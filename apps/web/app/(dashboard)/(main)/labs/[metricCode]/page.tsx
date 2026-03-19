'use client';

import { use, useMemo } from 'react';
import { trpc } from '@/lib/trpc/client';
import { TitleActionHeader } from '@/components/title-action-header';
import { StatusBadge, type HealthStatus } from '@/components/health/status-badge';
import { TrendChart } from '@/components/health/trend-chart';
import { deriveStatus, formatRange } from '@/lib/health-utils';
import { cn, formatDate } from '@/lib/utils';
import { DataTable, type DataTableColumn } from '@/components/data-table';

function formatMetricName(code: string) {
  return code.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function SummaryCard({
  label,
  value,
  subtext,
  variant = 'default',
}: {
  label: string;
  value: string;
  subtext?: string;
  variant?: 'default' | 'warning' | 'success' | 'accent';
}) {
  const valueColor = {
    default: 'text-neutral-900',
    warning: 'text-[var(--color-health-warning)]',
    success: 'text-[var(--color-health-normal)]',
    accent: 'text-accent-600',
  }[variant];

  return (
    <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3.5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-neutral-400 font-mono">
        {label}
      </div>
      <div className={cn('mt-1 text-2xl font-medium tracking-[-0.03em] font-display', valueColor)}>
        {value}
      </div>
      {subtext && (
        <div className="mt-0.5 text-[11px] text-neutral-400 font-mono">{subtext}</div>
      )}
    </div>
  );
}

export default function LabDetailPage({
  params,
}: {
  params: Promise<{ metricCode: string }>;
}) {
  const { metricCode } = use(params);

  const { data, isLoading } = trpc.observations.list.useQuery({
    metricCode,
    limit: 200,
  });

  // Date range for trend query: 1 year ago to now
  const dateFrom = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    return d;
  }, []);
  const dateTo = useMemo(() => new Date(), []);

  const { data: trendData } = trpc.observations.trend.useQuery({
    metricCode,
    dateFrom,
    dateTo,
    granularity: 'raw',
  });

  const items = data?.items ?? [];
  const sorted = useMemo(
    () =>
      [...items].sort(
        (a, b) => new Date(b.observedAt).getTime() - new Date(a.observedAt).getTime(),
      ),
    [items],
  );

  type Observation = (typeof items)[number];

  const resultColumns: DataTableColumn<Observation>[] = useMemo(
    () => [
      {
        id: 'date',
        header: 'Date',
        width: '1fr',
        cell: (obs) => (
          <div className="text-xs text-neutral-500 font-mono">
            {formatDate(obs.observedAt)}
          </div>
        ),
      },
      {
        id: 'value',
        header: 'Value',
        width: '0.8fr',
        cell: (obs) => {
          const obsStatus = deriveStatus(obs);
          return (
            <div className="flex items-baseline gap-1.5">
              <span
                className={cn(
                  'text-[15px] font-semibold tracking-[-0.01em] font-mono tabular-nums',
                  obs.isAbnormal
                    ? obsStatus === 'critical'
                      ? 'text-[var(--color-health-critical)]'
                      : 'text-[var(--color-health-warning)]'
                    : 'text-neutral-900',
                )}
              >
                {obs.valueNumeric != null ? obs.valueNumeric : obs.valueText ?? '—'}
              </span>
              {obs.unit && (
                <span className="text-[11px] text-neutral-400 font-mono">{obs.unit}</span>
              )}
            </div>
          );
        },
      },
      {
        id: 'range',
        header: 'Ref. Range',
        width: '1fr',
        cell: (obs) => (
          <div className="text-xs text-neutral-400 font-mono">
            {formatRange(obs.referenceRangeLow, obs.referenceRangeHigh, obs.unit)}
          </div>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        width: '0.8fr',
        cell: (obs) => {
          const obsStatus = deriveStatus(obs);
          return obs.isAbnormal ? (
            <StatusBadge
              status={obsStatus}
              label={obsStatus === 'critical' ? 'High' : 'Abnormal'}
            />
          ) : (
            <StatusBadge status="normal" label="Normal" />
          );
        },
      },
      {
        id: 'source',
        header: 'Source',
        width: '0.8fr',
        cell: (obs) => (
          <div className="text-[11px] text-neutral-400 font-mono truncate">
            {obs.status === 'corrected'
              ? 'Corrected'
              : obs.status === 'confirmed'
                ? 'Confirmed'
                : 'Extracted'}
          </div>
        ),
      },
    ],
    [],
  );

  const latest = sorted[0];
  const previous = sorted[1];
  const metricName = formatMetricName(metricCode);
  const status: HealthStatus = latest ? deriveStatus(latest) : 'neutral';

  // Chart data from trend endpoint
  const chartData = useMemo(
    () =>
      (trendData?.dataPoints ?? [])
        .filter((dp): dp is typeof dp & { value: number } => dp.value != null)
        .map((dp) => ({
          date: String(dp.date),
          value: dp.value,
          unit: dp.unit,
        })),
    [trendData],
  );

  // Stats
  const change = useMemo(() => {
    if (!latest?.valueNumeric || !previous?.valueNumeric) return null;
    const diff = latest.valueNumeric - previous.valueNumeric;
    const sign = diff > 0 ? '+' : '';
    return `${sign}${diff % 1 === 0 ? diff : diff.toFixed(1)}`;
  }, [latest, previous]);

  if (isLoading) {
    return (
      <div>
        <TitleActionHeader showBackButton title={undefined} />
        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl border border-neutral-200 bg-neutral-50" />
          ))}
        </div>
        <div className="mt-6 h-[340px] animate-pulse rounded-xl border border-neutral-200 bg-neutral-50" />
        <div className="mt-6 h-64 animate-pulse rounded-xl border border-neutral-200 bg-neutral-50" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div>
        <TitleActionHeader
          showBackButton
          title={metricName}
          subtitle="No results found for this metric."
        />
      </div>
    );
  }

  const refRange = formatRange(
    latest?.referenceRangeLow,
    latest?.referenceRangeHigh,
    latest?.unit,
  );

  return (
    <div className="stagger-children">
      <TitleActionHeader
        showBackButton
        title={metricName}
        underTitle={
          <div className="mt-2 flex items-center gap-3">
            <StatusBadge
              status={status}
              label={
                status === 'critical' ? 'High' : status === 'warning' ? 'Abnormal' : 'Normal'
              }
            />
            {latest?.valueNumeric != null && (
              <span className="text-sm text-neutral-500 font-mono tabular-nums">
                {latest.valueNumeric} {latest.unit ?? ''}
              </span>
            )}
          </div>
        }
      />

      {/* Summary stat cards */}
      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard
          label="Latest value"
          value={
            latest?.valueNumeric != null
              ? String(latest.valueNumeric)
              : latest?.valueText ?? '—'
          }
          subtext={latest?.unit ?? undefined}
          variant={status === 'critical' ? 'warning' : status === 'warning' ? 'warning' : 'default'}
        />
        <SummaryCard
          label="Change"
          value={change ?? '—'}
          subtext={change ? 'from previous' : undefined}
          variant={
            change
              ? change.startsWith('+') || change.startsWith('-')
                ? 'accent'
                : 'default'
              : 'default'
          }
        />
        <SummaryCard
          label="Total tests"
          value={String(items.length)}
        />
        <SummaryCard
          label="Reference range"
          value={refRange}
        />
      </div>

      {/* Trend Chart */}
      {chartData.length > 0 && (
        <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-neutral-700 font-body">Trend</h2>
          <TrendChart
            data={chartData}
            referenceRangeLow={latest?.referenceRangeLow}
            referenceRangeHigh={latest?.referenceRangeHigh}
            unit={latest?.unit}
            status={status}
          />
        </div>
      )}

      {/* Results table */}
      <DataTable
        className="mt-6"
        data={sorted}
        columns={resultColumns}
        rowConfig={{
          getRowKey: (obs) => obs.id,
          getRowTint: (obs) =>
            obs.isAbnormal ? 'bg-[var(--color-health-warning-bg)]/40' : undefined,
        }}
      />
    </div>
  );
}
