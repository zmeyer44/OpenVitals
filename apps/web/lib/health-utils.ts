import type { HealthStatus } from "@/components/health/status-badge";

/**
 * Canonical ranges for dynamic abnormality calculation.
 * Priority: optimal range > reference range from metric definition.
 */
export interface CanonicalRanges {
  optimalLow?: number | null;
  optimalHigh?: number | null;
  referenceLow?: number | null;
  referenceHigh?: number | null;
}

/**
 * Dynamically compute whether an observation is abnormal using current ranges.
 * Uses optimal range first; falls back to metric definition reference range.
 * This is computed at display time so changes to ranges update instantly.
 */
export function isValueAbnormal(
  value: number | null | undefined,
  ranges: CanonicalRanges,
): boolean | null {
  if (value == null) return null;

  // Priority 1: optimal range
  const low = ranges.optimalLow ?? ranges.referenceLow;
  const high = ranges.optimalHigh ?? ranges.referenceHigh;

  if (low == null && high == null) return null;
  if (low != null && value < low) return true;
  if (high != null && value > high) return true;
  return false;
}

/**
 * Derive display status from an observation.
 * When canonicalRanges are provided, computes dynamically (ignoring stored isAbnormal).
 * Falls back to stored isAbnormal when no canonical ranges available.
 */
export function deriveStatus(
  obs: {
    isAbnormal?: boolean | null;
    referenceRangeLow?: number | null;
    referenceRangeHigh?: number | null;
    valueNumeric?: number | null;
  },
  canonicalRanges?: CanonicalRanges,
): HealthStatus {
  // Dynamic calculation when ranges are provided
  const abnormal = canonicalRanges
    ? isValueAbnormal(obs.valueNumeric, canonicalRanges)
    : obs.isAbnormal;

  if (abnormal === true) {
    // Determine severity using the active range
    const low =
      canonicalRanges?.optimalLow ??
      canonicalRanges?.referenceLow ??
      obs.referenceRangeLow;
    const high =
      canonicalRanges?.optimalHigh ??
      canonicalRanges?.referenceHigh ??
      obs.referenceRangeHigh;

    if (obs.valueNumeric != null && low != null && high != null) {
      const distFromLow = low - obs.valueNumeric;
      const distFromHigh = obs.valueNumeric - high;
      const rangeSpan = high - low;
      if (
        rangeSpan > 0 &&
        (distFromLow > rangeSpan * 0.5 || distFromHigh > rangeSpan * 0.5)
      ) {
        return "critical";
      }
    }
    return "warning";
  }
  return "normal";
}

export function formatRelativeTime(date: Date | string): string {
  const now = Date.now();
  const then =
    typeof date === "string" ? new Date(date).getTime() : date.getTime();
  const diffMs = now - then;
  const absSec = Math.floor(Math.abs(diffMs) / 1000);

  if (absSec < 60) return "just now";
  const min = Math.floor(absSec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  // For older dates, use formatted date
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Determine if a trend delta represents improvement based on optimal range bounds.
 * - Only high bound (LDL < 70): lower is better → decrease = improving
 * - Only low bound (HDL > 50): higher is better → increase = improving
 * - Both bounds (glucose 72–85): moving toward center = improving
 * - No range: can't determine → null
 */
export function isTrendImproving(
  delta: number,
  ranges: CanonicalRanges | undefined,
  currentValue: number,
): boolean | null {
  if (!ranges || delta === 0) return null;

  const low = ranges.optimalLow ?? ranges.referenceLow ?? null;
  const high = ranges.optimalHigh ?? ranges.referenceHigh ?? null;
  const hasLow = low != null;
  const hasHigh = high != null;

  if (hasHigh && !hasLow) return delta < 0;
  if (hasLow && !hasHigh) return delta > 0;
  if (hasLow && hasHigh && low != null && high != null) {
    const center = (low + high) / 2;
    const prevValue = currentValue / (1 + delta / 100);
    return Math.abs(currentValue - center) < Math.abs(prevValue - center);
  }
  return null;
}

export type OptimalStatus = "optimal" | "suboptimal" | "unknown";

export function deriveOptimalStatus(obs: {
  valueNumeric?: number | null;
  optimalRangeLow?: number | null;
  optimalRangeHigh?: number | null;
}): OptimalStatus {
  if (obs.valueNumeric == null) return "unknown";
  if (obs.optimalRangeLow == null && obs.optimalRangeHigh == null)
    return "unknown";

  const val = obs.valueNumeric;
  if (obs.optimalRangeLow != null && val < obs.optimalRangeLow)
    return "suboptimal";
  if (obs.optimalRangeHigh != null && val > obs.optimalRangeHigh)
    return "suboptimal";
  return "optimal";
}

export function formatRange(
  low: number | null | undefined,
  high: number | null | undefined,
  unit?: string | null,
): string {
  const u = unit ?? "";
  if (low != null && high != null) return `${low} – ${high} ${u}`.trim();
  if (low != null) return `> ${low} ${u}`.trim();
  if (high != null) return `< ${high} ${u}`.trim();
  return "—";
}
