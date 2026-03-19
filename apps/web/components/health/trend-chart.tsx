'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
} from 'recharts';
import { cn } from '@/lib/utils';
import type { HealthStatus } from './status-badge';

interface TrendChartDataPoint {
  date: string;
  value: number;
  unit?: string | null;
}

interface TrendChartProps {
  data: TrendChartDataPoint[];
  referenceRangeLow?: number | null;
  referenceRangeHigh?: number | null;
  unit?: string | null;
  status?: HealthStatus;
}

const statusStroke: Record<string, string> = {
  normal: 'var(--color-health-normal)',
  warning: 'var(--color-health-warning)',
  critical: 'var(--color-health-critical)',
  info: 'var(--color-accent-500)',
  neutral: 'var(--color-neutral-400)',
};

function formatChartDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function CustomTooltip(props: { active?: boolean; payload?: Array<{ value?: number; payload?: unknown }>; label?: string }) {
  const { active, payload, label } = props;
  if (!active || !payload?.[0]) return null;
  const point = payload[0];
  const dataPoint = point.payload as TrendChartDataPoint;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-md">
      <p className="text-[11px] text-neutral-500 font-mono">
        {formatChartDate(String(label))}
      </p>
      <p className="mt-0.5 text-sm font-semibold text-neutral-900 font-mono tabular-nums">
        {point.value}
        {dataPoint.unit && (
          <span className="ml-1 text-[11px] font-normal text-neutral-400">{dataPoint.unit}</span>
        )}
      </p>
    </div>
  );
}

export function TrendChart({
  data,
  referenceRangeLow,
  referenceRangeHigh,
  unit,
  status = 'normal',
}: TrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-neutral-400">
        No data points available
      </div>
    );
  }

  const stroke = statusStroke[status] ?? statusStroke.normal;

  // Compute Y domain with padding
  const values = data.map((d) => d.value);
  const allValues = [
    ...values,
    ...(referenceRangeLow != null ? [referenceRangeLow] : []),
    ...(referenceRangeHigh != null ? [referenceRangeHigh] : []),
  ];
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const padding = (maxVal - minVal) * 0.15 || 1;
  const yMin = Math.floor(minVal - padding);
  const yMax = Math.ceil(maxVal + padding);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
        {referenceRangeLow != null && referenceRangeHigh != null && (
          <ReferenceArea
            y1={referenceRangeLow}
            y2={referenceRangeHigh}
            fill="var(--color-health-normal-bg)"
            stroke="var(--color-health-normal-border)"
            strokeDasharray="3 3"
            fillOpacity={0.6}
          />
        )}
        <XAxis
          dataKey="date"
          tickFormatter={formatChartDate}
          tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: 'var(--color-neutral-400)' }}
          axisLine={{ stroke: 'var(--color-neutral-200)' }}
          tickLine={false}
          dy={8}
        />
        <YAxis
          domain={[yMin, yMax]}
          tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: 'var(--color-neutral-400)' }}
          axisLine={false}
          tickLine={false}
          width={45}
          label={
            unit
              ? {
                  value: unit,
                  angle: -90,
                  position: 'insideLeft',
                  offset: 0,
                  style: {
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    fill: 'var(--color-neutral-400)',
                  },
                }
              : undefined
          }
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="value"
          stroke={stroke}
          strokeWidth={2}
          dot={(props: Record<string, unknown>) => {
            const { cx, cy, index } = props as { cx: number; cy: number; index: number };
            const isLast = index === data.length - 1;
            return (
              <circle
                key={index}
                cx={cx}
                cy={cy}
                r={isLast ? 5 : 3}
                fill="white"
                stroke={stroke}
                strokeWidth={2}
              />
            );
          }}
          activeDot={{ r: 5, fill: stroke, stroke: 'white', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
