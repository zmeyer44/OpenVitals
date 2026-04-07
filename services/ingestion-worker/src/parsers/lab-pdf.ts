import { generateText } from "ai";
import { getDb } from "@openvitals/database/client";
import { sourceArtifacts } from "@openvitals/database";
import { eq } from "drizzle-orm";
import { createBlobStorage } from "@openvitals/blob-storage";
import { extractLabsPrompt } from "@openvitals/ai";
import type { WorkflowContext } from "../workflow";
import type { ParseResult, RawExtraction } from "@openvitals/ingestion";
import {
  getModel,
  getModelId,
  getOpenRouterHeaders,
  getOpenRouterBaseUrl,
} from "../lib/ai-provider";

const OCR_MODEL = process.env.AI_OCR_MODEL ?? "google/gemini-2.5-flash";
const MIN_TEXT_LENGTH = 50; // Below this, assume scanned/image PDF

export async function parseLabPdf(ctx: WorkflowContext): Promise<ParseResult> {
  const db = getDb();

  // Get artifact with extracted text
  const [artifact] = await db
    .select()
    .from(sourceArtifacts)
    .where(eq(sourceArtifacts.id, ctx.artifactId))
    .limit(1);

  if (!artifact) throw new Error(`Artifact ${ctx.artifactId} not found`);

  let textContent = artifact.rawTextExtracted ?? "";

  // If no extracted text yet, download and extract
  if (!textContent) {
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

    if (artifact.mimeType === "application/pdf") {
      const { extractTextFromPdf } = await import("../lib/pdf");
      textContent = await extractTextFromPdf(buffer);
    } else {
      textContent = buffer.toString("utf-8");
    }
  }

  console.log(
    `[lab-pdf] Extracted ${textContent.length} chars from artifact=${ctx.artifactId}`,
  );

  let text: string;

  if (textContent.trim().length >= MIN_TEXT_LENGTH) {
    // Digital PDF - use text extraction + AI parsing
    const modelId = getModelId();
    const result = await generateText({
      model: getModel(modelId),
      system: extractLabsPrompt,
      prompt: textContent.slice(0, 30000),
    });
    text = result.text;
  } else {
    // Scanned/image PDF - use vision model with rendered pages
    console.log(
      `[lab-pdf] Text too short (${textContent.trim().length} chars), using OCR via ${OCR_MODEL}`,
    );

    const storage = createBlobStorage();
    const blob = await storage.download(artifact.blobPath);
    const chunks: Uint8Array[] = [];
    const reader = blob.data.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
    const pdfBuffer = Buffer.concat(chunks);

    // Send PDF as base64 directly to vision model via OpenRouter raw API
    // Gemini Flash supports PDF files directly — no page rendering needed
    const pdfBase64 = pdfBuffer.toString("base64");
    console.log(
      `[lab-pdf] Sending ${(pdfBuffer.length / 1024).toFixed(0)}KB PDF to ${OCR_MODEL} for OCR`,
    );

    const ocrResponse = await fetch(
      `${getOpenRouterBaseUrl()}/chat/completions`,
      {
        method: "POST",
        headers: getOpenRouterHeaders(),
        body: JSON.stringify({
          model: OCR_MODEL,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: {
                    url: `data:application/pdf;base64,${pdfBase64}`,
                  },
                },
                {
                  type: "text",
                  text:
                    "Extract all lab test results from this scanned lab report. " +
                    extractLabsPrompt,
                },
              ],
            },
          ],
          temperature: 0,
        }),
      },
    );

    const ocrData = await ocrResponse.json();
    if (ocrData.error) {
      console.error("[lab-pdf] OCR API error:", ocrData.error);
      text = "{}";
    } else {
      text = ocrData.choices[0].message.content;
      console.log(`[lab-pdf] OCR response: ${text.length} chars`);
    }
  }

  let parsed: any;
  try {
    const jsonStr = text
      .replace(/^```(?:json)?\s*\n?/m, "")
      .replace(/\n?```\s*$/m, "")
      .trim();
    parsed = JSON.parse(jsonStr);
    const analytes = (parsed.results ?? []).map((r: any) => r.analyte);
    console.log(`[lab-pdf] AI extracted ${analytes.length} results:`);
    for (const r of parsed.results ?? []) {
      console.log(
        `  - ${r.analyte}: ${r.value} ${r.unit} (range: ${r.referenceRangeLow}-${r.referenceRangeHigh})`,
      );
    }
  } catch {
    console.error("[lab-pdf] Failed to parse AI response:", text.slice(0, 500));
    return {
      extractions: [],
      rawMetadata: {
        parser: "lab-pdf",
        version: "0.1.0",
        error: "parse_failed",
      },
    };
  }

  const fallbackDate =
    parsed.collectionDate ?? new Date().toISOString().split("T")[0];

  const extractions: RawExtraction[] = (parsed.results ?? []).map((r: any) => {
    // Handle "< X" or "> X" values - strip comparator and use the number
    let numValue = typeof r.value === "number" ? r.value : null;
    const rawText = r.valueText ?? (r.value != null ? String(r.value) : null);
    if (numValue === null && rawText) {
      const ltMatch = rawText.match(/^[<>≤≥]\s*([\d.,]+)$/);
      if (ltMatch) {
        numValue = parseFloat(ltMatch[1]!.replace(",", "."));
      }
    }
    return {
      analyte: r.analyte ?? "",
      value: numValue,
      valueText: rawText,
      unit: r.unit ?? null,
      referenceRangeLow:
        typeof r.referenceRangeLow === "number" ? r.referenceRangeLow : null,
      referenceRangeHigh:
        typeof r.referenceRangeHigh === "number" ? r.referenceRangeHigh : null,
      referenceRangeText: r.referenceRangeText ?? null,
      isAbnormal: typeof r.isAbnormal === "boolean" ? r.isAbnormal : null,
      observedAt: r.observedAt ?? fallbackDate,
      category: "lab_result" as const,
    };
  });

  return {
    extractions,
    patientName: parsed.patientName,
    collectionDate: parsed.collectionDate,
    reportDate: parsed.reportDate,
    labName: parsed.labName,
    rawMetadata: { parser: "lab-pdf", version: "0.1.0" },
  };
}
