"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface PanelCardProps {
  panel: {
    id: string;
    name: string;
    description: string | null;
    category: string;
    estimatedCostLow: number | null;
    estimatedCostHigh: number | null;
    targetSex: string | null;
    metricCount: number;
  };
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  general: { bg: "bg-neutral-100", text: "text-neutral-600" },
  specialized: {
    bg: "bg-[var(--color-accent-50)]",
    text: "text-[var(--color-accent-600)]",
  },
  longevity: {
    bg: "bg-[var(--color-health-optimal-bg)]",
    text: "text-[var(--color-health-optimal)]",
  },
};

export function PanelCard({ panel }: PanelCardProps) {
  const catStyle = categoryColors[panel.category] ?? categoryColors.general;

  return (
    <Link
      href={`/testing/panels/${panel.id}`}
      className="card-elevated flex flex-col gap-3 p-4 group"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-neutral-900 group-hover:text-[var(--color-accent-600)] transition-colors">
          {panel.name}
        </h3>
        <ChevronRight className="h-4 w-4 shrink-0 text-neutral-400 group-hover:text-[var(--color-accent-500)] transition-colors" />
      </div>

      {panel.description && (
        <p className="text-xs leading-relaxed text-neutral-500 line-clamp-2">
          {panel.description}
        </p>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
        <span
          className={cn(
            "inline-flex items-center px-2 py-0.5 text-[11px] font-medium",
            catStyle.bg,
            catStyle.text,
          )}
        >
          {panel.category}
        </span>

        {panel.targetSex && (
          <span className="inline-flex items-center bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600">
            {panel.targetSex === "male" ? "Male" : "Female"}
          </span>
        )}

        <span className="text-xs text-neutral-500">
          {panel.metricCount} biomarkers
        </span>

        {panel.estimatedCostLow != null && panel.estimatedCostHigh != null && (
          <span className="ml-auto text-xs font-medium text-neutral-600">
            ${panel.estimatedCostLow} – ${panel.estimatedCostHigh}
          </span>
        )}
      </div>
    </Link>
  );
}
