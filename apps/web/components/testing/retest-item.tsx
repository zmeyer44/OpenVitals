"use client";

import { cn } from "@/lib/utils";
import {
  StatusBadge,
  type HealthStatus,
} from "@/components/health/status-badge";
import Link from "next/link";
import {
  MoreHorizontal,
  Settings2,
  Pause,
  Play,
  TrendingUp,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

type Urgency =
  | "overdue"
  | "due_soon"
  | "upcoming"
  | "on_track"
  | "never_tested";

interface RetestRecommendation {
  metricCode: string;
  metricName: string;
  category: string;
  unit: string | null;
  lastValue: number | null;
  lastObservedAt: string | null;
  daysSinceLastTest: number;
  healthStatus: HealthStatus;
  optimalStatus: "optimal" | "suboptimal" | "unknown";
  recommendedIntervalDays: number;
  userOverrideIntervalDays: number | null;
  effectiveIntervalDays: number;
  isPaused: boolean;
  urgency: Urgency;
  dueInDays: number;
  preventionPanel?: string | null;
  preventionWhy?: string | null;
}

interface RetestItemProps {
  item: RetestRecommendation;
  onCustomize: (metricCode: string) => void;
  onTogglePause: (metricCode: string, isPaused: boolean) => void;
}

const urgencyStyles: Record<Urgency, { text: string; bar: string }> = {
  overdue: {
    text: "text-[var(--color-testing-overdue)]",
    bar: "bg-[var(--color-testing-overdue)]",
  },
  due_soon: {
    text: "text-[var(--color-testing-due)]",
    bar: "bg-[var(--color-testing-due)]",
  },
  upcoming: {
    text: "text-[var(--color-testing-upcoming)]",
    bar: "bg-[var(--color-testing-upcoming)]",
  },
  on_track: {
    text: "text-[var(--color-testing-on-track)]",
    bar: "bg-[var(--color-testing-on-track)]",
  },
  never_tested: {
    text: "text-neutral-500",
    bar: "bg-neutral-300",
  },
};

function formatDueText(dueInDays: number): string {
  if (dueInDays <= -1) return `${Math.abs(dueInDays)} days overdue`;
  if (dueInDays === 0) return "Due now";
  return `Due in ${dueInDays} days`;
}

function formatDaysAgo(days: number): string {
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} mo ago`;
  return `${(days / 365).toFixed(1)} yr ago`;
}

export function RetestItem({
  item,
  onCustomize,
  onTogglePause,
}: RetestItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const style = urgencyStyles[item.urgency];

  const progressPct = Math.min(
    100,
    Math.max(0, (item.daysSinceLastTest / item.effectiveIntervalDays) * 100),
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-3.5",
        item.isPaused && "opacity-50",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-neutral-900 truncate">
              {item.metricName}
            </span>
            <span className="shrink-0 inline-flex items-center rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500">
              {item.category}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            {item.lastValue !== null && (
              <span className="tabular-nums font-medium text-neutral-700">
                {item.lastValue} {item.unit ?? ""}
              </span>
            )}
            <span>{formatDaysAgo(item.daysSinceLastTest)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <StatusBadge status={item.healthStatus} label={item.healthStatus} />
          {item.optimalStatus === "suboptimal" && (
            <span className="inline-flex items-center rounded-full bg-[var(--color-health-optimal-bg)] border border-[var(--color-health-optimal-border)] px-2 py-[3px] text-xs font-medium text-[var(--color-health-optimal)]">
              Suboptimal
            </span>
          )}

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
                <button
                  onClick={() => {
                    onCustomize(item.metricCode);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50"
                >
                  <Settings2 className="h-3.5 w-3.5" />
                  Customize interval
                </button>
                <button
                  onClick={() => {
                    onTogglePause(item.metricCode, !item.isPaused);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50"
                >
                  {item.isPaused ? (
                    <Play className="h-3.5 w-3.5" />
                  ) : (
                    <Pause className="h-3.5 w-3.5" />
                  )}
                  {item.isPaused ? "Resume" : "Pause"}
                </button>
                <Link
                  href={`/labs/${item.metricCode}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50"
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  View trend
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar">
        <div
          className={cn("progress-bar-fill", style.bar)}
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className={cn("text-xs font-medium", style.text)}>
        {item.isPaused ? "Paused" : formatDueText(item.dueInDays)}
      </div>
    </div>
  );
}
