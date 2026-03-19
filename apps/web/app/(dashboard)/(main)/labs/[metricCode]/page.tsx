'use client';

import { use, useMemo, useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { TitleActionHeader } from '@/components/title-action-header';
import { StatusBadge, type HealthStatus } from '@/components/health/status-badge';
import { TrendChart } from '@/components/health/trend-chart';
import { deriveStatus, formatRange } from '@/lib/health-utils';
import { cn, formatDate } from '@/lib/utils';
import { DataTable, type DataTableColumn } from '@/components/data-table';

const TIME_RANGES = [
  { key: '3m', label: '3M', months: 3 },
  { key: '6m', label: '6M', months: 6 },
  { key: '1y', label: '1Y', months: 12 },
  { key: '2y', label: '2Y', months: 24 },
  { key: 'all', label: 'All', months: null },
] as const;

type TimeRangeKey = (typeof TIME_RANGES)[number]['key'];

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

  const items = data?.items ?? [];

  // Date range for trend query: span all observations (with padding) instead of
  // a fixed 1-year window so older data points aren't excluded.
  const dateFrom = useMemo(() => {
    if (items.length === 0) return new Date(0);
    const oldest = items.reduce((min, o) => {
      const t = new Date(o.observedAt).getTime();
      return t < min ? t : min;
    }, Infinity);
    const d = new Date(oldest);
    d.setMonth(d.getMonth() - 1);
    return d;
  }, [items]);
  const dateTo = useMemo(() => new Date(), []);

  const { data: trendData, isLoading: trendLoading } = trpc.observations.trend.useQuery({
    metricCode,
    dateFrom,
    dateTo,
    granularity: 'raw',
  });

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

  const [timeRange, setTimeRange] = useState<TimeRangeKey>('all');

  // Chart data from trend endpoint — use ISO strings and disambiguate
  // duplicate dates so Recharts treats each point as unique on hover.
  const allChartData = useMemo(() => {
    const points = (trendData?.dataPoints ?? [])
      .filter((dp): dp is typeof dp & { value: number } => dp.value != null)
      .map((dp) => ({
        date: new Date(dp.date).toISOString(),
        value: dp.value,
        unit: dp.unit,
      }));

    const seen = new Map<string, number>();
    return points.map((pt) => {
      const count = seen.get(pt.date) ?? 0;
      seen.set(pt.date, count + 1);
      if (count === 0) return pt;
      // Offset duplicate timestamps by count milliseconds so each is unique
      const d = new Date(pt.date);
      d.setMilliseconds(d.getMilliseconds() + count);
      return { ...pt, date: d.toISOString() };
    });
  }, [trendData]);

  const chartData = useMemo(() => {
    const range = TIME_RANGES.find((r) => r.key === timeRange);
    if (!range?.months) return allChartData;
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - range.months);
    return allChartData.filter((dp) => new Date(dp.date) >= cutoff);
  }, [allChartData, timeRange]);

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
      {(trendLoading || allChartData.length > 0) && (
        <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-700 font-body">Trend</h2>
            {!trendLoading && (
              <div className="flex items-center gap-0.5 rounded-lg bg-neutral-100 p-0.5">
                {TIME_RANGES.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => setTimeRange(r.key)}
                    className={cn(
                      'rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-[0.04em] font-mono transition-all',
                      timeRange === r.key
                        ? 'bg-white text-neutral-900 shadow-sm'
                        : 'text-neutral-400 hover:text-neutral-600',
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {trendLoading ? (
            <div className="h-[300px] space-y-4">
              {/* Y-axis + chart area skeleton */}
              <div className="flex h-full gap-3">
                <div className="flex w-10 flex-col justify-between py-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-2.5 w-8 animate-pulse rounded bg-neutral-100" />
                  ))}
                </div>
                <div className="relative flex-1 rounded-lg">
                  <div className="absolute inset-0 animate-pulse rounded-lg bg-neutral-50" />
                  {/* Fake grid lines */}
                  <div className="absolute inset-x-0 top-[20%] border-t border-dashed border-neutral-100" />
                  <div className="absolute inset-x-0 top-[40%] border-t border-dashed border-neutral-100" />
                  <div className="absolute inset-x-0 top-[60%] border-t border-dashed border-neutral-100" />
                  <div className="absolute inset-x-0 top-[80%] border-t border-dashed border-neutral-100" />
                </div>
              </div>
              {/* X-axis labels skeleton */}
              <div className="ml-[52px] flex justify-between">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-2.5 w-10 animate-pulse rounded bg-neutral-100" />
                ))}
              </div>
            </div>
          ) : chartData.length > 0 ? (
            <TrendChart
              data={chartData}
              referenceRangeLow={latest?.referenceRangeLow}
              referenceRangeHigh={latest?.referenceRangeHigh}
              unit={latest?.unit}
              status={status}
            />
          ) : (
            <div className="flex h-[300px] items-center justify-center text-sm text-neutral-400">
              No data points in this time range
            </div>
          )}
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
