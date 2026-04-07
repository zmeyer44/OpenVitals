import type {
  RawExtraction,
  NormalizedObservation,
  FlaggedExtraction,
  NormalizationResult,
} from "./types";
import { CONFIDENCE_THRESHOLD } from "@openvitals/common";

export interface DemographicRange {
  sex: string | null;
  ageMin: number | null;
  ageMax: number | null;
  rangeLow: number | null;
  rangeHigh: number | null;
}

export interface UserDemographics {
  sex: string | null;
  ageInYears: number | null;
}

export interface MetricDefinition {
  id: string;
  name: string;
  category: string;
  unit: string | null;
  aliases: string[];
  referenceRangeLow: number | null;
  referenceRangeHigh: number | null;
  demographicRanges?: DemographicRange[];
}

export interface UnitConversion {
  fromUnit: string;
  toUnit: string;
  metricCode: string | null;
  multiplier: number;
  offset: number;
}

export function matchMetric(
  analyte: string,
  metricDefinitions: MetricDefinition[],
  unit?: string | null,
): MetricDefinition | null {
  const lower = analyte.toLowerCase().trim();

  // Exact match on id
  const exactId = metricDefinitions.find((m) => m.id === lower);
  if (exactId) return exactId;

  // Exact match on name
  const exactName = metricDefinitions.find(
    (m) => m.name.toLowerCase() === lower,
  );
  if (exactName) return exactName;

  // Alias match
  const aliasMatch = metricDefinitions.find((m) =>
    m.aliases.some((a) => a.toLowerCase() === lower),
  );
  if (aliasMatch) return aliasMatch;

  // Partial match (analyte contains metric name or vice versa)
  // When multiple partial matches exist, use unit to disambiguate
  const partialMatches = metricDefinitions.filter(
    (m) =>
      lower.includes(m.name.toLowerCase()) ||
      m.name.toLowerCase().includes(lower),
  );

  if (partialMatches.length === 1) return partialMatches[0]!;

  if (partialMatches.length > 1 && unit) {
    const unitLower = unit.toLowerCase();
    const isPercentage = unitLower === "%";
    const isAbsolute = !isPercentage;

    // For differentials: pick _pct for %, _abs for count units
    const unitMatch = partialMatches.find((m) => {
      if (isPercentage && (m.id.endsWith("_pct") || m.unit === "%"))
        return true;
      if (isAbsolute && (m.id.endsWith("_abs") || (m.unit && m.unit !== "%")))
        return true;
      return false;
    });
    if (unitMatch) return unitMatch;

    // If no unit-based match, try matching by unit compatibility
    const sameUnit = partialMatches.find(
      (m) => m.unit && m.unit.toLowerCase() === unitLower,
    );
    if (sameUnit) return sameUnit;
  }

  return partialMatches[0] ?? null;
}

export function convertUnit(
  value: number,
  fromUnit: string,
  toUnit: string,
  conversions: UnitConversion[],
  metricCode?: string,
): number | null {
  if (fromUnit.toLowerCase() === toUnit.toLowerCase()) return value;

  // Try metric-specific conversion first
  const specific = conversions.find(
    (c) =>
      c.fromUnit.toLowerCase() === fromUnit.toLowerCase() &&
      c.toUnit.toLowerCase() === toUnit.toLowerCase() &&
      c.metricCode === metricCode,
  );
  if (specific) return value * specific.multiplier + specific.offset;

  // Try global conversion
  const global = conversions.find(
    (c) =>
      c.fromUnit.toLowerCase() === fromUnit.toLowerCase() &&
      c.toUnit.toLowerCase() === toUnit.toLowerCase() &&
      c.metricCode === null,
  );
  if (global) return value * global.multiplier + global.offset;

  return null;
}

/**
 * Find the best matching demographic range for a given user.
 * Scoring: sex-specific > any-sex, narrower age band > wider.
 */
function findBestDemographicRange(
  ranges: DemographicRange[],
  demographics: UserDemographics,
): DemographicRange | null {
  let bestRange: DemographicRange | null = null;
  let bestScore = -1;

  for (const range of ranges) {
    // Check age bounds
    if (demographics.ageInYears !== null) {
      if (range.ageMin !== null && demographics.ageInYears < range.ageMin)
        continue;
      if (range.ageMax !== null && demographics.ageInYears > range.ageMax)
        continue;
    }

    // Check sex match
    if (
      range.sex !== null &&
      demographics.sex !== null &&
      range.sex !== demographics.sex
    )
      continue;

    // Score: sex-specific = +2, narrow age band = +1
    let score = 0;
    if (range.sex !== null && range.sex === demographics.sex) score += 2;
    if (range.ageMin !== null || range.ageMax !== null) score += 1;
    // Narrower band (both bounds set) gets extra point
    if (range.ageMin !== null && range.ageMax !== null) score += 1;

    if (score > bestScore) {
      bestScore = score;
      bestRange = range;
    }
  }

  return bestRange;
}

/**
 * Resolve reference range with priority:
 * 1. Per-observation range from the extraction (what the lab printed)
 * 2. Demographic-matched range from reference_ranges table
 * 3. Metric definition fallback
 */
export function resolveReferenceRange(
  extraction: RawExtraction,
  metric: MetricDefinition,
  demographics?: UserDemographics | null,
): { low: number | null; high: number | null } {
  // Priority 1: per-observation range
  if (
    extraction.referenceRangeLow !== null ||
    extraction.referenceRangeHigh !== null
  ) {
    return {
      low: extraction.referenceRangeLow,
      high: extraction.referenceRangeHigh,
    };
  }

  // Priority 2: demographic match
  if (
    demographics &&
    metric.demographicRanges &&
    metric.demographicRanges.length > 0
  ) {
    const match = findBestDemographicRange(
      metric.demographicRanges,
      demographics,
    );
    if (match) {
      return { low: match.rangeLow, high: match.rangeHigh };
    }
  }

  // Priority 3: metric definition fallback
  return {
    low: metric.referenceRangeLow,
    high: metric.referenceRangeHigh,
  };
}

/**
 * Resolve canonical reference range for abnormality calculation.
 * Reversed priority: canonical sources first, per-PDF as last resort.
 * This ensures consistent NORMAL/ABNORMAL status across labs.
 */
export function resolveCanonicalRange(
  extraction: RawExtraction,
  metric: MetricDefinition,
  demographics?: UserDemographics | null,
): { low: number | null; high: number | null } {
  // Priority 1: metric definition (the canonical standard)
  if (metric.referenceRangeLow !== null || metric.referenceRangeHigh !== null) {
    return {
      low: metric.referenceRangeLow,
      high: metric.referenceRangeHigh,
    };
  }

  // Priority 2: demographic match
  if (
    demographics &&
    metric.demographicRanges &&
    metric.demographicRanges.length > 0
  ) {
    const match = findBestDemographicRange(
      metric.demographicRanges,
      demographics,
    );
    if (match) {
      return { low: match.rangeLow, high: match.rangeHigh };
    }
  }

  // Priority 3: fall back to what the lab printed
  return {
    low: extraction.referenceRangeLow,
    high: extraction.referenceRangeHigh,
  };
}

/**
 * Canonical metric code map: some metric_definitions have duplicate entries
 * (e.g., 'hemoglobin_a1c' and 'hba1c'). This ensures we always store
 * observations with a single canonical code regardless of which definition matched.
 */
const CANONICAL_CODE_MAP: Record<string, string> = {
  hemoglobin_a1c: "hba1c",
  cholesterol_total: "total_cholesterol",
  apob: "apolipoprotein_b",
  hs_crp: "crp",
  c_reactive_protein: "crp",
  "25_hydroxyvitamin_d": "vitamin_d",
  vitamin_d_25_hydroxyvitamin_d: "vitamin_d",
};

export function normalizeExtractions(
  extractions: RawExtraction[],
  metricDefinitions: MetricDefinition[],
  unitConversions: UnitConversion[],
  baseConfidence: number = 0.85,
  demographics?: UserDemographics | null,
): NormalizationResult {
  const normalized: NormalizedObservation[] = [];
  const flagged: FlaggedExtraction[] = [];

  for (const extraction of extractions) {
    const metric = matchMetric(
      extraction.analyte,
      metricDefinitions,
      extraction.unit,
    );

    if (!metric) {
      flagged.push({
        extraction,
        reason: "unmatched_metric",
        details: `No metric definition found for analyte: ${extraction.analyte}`,
      });
      continue;
    }

    let finalValue = extraction.value;
    let finalUnit = extraction.unit ?? metric.unit ?? "";

    // Unit conversion if needed
    if (
      extraction.unit &&
      metric.unit &&
      extraction.unit.toLowerCase() !== metric.unit.toLowerCase()
    ) {
      const converted =
        extraction.value !== null
          ? convertUnit(
              extraction.value,
              extraction.unit,
              metric.unit,
              unitConversions,
              metric.id,
            )
          : null;
      if (converted !== null) {
        finalValue = converted;
        finalUnit = metric.unit;
      } else if (extraction.value === null) {
        // Qualitative result (e.g., "< 0.050") — keep null value, adopt target unit
        finalUnit = metric.unit;
      } else {
        flagged.push({
          extraction,
          reason: "ambiguous_unit",
          details: `Cannot convert ${extraction.unit} to ${metric.unit} for ${metric.id}`,
        });
        continue;
      }
    }

    // Store lab-reported range on observation (historical record)
    const { low: labLow, high: labHigh } = resolveReferenceRange(
      extraction,
      metric,
      demographics,
    );
    // Use canonical range for abnormality (consistent across labs)
    const { low: canonLow, high: canonHigh } = resolveCanonicalRange(
      extraction,
      metric,
      demographics,
    );
    const isAbnormal =
      extraction.isAbnormal ??
      (finalValue !== null && (canonLow !== null || canonHigh !== null)
        ? (canonLow !== null && finalValue < canonLow) ||
          (canonHigh !== null && finalValue > canonHigh)
        : null);

    // Resolve to canonical code (e.g., hemoglobin_a1c → hba1c)
    const canonicalCode = CANONICAL_CODE_MAP[metric.id] ?? metric.id;

    const obs: NormalizedObservation = {
      metricCode: canonicalCode,
      category: metric.category as any,
      valueNumeric: finalValue,
      valueText: extraction.valueText,
      unit: finalUnit,
      referenceRangeLow: labLow,
      referenceRangeHigh: labHigh,
      referenceRangeText: extraction.referenceRangeText,
      isAbnormal,
      observedAt: new Date(extraction.observedAt),
      confidenceScore: baseConfidence,
    };

    if (baseConfidence < CONFIDENCE_THRESHOLD) {
      flagged.push({
        extraction,
        reason: "low_confidence",
        details: `Confidence ${baseConfidence} below threshold ${CONFIDENCE_THRESHOLD}`,
      });
    }

    normalized.push(obs);
  }

  return { normalized, flagged };
}
