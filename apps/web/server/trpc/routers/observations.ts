import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, ne } from "drizzle-orm";
import { createRouter, protectedProcedure } from "../init";
import {
  listObservations,
  getObservationTrend,
  getObservationWithProvenance,
  observations,
  importJobs,
} from "@openvitals/database";

export const observationsRouter = createRouter({
  list: protectedProcedure
    .input(
      z.object({
        category: z.string().optional(),
        metricCode: z.string().optional(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
        status: z.string().optional(),
        limit: z.number().min(1).max(1000).default(50),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const offset = input.cursor ? parseInt(input.cursor, 10) : 0;
      const items = await listObservations(ctx.db, {
        userId: ctx.userId,
        category: input.category,
        metricCode: input.metricCode,
        dateFrom: input.dateFrom,
        dateTo: input.dateTo,
        status: input.status,
        limit: input.limit + 1,
        offset,
      });

      let nextCursor: string | null = null;
      if (items.length > input.limit) {
        items.pop();
        nextCursor = String(offset + input.limit);
      }

      return { items, nextCursor };
    }),

  trend: protectedProcedure
    .input(
      z.object({
        metricCode: z.string(),
        dateFrom: z.date(),
        dateTo: z.date(),
        granularity: z
          .enum(["raw", "daily", "weekly", "monthly"])
          .default("raw"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const rows = await getObservationTrend(ctx.db, {
        userId: ctx.userId,
        metricCode: input.metricCode,
        dateFrom: input.dateFrom,
        dateTo: input.dateTo,
      });

      const dataPoints = rows.map((r) => ({
        date: r.observedAt,
        value: r.valueNumeric,
        unit: r.unit,
      }));

      return { dataPoints };
    }),

  getWithProvenance: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const result = await getObservationWithProvenance(ctx.db, {
        observationId: input.id,
        userId: ctx.userId,
      });
      return result ?? null;
    }),

  correct: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        valueNumeric: z.number().optional(),
        valueText: z.string().optional(),
        metricCode: z.string().optional(),
        unit: z.string().optional(),
        correctionNote: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...corrections } = input;

      // Read current row
      const [current] = await ctx.db
        .select()
        .from(observations)
        .where(
          and(eq(observations.id, id), eq(observations.userId, ctx.userId)),
        )
        .limit(1);

      if (!current) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Observation not found",
        });
      }

      await ctx.db
        .update(observations)
        .set({
          ...(corrections.valueNumeric !== undefined && {
            valueNumeric: corrections.valueNumeric,
          }),
          ...(corrections.valueText !== undefined && {
            valueText: corrections.valueText,
          }),
          ...(corrections.metricCode !== undefined && {
            metricCode: corrections.metricCode,
          }),
          ...(corrections.unit !== undefined && { unit: corrections.unit }),
          originalValueNumeric:
            current.originalValueNumeric ?? current.valueNumeric,
          originalValueText: current.originalValueText ?? current.valueText,
          originalUnit: current.originalUnit ?? current.unit,
          correctionNote: corrections.correctionNote,
          status: "corrected",
          updatedAt: new Date(),
        })
        .where(
          and(eq(observations.id, id), eq(observations.userId, ctx.userId)),
        );

      return { success: true };
    }),

  confirm: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .update(observations)
        .set({ status: "confirmed", updatedAt: new Date() })
        .where(
          and(
            eq(observations.id, input.id),
            eq(observations.userId, ctx.userId),
          ),
        )
        .returning({ importJobId: observations.importJobId });

      if (!result.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Observation not found",
        });
      }

      // If all observations for this import job are now confirmed/corrected, mark job completed
      const jobId = result[0]!.importJobId;
      if (jobId) {
        const pending = await ctx.db
          .select({ id: observations.id })
          .from(observations)
          .where(
            and(
              eq(observations.importJobId, jobId),
              eq(observations.userId, ctx.userId),
              eq(observations.status, "extracted"),
            ),
          )
          .limit(1);

        if (pending.length === 0) {
          await ctx.db
            .update(importJobs)
            .set({
              status: "completed",
              needsReview: false,
              completedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(
              and(eq(importJobs.id, jobId), eq(importJobs.userId, ctx.userId)),
            );
        }
      }

      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .delete(observations)
        .where(
          and(
            eq(observations.id, input.id),
            eq(observations.userId, ctx.userId),
          ),
        )
        .returning({
          id: observations.id,
          importJobId: observations.importJobId,
        });

      if (!result.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Observation not found",
        });
      }

      // Update extraction count on import job
      const jobId = result[0]!.importJobId;
      if (jobId) {
        const remaining = await ctx.db
          .select({ id: observations.id })
          .from(observations)
          .where(
            and(
              eq(observations.importJobId, jobId),
              eq(observations.userId, ctx.userId),
            ),
          );

        await ctx.db
          .update(importJobs)
          .set({ extractionCount: remaining.length, updatedAt: new Date() })
          .where(
            and(eq(importJobs.id, jobId), eq(importJobs.userId, ctx.userId)),
          );
      }

      return { success: true };
    }),

  confirmAll: protectedProcedure
    .input(z.object({ importJobId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Batch confirm all extracted observations for this import job
      const result = await ctx.db
        .update(observations)
        .set({ status: "confirmed", updatedAt: new Date() })
        .where(
          and(
            eq(observations.importJobId, input.importJobId),
            eq(observations.userId, ctx.userId),
            eq(observations.status, "extracted"),
          ),
        )
        .returning({ id: observations.id });

      // Mark job completed
      await ctx.db
        .update(importJobs)
        .set({
          status: "completed",
          needsReview: false,
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(importJobs.id, input.importJobId),
            eq(importJobs.userId, ctx.userId),
          ),
        );

      return { confirmed: result.length };
    }),
});
