"use client";

import { use, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { TitleActionHeader } from "@/components/title-action-header";
import {
  StatusBadge,
  type HealthStatus,
} from "@/components/health/status-badge";
import { TrendChart } from "@/components/health/trend-chart";
import {
  deriveOptimalStatus,
  formatRange,
} from "@/lib/health-utils";
import { useDynamicStatus } from "@/hooks/use-dynamic-status";
import { cn, formatDate, formatObsValue, isDurationMetric } from "@/lib/utils";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { Pill, TrendingUp, TrendingDown, Minus, Pencil, Trash2, Check, X } from "lucide-react";

const TIME_RANGES = [
  { key: "3m", label: "3M", months: 3 },
  { key: "6m", label: "6M", months: 6 },
  { key: "1y", label: "1Y", months: 12 },
  { key: "2y", label: "2Y", months: 24 },
  { key: "all", label: "All", months: null },
] as const;

type TimeRangeKey = (typeof TIME_RANGES)[number]["key"];

function formatMetricName(code: string) {
  return code.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function SummaryCard({
  label,
  value,
  subtext,
  variant = "default",
}: {
  label: string;
  value: string;
  subtext?: string;
  variant?: "default" | "warning" | "success" | "accent";
}) {
  const valueColor = {
    default: "text-neutral-900",
    warning: "text-health-warning",
    success: "text-health-normal",
    accent: "text-accent-600",
  }[variant];

  return (
    <div className="card px-4 py-3.5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-neutral-400 font-mono">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 text-2xl font-medium tracking-[-0.03em] font-display",
          valueColor,
        )}
      >
        {value}
      </div>
      {subtext && (
        <div className="mt-0.5 text-[11px] text-neutral-400 font-mono">
          {subtext}
        </div>
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
  const { getStatus, getRanges } = useDynamicStatus();

  const { data, isLoading } = trpc.observations.list.useQuery({
    metricCode,
    limit: 200,
  });
  const { data: metricsData } = trpc.metrics.list.useQuery();
  const { data: prefsData } = trpc.preferences.get.useQuery();
  const { data: optimalRangesData } = trpc.optimalRanges.forUser.useQuery({
    metricCode,
  });
  const { data: medsData } = trpc.medications.list.useQuery({});
  const utils = trpc.useUtils();
  const correctMutation = trpc.observations.correct.useMutation({
    onSuccess: () => utils.observations.list.invalidate({ metricCode }),
  });
  const deleteMutation = trpc.observations.delete.useMutation({
    onSuccess: () => utils.observations.list.invalidate({ metricCode }),
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editNote, setEditNote] = useState("");
  const metricDef = metricsData?.find((m) => m.id === metricCode);
  const displayPrecision = metricDef?.displayPrecision ?? null;
  const showOptimal = prefsData?.showOptimalRanges ?? true;
  const optimalRange = optimalRangesData?.[metricCode] ?? null;
  // Get canonical ranges from the dynamic status hook
  const canonRanges = getRanges(metricCode);
  // Display the active range used for status (optimal first, then reference)
  const activeRangeLow = canonRanges?.optimalLow ?? canonRanges?.referenceLow;
  const activeRangeHigh = canonRanges?.optimalHigh ?? canonRanges?.referenceHigh;
  const canonicalRange = formatRange(activeRangeLow, activeRangeHigh, metricDef?.unit);

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

  const { data: trendData, isLoading: trendLoading } =
    trpc.observations.trend.useQuery({
      metricCode,
      dateFrom,
      dateTo,
      granularity: "raw",
    });

  const sorted = useMemo(
    () =>
      [...items].sort(
        (a, b) =>
          new Date(b.observedAt).getTime() - new Date(a.observedAt).getTime(),
      ),
    [items],
  );

  type Observation = (typeof items)[number];

  const resultColumns: DataTableColumn<Observation>[] = useMemo(
    () => [
      {
        id: "date",
        header: "Date",
        width: "1fr",
        cell: (obs) => (
          <div className="text-xs text-neutral-500 font-mono">
            {formatDate(obs.observedAt)}
          </div>
        ),
      },
      {
        id: "value",
        header: "Value",
        width: "0.8fr",
        cell: (obs) => {
          const obsStatus = getStatus(obs);
          const isAbn = obsStatus !== "normal";
          return (
            <div className="flex items-baseline gap-1.5">
              <span
                className={cn(
                  "text-[15px] font-semibold tracking-[-0.01em] font-mono tabular-nums",
                  isAbn
                    ? obsStatus === "critical"
                      ? "text-health-critical"
                      : "text-health-warning"
                    : "text-neutral-900",
                )}
              >
                {formatObsValue(
                  metricCode,
                  obs.valueNumeric,
                  obs.valueText,
                  displayPrecision,
                )}
              </span>
              {!isDurationMetric(metricCode) && obs.unit && (
                <span className="text-[11px] text-neutral-400 font-mono">
                  {obs.unit}
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: "range",
        header: "Lab Ref.",
        width: "1fr",
        cell: (obs) => (
          <div>
            <div className="text-[11px] text-neutral-400 font-mono">
              {formatRange(
                obs.referenceRangeLow,
                obs.referenceRangeHigh,
                obs.unit,
              )}
            </div>
          </div>
        ),
      },
      {
        id: "status",
        header: "Status",
        width: "0.8fr",
        cell: (obs) => {
          const obsStatus = getStatus(obs);
          return obsStatus !== "normal" ? (
            <StatusBadge
              status={obsStatus}
              label={obsStatus === "critical" ? "High" : "Abnormal"}
            />
          ) : (
            <StatusBadge status="normal" label="Normal" />
          );
        },
      },
      {
        id: "actions",
        header: "",
        width: "90px",
        cell: (obs) => (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => {
                setEditingId(obs.id);
                setEditValue(obs.valueNumeric != null ? String(obs.valueNumeric) : "");
                setEditNote("");
              }}
              className="rounded-md p-1 text-neutral-300 transition-all hover:bg-neutral-100 hover:text-neutral-500"
              title="Edit"
            >
              <Pencil className="h-3 w-3" />
            </button>
            <button
              onClick={() => deleteMutation.mutate({ id: obs.id })}
              className="rounded-md p-1 text-neutral-300 transition-all hover:bg-red-50 hover:text-red-500"
              title="Remove"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ),
      },
    ],
    [metricCode, displayPrecision, deleteMutation],
  );

  const latest = sorted[0];
  const previous = sorted[1];
  const metricName = formatMetricName(metricCode);
  const status: HealthStatus = latest ? getStatus(latest) : "neutral";

  const [timeRange, setTimeRange] = useState<TimeRangeKey>("all");

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
    const sign = diff > 0 ? "+" : "";
    return `${sign}${diff % 1 === 0 ? diff : diff.toFixed(1)}`;
  }, [latest, previous]);

  if (isLoading) {
    return (
      <div>
        <TitleActionHeader showBackButton title={undefined} />
        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="card h-20 animate-pulse bg-neutral-50"
            />
          ))}
        </div>
        <div className="card mt-6 h-[340px] animate-pulse bg-neutral-50" />
        <div className="card mt-6 h-64 animate-pulse bg-neutral-50" />
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

  // Use canonical range for the summary card (consistent standard)
  const refRange = canonicalRange !== "—" ? canonicalRange : formatRange(
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
                status === "critical"
                  ? "High"
                  : status === "warning"
                    ? "Abnormal"
                    : "Normal"
              }
            />
            {latest?.valueNumeric != null && (
              <span className="text-sm text-neutral-500 font-mono tabular-nums">
                {formatObsValue(
                  metricCode,
                  latest.valueNumeric,
                  latest.valueText,
                  displayPrecision,
                )}{" "}
                {isDurationMetric(metricCode) ? "" : (latest.unit ?? "")}
              </span>
            )}
          </div>
        }
      />

      {/* Summary stat cards */}
      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard
          label="Latest value"
          value={formatObsValue(
            metricCode,
            latest?.valueNumeric,
            latest?.valueText,
            displayPrecision,
          )}
          subtext={
            isDurationMetric(metricCode)
              ? undefined
              : (latest?.unit ?? undefined)
          }
          variant={
            status === "critical"
              ? "warning"
              : status === "warning"
                ? "warning"
                : "default"
          }
        />
        <SummaryCard
          label="Change"
          value={change ?? "—"}
          subtext={change ? "from previous" : undefined}
          variant={
            change
              ? change.startsWith("+") || change.startsWith("-")
                ? "accent"
                : "default"
              : "default"
          }
        />
        <SummaryCard label="Total tests" value={String(items.length)} />
        <SummaryCard
          label={optimalRange ? "Active range" : "Reference range"}
          value={refRange}
          subtext={optimalRange ? "Optimal" : undefined}
        />
        {showOptimal && optimalRange && (
          <SummaryCard
            label="Optimal range"
            value={formatRange(
              optimalRange.rangeLow,
              optimalRange.rangeHigh,
              latest?.unit,
            )}
            subtext={optimalRange.source ?? undefined}
          />
        )}
      </div>

      {/* Trend Chart */}
      {(trendLoading || allChartData.length > 0) && (
        <div className="card mt-6 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-700 font-body">
              Trend
            </h2>
            {!trendLoading && (
              <div className="flex items-center gap-0.5 rounded-lg bg-neutral-100 p-0.5">
                {TIME_RANGES.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => setTimeRange(r.key)}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-[0.04em] font-mono transition-all",
                      timeRange === r.key
                        ? "bg-white text-neutral-900 shadow-sm"
                        : "text-neutral-400 hover:text-neutral-600",
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
                    <div
                      key={i}
                      className="h-2.5 w-8 animate-pulse rounded bg-neutral-100"
                    />
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
                  <div
                    key={i}
                    className="h-2.5 w-10 animate-pulse rounded bg-neutral-100"
                  />
                ))}
              </div>
            </div>
          ) : chartData.length > 0 ? (
            <TrendChart
              data={chartData}
              referenceRangeLow={latest?.referenceRangeLow}
              referenceRangeHigh={latest?.referenceRangeHigh}
              optimalRangeLow={showOptimal ? optimalRange?.rangeLow : undefined}
              optimalRangeHigh={
                showOptimal ? optimalRange?.rangeHigh : undefined
              }
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

      {/* Medication context + trend insight */}
      <MetricContext
        observations={sorted}
        medications={medsData?.items ?? []}
        metricName={metricName}
      />

      {/* Results table */}
      <DataTable
        className="mt-6"
        data={sorted}
        columns={resultColumns}
        rowConfig={{
          getRowKey: (obs) => obs.id,
          getRowTint: (obs) =>
            getStatus(obs) !== "normal"
              ? "bg-health-warning-bg/40"
              : undefined,
        }}
      />

      {/* Inline edit overlay */}
      {editingId && (
        <div className="card mt-2 border-accent-200 bg-accent-50/30 p-4">
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-neutral-400 font-mono">
                Value
              </span>
              <input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-28 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[13px] text-neutral-900 focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-100 transition-all"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-neutral-400 font-mono">
                Note
              </span>
              <input
                type="text"
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                placeholder="Reason for correction"
                className="w-48 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-100 transition-all"
              />
            </label>
            <button
              onClick={async () => {
                await correctMutation.mutateAsync({
                  id: editingId,
                  ...(editValue !== "" && { valueNumeric: Number(editValue) }),
                  ...(editNote !== "" && { correctionNote: editNote }),
                });
                setEditingId(null);
              }}
              disabled={correctMutation.isPending}
              className="flex items-center gap-1.5 rounded-lg bg-accent-600 px-4 py-2 text-[13px] font-medium text-white shadow-sm hover:bg-accent-700 transition-colors disabled:opacity-50"
            >
              <Check className="h-3 w-3" />
              Save
            </button>
            <button
              onClick={() => setEditingId(null)}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-4 py-2 text-[13px] font-medium text-neutral-600 shadow-sm hover:bg-neutral-50 transition-colors"
            >
              <X className="h-3 w-3" />
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricContext({
  observations,
  medications,
  metricName,
}: {
  observations: Array<{
    metricCode: string;
    valueNumeric?: number | null;
    isAbnormal?: boolean | null;
    observedAt: string | Date;
  }>;
  medications: Array<{
    id: string;
    name: string;
    dosage?: string | null;
    startDate?: string | Date | null;
    endDate?: string | Date | null;
    isActive?: boolean | null;
  }>;
  metricName: string;
}) {
  const { isAbnormal: isObsAbnormal } = useDynamicStatus();
  if (observations.length < 2) return null;

  const oldest = new Date(observations[observations.length - 1]!.observedAt).getTime();
  const newest = new Date(observations[0]!.observedAt).getTime();

  // Find medications that overlap with the observation period
  const overlapping = medications.filter((m) => {
    if (!m.startDate) return false;
    const start = new Date(m.startDate).getTime();
    const end = m.endDate ? new Date(m.endDate).getTime() : Date.now();
    return start <= newest && end >= oldest;
  });

  // Compute trend insight
  const values = observations
    .filter((o) => o.valueNumeric != null)
    .map((o) => o.valueNumeric!);

  if (values.length < 2) return null;

  const firstHalf = values.slice(Math.floor(values.length / 2));
  const secondHalf = values.slice(0, Math.floor(values.length / 2));
  const firstAvg = firstHalf.reduce((s, v) => s + v, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((s, v) => s + v, 0) / secondHalf.length;
  const changePct = firstAvg !== 0 ? ((secondAvg - firstAvg) / Math.abs(firstAvg)) * 100 : 0;

  const latestAbnormal = observations[0] ? isObsAbnormal(observations[0]) : null;
  const trendDirection = Math.abs(changePct) < 3 ? 'stable' : changePct > 0 ? 'rising' : 'falling';

  if (overlapping.length === 0 && trendDirection === 'stable') return null;

  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Trend insight */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-2">
          {trendDirection === 'rising' ? (
            <TrendingUp className="size-3.5 text-neutral-500" />
          ) : trendDirection === 'falling' ? (
            <TrendingDown className="size-3.5 text-neutral-500" />
          ) : (
            <Minus className="size-3.5 text-neutral-500" />
          )}
          <span className="text-[11px] font-mono font-bold uppercase tracking-[0.04em] text-neutral-400">
            Trend
          </span>
        </div>
        <p className="text-[13px] font-medium text-neutral-800 font-body">
          {trendDirection === 'stable'
            ? `${metricName} has been stable`
            : `${metricName} is ${trendDirection} (${changePct > 0 ? '+' : ''}${Math.round(changePct)}%)`}
        </p>
        <p className="text-[11px] text-neutral-500 font-body mt-1">
          Based on {observations.length} results over this period.
          {latestAbnormal && trendDirection === 'falling'
            ? ' The downward trend may indicate improvement.'
            : ''}
        </p>
      </div>

      {/* Medications during this period */}
      {overlapping.length > 0 && (
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Pill className="size-3.5 text-neutral-500" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.04em] text-neutral-400">
              Medications during this period
            </span>
          </div>
          <div className="space-y-2">
            {overlapping.slice(0, 4).map((med) => (
              <div key={med.id} className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-neutral-700 font-body">
                  {med.name}
                </span>
                <div className="flex items-center gap-2">
                  {med.dosage && (
                    <span className="text-[10px] font-mono text-neutral-400">
                      {med.dosage}
                    </span>
                  )}
                  <span className={cn(
                    "text-[10px] font-mono",
                    med.isActive ? "text-health-normal" : "text-neutral-400",
                  )}>
                    {med.isActive ? 'Active' : 'Ended'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
