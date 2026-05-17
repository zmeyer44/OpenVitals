"use client";

import { useMemo } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { useSession } from "@/lib/auth/client";
import { useDynamicStatus } from "@/hooks/use-dynamic-status";
import {
  formatRange,
  isTrendImproving,
  deriveStatus,
} from "@/lib/health-utils";
import { PANELS } from "@/lib/panel-config";
import { GreetingHeader } from "@/components/home/greeting-header";
import {
  OnboardingChecklist,
  type ChecklistItem,
} from "@/components/home/onboarding-checklist";
import { BiomarkerPanelCard } from "@/components/home/biomarker-panel-card";
import { EmptyMetricCard } from "@/components/home/empty-metric-card";
import { PanelSectionHeader } from "@/components/home/panel-section-header";
import { WhatChanged, type ChangeItem } from "@/components/home/what-changed";
import {
  HealthScore,
  calculateHealthScore,
} from "@/components/home/health-score";
import { DashboardStats } from "@/components/home/dashboard-stats";
import {
  HealthInsights,
  generateInsights,
} from "@/components/home/health-insights";
import {
  AttentionMetrics,
  type AttentionMetric,
} from "@/components/home/attention-metrics";
import {
  UpcomingRetests,
  type RetestItem,
} from "@/components/home/upcoming-retests";
import {
  Upload,
  Pill,
  HeartPulse,
  ListChecks,
  FileText,
  MessageSquare,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  const { data: session } = useSession();
  const {
    getStatus,
    isAbnormal: isObsAbnormal,
    getRanges,
  } = useDynamicStatus();
  const observations = trpc.observations.list.useQuery({ limit: 500 });
  const medications = trpc.medications.list.useQuery({});
  const importJobs = trpc.importJobs.list.useQuery({ limit: 20 });
  const metricDefs = trpc.metrics.list.useQuery(undefined, {
    enabled: (observations.data?.items?.length ?? 0) > 0,
  });
  const conditionsQuery = trpc.conditions.list.useQuery();
  const retests = trpc.testing["retest.getRecommendations"].useQuery(
    undefined,
    { enabled: (observations.data?.items?.length ?? 0) > 0 },
  );

  const isLoading =
    observations.isLoading || medications.isLoading || importJobs.isLoading;

  const obsItems = observations.data?.items ?? [];
  const medItems = medications.data?.items ?? [];
  const jobItems = importJobs.data?.items ?? [];
  const metricDefsList = metricDefs.data ?? [];
  const condItems = conditionsQuery.data ?? [];
  const retestItems = retests.data ?? [];
  const hasData = obsItems.length > 0;

  // Build metric name lookup
  const metricNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const def of metricDefsList) {
      map.set(def.id, def.name);
    }
    return map;
  }, [metricDefsList]);

  // Group observations by metric (sorted newest first)
  const byMetric = useMemo(() => {
    const map = new Map<string, typeof obsItems>();
    for (const obs of obsItems) {
      const existing = map.get(obs.metricCode) ?? [];
      existing.push(obs);
      map.set(obs.metricCode, existing);
    }
    for (const [, arr] of map) {
      arr.sort(
        (a, b) =>
          new Date(b.observedAt).getTime() - new Date(a.observedAt).getTime(),
      );
    }
    return map;
  }, [obsItems]);

  // Aggregate stats for health score + summary
  const stats = useMemo(() => {
    let normalCount = 0;
    let warningCount = 0;
    let criticalCount = 0;

    for (const [, metricObs] of byMetric) {
      const latest = metricObs[0]!;
      const status = getStatus(latest);
      if (status === "critical") criticalCount++;
      else if (status === "warning") warningCount++;
      else normalCount++;
    }

    return { normalCount, warningCount, criticalCount };
  }, [byMetric, getStatus]);

  const healthScore = calculateHealthScore(
    stats.normalCount,
    stats.warningCount,
    stats.criticalCount,
  );

  // Attention metrics (top flagged)
  const attentionMetrics = useMemo<AttentionMetric[]>(() => {
    const result: AttentionMetric[] = [];
    const now = Date.now();

    for (const [code, metricObs] of byMetric) {
      const latest = metricObs[0]!;
      const status = getStatus(latest);
      if (status === "normal") continue;

      const sparkData = metricObs
        .slice(0, 8)
        .reverse()
        .map((o) => o.valueNumeric ?? 0);
      const daysSinceTest = Math.floor(
        (now - new Date(latest.observedAt).getTime()) / (1000 * 60 * 60 * 24),
      );

      result.push({
        metricCode: code,
        metricName: metricNameMap.get(code) ?? code.replace(/_/g, " "),
        latestValue: latest.valueNumeric ?? null,
        unit: latest.unit ?? null,
        status,
        sparkData,
        daysSinceTest,
      });
    }

    return result
      .sort((a, b) => {
        const order = {
          critical: 0,
          warning: 1,
          normal: 2,
          info: 3,
          neutral: 4,
        };
        return (order[a.status] ?? 4) - (order[b.status] ?? 4);
      })
      .slice(0, 5);
  }, [byMetric, metricNameMap, getStatus]);

  // Retest items — tested within last 3 years + prevention gaps (never_tested)
  const MAX_RETEST_AGE_DAYS = 365 * 3;
  const upcomingRetests = useMemo<RetestItem[]>(() => {
    return retestItems
      .filter(
        (r) =>
          !r.isPaused &&
          (r.urgency === "never_tested" ||
            r.daysSinceLastTest < MAX_RETEST_AGE_DAYS),
      )
      .map((r) => ({
        metricCode: r.metricCode,
        metricName: r.metricName,
        urgency: r.urgency,
        dueInDays: r.dueInDays,
        daysSinceLastTest: r.daysSinceLastTest,
        healthStatus: r.healthStatus,
        preventionPanel: r.preventionPanel,
        preventionWhy: r.preventionWhy,
      }));
  }, [retestItems]);

  // Auto-calculate derived metrics (HOMA-IR = glucose × insulin / 405)
  const calculatedMetrics = useMemo(() => {
    const map = new Map<string, { value: number; unit: string }>();
    const glucoseObs = byMetric.get("glucose");
    const insulinObs = byMetric.get("insulin");

    if (glucoseObs && insulinObs) {
      const latestGlucose = glucoseObs.find((o) => o.valueNumeric != null);
      const latestInsulin = insulinObs.find((o) => o.valueNumeric != null);
      if (latestGlucose?.valueNumeric && latestInsulin?.valueNumeric) {
        const homaIr =
          (latestGlucose.valueNumeric * latestInsulin.valueNumeric) / 405;
        map.set("homa_ir", {
          value: Math.round(homaIr * 100) / 100,
          unit: "",
        });
      }
    }
    return map;
  }, [byMetric]);

  // Panel data: filled metrics + empty metrics
  const panelData = useMemo(() => {
    return PANELS.map((panel) => {
      type FilledMetric = {
        type: "filled";
        metricCode: string;
        name: string;
        value: number;
        unit: string;
        sparkData: number[];
        trendDelta: number | null;
        trendImproving: boolean | null;
        optimalRange: string;
        status: "normal" | "warning" | "critical" | "info" | "neutral";
      };
      type EmptyMetric = {
        type: "empty";
        metricCode: string;
        name: string;
        reason: string;
      };

      const allMetrics: (FilledMetric | EmptyMetric)[] = [];
      let inRangeCount = 0;
      let panelWarningCount = 0;
      let panelCriticalCount = 0;
      let totalTested = 0;

      for (const metricDef of panel.metrics) {
        const code = metricDef.code;
        // Check primary code and aliases for observations
        const codesToCheck = [code, ...(metricDef.aliases ?? [])];
        let metricObs: typeof obsItems | undefined;
        let resolvedCode = code;
        for (const c of codesToCheck) {
          const obs = byMetric.get(c);
          if (obs && obs.length > 0) {
            metricObs = obs;
            resolvedCode = c;
            break;
          }
        }

        // Check calculated metrics as fallback (e.g., HOMA-IR)
        const calculated = calculatedMetrics.get(code);

        if ((!metricObs || metricObs.length === 0) && !calculated) {
          allMetrics.push({
            type: "empty",
            metricCode: code,
            name: metricNameMap.get(code) ?? code.replace(/_/g, " "),
            reason: metricDef.reason,
          });
          continue;
        }

        // Use calculated value if no observations
        if ((!metricObs || metricObs.length === 0) && calculated) {
          const ranges = getRanges(code);
          const calcStatus = deriveStatus(
            { valueNumeric: calculated.value },
            ranges,
          );
          totalTested++;
          if (calcStatus === "normal") inRangeCount++;
          else if (calcStatus === "warning") panelWarningCount++;
          else if (calcStatus === "critical") panelCriticalCount++;

          const hasOptimal =
            ranges?.optimalLow != null || ranges?.optimalHigh != null;
          const rangeLabel = hasOptimal ? "optimal" : "ref";
          const optimalRange = `${rangeLabel} ${formatRange(
            ranges?.optimalLow ?? ranges?.referenceLow,
            ranges?.optimalHigh ?? ranges?.referenceHigh,
            calculated.unit,
          )}`;
          allMetrics.push({
            type: "filled",
            metricCode: code,
            name: metricNameMap.get(code) ?? code.replace(/_/g, " "),
            value: calculated.value,
            unit: calculated.unit,
            sparkData: [calculated.value],
            trendDelta: null,
            trendImproving: null,
            optimalRange,
            status: calcStatus,
          });
          continue;
        }

        // At this point metricObs is guaranteed non-empty (empty cases handled above)
        const validObs = metricObs ?? [];
        const latestWithValue = validObs.find((o) => o.valueNumeric != null);
        if (!latestWithValue) {
          allMetrics.push({
            type: "empty",
            metricCode: code,
            name: metricNameMap.get(code) ?? code.replace(/_/g, " "),
            reason: metricDef.reason,
          });
          continue;
        }

        const latest = latestWithValue;
        const value = latest.valueNumeric!;

        totalTested++;
        const status = getStatus(latest);
        if (status === "normal") inRangeCount++;
        else if (status === "warning") panelWarningCount++;
        else if (status === "critical") panelCriticalCount++;

        const withValues = validObs.filter((o) => o.valueNumeric != null);
        const previous = withValues[1];
        const sparkData = withValues
          .slice(0, 8)
          .reverse()
          .map((o) => o.valueNumeric ?? 0);
        const ranges = getRanges(resolvedCode) ?? getRanges(code);
        const hasOptimal =
          ranges?.optimalLow != null || ranges?.optimalHigh != null;
        const rangeLabel = hasOptimal ? "optimal" : "ref";
        const optimalRange = `${rangeLabel} ${formatRange(
          ranges?.optimalLow ?? ranges?.referenceLow,
          ranges?.optimalHigh ?? ranges?.referenceHigh,
          latest.unit,
        )}`;

        let trendDelta: number | null = null;
        if (previous?.valueNumeric && previous.valueNumeric !== 0) {
          trendDelta =
            ((value - previous.valueNumeric) /
              Math.abs(previous.valueNumeric)) *
            100;
        }

        const trendImproving =
          trendDelta != null
            ? isTrendImproving(trendDelta, ranges, value)
            : null;

        allMetrics.push({
          type: "filled",
          metricCode: code,
          name: metricNameMap.get(code) ?? code.replace(/_/g, " "),
          value,
          unit: latest.unit ?? "",
          sparkData,
          trendDelta,
          trendImproving,
          optimalRange,
          status,
        });
      }

      return {
        ...panel,
        allMetrics,
        inRangeCount,
        panelWarningCount,
        panelCriticalCount,
        totalTested,
        totalMetrics: panel.metrics.length,
      };
    });
  }, [byMetric, metricNameMap, getStatus, getRanges, calculatedMetrics]);

  // Health insights
  const healthInsights = useMemo(() => {
    if (!hasData) return [];
    return generateInsights(byMetric, metricNameMap);
  }, [hasData, byMetric, metricNameMap]);

  // What Changed
  const whatChanged = useMemo(() => {
    const allDates = new Set<string>();
    for (const obs of obsItems) {
      allDates.add(new Date(obs.observedAt).toISOString().slice(0, 10));
    }
    const sortedDates = [...allDates].sort().reverse();
    if (sortedDates.length < 2)
      return { changes: [], previousDate: "", currentDate: "" };

    const currentDate = sortedDates[0]!;
    const previousDate = sortedDates[1]!;
    const changes: ChangeItem[] = [];

    for (const [code, metricObs] of byMetric) {
      const currentObs = metricObs.find(
        (o) =>
          new Date(o.observedAt).toISOString().slice(0, 10) === currentDate,
      );
      const previousObs = metricObs.find(
        (o) =>
          new Date(o.observedAt).toISOString().slice(0, 10) === previousDate,
      );

      if (!currentObs?.valueNumeric || !previousObs?.valueNumeric) continue;
      if (previousObs.valueNumeric === 0) continue;

      const pct =
        ((currentObs.valueNumeric - previousObs.valueNumeric) /
          Math.abs(previousObs.valueNumeric)) *
        100;
      if (Math.abs(pct) < 5) continue;

      const ranges = getRanges(code);
      const trendResult = isTrendImproving(
        pct,
        ranges,
        currentObs.valueNumeric,
      );
      const improved = trendResult ?? getStatus(currentObs) === "normal";

      changes.push({
        metricCode: code,
        name: metricNameMap.get(code) ?? code.replace(/_/g, " "),
        oldValue: previousObs.valueNumeric,
        newValue: currentObs.valueNumeric,
        unit: currentObs.unit ?? "",
        percentChange: pct,
        improved,
      });
    }

    changes.sort(
      (a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange),
    );

    const fmt = (d: string) =>
      new Date(d).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    return {
      changes,
      previousDate: fmt(previousDate),
      currentDate: fmt(currentDate),
    };
  }, [obsItems, byMetric, metricNameMap, getStatus, getRanges]);

  // Derive display values
  const fullName = session?.user?.name ?? "";
  const firstName = fullName.split(/\s+/)[0] ?? "";
  const metricCount = byMetric.size;
  const retestsDueCount = retestItems.filter(
    (r) => r.urgency === "overdue" || r.urgency === "due_soon",
  ).length;
  const summaryParts = [];
  if (hasData) summaryParts.push(`${metricCount} metrics`);
  if (stats.warningCount + stats.criticalCount > 0)
    summaryParts.push(`${stats.warningCount + stats.criticalCount} flagged`);
  if (retestsDueCount > 0) summaryParts.push(`${retestsDueCount} retests due`);
  const summaryLine =
    summaryParts.length > 0
      ? summaryParts.join(" · ")
      : "Upload your first lab report to get started";
  const abnormalCount = obsItems.filter((o) => isObsAbnormal(o)).length;

  // Onboarding checklist
  const checklistItems: ChecklistItem[] = [
    {
      label: "Upload a lab report",
      description: "Import your lab results to start tracking biomarkers.",
      href: "/uploads",
      completed: jobItems.length > 0,
      icon: Upload,
    },
    {
      label: "Add a medication",
      description: "Track medications so AI insights can factor them in.",
      href: "/medications",
      completed: medItems.length > 0,
      icon: Pill,
    },
    {
      label: "Track a condition",
      description: "Record health conditions to build a complete picture.",
      href: "/conditions",
      completed: condItems.length > 0,
      icon: HeartPulse,
    },
    {
      label: "Review your biomarkers",
      description: "Explore lab results with reference ranges and trends.",
      href: "/biomarkers",
      completed: obsItems.length > 0,
      icon: ListChecks,
    },
    {
      label: "Generate a health report",
      description: "Create a report to share with your doctor.",
      href: "/reports",
      completed: false,
      icon: FileText,
    },
    {
      label: "Ask AI a question",
      description: "Chat with your health data for insights.",
      href: "/ai",
      completed: false,
      icon: MessageSquare,
    },
  ];

  if (isLoading) {
    return (
      <div>
        <div className="card h-20 animate-pulse bg-neutral-50" />
        <div className="mt-4 grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card h-24 animate-pulse bg-neutral-50" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="stagger-children">
      {/* Greeting */}
      <GreetingHeader
        firstName={firstName}
        summaryLine={summaryLine}
        abnormalCount={abnormalCount}
      />

      {/* Health Score + Dashboard Stats */}
      {hasData && (
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4">
          <HealthScore
            score={healthScore}
            normalCount={stats.normalCount}
            warningCount={stats.warningCount}
            criticalCount={stats.criticalCount}
            totalMetrics={metricCount}
          />
          <DashboardStats
            metricCount={metricCount}
            totalResults={obsItems.length}
            flaggedCount={stats.warningCount + stats.criticalCount}
            criticalCount={stats.criticalCount}
            warningCount={stats.warningCount}
            activeMedCount={medItems.filter((m) => m.isActive).length}
            discontinuedMedCount={medItems.filter((m) => !m.isActive).length}
            retestsDueCount={retestsDueCount}
            overdueCount={
              retestItems.filter((r) => r.urgency === "overdue").length
            }
          />
        </div>
      )}

      {/* Quick actions */}
      <div className="mt-5 flex gap-3">
        <Link
          href="/uploads"
          className="card inline-flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium font-display hover:border-accent-200 transition-all"
        >
          <Upload className="size-4 text-neutral-500" />
          Upload Blood Work
        </Link>
        <Link
          href="/ai"
          className="card inline-flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium font-display hover:border-accent-200 transition-all"
        >
          <Sparkles className="size-4 text-neutral-500" />
          Ask AI Coach
        </Link>
      </div>

      {/* Onboarding checklist (new users only) */}
      {!hasData && (
        <div className="mt-6">
          <OnboardingChecklist items={checklistItems} />
        </div>
      )}

      {/* Insights */}
      {healthInsights.length > 0 && (
        <div className="mt-6">
          <HealthInsights insights={healthInsights} />
        </div>
      )}

      {/* Needs Attention + Upcoming Retests (side-by-side) */}
      {(attentionMetrics.length > 0 || upcomingRetests.length > 0) && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {attentionMetrics.length > 0 && (
            <AttentionMetrics metrics={attentionMetrics} />
          )}
          {upcomingRetests.length > 0 && (
            <UpcomingRetests items={upcomingRetests} />
          )}
        </div>
      )}

      {/* Panel sections — always show all panels */}
      {panelData.map((panel) => (
        <div key={panel.id} className="mt-6">
          <PanelSectionHeader
            label={panel.label}
            inRangeCount={panel.inRangeCount}
            warningCount={panel.panelWarningCount}
            criticalCount={panel.panelCriticalCount}
            totalTested={panel.totalTested}
            totalMetrics={panel.totalMetrics}
          />
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {panel.allMetrics.map((m) =>
              m.type === "filled" ? (
                <BiomarkerPanelCard key={m.metricCode} {...m} />
              ) : (
                <EmptyMetricCard key={m.metricCode} {...m} />
              ),
            )}
          </div>
        </div>
      ))}

      {/* What Changed */}
      {whatChanged.changes.length > 0 && (
        <div className="mt-8">
          <WhatChanged
            changes={whatChanged.changes}
            previousDate={whatChanged.previousDate}
            currentDate={whatChanged.currentDate}
          />
        </div>
      )}

      {/* AI Coach Suggestions placeholder */}
      <div className="mt-8">
        <div className="card p-5 border-dashed">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="size-4 text-neutral-400" />
            <h2 className="text-[15px] font-medium font-display tracking-[-0.02em] text-neutral-500">
              AI Coach Suggestions
            </h2>
          </div>
          <p className="text-[13px] text-neutral-400 font-display">
            Upload your latest blood work and the AI coach will analyze trends
            and suggest next steps.
          </p>
          <Link
            href="/ai"
            className="mt-3 inline-flex text-[12px] font-medium text-accent-600 font-display hover:text-accent-700"
          >
            Ask AI Coach &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
