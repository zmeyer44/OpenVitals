import { generateText } from "ai";
import { getDb } from "@openvitals/database/client";
import { sql } from "drizzle-orm";
import { getModel } from "../lib/ai-provider";
import { metricDefinitions } from "@openvitals/database";
import type { WorkflowContext } from "../workflow";
import type {
  NormalizationResult,
  FlaggedExtraction,
  RawExtraction,
  NormalizedObservation,
} from "@openvitals/ingestion";
import { normalizeExtractions } from "@openvitals/ingestion";
import type {
  MetricDefinition,
  UnitConversion,
  UserDemographics,
} from "@openvitals/ingestion";

const IDENTIFY_MODEL = process.env.AI_OCR_MODEL ?? "google/gemini-2.5-flash";

interface IdentifiedBiomarker {
  analyte: string;
  id: string | null;
  standardName: string;
  loincCode: string | null;
  unit: string | null;
  rangeLow: number | null;
  rangeHigh: number | null;
  category: string;
}

/**
 * Auto-identify unmatched biomarkers using LLM.
 * Sends unmatched analytes to Gemini Flash which identifies them
 * with proper names, LOINC codes, units, and reference ranges.
 * Auto-creates metric definitions and re-normalizes.
 */
export async function autoIdentify(
  ctx: WorkflowContext,
  normResult: NormalizationResult,
  metricDefs: MetricDefinition[],
  unitConversions: UnitConversion[],
  demographics?: UserDemographics | null,
): Promise<NormalizationResult> {
  const unmatched = normResult.flagged.filter(
    (f) => f.reason === "unmatched_metric",
  );

  if (unmatched.length === 0) {
    console.log("[auto-identify] No unmatched items to identify");
    return normResult;
  }

  console.log(
    `[auto-identify] Sending ${unmatched.length} unmatched items to ${IDENTIFY_MODEL}`,
  );

  // Build the prompt with analyte details
  const analyteList = unmatched
    .map(
      (f) =>
        `- "${f.extraction.analyte}" (${f.extraction.value ?? f.extraction.valueText ?? "?"} ${f.extraction.unit ?? ""})`,
    )
    .join("\n");

  const prompt = `You are a medical laboratory expert. For each unmatched lab test analyte below, identify it and provide structured information.

For each analyte, return:
- analyte: the original name (as given)
- id: kebab_case identifier using underscores (e.g., "aslo", "rheumatoid_factor", "toxoplasma_igg"). Set to null if you cannot identify it.
- standardName: Standard English medical name
- loincCode: LOINC code if you know it (null otherwise)
- unit: Standard unit of measurement (null for qualitative tests)
- rangeLow: Lower bound of normal reference range for adults (null if not applicable)
- rangeHigh: Upper bound of normal reference range for adults (null if not applicable)
- category: One of: hematology, metabolic, lipid, thyroid, hormone, vitamin, mineral, inflammation, immunology, liver, renal, cardiac, urine

Respond ONLY with a JSON array. No markdown fences.

Analytes:
${analyteList}`;

  try {
    const result = await generateText({
      model: getModel(IDENTIFY_MODEL),
      prompt,
      temperature: 0,
    });

    const aiText = result.text;
    const jsonStr = aiText
      .replace(/^```(?:json)?\s*\n?/m, "")
      .replace(/\n?```\s*$/m, "")
      .trim();
    const identified: IdentifiedBiomarker[] = JSON.parse(jsonStr);

    console.log(
      `[auto-identify] LLM identified ${identified.filter((i) => i.id).length}/${identified.length} items`,
    );

    // Create new metric definitions for identified items
    const db = getDb();
    const newMetricDefs: MetricDefinition[] = [];
    const resolvedExtractions: RawExtraction[] = [];
    const remainingFlagged: FlaggedExtraction[] = [];

    // Keep non-unmatched flags as-is
    const otherFlagged = normResult.flagged.filter(
      (f) => f.reason !== "unmatched_metric",
    );

    for (const flagged of unmatched) {
      const match = identified.find(
        (i) => i.analyte === flagged.extraction.analyte && i.id !== null,
      );

      if (!match || !match.id) {
        remainingFlagged.push(flagged);
        continue;
      }

      // Validate LLM-returned id format to prevent injection/overwrites
      if (!/^[a-z][a-z0-9_]{0,63}$/.test(match.id)) {
        console.warn(`[auto-identify] Skipping unsafe id: ${match.id}`);
        remainingFlagged.push(flagged);
        continue;
      }

      // Check if metric already exists
      const existing = metricDefs.find(
        (m) =>
          m.id === match.id ||
          m.name.toLowerCase() === match.standardName.toLowerCase(),
      );

      if (!existing) {
        // Create new metric definition
        try {
          await db
            .insert(metricDefinitions)
            .values({
              id: match.id,
              name: match.standardName,
              category: match.category,
              unit: match.unit,
              loincCode: match.loincCode,
              aliases: [flagged.extraction.analyte],
              referenceRangeLow: match.rangeLow,
              referenceRangeHigh: match.rangeHigh,
              referenceRangeText:
                match.rangeLow != null || match.rangeHigh != null
                  ? `${match.rangeLow ?? "?"} - ${match.rangeHigh ?? "?"} ${match.unit ?? ""}`
                  : null,
              description: match.standardName,
              displayPrecision: 2,
              sortOrder: 900,
            })
            .onConflictDoNothing();

          console.log(
            `[auto-identify] Created metric: ${match.id} (${match.standardName})`,
          );

          newMetricDefs.push({
            id: match.id,
            name: match.standardName,
            category: match.category,
            unit: match.unit,
            aliases: [flagged.extraction.analyte],
            referenceRangeLow: match.rangeLow,
            referenceRangeHigh: match.rangeHigh,
          });
        } catch (err) {
          console.error(
            `[auto-identify] Failed to create metric ${match.id}:`,
            err,
          );
          remainingFlagged.push(flagged);
          continue;
        }
      } else {
        // Add alias to existing metric if not present
        const existingAliases = existing.aliases ?? [];
        if (
          !existingAliases.some(
            (a) => a.toLowerCase() === flagged.extraction.analyte.toLowerCase(),
          )
        ) {
          await db.execute(
            sql`UPDATE metric_definitions SET aliases = aliases::jsonb || ${JSON.stringify([flagged.extraction.analyte])}::jsonb WHERE id = ${existing.id}`,
          );
        }
        newMetricDefs.push(existing);
      }

      resolvedExtractions.push(flagged.extraction);
    }

    // Re-normalize the resolved extractions with the expanded metric definitions
    if (resolvedExtractions.length > 0) {
      const allMetrics = [...metricDefs, ...newMetricDefs];
      const reNormResult = normalizeExtractions(
        resolvedExtractions,
        allMetrics,
        unitConversions,
        0.85,
        demographics,
      );

      console.log(
        `[auto-identify] Re-normalized: ${reNormResult.normalized.length} succeeded, ${reNormResult.flagged.length} still flagged`,
      );

      return {
        normalized: [...normResult.normalized, ...reNormResult.normalized],
        flagged: [
          ...otherFlagged,
          ...remainingFlagged,
          ...reNormResult.flagged,
        ],
      };
    }

    return {
      normalized: normResult.normalized,
      flagged: [...otherFlagged, ...remainingFlagged],
    };
  } catch (err) {
    console.error("[auto-identify] Failed:", err);
    return normResult;
  }
}
