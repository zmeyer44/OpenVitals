import { registerProvider } from '../registry';
import type {
  IntegrationProvider,
  TokenSet,
  SyncResult,
  NormalizedObservation,
  WebhookEvent,
} from '../types';

const AUTH_URL = 'https://api.prod.whoop.com/oauth/oauth2/auth';
const TOKEN_URL = 'https://api.prod.whoop.com/oauth/oauth2/token';
const API_BASE = 'https://api.prod.whoop.com/developer/v2';

const SCOPES = [
  'read:recovery',
  'read:cycles',
  'read:sleep',
  'read:workout',
  'read:profile',
  'read:body_measurement',
];

function getClientId(): string {
  const id = process.env.WHOOP_CLIENT_ID;
  if (!id) throw new Error('WHOOP_CLIENT_ID is not set');
  return id;
}

function getClientSecret(): string {
  const secret = process.env.WHOOP_CLIENT_SECRET;
  if (!secret) throw new Error('WHOOP_CLIENT_SECRET is not set');
  return secret;
}

async function apiRequest(
  url: string,
  accessToken: string,
): Promise<unknown> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(
      `Whoop API error: ${res.status} ${res.statusText}${body ? ` — ${body}` : ''}`,
    );
  }
  return res.json();
}

interface WhoopPaginatedResponse {
  records: unknown[];
  next_token?: string | null;
}

async function fetchAllPages(
  endpoint: string,
  accessToken: string,
  params: URLSearchParams,
): Promise<unknown[]> {
  const allRecords: unknown[] = [];
  let nextToken: string | null = null;

  do {
    const p = new URLSearchParams(params);
    if (nextToken) p.set('nextToken', nextToken);

    const url = `${API_BASE}${endpoint}?${p.toString()}`;
    const data = (await apiRequest(url, accessToken)) as WhoopPaginatedResponse;

    if (data.records) {
      allRecords.push(...data.records);
    }
    nextToken = data.next_token ?? null;
  } while (nextToken);

  return allRecords;
}

const whoopProvider: IntegrationProvider = {
  id: 'whoop',
  name: 'Whoop',
  scopes: SCOPES,

  buildAuthUrl(state: string, redirectUri: string): string {
    const params = new URLSearchParams({
      client_id: getClientId(),
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: SCOPES.join(' '),
      state,
    });
    return `${AUTH_URL}?${params.toString()}`;
  },

  async exchangeCode(code: string, redirectUri: string): Promise<TokenSet> {
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: getClientId(),
        client_secret: getClientSecret(),
        scope: SCOPES.join(' '),
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Token exchange failed: ${res.status} ${text}`);
    }

    const data = await res.json() as Record<string, unknown>;
    console.log(
      `[whoop] token exchange response keys: ${Object.keys(data).join(', ')}`,
    );

    const accessToken = (data.access_token ?? data.accessToken) as string | undefined;
    const refreshToken = (data.refresh_token ?? data.refreshToken ?? '') as string;
    const expiresIn = (data.expires_in ?? data.expiresIn ?? 3600) as number;

    if (!accessToken) {
      throw new Error(
        `Token exchange returned no access_token. Keys: ${Object.keys(data).join(', ')}`,
      );
    }

    return {
      accessToken,
      refreshToken,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
    };
  },

  async refreshTokens(refreshToken: string): Promise<TokenSet> {
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: getClientId(),
        client_secret: getClientSecret(),
        scope: SCOPES.join(' '),
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Token refresh failed: ${res.status} ${text}`);
    }

    const data = await res.json() as Record<string, unknown>;

    const accessToken = (data.access_token ?? data.accessToken) as string | undefined;
    const newRefreshToken = (data.refresh_token ?? data.refreshToken ?? '') as string;
    const expiresIn = (data.expires_in ?? data.expiresIn ?? 3600) as number;

    if (!accessToken) {
      throw new Error(
        `Token refresh returned no access_token. Keys: ${Object.keys(data).join(', ')}`,
      );
    }

    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
    };
  },

  parseWebhookEvent(body: unknown): WebhookEvent | null {
    const event = body as {
      user_id?: number;
      id?: number;
      type?: string;
    };
    if (!event.user_id || !event.id || !event.type) return null;

    // Only process events we care about
    const supportedTypes = [
      'recovery.created', 'recovery.updated',
      'cycle.created', 'cycle.updated',
      'sleep.created', 'sleep.updated',
      'workout.created', 'workout.updated',
    ];
    if (!supportedTypes.includes(event.type)) return null;

    return {
      providerUserId: String(event.user_id),
      type: event.type,
      resourceId: String(event.id),
    };
  },

  async fetchWebhookRecord(
    accessToken: string,
    event: WebhookEvent,
  ): Promise<NormalizedObservation[]> {
    const [resourceType] = event.type.split('.');
    const observations: NormalizedObservation[] = [];

    if (resourceType === 'recovery') {
      // Recovery is fetched by cycle ID
      const rec = (await apiRequest(
        `${API_BASE}/cycle/${event.resourceId}/recovery`,
        accessToken,
      )) as {
        created_at?: string;
        score?: {
          recovery_score?: number;
          hrv_rmssd_milli?: number;
          resting_heart_rate?: number;
          spo2_percentage?: number;
        };
      };

      const date = rec.created_at ? new Date(rec.created_at) : null;
      if (date && rec.score) {
        if (rec.score.recovery_score != null)
          observations.push({ metricCode: 'recovery_score', category: 'wearable', valueNumeric: rec.score.recovery_score, valueText: null, unit: '%', observedAt: date, metadataJson: { source: 'whoop', webhook: true } });
        if (rec.score.hrv_rmssd_milli != null)
          observations.push({ metricCode: 'hrv_rmssd', category: 'wearable', valueNumeric: rec.score.hrv_rmssd_milli, valueText: null, unit: 'ms', observedAt: date, metadataJson: { source: 'whoop', webhook: true } });
        if (rec.score.resting_heart_rate != null)
          observations.push({ metricCode: 'resting_heart_rate', category: 'vital_sign', valueNumeric: rec.score.resting_heart_rate, valueText: null, unit: 'bpm', observedAt: date, metadataJson: { source: 'whoop', webhook: true } });
        if (rec.score.spo2_percentage != null)
          observations.push({ metricCode: 'spo2', category: 'vital_sign', valueNumeric: rec.score.spo2_percentage, valueText: null, unit: '%', observedAt: date, metadataJson: { source: 'whoop', webhook: true } });
      }
    } else if (resourceType === 'cycle') {
      const cycle = (await apiRequest(
        `${API_BASE}/cycle/${event.resourceId}`,
        accessToken,
      )) as {
        created_at?: string;
        score?: { strain?: number };
      };

      const date = cycle.created_at ? new Date(cycle.created_at) : null;
      if (date && cycle.score?.strain != null)
        observations.push({ metricCode: 'strain_score', category: 'wearable', valueNumeric: cycle.score.strain, valueText: null, unit: null, observedAt: date, metadataJson: { source: 'whoop', webhook: true } });
    } else if (resourceType === 'sleep') {
      const sleep = (await apiRequest(
        `${API_BASE}/activity/sleep/${event.resourceId}`,
        accessToken,
      )) as {
        created_at?: string;
        score?: {
          stage_summary?: {
            total_slow_wave_sleep_time_milli?: number;
            total_rem_sleep_time_milli?: number;
            total_light_sleep_time_milli?: number;
          };
          respiratory_rate?: number;
        };
      };

      const date = sleep.created_at ? new Date(sleep.created_at) : null;
      if (date && sleep.score) {
        const summary = sleep.score.stage_summary;
        if (summary) {
          const totalMs = (summary.total_slow_wave_sleep_time_milli ?? 0) + (summary.total_rem_sleep_time_milli ?? 0) + (summary.total_light_sleep_time_milli ?? 0);
          if (totalMs > 0)
            observations.push({ metricCode: 'sleep_duration', category: 'wearable', valueNumeric: Math.round(totalMs / 60000), valueText: null, unit: 'min', observedAt: date, metadataJson: { source: 'whoop', webhook: true } });
        }
        if (sleep.score.respiratory_rate != null)
          observations.push({ metricCode: 'respiratory_rate', category: 'vital_sign', valueNumeric: sleep.score.respiratory_rate, valueText: null, unit: 'breaths/min', observedAt: date, metadataJson: { source: 'whoop', webhook: true } });
      }
    } else if (resourceType === 'workout') {
      const workout = (await apiRequest(
        `${API_BASE}/activity/workout/${event.resourceId}`,
        accessToken,
      )) as {
        created_at?: string;
        score?: { strain?: number };
      };

      const date = workout.created_at ? new Date(workout.created_at) : null;
      if (date && workout.score?.strain != null)
        observations.push({ metricCode: 'strain_score', category: 'wearable', valueNumeric: workout.score.strain, valueText: null, unit: null, observedAt: date, metadataJson: { source: 'whoop', webhook: true, workoutId: event.resourceId } });
    }

    return observations;
  },

  async fetchData(
    accessToken: string,
    cursor: string | null,
  ): Promise<SyncResult> {
    // Cursor is an ISO date; default to 30 days ago on first sync
    const startDate =
      cursor ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const params = new URLSearchParams({ start: startDate });

    const observations: NormalizedObservation[] = [];

    // Fetch recovery data → recovery_score, hrv_rmssd, resting_heart_rate, spo2
    const recoveries = (await fetchAllPages(
      '/recovery',
      accessToken,
      params,
    )) as Array<{
      created_at?: string;
      score?: {
        recovery_score?: number;
        hrv_rmssd_milli?: number;
        resting_heart_rate?: number;
        spo2_percentage?: number;
      };
    }>;

    for (const rec of recoveries) {
      const date = rec.created_at ? new Date(rec.created_at) : null;
      if (!date || !rec.score) continue;

      if (rec.score.recovery_score != null) {
        observations.push({
          metricCode: 'recovery_score',
          category: 'wearable',
          valueNumeric: rec.score.recovery_score,
          valueText: null,
          unit: '%',
          observedAt: date,
          metadataJson: { source: 'whoop' },
        });
      }

      if (rec.score.hrv_rmssd_milli != null) {
        observations.push({
          metricCode: 'hrv_rmssd',
          category: 'wearable',
          valueNumeric: rec.score.hrv_rmssd_milli,
          valueText: null,
          unit: 'ms',
          observedAt: date,
          metadataJson: { source: 'whoop' },
        });
      }

      if (rec.score.resting_heart_rate != null) {
        observations.push({
          metricCode: 'resting_heart_rate',
          category: 'vital_sign',
          valueNumeric: rec.score.resting_heart_rate,
          valueText: null,
          unit: 'bpm',
          observedAt: date,
          metadataJson: { source: 'whoop' },
        });
      }

      if (rec.score.spo2_percentage != null) {
        observations.push({
          metricCode: 'spo2',
          category: 'vital_sign',
          valueNumeric: rec.score.spo2_percentage,
          valueText: null,
          unit: '%',
          observedAt: date,
          metadataJson: { source: 'whoop' },
        });
      }
    }

    // Fetch cycle data → strain_score
    const cycles = (await fetchAllPages(
      '/cycle',
      accessToken,
      params,
    )) as Array<{
      created_at?: string;
      score?: {
        strain?: number;
      };
    }>;

    for (const cycle of cycles) {
      const date = cycle.created_at ? new Date(cycle.created_at) : null;
      if (!date || !cycle.score?.strain) continue;

      observations.push({
        metricCode: 'strain_score',
        category: 'wearable',
        valueNumeric: cycle.score.strain,
        valueText: null,
        unit: null,
        observedAt: date,
        metadataJson: { source: 'whoop' },
      });
    }

    // Fetch sleep data → sleep_duration, respiratory_rate
    const sleeps = (await fetchAllPages(
      '/activity/sleep',
      accessToken,
      params,
    )) as Array<{
      created_at?: string;
      score?: {
        stage_summary?: {
          total_in_bed_time_milli?: number;
          total_slow_wave_sleep_time_milli?: number;
          total_rem_sleep_time_milli?: number;
          total_light_sleep_time_milli?: number;
        };
        respiratory_rate?: number;
      };
    }>;

    for (const sleep of sleeps) {
      const date = sleep.created_at ? new Date(sleep.created_at) : null;
      if (!date || !sleep.score) continue;

      // Total sleep = SWS + REM + light sleep (in minutes)
      const summary = sleep.score.stage_summary;
      if (summary) {
        const totalMs =
          (summary.total_slow_wave_sleep_time_milli ?? 0) +
          (summary.total_rem_sleep_time_milli ?? 0) +
          (summary.total_light_sleep_time_milli ?? 0);
        if (totalMs > 0) {
          observations.push({
            metricCode: 'sleep_duration',
            category: 'wearable',
            valueNumeric: Math.round(totalMs / 60000),
            valueText: null,
            unit: 'min',
            observedAt: date,
            metadataJson: { source: 'whoop' },
          });
        }
      }

      if (sleep.score.respiratory_rate != null) {
        observations.push({
          metricCode: 'respiratory_rate',
          category: 'vital_sign',
          valueNumeric: sleep.score.respiratory_rate,
          valueText: null,
          unit: 'breaths/min',
          observedAt: date,
          metadataJson: { source: 'whoop' },
        });
      }
    }

    // New cursor = current time
    const newCursor = new Date().toISOString();

    return { observations, newCursor };
  },
};

// Auto-register on import
registerProvider(whoopProvider);

export default whoopProvider;
