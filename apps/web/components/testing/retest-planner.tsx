"use client";

import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc/client";
import { RetestItem } from "./retest-item";
import { RetestSettingsDialog } from "./retest-settings-dialog";
import { useState } from "react";

type Urgency = "overdue" | "due_soon" | "upcoming" | "on_track";

const urgencyConfig: Record<
  Urgency,
  { label: string; color: string; bg: string }
> = {
  overdue: {
    label: "Overdue",
    color: "var(--color-testing-overdue)",
    bg: "var(--color-testing-overdue-bg)",
  },
  due_soon: {
    label: "Due Soon",
    color: "var(--color-testing-due)",
    bg: "var(--color-testing-due-bg)",
  },
  upcoming: {
    label: "Upcoming",
    color: "var(--color-testing-upcoming)",
    bg: "var(--color-testing-upcoming-bg)",
  },
  on_track: {
    label: "On Track",
    color: "var(--color-testing-on-track)",
    bg: "var(--color-testing-on-track-bg)",
  },
};

export function RetestPlanner() {
  const utils = trpc.useUtils();
  const { data: items, isLoading } =
    trpc.testing["retest.getRecommendations"].useQuery();
  const setOverride = trpc.testing["retest.setOverride"].useMutation({
    onSuccess: () => utils.testing["retest.getRecommendations"].invalidate(),
  });
  const deleteOverride = trpc.testing["retest.deleteOverride"].useMutation({
    onSuccess: () => utils.testing["retest.getRecommendations"].invalidate(),
  });
  const togglePause = trpc.testing["retest.togglePause"].useMutation({
    onSuccess: () => utils.testing["retest.getRecommendations"].invalidate(),
  });

  const [editMetric, setEditMetric] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl border border-neutral-200 bg-neutral-50"
            />
          ))}
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl border border-neutral-200 bg-neutral-50"
          />
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center">
        <p className="text-sm text-neutral-500">
          No lab data yet. Upload a lab report to get personalized retest
          recommendations.
        </p>
      </div>
    );
  }

  // Group by urgency
  const groups: Record<Urgency, typeof items> = {
    overdue: [],
    due_soon: [],
    upcoming: [],
    on_track: [],
  };
  for (const item of items) {
    groups[item.urgency as Urgency].push(item);
  }

  const counts = {
    overdue: groups.overdue.length,
    due_soon: groups.due_soon.length,
    upcoming: groups.upcoming.length,
    on_track: groups.on_track.length,
  };

  const editingItem = editMetric
    ? items.find((i) => i.metricCode === editMetric)
    : null;

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 stagger-children">
        {(
          Object.entries(urgencyConfig) as [
            Urgency,
            (typeof urgencyConfig)[Urgency],
          ][]
        ).map(([key, config]) => (
          <div
            key={key}
            className="rounded-xl border border-neutral-200 bg-white p-3.5"
          >
            <p className="text-xs font-medium text-neutral-500">
              {config.label}
            </p>
            <p
              className="mt-1 stat-number text-2xl"
              style={{ color: config.color }}
            >
              {counts[key]}
            </p>
          </div>
        ))}
      </div>

      {/* Grouped lists */}
      {(["overdue", "due_soon", "upcoming", "on_track"] as Urgency[]).map(
        (urgency) => {
          const group = groups[urgency];
          if (group.length === 0) return null;
          const config = urgencyConfig[urgency];

          return (
            <div key={urgency}>
              <h3
                className="mb-2 text-xs font-semibold uppercase tracking-wider"
                style={{ color: config.color }}
              >
                {config.label} ({group.length})
              </h3>
              <div className="space-y-2">
                {group.map((item) => (
                  <RetestItem
                    key={item.metricCode}
                    item={item}
                    onCustomize={setEditMetric}
                    onTogglePause={(code, paused) =>
                      togglePause.mutate({ metricCode: code, isPaused: paused })
                    }
                  />
                ))}
              </div>
            </div>
          );
        },
      )}

      {/* Settings dialog */}
      {editingItem && (
        <RetestSettingsDialog
          metricCode={editingItem.metricCode}
          metricName={editingItem.metricName}
          currentIntervalDays={editingItem.userOverrideIntervalDays}
          onSave={(code, days) => {
            setOverride.mutate({ metricCode: code, retestIntervalDays: days });
            setEditMetric(null);
          }}
          onReset={(code) => {
            deleteOverride.mutate({ metricCode: code });
            setEditMetric(null);
          }}
          onClose={() => setEditMetric(null)}
        />
      )}
    </div>
  );
}
