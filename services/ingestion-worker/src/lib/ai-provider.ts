/**
 * Shared AI model provider for the ingestion worker.
 *
 * Supports two backends via the AI_PROVIDER env var:
 *   - "gateway" (default) — uses @ai-sdk/gateway (Vercel AI Gateway)
 *   - "openrouter" — uses @openrouter/ai-sdk-provider
 *
 * Both work with the Vercel AI SDK's `generateText()`.
 *
 * Usage:
 *   import { getModel, getModelId } from '../lib/ai-provider';
 *   const { text } = await generateText({ model: getModel(), ... });
 */

import type { LanguageModel } from "ai";

const AI_PROVIDER = process.env.AI_PROVIDER ?? "gateway";
const DEFAULT_MODEL = "anthropic/claude-sonnet-4-20250514";

export function getModelId(): string {
  return process.env.AI_DEFAULT_MODEL ?? DEFAULT_MODEL;
}

export function getModel(modelId?: string): LanguageModel {
  const id = modelId ?? getModelId();

  if (AI_PROVIDER === "openrouter") {
    // Lazy import to avoid requiring the package when using gateway
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createOpenRouter } = require("@openrouter/ai-sdk-provider");
    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
    });
    return openrouter(id);
  }

  // Default: @ai-sdk/gateway
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { gateway } = require("@ai-sdk/gateway");
  return gateway(id);
}

/**
 * Get OpenRouter-compatible headers for raw fetch calls.
 * Falls back to gateway-compatible headers if using gateway provider.
 */
export function getOpenRouterHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY ?? process.env.AI_GATEWAY_API_KEY ?? ""}`,
  };
}

export function getOpenRouterBaseUrl(): string {
  return process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";
}
