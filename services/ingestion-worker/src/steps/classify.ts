import { generateText } from "ai";
import { getDb } from "@openvitals/database/client";
import { importJobs, sourceArtifacts } from "@openvitals/database";
import { eq } from "drizzle-orm";
import { classifyDocumentPrompt } from "@openvitals/ai";
import { createBlobStorage } from "@openvitals/blob-storage";
import type { WorkflowContext } from "../workflow";
import type { ClassificationResult } from "@openvitals/ingestion";
import { getModel, getModelId } from "../lib/ai-provider";

export async function classify(
  ctx: WorkflowContext,
): Promise<ClassificationResult> {
  const db = getDb();

  // Update status to classifying
  await db
    .update(importJobs)
    .set({ status: "classifying", startedAt: new Date() })
    .where(eq(importJobs.id, ctx.importJobId));

  // Fetch artifact metadata
  const [artifact] = await db
    .select()
    .from(sourceArtifacts)
    .where(eq(sourceArtifacts.id, ctx.artifactId))
    .limit(1);

  if (!artifact) throw new Error(`Artifact ${ctx.artifactId} not found`);

  // Quick heuristic for CSV files
  if (artifact.mimeType === "text/csv") {
    const result: ClassificationResult = {
      documentType: "csv_export",
      confidence: 0.95,
      reasoning: "File is CSV format",
    };
    await db
      .update(importJobs)
      .set({
        classifiedType: result.documentType,
        classificationConfidence: result.confidence,
        classifyCompletedAt: new Date(),
      })
      .where(eq(importJobs.id, ctx.importJobId));
    await db
      .update(sourceArtifacts)
      .set({
        classifiedType: result.documentType,
        classificationConfidence: result.confidence,
      })
      .where(eq(sourceArtifacts.id, ctx.artifactId));
    return result;
  }

  // Quick heuristic for Apple Health exports (ZIP files with known naming pattern)
  if (
    (artifact.mimeType === "application/zip" ||
      artifact.mimeType === "application/x-zip-compressed") &&
    /(?:export|apple.?health)/i.test(artifact.fileName)
  ) {
    const result: ClassificationResult = {
      documentType: "apple_health_export",
      confidence: 0.95,
      reasoning: "ZIP file with Apple Health export naming pattern",
    };
    await db
      .update(importJobs)
      .set({
        classifiedType: result.documentType,
        classificationConfidence: result.confidence,
        classifyCompletedAt: new Date(),
      })
      .where(eq(importJobs.id, ctx.importJobId));
    await db
      .update(sourceArtifacts)
      .set({
        classifiedType: result.documentType,
        classificationConfidence: result.confidence,
      })
      .where(eq(sourceArtifacts.id, ctx.artifactId));
    return result;
  }

  // Download and extract text
  const storage = createBlobStorage();
  const blob = await storage.download(artifact.blobPath);
  const chunks: Uint8Array[] = [];
  const reader = blob.data.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  const buffer = Buffer.concat(chunks);

  let textContent = "";
  if (artifact.mimeType === "application/pdf") {
    const { extractTextFromPdf } = await import("../lib/pdf");
    textContent = await extractTextFromPdf(buffer);
  } else {
    textContent = buffer.toString("utf-8");
  }

  // Save extracted text
  await db
    .update(sourceArtifacts)
    .set({ rawTextExtracted: textContent.slice(0, 50000) })
    .where(eq(sourceArtifacts.id, ctx.artifactId));

  // If text extraction yielded almost nothing for a PDF, it's likely scanned.
  // Auto-classify as lab_report (most common document type for blood work PDFs)
  if (
    artifact.mimeType === "application/pdf" &&
    textContent.trim().length < 50
  ) {
    console.log(
      `[classify] Scanned PDF detected (${textContent.trim().length} chars), auto-classifying as lab_report`,
    );
    const scannedResult: ClassificationResult = {
      documentType: "lab_report",
      confidence: 0.8,
      reasoning:
        "Scanned PDF with minimal extractable text - assuming lab report for OCR processing",
    };
    await db
      .update(importJobs)
      .set({
        classifiedType: scannedResult.documentType,
        classificationConfidence: scannedResult.confidence,
        classifyCompletedAt: new Date(),
      })
      .where(eq(importJobs.id, ctx.importJobId));
    await db
      .update(sourceArtifacts)
      .set({
        classifiedType: scannedResult.documentType,
        classificationConfidence: scannedResult.confidence,
      })
      .where(eq(sourceArtifacts.id, ctx.artifactId));
    return scannedResult;
  }

  // Classify with AI
  const modelId = getModelId();
  const { text } = await generateText({
    model: getModel(modelId),
    system: classifyDocumentPrompt,
    prompt: `Document type: ${artifact.mimeType}\nFile name: ${artifact.fileName}\n\nContent:\n${textContent.slice(0, 10000)}`,
  });

  let result: ClassificationResult;
  try {
    // Strip markdown code fences if present
    const jsonStr = text
      .replace(/^```(?:json)?\s*\n?/m, "")
      .replace(/\n?```\s*$/m, "")
      .trim();
    const parsed = JSON.parse(jsonStr);
    result = {
      documentType: parsed.documentType ?? "unknown",
      confidence:
        typeof parsed.confidence === "number" ? parsed.confidence : 0.5,
      reasoning: parsed.reasoning ?? "",
    };
  } catch (e) {
    console.error(
      "[classify] Failed to parse AI response:",
      text.slice(0, 200),
    );
    result = {
      documentType: "unknown",
      confidence: 0.3,
      reasoning: "Failed to parse AI response",
    };
  }

  // Update DB
  await db
    .update(importJobs)
    .set({
      classifiedType: result.documentType,
      classificationConfidence: result.confidence,
      classifyCompletedAt: new Date(),
    })
    .where(eq(importJobs.id, ctx.importJobId));
  await db
    .update(sourceArtifacts)
    .set({
      classifiedType: result.documentType,
      classificationConfidence: result.confidence,
    })
    .where(eq(sourceArtifacts.id, ctx.artifactId));

  return result;
}
