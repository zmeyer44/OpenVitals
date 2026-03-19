'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { TitleActionHeader } from '@/components/title-action-header';
import { AnimatedEmptyState } from '@/components/animated-empty-state';
import { StatusBadge } from '@/components/health/status-badge';
import {
  Search, ChevronDown, ChevronRight,
  ListChecks, Dna, Activity, Beaker, FlaskConical, Microscope,
  Droplets, Bug, Sun, CircleDot, Gauge, Syringe, Flame, HeartPulse, TestTubes, BarChart3,
  type LucideIcon,
} from 'lucide-react';

const emptyIcons = [ListChecks, Dna, Activity, Beaker, FlaskConical, Microscope];

const categoryLabels: Record<string, string> = {
  metabolic: 'Metabolic',
  hematology: 'Hematology',
  lipid: 'Lipid Panel',
  thyroid: 'Thyroid',
  iron_study: 'Iron Studies',
  vitamin: 'Vitamins',
  hepatic: 'Hepatic',
  renal: 'Renal',
  hormone: 'Hormones',
  inflammation: 'Inflammation',
  cardiac: 'Cardiac',
  urinalysis: 'Urinalysis',
  vital_sign: 'Vital Signs',
};

const categoryIcons: Record<string, LucideIcon> = {
  metabolic: Dna,
  hematology: Droplets,
  lipid: Beaker,
  thyroid: Bug,
  iron_study: FlaskConical,
  vitamin: Sun,
  hepatic: CircleDot,
  renal: Gauge,
  hormone: Syringe,
  inflammation: Flame,
  cardiac: HeartPulse,
  urinalysis: TestTubes,
  vital_sign: BarChart3,
};

function formatRange(low: number | null, high: number | null, unit: string | null): string {
  const u = unit ?? '';
  if (low != null && high != null) return `${low}–${high} ${u}`.trim();
  if (low != null) return `> ${low} ${u}`.trim();
  if (high != null) return `< ${high} ${u}`.trim();
  return '—';
}

export default function BiomarkersPage() {
  const { data: metrics, isLoading: metricsLoading } = trpc.metrics.list.useQuery();
  const { data: ranges, isLoading: rangesLoading } = trpc.metrics.referenceRanges.useQuery();
  const { data: prefs } = trpc.preferences.get.useQuery();

  const [search, setSearch] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);

  const isLoading = metricsLoading || rangesLoading;

  if (isLoading) {
    return (
      <div>
        <TitleActionHeader title="Biomarkers" subtitle="Loading..." />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl border border-neutral-200 bg-neutral-50" />
          ))}
        </div>
      </div>
    );
  }

  const allMetrics = metrics ?? [];
  const allRanges = ranges ?? [];

  if (allMetrics.length === 0) {
    return (
      <div>
        <TitleActionHeader title="Biomarkers" subtitle="Metric definitions and reference ranges." />
        <div className="mt-7">
          <AnimatedEmptyState
            title="No metrics defined"
            description="Run db:seed to populate metric definitions and reference ranges."
            cardIcon={({ index }) => emptyIcons[index % emptyIcons.length]!}
          />
        </div>
      </div>
    );
  }

  // Group ranges by metric code
  const rangesByMetric = new Map<string, typeof allRanges>();
  for (const r of allRanges) {
    const existing = rangesByMetric.get(r.metricCode) ?? [];
    existing.push(r);
    rangesByMetric.set(r.metricCode, existing);
  }

  // Filter by search
  const lower = search.toLowerCase().trim();
  const filtered = lower
    ? allMetrics.filter(
        (m) =>
          m.name.toLowerCase().includes(lower) ||
          m.id.toLowerCase().includes(lower) ||
          m.category.toLowerCase().includes(lower) ||
          m.aliases.some((a: string) => a.toLowerCase().includes(lower)),
      )
    : allMetrics;

  // Group by category
  const byCategory = new Map<string, typeof filtered>();
  for (const m of filtered) {
    const existing = byCategory.get(m.category) ?? [];
    existing.push(m);
    byCategory.set(m.category, existing);
  }

  // Sorted category keys
  const categoryOrder = Object.keys(categoryLabels);
  const sortedCategories = [...byCategory.keys()].sort(
    (a, b) => (categoryOrder.indexOf(a) === -1 ? 999 : categoryOrder.indexOf(a)) -
              (categoryOrder.indexOf(b) === -1 ? 999 : categoryOrder.indexOf(b)),
  );

  const userSex = prefs?.biologicalSex ?? null;
  const subtitle = `${allMetrics.length} metrics · ${allRanges.length} reference ranges${userSex ? ` · Profile: ${userSex}` : ''}`;

  return (
    <div>
      <TitleActionHeader title="Biomarkers" subtitle={subtitle} />

      {/* Search */}
      <div className="relative mt-7 mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search metrics, aliases, or categories..."
          className="w-full rounded-lg border border-neutral-200 bg-white py-2.5 pl-10 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-100 transition-all"
        />
      </div>

      {filtered.length === 0 ? (
        <AnimatedEmptyState
          title="No matches"
          description={`No metrics matching "${search}". Try a different term.`}
          cardIcon={({ index }) => emptyIcons[index % emptyIcons.length]!}
        />
      ) : (
        <div className="space-y-3">
          {sortedCategories.map((cat) => {
            const catMetrics = byCategory.get(cat)!;
            const isExpanded = expandedCategory === cat || lower.length > 0;
            const IconComponent = categoryIcons[cat] ?? ListChecks;
            const label = categoryLabels[cat] ?? cat;

            return (
              <div key={cat} className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
                {/* Category header */}
                <button
                  type="button"
                  onClick={() => setExpandedCategory(isExpanded && !lower ? null : cat)}
                  className="flex w-full items-center justify-between px-5 py-4 transition-colors hover:bg-neutral-50 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-neutral-100">
                      <IconComponent className="size-4 text-neutral-500" />
                    </div>
                    <div className="text-left">
                      <div className="text-[15px] font-semibold text-neutral-900 font-body">
                        {label}
                      </div>
                      <div className="mt-0.5 text-[11px] text-neutral-400 font-mono">
                        {catMetrics.length} metric{catMetrics.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="size-4 text-neutral-400" />
                  ) : (
                    <ChevronRight className="size-4 text-neutral-400" />
                  )}
                </button>

                {/* Metrics table */}
                {isExpanded && (
                  <div>
                    {/* Header row */}
                    <div className="grid grid-cols-[1.6fr_1fr_1.4fr_0.8fr] gap-3 border-t border-b border-neutral-200 bg-neutral-50 px-5 py-2.5">
                      {['Metric', 'Unit', 'Default Range', 'Aliases'].map((h) => (
                        <div
                          key={h}
                          className="text-[11px] font-semibold uppercase tracking-[0.04em] text-neutral-400 font-mono"
                        >
                          {h}
                        </div>
                      ))}
                    </div>

                    {/* Metric rows */}
                    {catMetrics.map((m) => {
                      const metricRanges = rangesByMetric.get(m.id) ?? [];
                      const hasDemographicRanges = metricRanges.length > 0;
                      const isMetricExpanded = expandedMetric === m.id;
                      const aliasList = m.aliases.slice(0, 4);
                      const moreAliases = m.aliases.length > 4 ? m.aliases.length - 4 : 0;

                      return (
                        <div key={m.id}>
                          <div
                            className="grid grid-cols-[1.6fr_1fr_1.4fr_0.8fr] items-center gap-3 border-b border-neutral-100 px-5 py-3.5 transition-colors hover:bg-neutral-50 cursor-pointer"
                            onClick={() => setExpandedMetric(isMetricExpanded ? null : m.id)}
                          >
                            {/* Name + description */}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-neutral-900 font-body">
                                  {m.name}
                                </span>
                                {hasDemographicRanges && (
                                  <StatusBadge
                                    status="info"
                                    label={`${metricRanges.length} range${metricRanges.length !== 1 ? 's' : ''}`}
                                  />
                                )}
                              </div>
                              {m.description && (
                                <div className="mt-0.5 text-[11px] text-neutral-400 font-mono">
                                  {m.description}
                                </div>
                              )}
                            </div>

                            {/* Unit */}
                            <div className="text-xs text-neutral-600 font-mono">
                              {m.unit ?? '—'}
                            </div>

                            {/* Default range */}
                            <div className="text-xs text-neutral-600 font-mono">
                              {formatRange(m.referenceRangeLow, m.referenceRangeHigh, m.unit)}
                            </div>

                            {/* Aliases preview */}
                            <div className="flex flex-wrap gap-1">
                              {aliasList.map((a: string) => (
                                <span
                                  key={a}
                                  className="inline-block rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-500 font-mono"
                                >
                                  {a}
                                </span>
                              ))}
                              {moreAliases > 0 && (
                                <span className="inline-block rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-400 font-mono">
                                  +{moreAliases}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Expanded detail: demographic ranges */}
                          {isMetricExpanded && (
                            <div className="border-b border-neutral-100 bg-neutral-50/50 px-5 py-4">
                              <div className="mb-3 flex flex-wrap gap-1.5">
                                {m.aliases.map((a: string) => (
                                  <span
                                    key={a}
                                    className="inline-block rounded-full border border-neutral-200 bg-white px-2.5 py-0.5 text-[11px] text-neutral-600 font-mono"
                                  >
                                    {a}
                                  </span>
                                ))}
                              </div>

                              {m.loincCode && (
                                <div className="mb-3 text-[11px] text-neutral-400 font-mono">
                                  LOINC: {m.loincCode}
                                </div>
                              )}

                              {metricRanges.length > 0 ? (
                                <div>
                                  <div className="mb-2 text-[12px] font-medium text-neutral-700 font-body">
                                    Reference Ranges
                                  </div>
                                  <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
                                    <div className="grid grid-cols-[1fr_1fr_1fr_1.2fr] gap-3 border-b border-neutral-200 bg-neutral-50 px-4 py-2">
                                      {['Sex', 'Age', 'Range', 'Source'].map((h) => (
                                        <div
                                          key={h}
                                          className="text-[10px] font-semibold uppercase tracking-[0.04em] text-neutral-400 font-mono"
                                        >
                                          {h}
                                        </div>
                                      ))}
                                    </div>
                                    {metricRanges.map((r) => {
                                      const isUserMatch =
                                        userSex &&
                                        (r.sex === null || r.sex === userSex);

                                      return (
                                        <div
                                          key={r.id}
                                          className={`grid grid-cols-[1fr_1fr_1fr_1.2fr] items-center gap-3 border-b border-neutral-100 px-4 py-2.5 ${
                                            isUserMatch
                                              ? 'bg-accent-50/40'
                                              : ''
                                          }`}
                                        >
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-xs text-neutral-700 font-mono">
                                              {r.sex
                                                ? r.sex.charAt(0).toUpperCase() + r.sex.slice(1)
                                                : 'Any'}
                                            </span>
                                            {isUserMatch && r.sex && (
                                              <span className="inline-block size-1.5 rounded-full bg-accent-500" />
                                            )}
                                          </div>
                                          <div className="text-xs text-neutral-600 font-mono">
                                            {r.ageMin != null && r.ageMax != null
                                              ? `${r.ageMin}–${r.ageMax}`
                                              : r.ageMin != null
                                                ? `${r.ageMin}+`
                                                : r.ageMax != null
                                                  ? `≤ ${r.ageMax}`
                                                  : 'Any'}
                                          </div>
                                          <div className="text-xs font-medium text-neutral-900 font-mono">
                                            {formatRange(r.rangeLow, r.rangeHigh, m.unit)}
                                          </div>
                                          <div className="text-[11px] text-neutral-400 font-mono">
                                            {r.source ?? '—'}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-[12px] text-neutral-400 font-body">
                                  No demographic-specific ranges — using default range only.
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
