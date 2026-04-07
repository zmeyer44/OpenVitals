import { useMemo } from 'react';
import { trpc } from '@/lib/trpc/client';
import {
  deriveStatus,
  isValueAbnormal,
  type CanonicalRanges,
} from '@/lib/health-utils';
import type { HealthStatus } from '@/components/health/status-badge';

/**
 * Hook that provides dynamic health status calculations using current optimal
 * and reference ranges. Replaces static `obs.isAbnormal` and bare `deriveStatus(obs)`
 * calls so that changes to ranges update the UI instantly.
 */
export function useDynamicStatus() {
  const { data: metricsData, isLoading: metricsLoading } =
    trpc.metrics.list.useQuery();
  const { data: optimalRangesData, isLoading: optimalLoading } =
    trpc.optimalRanges.forUser.useQuery();

  const isLoading = metricsLoading || optimalLoading;

  const rangesMap = useMemo(() => {
    const map = new Map<string, CanonicalRanges>();
    const metricDefs = metricsData ?? [];

    // Seed from metric definitions (reference ranges)
    for (const def of metricDefs) {
      map.set(def.id, {
        optimalLow: optimalRangesData?.[def.id]?.rangeLow ?? null,
        optimalHigh: optimalRangesData?.[def.id]?.rangeHigh ?? null,
        referenceLow: def.referenceRangeLow ?? null,
        referenceHigh: def.referenceRangeHigh ?? null,
      });
    }

    // Include optimal ranges for metrics not in definitions
    if (optimalRangesData) {
      for (const code of Object.keys(optimalRangesData)) {
        if (!map.has(code)) {
          map.set(code, {
            optimalLow: optimalRangesData[code]?.rangeLow ?? null,
            optimalHigh: optimalRangesData[code]?.rangeHigh ?? null,
            referenceLow: null,
            referenceHigh: null,
          });
        }
      }
    }

    return map;
  }, [metricsData, optimalRangesData]);

  /** Derive the display HealthStatus for an observation. */
  function getStatus(obs: {
    metricCode: string;
    valueNumeric?: number | null;
    isAbnormal?: boolean | null;
    referenceRangeLow?: number | null;
    referenceRangeHigh?: number | null;
  }): HealthStatus {
    const ranges = rangesMap.get(obs.metricCode);
    return deriveStatus(obs, ranges);
  }

  /** Check whether an observation value is abnormal (true/false/null). */
  function isAbnormal(obs: {
    metricCode: string;
    valueNumeric?: number | null;
    isAbnormal?: boolean | null;
    referenceRangeLow?: number | null;
    referenceRangeHigh?: number | null;
  }): boolean | null {
    const ranges = rangesMap.get(obs.metricCode);
    if (ranges) {
      return isValueAbnormal(obs.valueNumeric, ranges);
    }
    // Fall back to stored value when no ranges available
    return obs.isAbnormal ?? null;
  }

  /** Get the canonical ranges for a specific metric code. */
  function getRanges(metricCode: string): CanonicalRanges | undefined {
    return rangesMap.get(metricCode);
  }

  return { getStatus, isAbnormal, getRanges, isLoading };
}
