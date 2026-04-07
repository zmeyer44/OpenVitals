"use client";

import Link from "next/link";
import { Clock, ChevronRight, FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RetestItem {
  metricCode: string;
  metricName: string;
  urgency: "overdue" | "due_soon" | "upcoming" | "on_track" | "never_tested";
  dueInDays: number;
  daysSinceLastTest: number;
  healthStatus: string;
  preventionPanel?: string | null;
  preventionWhy?: string | null;
}

interface UpcomingRetestsProps {
  items: RetestItem[];
}

const urgencyStyles: Record<
  string,
  { dot: string; text: string; label: string }
> = {
  overdue: {
    dot: "bg-testing-overdue",
    text: "text-testing-overdue",
    label: "OVERDUE",
  },
  due_soon: {
    dot: "bg-testing-due",
    text: "text-testing-due",
    label: "DUE SOON",
  },
  upcoming: {
    dot: "bg-testing-upcoming",
    text: "text-testing-upcoming",
    label: "UPCOMING",
  },
  on_track: {
    dot: "bg-testing-on-track",
    text: "text-testing-on-track",
    label: "ON TRACK",
  },
  never_tested: {
    dot: "bg-neutral-300",
    text: "text-neutral-500",
    label: "GET TESTED",
  },
};

export function UpcomingRetests({ items }: UpcomingRetestsProps) {
  // Show actionable items: overdue/due_soon/upcoming first, then prevention gaps
  const actionable = items.filter((i) => i.urgency !== "on_track").slice(0, 8);

  if (actionable.length === 0) return null;

  // Split into retests and prevention gaps for visual grouping
  const retests = actionable.filter((i) => i.urgency !== "never_tested");
  const gaps = actionable.filter((i) => i.urgency === "never_tested");

  return (
    <div className="card">
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <Clock className="size-3.5 text-neutral-400" />
          <h2 className="text-[13px] font-semibold text-neutral-900 font-display">
            Upcoming Retests
          </h2>
        </div>
        <Link
          href="/testing"
          className="text-[11px] font-mono text-neutral-400 hover:text-neutral-600 transition-colors flex items-center gap-1"
        >
          Plan
          <ChevronRight className="size-3" />
        </Link>
      </div>
      <div className="divide-y divide-neutral-100">
        {retests.map((item) => {
          const style = urgencyStyles[item.urgency] ?? urgencyStyles.on_track;
          const dueText =
            item.dueInDays <= 0
              ? `${Math.abs(item.dueInDays)}d overdue`
              : `in ${item.dueInDays}d`;

          return (
            <div key={item.metricCode} className="flex items-center px-4 py-3">
              <span
                className={cn(
                  "size-[5px] rounded-full shrink-0 mr-3",
                  style.dot,
                )}
              />
              <div className="flex-1 min-w-0">
                <span className="text-[12px] font-medium text-neutral-700 font-body truncate block">
                  {item.metricName}
                </span>
                <span className="text-[10px] font-mono text-neutral-400">
                  Last tested {item.daysSinceLastTest}d ago
                </span>
              </div>
              <span
                className={cn(
                  "text-[10px] font-mono font-bold uppercase tracking-[0.04em]",
                  style.text,
                )}
              >
                {dueText}
              </span>
            </div>
          );
        })}

        {/* Prevention gap separator */}
        {gaps.length > 0 && retests.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-neutral-50">
            <FlaskConical className="size-3 text-neutral-400" />
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-[0.06em]">
              Recommended tests
            </span>
          </div>
        )}

        {gaps.map((item) => (
          <div
            key={item.metricCode}
            className="flex items-center px-4 py-3 bg-neutral-50/50"
          >
            <span className="size-[5px] rounded-full shrink-0 mr-3 bg-neutral-300 ring-2 ring-neutral-200" />
            <div className="flex-1 min-w-0">
              <span className="text-[12px] font-medium text-neutral-600 font-body truncate block">
                {item.metricName}
              </span>
              {item.preventionPanel && (
                <span className="text-[10px] font-mono text-neutral-400">
                  {item.preventionPanel}
                </span>
              )}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.04em] text-accent-500">
              Get tested
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
