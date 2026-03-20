import { z } from 'zod';
import { and, eq, desc } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { createRouter, protectedProcedure } from '../init';
import {
  listConnections,
  getConnectionByProvider,
  disconnectProvider,
  observations,
  dataSources,
} from '@openvitals/database';
import { getProvider, syncProvider } from '@/server/integrations';

export const integrationsRouter = createRouter({
  detail: protectedProcedure
    .input(z.object({ provider: z.string() }))
    .query(async ({ ctx, input }) => {
      const connection = await getConnectionByProvider(ctx.db, {
        userId: ctx.userId,
        provider: input.provider,
      });

      // Find the data_source for this integration provider
      const dsRows = await ctx.db
        .select({ id: dataSources.id })
        .from(dataSources)
        .where(
          and(
            eq(dataSources.userId, ctx.userId),
            eq(dataSources.type, 'integration'),
            eq(dataSources.provider!, input.provider),
          ),
        )
        .limit(1);

      const dataSourceId = dsRows[0]?.id ?? null;

      let items: typeof observations.$inferSelect[] = [];
      if (dataSourceId) {
        items = await ctx.db
          .select()
          .from(observations)
          .where(
            and(
              eq(observations.userId, ctx.userId),
              eq(observations.dataSourceId!, dataSourceId),
            ),
          )
          .orderBy(desc(observations.observedAt))
          .limit(200);
      }

      return {
        connection: connection
          ? {
              provider: connection.provider,
              isActive: connection.isActive,
              lastSyncAt: connection.lastSyncAt,
              lastSyncError: connection.lastSyncError,
              createdAt: connection.createdAt,
            }
          : null,
        observations: items,
      };
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const connections = await listConnections(ctx.db, {
      userId: ctx.userId,
    });
    return {
      items: connections
        .filter((c) => c.isActive)
        .map((c) => ({
          provider: c.provider,
          isActive: c.isActive,
          lastSyncAt: c.lastSyncAt,
          lastSyncError: c.lastSyncError,
          createdAt: c.createdAt,
        })),
    };
  }),

  disconnect: protectedProcedure
    .input(z.object({ provider: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await disconnectProvider(ctx.db, {
        userId: ctx.userId,
        provider: input.provider,
      });

      if (!result) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Connection not found',
        });
      }

      return { success: true };
    }),

  sync: protectedProcedure
    .input(z.object({ provider: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const provider = getProvider(input.provider);
      if (!provider) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Unknown provider: ${input.provider}`,
        });
      }

      const connection = await getConnectionByProvider(ctx.db, {
        userId: ctx.userId,
        provider: input.provider,
      });

      if (!connection || !connection.isActive) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No active connection for this provider',
        });
      }

      try {
        const result = await syncProvider(ctx.db, connection, provider);
        return { count: result.count, error: null };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Unknown sync error';
        console.error(`[integrations.sync] ${input.provider}:`, message);
        return { count: 0, error: message };
      }
    }),
});
