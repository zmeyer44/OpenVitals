"use client";

import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc/client";
import { TitleActionHeader } from "@/components/title-action-header";
import { StatusBadge } from "@/components/health/status-badge";
import Link from "next/link";
import { Microscope } from "lucide-react";

// Thresholds: < 90 days = recent, < recommended interval = stale, null = never
function getRowStatus(
  daysSinceTest: number | null,
): "recent" | "stale" | "never" {
  if (daysSinceTest === null) return "never";
  if (daysSinceTest <= 180) return "recent";
  return "stale";
}

const rowColors = {
  recent:
    "bg-[var(--color-health-normal-bg)] border-[var(--color-health-normal-border)]",
  stale:
    "bg-[var(--color-health-warning-bg)] border-[var(--color-health-warning-border)]",
  never: "bg-neutral-50 border-neutral-200",
};

export default function PanelDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: panel, isLoading } = trpc.testing[
    "panels.getByIdWithStatus"
  ].useQuery({ id: params.id });

  if (isLoading) {
    return (
      <div>
        <TitleActionHeader title={undefined} showBackButton />
        <div className="mt-5 space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-xl border border-neutral-200 bg-neutral-50"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!panel) {
    return (
      <div>
        <TitleActionHeader title="Panel Not Found" showBackButton />
        <p className="mt-4 text-sm text-neutral-500">
          This panel does not exist.
        </p>
      </div>
    );
  }

  return (
    <div>
      <TitleActionHeader
        title={panel.name}
        subtitle={panel.description ?? undefined}
        showBackButton
        underTitle={
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
              {panel.category}
            </span>
            {panel.estimatedCostLow != null &&
              panel.estimatedCostHigh != null && (
                <span className="text-sm text-neutral-600">
                  ${panel.estimatedCostLow} – ${panel.estimatedCostHigh}
                </span>
              )}
            {panel.targetSex && (
              <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
                {panel.targetSex === "male" ? "Male" : "Female"}
              </span>
            )}
          </div>
        }
      />

      {/* Summary */}
      <div className="mt-4 mb-4 flex items-center gap-2">
        <div className="rounded-lg border border-neutral-200 bg-white px-4 py-2.5">
          <p className="text-xs text-neutral-500">Coverage</p>
          <p className="text-lg font-medium tabular-nums text-neutral-900">
            {panel.testedCount}
            <span className="text-neutral-400">/{panel.totalCount}</span>
          </p>
        </div>
        <p className="text-xs text-neutral-500">
          You have data for {panel.testedCount} of {panel.totalCount} biomarkers
          in this panel.
        </p>
      </div>

      {/* Metric list */}
      <div className="space-y-1.5">
        {panel.metrics.map((m) => {
          const status = getRowStatus(m.daysSinceTest);
          return (
            <div
              key={m.metricCode}
              className={cn(
                "flex items-center justify-between gap-3 rounded-xl border px-4 py-3",
                rowColors[status],
              )}
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-neutral-900 truncate">
                    {m.name}
                  </span>
                  <span className="shrink-0 inline-flex items-center rounded-full bg-white/60 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500">
                    {m.category}
                  </span>
                </div>
                {m.latestValue !== null && m.observedAt && (
                  <span className="text-xs text-neutral-500">
                    <span className="tabular-nums font-medium text-neutral-700">
                      {m.latestValue} {m.unit ?? ""}
                    </span>
                    {" · "}
                    {new Date(m.observedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {m.daysSinceTest !== null && (
                      <span className="text-neutral-400">
                        {" "}
                        ({m.daysSinceTest}d ago)
                      </span>
                    )}
                  </span>
                )}
                {m.latestValue === null && (
                  <span className="text-xs text-neutral-400">No data</span>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {m.healthStatus && (
                  <StatusBadge status={m.healthStatus} label={m.healthStatus} />
                )}
                {m.optimalStatus === "suboptimal" && (
                  <span className="inline-flex items-center rounded-full bg-[var(--color-health-optimal-bg)] border border-[var(--color-health-optimal-border)] px-2 py-[3px] text-xs font-medium text-[var(--color-health-optimal)]">
                    Suboptimal
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Find a lab link */}
      <div className="mt-6">
        <Link
          href="/testing?tab=directory"
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-4 py-2.5",
            "border border-neutral-200 bg-white text-sm font-medium text-neutral-700",
            "transition-colors hover:border-[var(--color-accent-300)] hover:text-[var(--color-accent-600)]",
          )}
        >
          <Microscope className="h-4 w-4" />
          Find a lab to get tested
        </Link>
      </div>
    </div>
  );
}
