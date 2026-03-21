import { MiniSparkline } from './mini-sparkline';
import type { HealthStatus } from './status-badge';

interface MetricCardProps {
  title: string;
  value: string;
  unit: string;
  delta: string;
  deltaDirection: 'up' | 'down' | 'stable';
  sparkData: number[];
  status: HealthStatus;
}

const statusValueColor: Record<string, string> = {
  normal: 'var(--color-neutral-900)',
  warning: 'var(--color-health-warning)',
  critical: 'var(--color-health-critical)',
};

const deltaColor: Record<string, string> = {
  down: 'var(--color-health-normal)',
  up: 'var(--color-health-warning)',
  stable: 'var(--color-neutral-400)',
};

const sparkColor: Record<string, string> = {
  normal: 'var(--color-accent-500)',
  warning: 'var(--color-health-warning)',
  critical: 'var(--color-health-critical)',
};

const deltaArrow: Record<string, string> = {
  up: '\u2191',
  down: '\u2193',
  stable: '\u2192',
};

export function MetricCard({ title, value, unit, delta, deltaDirection, sparkData, status }: MetricCardProps) {
  return (
    <div className="flex flex-col gap-3 border border-neutral-200 bg-white p-5 min-w-0">
      <div
        className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400"
      >
        {title}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          className="text-[32px] font-medium tracking-[-0.03em]"
          style={{
            fontFamily: 'var(--font-display)',
            color: statusValueColor[status] ?? statusValueColor.normal,
          }}
        >
          {value}
        </span>
        <span
          className="text-[13px] text-neutral-400 font-mono"
        >
          {unit}
        </span>
      </div>
      <div className="flex items-end justify-between">
        <div
          className="flex items-center gap-1 text-xs font-medium"
          style={{
            fontFamily: 'var(--font-mono)',
            color: deltaColor[deltaDirection],
          }}
        >
          <span>{deltaArrow[deltaDirection]}</span>
          <span>{delta}</span>
        </div>
        <MiniSparkline
          data={sparkData}
          color={sparkColor[status] ?? sparkColor.normal!}
        />
      </div>
    </div>
  );
}
