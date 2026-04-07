'use client';

import { trpc } from '@/lib/trpc/client';
import { TitleActionHeader } from '@/components/title-action-header';
import { MetricCard } from '@/components/health/metric-card';
import { MetricSummaryCard } from '@/components/health/metric-summary-card';
import { AnimatedEmptyState } from '@/components/animated-empty-state';
import { formatRange } from '@/lib/health-utils';
import { useDynamicStatus } from '@/hooks/use-dynamic-status';
import { formatDate, formatObsValue, isDurationMetric } from '@/lib/utils';
import { TestTubes, Droplets, Activity, Microscope, FlaskConical, Dna, Download } from 'lucide-react';
import { Button } from '@/components/button';
import { downloadCsv } from '@/lib/export';

const emptyIcons = [TestTubes, Droplets, Activity, Microscope, FlaskConical, Dna];

function formatMetricName(code: string) {
  return code.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function LabsPage() {
  const { getStatus, isAbnormal: isObsAbnormal } = useDynamicStatus();
  const { data, isLoading } = trpc.observations.list.useQuery({ limit: 200 });
  const { data: metricsData } = trpc.metrics.list.useQuery();
  const precisionMap = new Map(
    (metricsData ?? []).map((m) => [m.id, m.displayPrecision] as const),
  );
  const items = data?.items ?? [];

  if (isLoading) {
    return (
      <div>
        <TitleActionHeader title="Lab Results" subtitle="Loading..." />
        <div className="mt-7 mb-7 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card h-36 animate-pulse bg-neutral-50" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-40 animate-pulse bg-neutral-50" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div>
        <TitleActionHeader title="Lab Results" subtitle="View and track your lab values over time." />
        <div className="mt-7">
          <AnimatedEmptyState
            title="No lab results yet"
            description="Upload your first lab report to see your results here."
            cardIcon={({ index }) => emptyIcons[index % emptyIcons.length]!}
            learnMoreHref="/uploads"
            learnMoreClassName="border-accent-200 text-accent-600 hover:bg-accent-50"
          />
        </div>
      </div>
    );
  }

  // Group observations by metricCode
  const byMetric = new Map<string, typeof items>();
  for (const item of items) {
    const existing = byMetric.get(item.metricCode) ?? [];
    existing.push(item);
    byMetric.set(item.metricCode, existing);
  }

  // Sort each group by date descending
  const metricGroups = Array.from(byMetric.entries()).map(([code, obs]) => {
    const sorted = [...obs].sort(
      (a, b) => new Date(b.observedAt).getTime() - new Date(a.observedAt).getTime(),
    );
    const latest = sorted[0]!;
    const previous = sorted[1];
    const status = getStatus(latest);
    const sparkData = sorted.slice(0, 6).reverse().map((o) => o.valueNumeric ?? 0);

    const deltaVal =
      previous?.valueNumeric != null && latest.valueNumeric != null
        ? Math.abs(latest.valueNumeric - previous.valueNumeric)
        : 0;
    const deltaDir =
      previous?.valueNumeric != null && latest.valueNumeric != null
        ? latest.valueNumeric > previous.valueNumeric
          ? ('up' as const)
          : latest.valueNumeric < previous.valueNumeric
            ? ('down' as const)
            : ('stable' as const)
        : ('stable' as const);

    return { code, sorted, latest, status, sparkData, deltaVal, deltaDir, count: obs.length };
  });

  // Sort: abnormal first → most results → alphabetical
  metricGroups.sort((a, b) => {
    const aAbnormal = a.status !== 'normal' ? 1 : 0;
    const bAbnormal = b.status !== 'normal' ? 1 : 0;
    if (bAbnormal !== aAbnormal) return bAbnormal - aAbnormal;
    if (b.count !== a.count) return b.count - a.count;
    return a.code.localeCompare(b.code);
  });

  // Top 4 for MetricCards (prioritize abnormal)
  const topMetrics = metricGroups.slice(0, 4);

  // Subtitle
  const uniqueMetrics = byMetric.size;
  const subtitle = `${uniqueMetrics} unique metric${uniqueMetrics !== 1 ? 's' : ''} · ${items.length} total results`;

  return (
    <div className="stagger-children">
      <TitleActionHeader
        title="Lab Results"
        subtitle={subtitle}
        actions={
          <Button
            variant="outline-subtle"
            size="sm"
            icon={<Download />}
            text="Export CSV"
            onClick={() => {
              downloadCsv(
                'openvitals-labs',
                ['Metric', 'Value', 'Unit', 'Reference Low', 'Reference High', 'Abnormal', 'Date', 'Category'],
                items.map((o) => [
                  o.metricCode,
                  o.valueNumeric ?? o.valueText,
                  o.unit,
                  o.referenceRangeLow,
                  o.referenceRangeHigh,
                  isObsAbnormal(o) ? 'Yes' : 'No',
                  new Date(o.observedAt).toISOString().split('T')[0],
                  o.category,
                ]),
              );
            }}
          />
        }
      />

      {/* Top metric cards */}
      {topMetrics.length > 0 && (
        <div className="mt-7 mb-7 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {topMetrics.map((mg) => (
            <MetricCard
              key={mg.code}
              title={formatMetricName(mg.code)}
              value={formatObsValue(mg.code, mg.latest.valueNumeric, mg.latest.valueText, precisionMap.get(mg.code))}
              unit={isDurationMetric(mg.code) ? '' : (mg.latest.unit ?? '')}
              delta={
                mg.deltaVal
                  ? `${mg.deltaVal % 1 === 0 ? mg.deltaVal : mg.deltaVal.toFixed(1)} from last`
                  : 'No prior'
              }
              deltaDirection={mg.deltaDir}
              sparkData={mg.sparkData.length >= 2 ? mg.sparkData : [0, ...mg.sparkData]}
              status={mg.status}
            />
          ))}
        </div>
      )}

      {/* Grouped metric summary cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {metricGroups.map((mg) => {
          const statusLabel =
            mg.status === 'critical'
              ? 'High'
              : mg.status === 'warning'
                ? 'Abnormal'
                : 'Normal';

          return (
            <MetricSummaryCard
              key={mg.code}
              metricCode={mg.code}
              name={formatMetricName(mg.code)}
              latestValue={formatObsValue(mg.code, mg.latest.valueNumeric, mg.latest.valueText, precisionMap.get(mg.code))}
              unit={isDurationMetric(mg.code) ? '' : (mg.latest.unit ?? '')}
              status={mg.status}
              statusLabel={statusLabel}
              resultCount={mg.count}
              sparkData={mg.sparkData.length >= 2 ? mg.sparkData : [0, ...mg.sparkData]}
              referenceRange={formatRange(
                mg.latest.referenceRangeLow,
                mg.latest.referenceRangeHigh,
                mg.latest.unit,
              )}
              latestDate={formatDate(mg.latest.observedAt)}
            />
          );
        })}
      </div>
    </div>
  );
}
