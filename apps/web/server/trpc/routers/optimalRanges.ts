import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createRouter, protectedProcedure } from "../init";
import { optimalRanges, userOptimalRanges, users } from "@openvitals/database";
import { computeAge } from "@/lib/demographics";

interface DemographicRange {
  metricCode: string;
  sex: string | null;
  ageMin: number | null;
  ageMax: number | null;
  rangeLow: number | null;
  rangeHigh: number | null;
  source: string | null;
}

interface UserDemographics {
  sex: string | null;
  ageInYears: number | null;
}

function findBestDemographicRange(
  ranges: DemographicRange[],
  demographics: UserDemographics,
): DemographicRange | null {
  let bestRange: DemographicRange | null = null;
  let bestScore = -1;

  for (const range of ranges) {
    if (demographics.ageInYears !== null) {
      if (range.ageMin !== null && demographics.ageInYears < range.ageMin)
        continue;
      if (range.ageMax !== null && demographics.ageInYears > range.ageMax)
        continue;
    }

    if (
      range.sex !== null &&
      demographics.sex !== null &&
      range.sex !== demographics.sex
    )
      continue;

    let score = 0;
    if (range.sex !== null && range.sex === demographics.sex) score += 2;
    if (range.ageMin !== null || range.ageMax !== null) score += 1;
    if (range.ageMin !== null && range.ageMax !== null) score += 1;

    if (score > bestScore) {
      bestScore = score;
      bestRange = range;
    }
  }

  return bestRange;
}

export const optimalRangesRouter = createRouter({
  list: protectedProcedure
    .input(z.object({ metricCode: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      if (input?.metricCode) {
        return ctx.db
          .select()
          .from(optimalRanges)
          .where(eq(optimalRanges.metricCode, input.metricCode));
      }
      return ctx.db.select().from(optimalRanges);
    }),

  forUser: protectedProcedure
    .input(z.object({ metricCode: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      // Get user demographics
      const [user] = await ctx.db
        .select({
          dateOfBirth: users.dateOfBirth,
          biologicalSex: users.biologicalSex,
        })
        .from(users)
        .where(eq(users.id, ctx.userId))
        .limit(1);

      const demographics: UserDemographics = {
        sex: user?.biologicalSex ?? null,
        ageInYears: computeAge(user?.dateOfBirth ?? null),
      };

      // Get user overrides
      const overrides = input?.metricCode
        ? await ctx.db
            .select()
            .from(userOptimalRanges)
            .where(
              and(
                eq(userOptimalRanges.userId, ctx.userId),
                eq(userOptimalRanges.metricCode, input.metricCode),
              ),
            )
        : await ctx.db
            .select()
            .from(userOptimalRanges)
            .where(eq(userOptimalRanges.userId, ctx.userId));

      const overrideMap = new Map(overrides.map((o) => [o.metricCode, o]));

      // Get default optimal ranges
      const defaults = input?.metricCode
        ? await ctx.db
            .select()
            .from(optimalRanges)
            .where(eq(optimalRanges.metricCode, input.metricCode))
        : await ctx.db.select().from(optimalRanges);

      // Group defaults by metricCode
      const byMetric = new Map<string, typeof defaults>();
      for (const row of defaults) {
        const existing = byMetric.get(row.metricCode) ?? [];
        existing.push(row);
        byMetric.set(row.metricCode, existing);
      }

      // Resolve: user override > demographic match > first available
      const result: Record<
        string,
        {
          metricCode: string;
          rangeLow: number | null;
          rangeHigh: number | null;
          source: string | null;
          isOverride: boolean;
        }
      > = {};

      for (const [code, ranges] of byMetric) {
        const override = overrideMap.get(code);
        if (override) {
          result[code] = {
            metricCode: code,
            rangeLow: override.rangeLow,
            rangeHigh: override.rangeHigh,
            source: "User override",
            isOverride: true,
          };
        } else {
          const best = findBestDemographicRange(ranges, demographics);
          if (best) {
            result[code] = {
              metricCode: code,
              rangeLow: best.rangeLow,
              rangeHigh: best.rangeHigh,
              source: best.source,
              isOverride: false,
            };
          }
        }
      }

      // Include overrides for metrics not in defaults
      for (const override of overrides) {
        if (!result[override.metricCode]) {
          result[override.metricCode] = {
            metricCode: override.metricCode,
            rangeLow: override.rangeLow,
            rangeHigh: override.rangeHigh,
            source: "User override",
            isOverride: true,
          };
        }
      }

      return result;
    }),

  getUserOverrides: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(userOptimalRanges)
      .where(eq(userOptimalRanges.userId, ctx.userId));
  }),

  setOverride: protectedProcedure
    .input(
      z.object({
        metricCode: z.string(),
        rangeLow: z.number().nullable(),
        rangeHigh: z.number().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .insert(userOptimalRanges)
        .values({
          userId: ctx.userId,
          metricCode: input.metricCode,
          rangeLow: input.rangeLow,
          rangeHigh: input.rangeHigh,
        })
        .onConflictDoUpdate({
          target: [userOptimalRanges.userId, userOptimalRanges.metricCode],
          set: {
            rangeLow: input.rangeLow,
            rangeHigh: input.rangeHigh,
            updatedAt: new Date(),
          },
        });
      return { success: true };
    }),

  deleteOverride: protectedProcedure
    .input(z.object({ metricCode: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(userOptimalRanges)
        .where(
          and(
            eq(userOptimalRanges.userId, ctx.userId),
            eq(userOptimalRanges.metricCode, input.metricCode),
          ),
        );
      return { success: true };
    }),

  toggleVisibility: protectedProcedure
    .input(z.object({ show: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(users)
        .set({ showOptimalRanges: input.show, updatedAt: new Date() })
        .where(eq(users.id, ctx.userId));
      return { success: true };
    }),
});
