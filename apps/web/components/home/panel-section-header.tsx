import { cn } from "@/lib/utils";

interface PanelSectionHeaderProps {
  label: string;
  inRangeCount: number;
  warningCount: number;
  criticalCount: number;
  totalTested: number;
  totalMetrics: number;
}

export function PanelSectionHeader({
  label,
  inRangeCount,
  warningCount,
  criticalCount,
  totalTested,
  totalMetrics,
}: PanelSectionHeaderProps) {
  const untestedCount = totalMetrics - totalTested;

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[15px] font-medium font-display tracking-[-0.02em] text-neutral-900">
          {label}
        </h2>
        <div className="flex items-center gap-2">
          {totalTested > 0 && (
            <span className="text-[11px] font-mono text-neutral-500">
              {inRangeCount}/{totalTested} in range
            </span>
          )}
          {untestedCount > 0 && (
            <span className="text-[11px] font-mono text-neutral-300">
              {totalTested === 0
                ? `0/${totalMetrics} tested`
                : `· ${untestedCount} untested`}
            </span>
          )}
        </div>
      </div>
      {/* Progress bar — full width, untested shown as striped pattern */}
      <div className="flex h-1.5 w-full overflow-hidden rounded-full">
        {inRangeCount > 0 && (
          <div
            className="bg-[var(--color-health-normal)]"
            style={{ width: `${(inRangeCount / totalMetrics) * 100}%` }}
          />
        )}
        {warningCount > 0 && (
          <div
            className="bg-[var(--color-health-warning)]"
            style={{ width: `${(warningCount / totalMetrics) * 100}%` }}
          />
        )}
        {criticalCount > 0 && (
          <div
            className="bg-[var(--color-health-critical)]"
            style={{ width: `${(criticalCount / totalMetrics) * 100}%` }}
          />
        )}
        {/* Untested: striped pattern */}
        {untestedCount > 0 && (
          <div
            className="flex-1"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, var(--color-neutral-200) 0px, var(--color-neutral-200) 2px, transparent 2px, transparent 5px)",
            }}
          />
        )}
        {/* Nothing tested at all */}
        {totalTested === 0 && <div className="flex-1 bg-neutral-100" />}
      </div>
    </div>
  );
}
