/**
 * Post-materialization step: compute derived/calculated biomarkers.
 *
 * After observations are inserted, this step checks if any calculated metrics
 * (HOMA-IR, Cholesterol/HDL ratio, etc.) can be computed from the newly
 * ingested data and stores them as real observations.
 */

import { getDb } from "@openvitals/database/client";
import { computeCalculatedMetrics } from "@openvitals/database";
import type { WorkflowContext } from "../workflow";

export async function computeDerived(
  ctx: WorkflowContext,
  /** Metric codes that were just ingested — used to scope which formulas to evaluate */
  ingestedMetricCodes: string[],
): Promise<void> {
  if (ingestedMetricCodes.length === 0) return;

  const db = getDb();

  const { computed, skipped } = await computeCalculatedMetrics(db, {
    userId: ctx.userId,
    triggerMetricCodes: ingestedMetricCodes,
    importJobId: ctx.importJobId,
    sourceArtifactId: ctx.artifactId,
  });

  if (computed.length > 0) {
    console.log(
      `[compute-derived] Computed ${computed.length} derived metrics: ${computed.join(", ")}`,
    );
  }
  if (skipped.length > 0) {
    console.log(
      `[compute-derived] Skipped ${skipped.length} (missing inputs): ${skipped.join(", ")}`,
    );
  }
}
