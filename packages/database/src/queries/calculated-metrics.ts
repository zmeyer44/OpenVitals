/**
 * Calculated/Derived Biomarkers Engine
 *
 * Computes derived metrics from existing observations and stores them
 * as real observations with metadataJson: { source: "calculated", formula: "..." }.
 * This ensures they appear on /labs detail pages, trend charts, and reports.
 *
 * Key principle: inputs must be from the SAME observation date (same lab draw).
 * When new lab data is ingested, the engine checks if paired inputs exist on
 * the same date and computes the derived metric if so.
 */

import { and, eq, desc, isNotNull, inArray, sql } from "drizzle-orm";
import { observations } from "../schema/observations";
import type { Database } from "../client";

// ── Formula Definitions ────────────────────────────────────────────────────────

export interface CalculatedMetricDef {
  code: string;
  name: string;
  category: string;
  unit: string;
  inputs: string[];
  /** Calculate from input values keyed by metric code */
  calculate: (values: Record<string, number>) => number | null;
  /** Human-readable formula for display */
  formulaText: string;
  precision: number;
}

export const CALCULATED_METRICS: CalculatedMetricDef[] = [
  {
    code: "homa_ir",
    name: "HOMA-IR",
    category: "metabolic",
    unit: "",
    inputs: ["glucose", "insulin"],
    calculate: (v) => {
      if (v.glucose == null || v.insulin == null) return null;
      if (v.glucose === 0 || v.insulin === 0) return null;
      return (v.glucose * v.insulin) / 405;
    },
    formulaText: "(glucose × insulin) / 405",
    precision: 2,
  },
  {
    code: "cholesterol_hdl_ratio",
    name: "Cholesterol/HDL Ratio",
    category: "lipid",
    unit: "",
    inputs: ["total_cholesterol", "hdl_cholesterol"],
    calculate: (v) => {
      if (v.total_cholesterol == null || v.hdl_cholesterol == null) return null;
      if (v.hdl_cholesterol === 0) return null;
      return v.total_cholesterol / v.hdl_cholesterol;
    },
    formulaText: "total cholesterol / HDL cholesterol",
    precision: 1,
  },
  {
    code: "triglyceride_hdl_ratio",
    name: "Triglyceride/HDL Ratio",
    category: "lipid",
    unit: "",
    inputs: ["triglycerides", "hdl_cholesterol"],
    calculate: (v) => {
      if (v.triglycerides == null || v.hdl_cholesterol == null) return null;
      if (v.hdl_cholesterol === 0) return null;
      return v.triglycerides / v.hdl_cholesterol;
    },
    formulaText: "triglycerides / HDL cholesterol",
    precision: 1,
  },
  {
    code: "non_hdl_cholesterol",
    name: "Non-HDL Cholesterol",
    category: "lipid",
    unit: "mg/dL",
    inputs: ["total_cholesterol", "hdl_cholesterol"],
    calculate: (v) => {
      if (v.total_cholesterol == null || v.hdl_cholesterol == null) return null;
      return v.total_cholesterol - v.hdl_cholesterol;
    },
    formulaText: "total cholesterol − HDL cholesterol",
    precision: 0,
  },
];

// ── Code aliases for input resolution ──────────────────────────────────────────
const INPUT_ALIASES: Record<string, string[]> = {
  // After migration 0011, canonical is "total_cholesterol"
  // Keep alias for safety during transition
  total_cholesterol: ["total_cholesterol", "cholesterol_total"],
};

/** Get all metric codes (including aliases) that could be an input for any formula */
function getAllInputCodes(): string[] {
  const codes = new Set<string>();
  for (const formula of CALCULATED_METRICS) {
    for (const input of formula.inputs) {
      codes.add(input);
      for (const alias of INPUT_ALIASES[input] ?? []) {
        codes.add(alias);
      }
    }
  }
  return [...codes];
}

// ── Core computation function ──────────────────────────────────────────────────

/**
 * Compute all calculable derived metrics for a user.
 *
 * Inputs must be from the SAME observation date (same lab draw).
 *
 * - If `triggerMetricCodes` is set: only evaluates formulas whose inputs overlap
 *   with the trigger codes, and only for dates where those triggers appear.
 * - If not set (full recalculate): evaluates ALL formulas for ALL dates.
 */
export async function computeCalculatedMetrics(
  db: Database,
  params: {
    userId: string;
    /** If set, only compute for metrics whose inputs include these codes */
    triggerMetricCodes?: string[];
    /** If set, link the calculated observation to this import job */
    importJobId?: string;
    /** If set, link to this source artifact */
    sourceArtifactId?: string;
  },
): Promise<{ computed: string[]; skipped: string[] }> {
  const computed: string[] = [];
  const skipped: string[] = [];

  // Determine which formulas to evaluate
  const formulasToEvaluate = params.triggerMetricCodes
    ? CALCULATED_METRICS.filter((m) =>
        m.inputs.some(
          (input) =>
            params.triggerMetricCodes!.includes(input) ||
            INPUT_ALIASES[input]?.some((alias) =>
              params.triggerMetricCodes!.includes(alias),
            ),
        ),
      )
    : CALCULATED_METRICS;

  if (formulasToEvaluate.length === 0) {
    return { computed, skipped };
  }

  // Get all observations for this user with relevant metric codes
  const allInputCodes = getAllInputCodes();
  const userObs = await db
    .select({
      metricCode: observations.metricCode,
      valueNumeric: observations.valueNumeric,
      observedAt: observations.observedAt,
    })
    .from(observations)
    .where(
      and(
        eq(observations.userId, params.userId),
        inArray(observations.metricCode, allInputCodes),
        isNotNull(observations.valueNumeric),
      ),
    )
    .orderBy(desc(observations.observedAt));

  // Group by date → metricCode → value
  const byDate = new Map<string, Map<string, number>>();
  for (const obs of userObs) {
    const dateKey = obs.observedAt.toISOString();
    if (!byDate.has(dateKey)) byDate.set(dateKey, new Map());
    const dateMap = byDate.get(dateKey)!;
    // Only take the first (most recent if duplicates on same date)
    if (!dateMap.has(obs.metricCode) && obs.valueNumeric != null) {
      dateMap.set(obs.metricCode, obs.valueNumeric);
    }
  }

  // Check existing calculated observations to avoid duplicates
  const existingCalc = await db
    .select({
      metricCode: observations.metricCode,
      observedAt: observations.observedAt,
    })
    .from(observations)
    .where(
      and(
        eq(observations.userId, params.userId),
        inArray(
          observations.metricCode,
          formulasToEvaluate.map((f) => f.code),
        ),
        sql`${observations.metadataJson}->>'source' = 'calculated'`,
      ),
    );

  const existingKeys = new Set(
    existingCalc.map((e) => `${e.metricCode}:${e.observedAt.toISOString()}`),
  );

  // For each date, check if all inputs exist and compute
  for (const [dateKey, dateMetrics] of byDate) {
    const obsDate = new Date(dateKey);

    for (const formula of formulasToEvaluate) {
      // Check if all inputs are present on this date
      const inputValues: Record<string, number> = {};
      let allFound = true;

      for (const inputCode of formula.inputs) {
        const codesToCheck = [inputCode, ...(INPUT_ALIASES[inputCode] ?? [])];
        let value: number | undefined;

        for (const code of codesToCheck) {
          if (dateMetrics.has(code)) {
            value = dateMetrics.get(code);
            break;
          }
        }

        if (value != null) {
          inputValues[inputCode] = value;
        } else {
          allFound = false;
          break;
        }
      }

      if (!allFound) continue;

      // Skip if already calculated for this date
      const key = `${formula.code}:${dateKey}`;
      if (existingKeys.has(key)) continue;

      // Calculate
      const result = formula.calculate(inputValues);
      if (result == null) continue;

      const roundedValue =
        Math.round(result * 10 ** formula.precision) / 10 ** formula.precision;

      await db.insert(observations).values({
        userId: params.userId,
        metricCode: formula.code,
        category: formula.category,
        valueNumeric: roundedValue,
        valueText: String(roundedValue),
        unit: formula.unit,
        status: "confirmed",
        confidenceScore: 1.0,
        observedAt: obsDate,
        importJobId: params.importJobId ?? null,
        sourceArtifactId: params.sourceArtifactId ?? null,
        metadataJson: {
          source: "calculated",
          formula: formula.code,
          formulaText: formula.formulaText,
          inputs: inputValues,
        },
      });

      existingKeys.add(key);
      if (!computed.includes(formula.code)) {
        computed.push(formula.code);
      }
    }
  }

  // Mark formulas that were evaluated but never computed
  for (const formula of formulasToEvaluate) {
    if (!computed.includes(formula.code)) {
      skipped.push(formula.code);
    }
  }

  return { computed, skipped };
}
