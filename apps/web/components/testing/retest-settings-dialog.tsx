"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { X } from "lucide-react";

interface RetestSettingsDialogProps {
  metricCode: string;
  metricName: string;
  currentIntervalDays: number | null;
  onSave: (metricCode: string, days: number) => void;
  onReset: (metricCode: string) => void;
  onClose: () => void;
}

const presets = [
  { label: "1 mo", days: 30 },
  { label: "3 mo", days: 90 },
  { label: "6 mo", days: 180 },
  { label: "1 yr", days: 365 },
];

export function RetestSettingsDialog({
  metricCode,
  metricName,
  currentIntervalDays,
  onSave,
  onReset,
  onClose,
}: RetestSettingsDialogProps) {
  const [days, setDays] = useState<number>(currentIntervalDays ?? 180);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-5 shadow-xl animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-neutral-900">
            Retest Interval
          </h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-neutral-500 mb-4">
          Set how often you want to retest{" "}
          <span className="font-medium text-neutral-700">{metricName}</span>.
        </p>

        <div className="flex gap-2 mb-4">
          {presets.map((p) => (
            <button
              key={p.days}
              onClick={() => setDays(p.days)}
              className={cn(
                "flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors",
                days === p.days
                  ? "bg-[var(--color-accent-500)] text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="mb-5">
          <label className="text-xs text-neutral-500 mb-1 block">
            Custom (days)
          </label>
          <input
            type="number"
            min={1}
            max={730}
            value={days}
            onChange={(e) =>
              setDays(Math.max(1, parseInt(e.target.value) || 1))
            }
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 tabular-nums"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSave(metricCode, days)}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-xs font-medium",
              "bg-[var(--color-accent-500)] text-white",
              "transition-colors hover:bg-[var(--color-accent-600)]",
            )}
          >
            Save
          </button>
          {currentIntervalDays !== null && (
            <button
              onClick={() => onReset(metricCode)}
              className="rounded-lg px-3 py-2 text-xs font-medium text-neutral-500 hover:bg-neutral-100 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
