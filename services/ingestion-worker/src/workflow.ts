import { getDb } from "@openvitals/database/client";
import { importJobs } from "@openvitals/database";
import { eq } from "drizzle-orm";
import { emitEvent } from "@openvitals/events";
import { classify } from "./steps/classify";
import { parse } from "./steps/parse";
import { normalize } from "./steps/normalize";
import { autoIdentify } from "./steps/auto-identify";
import { materialize } from "./steps/materialize";

export interface WorkflowContext {
  importJobId: string;
  artifactId: string;
  userId: string;
}

export async function processWorkflow(ctx: WorkflowContext): Promise<void> {
  console.log(`[workflow] Starting ingestion for job=${ctx.importJobId}`);
  const db = getDb();

  try {
    // Step 1: Classify the document
    const classification = await classify(ctx);
    console.log(
      `[workflow] Classified as ${classification.documentType} (${classification.confidence})`,
    );

    // If confidence too low, mark for review and stop
    if (classification.confidence < 0.7) {
      console.log(`[workflow] Low confidence, marking for review`);
      await db
        .update(importJobs)
        .set({ status: "review_needed", needsReview: true })
        .where(eq(importJobs.id, ctx.importJobId));
      return;
    }

    // Step 2: Parse the document
    const parseResult = await parse(ctx, classification.documentType);
    console.log(
      `[workflow] Extracted ${parseResult.extractions.length} results`,
    );

    if (parseResult.extractions.length === 0) {
      await db
        .update(importJobs)
        .set({
          status: "completed",
          extractionCount: 0,
          completedAt: new Date(),
        })
        .where(eq(importJobs.id, ctx.importJobId));
      return;
    }

    // Step 3: Normalize extractions
    const {
      result: normalization,
      metricDefs,
      unitConversions,
      demographics,
    } = await normalize(ctx, parseResult.extractions);
    console.log(
      `[workflow] Normalized ${normalization.normalized.length}, flagged ${normalization.flagged.length}`,
    );

    // Step 3.5: Auto-identify unmatched items via LLM
    const finalNormalization = await autoIdentify(
      ctx,
      normalization,
      metricDefs,
      unitConversions,
      demographics,
    );
    console.log(
      `[workflow] After auto-identify: ${finalNormalization.normalized.length} normalized, ${finalNormalization.flagged.length} flagged`,
    );

    // Step 4: Materialize to database
    await materialize(ctx, finalNormalization);
    console.log(`[workflow] Materialized.`);

    console.log(`[workflow] Job complete.`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[workflow] Failed for job=${ctx.importJobId}:`, message);

    await db
      .update(importJobs)
      .set({ status: "failed", errorMessage: message })
      .where(eq(importJobs.id, ctx.importJobId));

    emitEvent({
      type: "import.failed",
      payload: { importJobId: ctx.importJobId, error: message },
      userId: ctx.userId,
      timestamp: new Date(),
    });
  }
}
