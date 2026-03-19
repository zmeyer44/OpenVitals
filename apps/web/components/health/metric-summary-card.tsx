import Link from 'next/link';
import { MiniSparkline } from './mini-sparkline';
import { StatusBadge, type HealthStatus } from './status-badge';
import { cn } from '@/lib/utils';

interface MetricSummaryCardProps {
  metricCode: string;
  name: string;
  latestValue: string;
  unit: string;
  status: HealthStatus;
  statusLabel: string;
  resultCount: number;
  sparkData: number[];
  referenceRange: string;
  latestDate: string;
}

const statusValueColor: Record<string, string> = {
  normal: 'text-neutral-900',
  warning: 'text-[var(--color-health-warning)]',
  critical: 'text-[var(--color-health-critical)]',
  info: 'text-accent-600',
  neutral: 'text-neutral-600',
};

const sparkColor: Record<string, string> = {
  normal: 'var(--color-accent-500)',
  warning: 'var(--color-health-warning)',
  critical: 'var(--color-health-critical)',
  info: 'var(--color-accent-500)',
  neutral: 'var(--color-neutral-400)',
};

export function MetricSummaryCard({
  metricCode,
  name,
  latestValue,
  unit,
  status,
  statusLabel,
  resultCount,
  sparkData,
  referenceRange,
  latestDate,
}: MetricSummaryCardProps) {
  return (
    <Link
      href={`/labs/${metricCode}`}
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-5 min-w-0',
        'hover:border-accent-200 hover:shadow-sm transition-all cursor-pointer',
      )}
    >
      {/* Header: name + badge */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-[13px] font-medium tracking-[0.02em] text-neutral-500 font-body truncate">
          {name}
        </span>
        <StatusBadge status={status} label={statusLabel} className="shrink-0" />
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1.5">
        <span
          className={cn(
            'text-[28px] font-medium tracking-[-0.03em] font-display',
            statusValueColor[status] ?? statusValueColor.normal,
          )}
        >
          {latestValue}
        </span>
        <span className="text-[13px] text-neutral-400 font-mono">{unit}</span>
      </div>

      {/* Sparkline + meta */}
      <div className="flex items-end justify-between gap-2">
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-[11px] text-neutral-400 font-mono truncate">
            {referenceRange}
          </span>
          <span className="text-[11px] text-neutral-400 font-mono">
            {resultCount} result{resultCount !== 1 ? 's' : ''} · {latestDate}
          </span>
        </div>
        <MiniSparkline
          data={sparkData}
          color={sparkColor[status] ?? sparkColor.normal!}
        />
      </div>
    </Link>
  );
}
