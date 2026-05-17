'use client';

import { MiniSparkline } from '@/components/health/mini-sparkline';
import { StatusBadge } from '@/components/health/status-badge';
import { useDynamicStatus } from '@/hooks/use-dynamic-status';
import { formatDate } from '@/lib/utils';

// --- Labs Preview ---

interface LabsPreviewContentProps {
  items: Array<{
    metricCode: string;
    isAbnormal?: boolean | null;
    valueNumeric?: number | null;
    referenceRangeLow?: number | null;
    referenceRangeHigh?: number | null;
    observedAt: string | Date;
  }>;
}

export function LabsPreviewContent({ items }: LabsPreviewContentProps) {
  const { getStatus, isAbnormal: isObsAbnormal } = useDynamicStatus();

  if (items.length === 0) {
    return <p className="text-[13px] text-neutral-400 font-body">No lab results yet</p>;
  }

  const byMetric = new Map<string, typeof items>();
  for (const item of items) {
    const existing = byMetric.get(item.metricCode) ?? [];
    existing.push(item);
    byMetric.set(item.metricCode, existing);
  }

  const abnormalCount = items.filter((i) => isObsAbnormal(i)).length;
  const metricCount = byMetric.size;

  // Top 3 metrics by count, abnormal first
  const topMetrics = Array.from(byMetric.entries())
    .map(([code, obs]) => {
      const sorted = [...obs].sort(
        (a, b) => new Date(b.observedAt).getTime() - new Date(a.observedAt).getTime(),
      );
      const sparkData = sorted.slice(0, 6).reverse().map((o) => o.valueNumeric ?? 0);
      const status = getStatus(sorted[0]!);
      return { code, sparkData, status };
    })
    .sort((a, b) => {
      const aAbn = a.status !== 'normal' ? 1 : 0;
      const bAbn = b.status !== 'normal' ? 1 : 0;
      return bAbn - aAbn;
    })
    .slice(0, 3);

  const statusColor = {
    normal: 'var(--color-health-normal)',
    warning: 'var(--color-health-warning)',
    critical: 'var(--color-health-critical)',
  } as const;

  return (
    <div>
      <div className="flex items-baseline gap-3">
        <span className="text-[22px] font-semibold text-neutral-900 font-mono">{metricCount}</span>
        <span className="text-[13px] text-neutral-500 font-body">metrics tracked</span>
        {abnormalCount > 0 && (
          <StatusBadge status="warning" label={`${abnormalCount} flagged`} />
        )}
      </div>
      <div className="mt-3 space-y-2">
        {topMetrics.map((m) => (
          <div key={m.code} className="flex items-center justify-between">
            <span className="text-[12px] text-neutral-600 font-body capitalize">
              {m.code.replace(/_/g, ' ')}
            </span>
            {m.sparkData.length >= 2 && (
              <MiniSparkline
                data={m.sparkData}
                color={statusColor[m.status as keyof typeof statusColor] ?? statusColor.normal}
                width={64}
                height={20}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Medications Preview ---

interface MedicationsPreviewContentProps {
  items: Array<{
    id: string;
    name: string;
    isActive: boolean | null;
  }>;
}

export function MedicationsPreviewContent({ items }: MedicationsPreviewContentProps) {
  if (items.length === 0) {
    return <p className="text-[13px] text-neutral-400 font-body">No medications added</p>;
  }

  const active = items.filter((m) => m.isActive);
  const top3 = active.slice(0, 3);

  return (
    <div>
      <div className="flex items-baseline gap-3">
        <span className="text-[22px] font-semibold text-neutral-900 font-mono">{active.length}</span>
        <span className="text-[13px] text-neutral-500 font-body">active</span>
      </div>
      <div className="mt-3 space-y-1.5">
        {top3.map((m) => (
          <div key={m.id} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-health-normal" />
            <span className="text-[12px] text-neutral-600 font-body">{m.name}</span>
          </div>
        ))}
        {active.length > 3 && (
          <p className="text-[11px] text-neutral-400 font-body">
            +{active.length - 3} more
          </p>
        )}
      </div>
    </div>
  );
}

// --- Timeline Preview ---

interface TimelinePreviewContentProps {
  eventCount: number;
  latestEvent: { title: string; status: 'normal' | 'warning' | 'critical' | 'info' | 'neutral'; label: string } | null;
}

export function TimelinePreviewContent({ eventCount, latestEvent }: TimelinePreviewContentProps) {
  if (eventCount === 0) {
    return <p className="text-[13px] text-neutral-400 font-body">No events yet</p>;
  }

  return (
    <div>
      <div className="flex items-baseline gap-3">
        <span className="text-[22px] font-semibold text-neutral-900 font-mono">{eventCount}</span>
        <span className="text-[13px] text-neutral-500 font-body">events</span>
      </div>
      {latestEvent && (
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-[12px] text-neutral-600 font-body truncate">{latestEvent.title}</span>
          <StatusBadge status={latestEvent.status} label={latestEvent.label} />
        </div>
      )}
    </div>
  );
}

// --- Uploads Preview ---

interface UploadsPreviewContentProps {
  items: Array<{
    id: string;
    status: string;
    createdAt: string | Date | null;
    fileName?: string | null;
  }>;
}

export function UploadsPreviewContent({ items }: UploadsPreviewContentProps) {
  if (items.length === 0) {
    return <p className="text-[13px] text-neutral-400 font-body">No uploads yet</p>;
  }

  const latest = items[0]!;
  const statusMap: Record<string, { status: 'normal' | 'warning' | 'info' | 'neutral'; label: string }> = {
    completed: { status: 'normal', label: 'Completed' },
    processing: { status: 'info', label: 'Processing' },
    failed: { status: 'warning', label: 'Failed' },
  };
  const badge = statusMap[latest.status] ?? { status: 'neutral' as const, label: latest.status };

  return (
    <div>
      <div className="flex items-baseline gap-3">
        <span className="text-[22px] font-semibold text-neutral-900 font-mono">{items.length}</span>
        <span className="text-[13px] text-neutral-500 font-body">uploads</span>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-[12px] text-neutral-600 font-body truncate">
          {latest.fileName ?? formatDate(latest.createdAt)}
        </span>
        <StatusBadge status={badge.status} label={badge.label} />
      </div>
    </div>
  );
}

// --- AI Chat Preview ---

export function AIChatPreviewContent() {
  return (
    <div>
      <p className="text-[13px] text-neutral-500 font-body">
        Ask about your health data...
      </p>
      <div className="mt-3 border border-neutral-100 bg-neutral-50 px-3 py-2">
        <p className="text-[12px] text-neutral-400 font-body italic">
          &ldquo;What do my recent lab results mean?&rdquo;
        </p>
      </div>
    </div>
  );
}
