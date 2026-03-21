'use client';

import { MetricCard } from '@/components/health/metric-card';
import { LabResultRow, LabResultHeader } from '@/components/health/lab-result-row';
import { ProvenancePill } from '@/components/health/provenance-pill';
import { InsightPanelToolbar } from './insight-panel-toolbar';

export interface HealthInsight {
  id: string;
  title: string;
  type: 'lab_trend' | 'medication_review' | 'summary';
  status: 'streaming' | 'ready';
  data?: {
    metrics?: Array<{
      title: string;
      value: string;
      unit: string;
      delta: string;
      deltaDirection: 'up' | 'down' | 'stable';
      sparkData: number[];
      status: 'normal' | 'warning' | 'critical';
    }>;
    labResults?: Array<{
      metric: string;
      value: string;
      unit: string;
      range: string;
      trend: number[];
      status: 'normal' | 'warning' | 'critical';
      date: string;
    }>;
    summary?: string;
    sources?: Array<{ label: string; icon: string }>;
  };
}

interface InsightPanelProps {
  insight: HealthInsight | null;
  onClose: () => void;
}

export function InsightPanel({ insight, onClose }: InsightPanelProps) {
  if (!insight) {
    return (
      <div className="flex h-full flex-col">
        <InsightPanelToolbar title="Insight" isReady={false} onClose={onClose} />
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-secondary-50">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-neutral-400">
                <path d="M9 17H7A5 5 0 017 7h2M15 7h2a5 5 0 010 10h-2M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-[13px] text-neutral-500 font-body">
              Health insights will appear here
            </p>
            <p className="mt-1 text-[11px] text-neutral-400 font-mono">
              Ask a question to generate an analysis
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isStreaming = insight.status === 'streaming';

  return (
    <div className="flex h-full flex-col">
      <InsightPanelToolbar title={insight.title} isReady={!isStreaming} onClose={onClose} />
      <div className="flex-1 overflow-y-auto">
        {isStreaming ? (
          <div className="space-y-4 p-6">
            <div className="skeleton h-5 w-48" />
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="border border-neutral-200 p-4">
                  <div className="skeleton mb-3 h-3 w-20" />
                  <div className="skeleton mb-3 h-8 w-16" />
                  <div className="skeleton h-6 w-full" />
                </div>
              ))}
            </div>
            <div className="skeleton mt-6 h-4 w-32" />
            <div className="overflow-hidden border border-neutral-200">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 border-b border-neutral-100 px-5 py-3.5">
                  <div className="skeleton h-4 w-28" />
                  <div className="skeleton h-4 w-16" />
                  <div className="skeleton h-4 w-20" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 p-6">
            {insight.data?.metrics && insight.data.metrics.length > 0 && (
              <div>
                <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.04em] text-neutral-400 font-mono">
                  Key Metrics
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {insight.data.metrics.map((m) => (
                    <MetricCard key={m.title} {...m} />
                  ))}
                </div>
              </div>
            )}

            {insight.data?.labResults && insight.data.labResults.length > 0 && (
              <div>
                <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.04em] text-neutral-400 font-mono">
                  Results
                </h3>
                <div className="overflow-hidden border border-neutral-200 bg-white">
                  <LabResultHeader />
                  {insight.data.labResults.map((r) => (
                    <LabResultRow key={r.metric} {...r} />
                  ))}
                </div>
              </div>
            )}

            {insight.data?.summary && (
              <div>
                <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.04em] text-neutral-400 font-mono">
                  Analysis
                </h3>
                <div className="border border-neutral-200 bg-white p-5 text-[14px] leading-[1.7] text-neutral-700 font-body">
                  {insight.data.summary}
                </div>
              </div>
            )}

            {insight.data?.sources && insight.data.sources.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {insight.data.sources.map((s, i) => (
                  <ProvenancePill key={i} label={s.label} icon={s.icon} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
