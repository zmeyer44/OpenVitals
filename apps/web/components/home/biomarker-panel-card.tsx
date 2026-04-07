import Link from "next/link";
import { MiniSparkline } from "@/components/health/mini-sparkline";
import { cn } from "@/lib/utils";
import type { HealthStatus } from "@/components/health/status-badge";

interface BiomarkerPanelCardProps {
  metricCode: string;
  name: string;
  value: number;
  unit: string;
  sparkData: number[];
  trendDelta: number | null;
  trendImproving: boolean | null;
  optimalRange: string;
  status: HealthStatus;
}

const statusValueColor: Record<string, string> = {
  normal: "text-neutral-900",
  warning: "text-[var(--color-health-warning)]",
  critical: "text-[var(--color-health-critical)]",
  info: "text-neutral-900",
  neutral: "text-neutral-600",
};

const sparkColor: Record<string, string> = {
  normal: "var(--color-accent-500)",
  warning: "var(--color-health-warning)",
  critical: "var(--color-health-critical)",
  info: "var(--color-accent-500)",
  neutral: "var(--color-neutral-400)",
};

const statusDotColor: Record<string, string> = {
  normal: "bg-[var(--color-health-normal)]",
  warning: "bg-[var(--color-health-warning)]",
  critical: "bg-[var(--color-health-critical)]",
  info: "bg-[var(--color-health-info)]",
  neutral: "bg-neutral-400",
};

function formatDelta(delta: number): string {
  const sign = delta > 0 ? "+" : "";
  return `${sign}${Math.round(delta)}%`;
}

export function BiomarkerPanelCard({
  metricCode,
  name,
  value,
  unit,
  sparkData,
  trendDelta,
  trendImproving,
  optimalRange,
  status,
}: BiomarkerPanelCardProps) {
  return (
    <Link
      href={`/labs/${metricCode}`}
      className={cn(
        "card flex flex-col gap-2 p-4 min-w-0",
        "hover:border-accent-200 transition-all cursor-pointer",
      )}
    >
      {/* Row 1: name + trend delta */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={cn(
              "size-[6px] shrink-0 rounded-full",
              statusDotColor[status],
            )}
          />
          <span className="text-[12px] font-medium tracking-[0.02em] text-neutral-500 font-display truncate uppercase">
            {name}
          </span>
        </div>
        {trendDelta !== null && (
          <span
            className={cn(
              "text-[11px] font-mono font-medium shrink-0",
              trendImproving === true
                ? "text-[var(--color-health-normal)]"
                : trendImproving === false
                  ? "text-[var(--color-health-warning)]"
                  : "text-neutral-400",
            )}
          >
            {formatDelta(trendDelta)}
          </span>
        )}
      </div>

      {/* Row 2: value + sparkline */}
      <div className="flex items-end justify-between gap-2">
        <div className="flex items-baseline gap-1">
          <span
            className={cn(
              "text-[22px] font-medium tracking-[-0.03em] font-display",
              statusValueColor[status] ?? statusValueColor.normal,
            )}
          >
            {Number.isInteger(value) ? value : value.toFixed(1)}
          </span>
          <span className="text-[11px] text-neutral-400 font-mono">{unit}</span>
        </div>
        <MiniSparkline
          data={sparkData}
          color={sparkColor[status] ?? sparkColor.normal!}
          width={80}
          height={24}
        />
      </div>

      {/* Row 3: range info */}
      <span className="text-[10px] text-neutral-400 font-mono truncate">
        {optimalRange}
      </span>
    </Link>
  );
}
