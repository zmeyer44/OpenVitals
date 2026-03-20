import { and, eq } from 'drizzle-orm';
import { observations } from '@openvitals/database';
import {
  updateConnectionTokens,
  updateSyncStatus,
  ensureDataSource,
} from '@openvitals/database';
import type { Database } from '@openvitals/database';
import type { IntegrationProvider } from './types';
import { encrypt, decrypt } from './encryption';

interface ConnectionRow {
  id: string;
  userId: string;
  accessTokenEnc: string | null;
  refreshTokenEnc: string | null;
  tokenExpiresAt: Date | null;
  lastSyncCursor: string | null;
}

export async function syncProvider(
  db: Database,
  connection: ConnectionRow,
  provider: IntegrationProvider,
): Promise<{ count: number }> {
  if (!connection.accessTokenEnc) {
    throw new Error('Connection has no access token');
  }

  let accessToken = decrypt(connection.accessTokenEnc);
  let refreshToken = connection.refreshTokenEnc
    ? decrypt(connection.refreshTokenEnc)
    : null;

  const hasRefreshToken = !!refreshToken;
  const tokenExpiresAt = connection.tokenExpiresAt;
  console.log(
    `[sync] ${provider.id}: hasRefreshToken=${hasRefreshToken}, tokenExpiresAt=${tokenExpiresAt?.toISOString() ?? 'null'}`,
  );

  // Refresh tokens if expired (with 5-minute buffer) and refresh token available
  const now = new Date();
  const buffer = 5 * 60 * 1000;
  const needsRefresh =
    refreshToken &&
    tokenExpiresAt &&
    tokenExpiresAt.getTime() - buffer < now.getTime();

  if (needsRefresh && refreshToken) {
    console.log(`[sync] ${provider.id}: proactive token refresh (expired or expiring soon)`);
    const newTokens = await provider.refreshTokens(refreshToken);
    const encAccess = encrypt(newTokens.accessToken);
    const encRefresh = newTokens.refreshToken
      ? encrypt(newTokens.refreshToken)
      : connection.refreshTokenEnc;

    await updateConnectionTokens(db, {
      id: connection.id,
      accessTokenEnc: encAccess,
      refreshTokenEnc: encRefresh!,
      tokenExpiresAt: newTokens.expiresAt,
    });

    accessToken = newTokens.accessToken;
    if (newTokens.refreshToken) {
      refreshToken = newTokens.refreshToken;
    }
  }

  // Fetch data with 401 retry
  let result;
  try {
    result = await provider.fetchData(accessToken, connection.lastSyncCursor);
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('401') && refreshToken) {
      console.log(`[sync] ${provider.id}: 401 received, attempting token refresh and retry`);
      // Try refreshing and retrying once
      const newTokens = await provider.refreshTokens(refreshToken);
      const encAccess = encrypt(newTokens.accessToken);
      const encRefresh = newTokens.refreshToken
        ? encrypt(newTokens.refreshToken)
        : connection.refreshTokenEnc;

      await updateConnectionTokens(db, {
        id: connection.id,
        accessTokenEnc: encAccess,
        refreshTokenEnc: encRefresh!,
        tokenExpiresAt: newTokens.expiresAt,
      });

      result = await provider.fetchData(
        newTokens.accessToken,
        connection.lastSyncCursor,
      );
    } else {
      if (err instanceof Error && err.message.includes('401') && !refreshToken) {
        console.error(`[sync] ${provider.id}: 401 received but no refresh token available — cannot retry`);
      }
      throw err;
    }
  }

  // Ensure data source exists for provenance
  const dataSourceId = await ensureDataSource(db, {
    userId: connection.userId,
    provider: provider.id,
  });

  // Insert observations, skipping duplicates
  let insertedCount = 0;
  for (const obs of result.observations) {
    // Check for existing observation with same user+metric+time+source
    const existing = await db
      .select({ id: observations.id })
      .from(observations)
      .where(
        and(
          eq(observations.userId, connection.userId),
          eq(observations.metricCode, obs.metricCode),
          eq(observations.observedAt, obs.observedAt),
          eq(observations.dataSourceId, dataSourceId),
        ),
      )
      .limit(1);

    if (existing.length === 0) {
      await db.insert(observations).values({
        userId: connection.userId,
        metricCode: obs.metricCode,
        category: obs.category,
        valueNumeric: obs.valueNumeric,
        valueText: obs.valueText,
        unit: obs.unit,
        observedAt: obs.observedAt,
        dataSourceId,
        status: 'extracted',
        confidenceScore: 1.0,
        metadataJson: obs.metadataJson ?? null,
      });
      insertedCount++;
    }
  }

  // Update sync status
  await updateSyncStatus(db, {
    id: connection.id,
    lastSyncAt: new Date(),
    lastSyncCursor: result.newCursor,
    lastSyncError: null,
  });

  return { count: insertedCount };
}
