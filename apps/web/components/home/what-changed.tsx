import { cn } from "@/lib/utils";

interface ChangeItem {
  metricCode: string;
  name: string;
  oldValue: number;
  newValue: number;
  unit: string;
  percentChange: number;
  improved: boolean;
}

interface WhatChangedProps {
  changes: ChangeItem[];
  previousDate: string;
  currentDate: string;
}

export type { ChangeItem };

export function WhatChanged({
  changes,
  previousDate,
  currentDate,
}: WhatChangedProps) {
  if (changes.length === 0) return null;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-[15px] font-medium font-display tracking-[-0.02em] text-neutral-900">
          What Changed
        </h2>
        <span className="text-[11px] font-mono text-neutral-400">
          {previousDate} vs {currentDate}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {changes.map((c) => (
          <div
            key={c.metricCode}
            className="card flex items-center justify-between p-3 gap-3"
          >
            <div className="min-w-0">
              <span className="text-[12px] font-medium text-neutral-600 font-display truncate block">
                {c.name}
              </span>
              <span className="text-[11px] font-mono text-neutral-400">
                {c.oldValue.toFixed(1)} &rarr; {c.newValue.toFixed(1)} {c.unit}
              </span>
            </div>
            <span
              className={cn(
                "text-[13px] font-mono font-medium shrink-0",
                c.improved
                  ? "text-[var(--color-health-normal)]"
                  : "text-[var(--color-health-warning)]",
              )}
            >
              {c.percentChange > 0 ? "+" : ""}
              {c.percentChange.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
