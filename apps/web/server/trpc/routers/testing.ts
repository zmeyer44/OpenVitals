import { z } from "zod";
import { eq, and, desc, sql, inArray, notInArray } from "drizzle-orm";
import { createRouter, protectedProcedure } from "../init";
import {
  labProviders,
  panelTemplates,
  panelTemplateMetrics,
  userRetestSettings,
  metricDefinitions,
  observations,
  optimalRanges,
  userOptimalRanges,
  users,
} from "@openvitals/database";
import { computeAge } from "@/lib/demographics";
import { deriveStatus, deriveOptimalStatus } from "@/lib/health-utils";
import {
  getAllPreventionMetrics,
  getPreventionFrequency,
} from "@/lib/prevention-panels";

// Categories that are continuously measured (not lab-tested)
const EXCLUDED_CATEGORIES = ["wearable", "vital_sign"];

export const testingRouter = createRouter({
  // ── Providers ────────────────────────────────────────────────────────────

  "providers.list": protectedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(labProviders)
      .where(eq(labProviders.isActive, true))
      .orderBy(labProviders.sortOrder);
  }),

  // ── Panels ───────────────────────────────────────────────────────────────

  "panels.list": protectedProcedure
    .input(z.object({ category: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      // Get user sex for filtering
      const [user] = await ctx.db
        .select({ biologicalSex: users.biologicalSex })
        .from(users)
        .where(eq(users.id, ctx.userId))
        .limit(1);

      const userSex = user?.biologicalSex ?? null;

      let query = ctx.db
        .select({
          id: panelTemplates.id,
          name: panelTemplates.name,
          description: panelTemplates.description,
          category: panelTemplates.category,
          estimatedCostLow: panelTemplates.estimatedCostLow,
          estimatedCostHigh: panelTemplates.estimatedCostHigh,
          targetSex: panelTemplates.targetSex,
          sortOrder: panelTemplates.sortOrder,
          metricCount: sql<number>`count(${panelTemplateMetrics.id})::int`,
        })
        .from(panelTemplates)
        .leftJoin(
          panelTemplateMetrics,
          eq(panelTemplates.id, panelTemplateMetrics.panelId),
        )
        .where(eq(panelTemplates.isActive, true))
        .groupBy(panelTemplates.id)
        .orderBy(panelTemplates.sortOrder);

      const rows = await query;

      // Filter by sex: show panels with no targetSex or matching user sex
      return rows.filter(
        (p) => p.targetSex === null || p.targetSex === userSex,
      );
    }),

  "panels.getByIdWithStatus": protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // Get panel
      const [panel] = await ctx.db
        .select()
        .from(panelTemplates)
        .where(eq(panelTemplates.id, input.id))
        .limit(1);

      if (!panel) return null;

      // Get panel metrics with definitions
      const metrics = await ctx.db
        .select({
          metricCode: panelTemplateMetrics.metricCode,
          isCore: panelTemplateMetrics.isCore,
          sortOrder: panelTemplateMetrics.sortOrder,
          name: metricDefinitions.name,
          category: metricDefinitions.category,
          unit: metricDefinitions.unit,
        })
        .from(panelTemplateMetrics)
        .innerJoin(
          metricDefinitions,
          eq(panelTemplateMetrics.metricCode, metricDefinitions.id),
        )
        .where(eq(panelTemplateMetrics.panelId, input.id))
        .orderBy(panelTemplateMetrics.sortOrder);

      const metricCodes = metrics.map((m) => m.metricCode);

      // Get user's latest observation per metric
      const latestObs =
        metricCodes.length > 0
          ? await ctx.db
              .selectDistinctOn([observations.metricCode], {
                metricCode: observations.metricCode,
                valueNumeric: observations.valueNumeric,
                unit: observations.unit,
                observedAt: observations.observedAt,
                isAbnormal: observations.isAbnormal,
                referenceRangeLow: observations.referenceRangeLow,
                referenceRangeHigh: observations.referenceRangeHigh,
              })
              .from(observations)
              .where(
                and(
                  eq(observations.userId, ctx.userId),
                  inArray(observations.metricCode, metricCodes),
                ),
              )
              .orderBy(observations.metricCode, desc(observations.observedAt))
          : [];

      const obsMap = new Map(latestObs.map((o) => [o.metricCode, o]));

      // Get optimal ranges for these metrics
      const optRanges =
        metricCodes.length > 0
          ? await ctx.db
              .select()
              .from(optimalRanges)
              .where(inArray(optimalRanges.metricCode, metricCodes))
          : [];
      const optMap = new Map<
        string,
        { rangeLow: number | null; rangeHigh: number | null }
      >();
      for (const r of optRanges) {
        if (!optMap.has(r.metricCode)) {
          optMap.set(r.metricCode, {
            rangeLow: r.rangeLow,
            rangeHigh: r.rangeHigh,
          });
        }
      }

      const now = Date.now();

      const metricsWithStatus = metrics.map((m) => {
        const obs = obsMap.get(m.metricCode);
        const opt = optMap.get(m.metricCode);
        const daysSinceTest = obs
          ? Math.floor(
              (now - new Date(obs.observedAt).getTime()) /
                (1000 * 60 * 60 * 24),
            )
          : null;

        const healthStatus = obs
          ? deriveStatus({
              isAbnormal: obs.isAbnormal,
              referenceRangeLow: obs.referenceRangeLow,
              referenceRangeHigh: obs.referenceRangeHigh,
              valueNumeric: obs.valueNumeric,
            })
          : null;

        const optimalStatus = obs
          ? deriveOptimalStatus({
              valueNumeric: obs.valueNumeric,
              optimalRangeLow: opt?.rangeLow ?? null,
              optimalRangeHigh: opt?.rangeHigh ?? null,
            })
          : null;

        return {
          metricCode: m.metricCode,
          name: m.name,
          category: m.category,
          unit: m.unit,
          isCore: m.isCore,
          latestValue: obs?.valueNumeric ?? null,
          latestUnit: obs?.unit ?? null,
          observedAt: obs?.observedAt?.toISOString() ?? null,
          daysSinceTest,
          healthStatus,
          optimalStatus,
        };
      });

      const testedCount = metricsWithStatus.filter(
        (m) => m.latestValue !== null,
      ).length;

      return {
        ...panel,
        metrics: metricsWithStatus,
        testedCount,
        totalCount: metricsWithStatus.length,
      };
    }),

  // ── Retest Planner ───────────────────────────────────────────────────────

  "retest.getRecommendations": protectedProcedure.query(async ({ ctx }) => {
    // Get user demographics
    const [user] = await ctx.db
      .select({
        dateOfBirth: users.dateOfBirth,
        biologicalSex: users.biologicalSex,
      })
      .from(users)
      .where(eq(users.id, ctx.userId))
      .limit(1);

    // Get all user's latest observations (excluding wearables/vitals)
    const allObs = await ctx.db
      .selectDistinctOn([observations.metricCode], {
        metricCode: observations.metricCode,
        valueNumeric: observations.valueNumeric,
        unit: observations.unit,
        observedAt: observations.observedAt,
        isAbnormal: observations.isAbnormal,
        referenceRangeLow: observations.referenceRangeLow,
        referenceRangeHigh: observations.referenceRangeHigh,
        category: observations.category,
      })
      .from(observations)
      .where(
        and(
          eq(observations.userId, ctx.userId),
          notInArray(observations.category, EXCLUDED_CATEGORIES),
        ),
      )
      .orderBy(observations.metricCode, desc(observations.observedAt));

    if (allObs.length === 0) return [];

    const metricCodes = allObs.map((o) => o.metricCode);
    // Also include prevention panel metrics for gap detection
    const allCodes = [
      ...new Set([...metricCodes, ...getAllPreventionMetrics()]),
    ];

    // Get metric definitions, optimal ranges, and user overrides in parallel
    const [metricDefs, optRanges, userOverrides] = await Promise.all([
      ctx.db
        .select()
        .from(metricDefinitions)
        .where(inArray(metricDefinitions.id, allCodes)),
      ctx.db
        .select()
        .from(optimalRanges)
        .where(inArray(optimalRanges.metricCode, metricCodes)),
      ctx.db
        .select()
        .from(userRetestSettings)
        .where(eq(userRetestSettings.userId, ctx.userId)),
    ]);

    const defMap = new Map(metricDefs.map((d) => [d.id, d]));
    const optMap = new Map<
      string,
      { rangeLow: number | null; rangeHigh: number | null }
    >();
    for (const r of optRanges) {
      if (!optMap.has(r.metricCode)) {
        optMap.set(r.metricCode, {
          rangeLow: r.rangeLow,
          rangeHigh: r.rangeHigh,
        });
      }
    }
    const overrideMap = new Map(userOverrides.map((o) => [o.metricCode, o]));

    const now = Date.now();

    type Recommendation = {
      metricCode: string;
      metricName: string;
      category: string;
      unit: string | null;
      lastValue: number | null;
      lastObservedAt: string | null;
      daysSinceLastTest: number;
      healthStatus: "normal" | "warning" | "critical" | "info" | "neutral";
      optimalStatus: "optimal" | "suboptimal" | "unknown";
      recommendedIntervalDays: number;
      userOverrideIntervalDays: number | null;
      effectiveIntervalDays: number;
      isPaused: boolean;
      urgency:
        | "overdue"
        | "due_soon"
        | "upcoming"
        | "on_track"
        | "never_tested";
      dueInDays: number;
      preventionPanel: string | null;
      preventionWhy: string | null;
    };

    const recommendations: Recommendation[] = allObs.map((obs) => {
      const def = defMap.get(obs.metricCode);
      const opt = optMap.get(obs.metricCode);
      const override = overrideMap.get(obs.metricCode);

      const healthStatus = deriveStatus({
        isAbnormal: obs.isAbnormal,
        referenceRangeLow: obs.referenceRangeLow,
        referenceRangeHigh: obs.referenceRangeHigh,
        valueNumeric: obs.valueNumeric,
      }) as Recommendation["healthStatus"];

      const optimalStatus = deriveOptimalStatus({
        valueNumeric: obs.valueNumeric,
        optimalRangeLow: opt?.rangeLow ?? null,
        optimalRangeHigh: opt?.rangeHigh ?? null,
      });

      // Compute recommended interval
      let recommendedIntervalDays: number;
      if (healthStatus === "critical") {
        recommendedIntervalDays = 30;
      } else if (healthStatus === "warning") {
        recommendedIntervalDays = 90;
      } else if (optimalStatus === "suboptimal") {
        recommendedIntervalDays = 120;
      } else if (optimalStatus === "optimal") {
        recommendedIntervalDays = 365;
      } else {
        recommendedIntervalDays = 180;
      }

      const userOverrideIntervalDays = override?.retestIntervalDays ?? null;
      const effectiveIntervalDays =
        userOverrideIntervalDays ?? recommendedIntervalDays;
      const isPaused = override?.isPaused ?? false;

      const daysSinceLastTest = Math.floor(
        (now - new Date(obs.observedAt).getTime()) / (1000 * 60 * 60 * 24),
      );
      const dueInDays = effectiveIntervalDays - daysSinceLastTest;

      let urgency:
        | "overdue"
        | "due_soon"
        | "upcoming"
        | "on_track"
        | "never_tested";
      if (dueInDays <= -30) {
        urgency = "overdue";
      } else if (dueInDays <= 0) {
        urgency = "due_soon";
      } else if (dueInDays <= 30) {
        urgency = "upcoming";
      } else {
        urgency = "on_track";
      }

      // Check if this metric is in a prevention panel
      const prevention = getPreventionFrequency(obs.metricCode);

      return {
        metricCode: obs.metricCode,
        metricName: def?.name ?? obs.metricCode,
        category: def?.category ?? obs.category,
        unit: def?.unit ?? obs.unit,
        lastValue: obs.valueNumeric,
        lastObservedAt: obs.observedAt.toISOString(),
        daysSinceLastTest,
        healthStatus,
        optimalStatus,
        recommendedIntervalDays,
        userOverrideIntervalDays,
        effectiveIntervalDays,
        isPaused,
        urgency,
        dueInDays,
        preventionPanel: prevention?.panelLabel ?? null,
        preventionWhy: prevention?.why ?? null,
      };
    });

    // ── Prevention gap items (never tested but recommended) ──────────
    const testedCodes = new Set(allObs.map((o) => o.metricCode));
    const preventionMetrics = getAllPreventionMetrics();

    // Also check aliases — if user has "25_hydroxyvitamin_d", don't suggest "vitamin_d"
    const ALIAS_MAP: Record<string, string[]> = {
      vitamin_d: ["25_hydroxyvitamin_d", "vitamin_d_25_hydroxyvitamin_d"],
      crp: ["c_reactive_protein", "hs_crp"],
      hba1c: ["hemoglobin_a1c"],
    };

    for (const code of preventionMetrics) {
      // Skip if already tested (primary code or aliases)
      const aliases = ALIAS_MAP[code] ?? [];
      const isTested =
        testedCodes.has(code) || aliases.some((a) => testedCodes.has(a));
      if (isTested) continue;

      // Skip calculated metrics (they're computed, not tested)
      if (code === "homa_ir") continue;

      const def = defMap.get(code);
      const prevention = getPreventionFrequency(code);
      if (!prevention) continue;

      recommendations.push({
        metricCode: code,
        metricName: def?.name ?? code.replace(/_/g, " "),
        category: def?.category ?? "lab_result",
        unit: def?.unit ?? null,
        lastValue: null,
        lastObservedAt: null,
        daysSinceLastTest: Infinity,
        healthStatus: "neutral",
        optimalStatus: "unknown",
        recommendedIntervalDays: prevention.frequencyDays,
        userOverrideIntervalDays: null,
        effectiveIntervalDays: prevention.frequencyDays,
        isPaused: false,
        urgency: "never_tested" as const,
        dueInDays: 0,
        preventionPanel: prevention.panelLabel,
        preventionWhy: prevention.why,
      });
    }

    // Sort: flagged retests first, then prevention gaps, then routine
    // Within each group: overdue → due_soon → upcoming → on_track → never_tested
    const urgencyOrder: Record<string, number> = {
      overdue: 0,
      due_soon: 1,
      upcoming: 2,
      on_track: 3,
      never_tested: 4,
    };
    recommendations.sort((a, b) => {
      // Flagged (critical/warning) metrics always first
      const aFlagged =
        a.healthStatus === "critical" || a.healthStatus === "warning" ? 0 : 1;
      const bFlagged =
        b.healthStatus === "critical" || b.healthStatus === "warning" ? 0 : 1;
      if (aFlagged !== bFlagged) return aFlagged - bFlagged;

      const groupDiff =
        (urgencyOrder[a.urgency] ?? 5) - (urgencyOrder[b.urgency] ?? 5);
      if (groupDiff !== 0) return groupDiff;
      return a.dueInDays - b.dueInDays;
    });

    return recommendations;
  }),

  "retest.setOverride": protectedProcedure
    .input(
      z.object({
        metricCode: z.string(),
        retestIntervalDays: z.number().int().positive(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .insert(userRetestSettings)
        .values({
          userId: ctx.userId,
          metricCode: input.metricCode,
          retestIntervalDays: input.retestIntervalDays,
        })
        .onConflictDoUpdate({
          target: [userRetestSettings.userId, userRetestSettings.metricCode],
          set: {
            retestIntervalDays: input.retestIntervalDays,
            updatedAt: new Date(),
          },
        });
      return { success: true };
    }),

  "retest.deleteOverride": protectedProcedure
    .input(z.object({ metricCode: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(userRetestSettings)
        .where(
          and(
            eq(userRetestSettings.userId, ctx.userId),
            eq(userRetestSettings.metricCode, input.metricCode),
          ),
        );
      return { success: true };
    }),

  "retest.togglePause": protectedProcedure
    .input(z.object({ metricCode: z.string(), isPaused: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .insert(userRetestSettings)
        .values({
          userId: ctx.userId,
          metricCode: input.metricCode,
          retestIntervalDays: 180, // default
          isPaused: input.isPaused,
        })
        .onConflictDoUpdate({
          target: [userRetestSettings.userId, userRetestSettings.metricCode],
          set: {
            isPaused: input.isPaused,
            updatedAt: new Date(),
          },
        });
      return { success: true };
    }),
});
