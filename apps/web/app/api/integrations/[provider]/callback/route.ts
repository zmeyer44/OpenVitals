import { NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { cookies } from 'next/headers';
import { getDb } from '@openvitals/database/client';
import { upsertConnection } from '@openvitals/database';
import { getProvider, encrypt } from '@/server/integrations';

function verifyState(
  state: string,
): { userId: string; nonce: string } | null {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) return null;

  try {
    const decoded = JSON.parse(
      Buffer.from(state, 'base64url').toString('utf8'),
    ) as { payload: string; sig: string };
    const expectedSig = createHmac('sha256', secret)
      .update(decoded.payload)
      .digest('hex');

    if (expectedSig !== decoded.sig) return null;

    return JSON.parse(decoded.payload) as { userId: string; nonce: string };
  } catch {
    return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider: providerId } = await params;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  if (error) {
    return NextResponse.redirect(
      `${appUrl}/integrations?error=${encodeURIComponent(error)}`,
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${appUrl}/integrations?error=missing_params`,
    );
  }

  // Verify state HMAC matches cookie
  const cookieStore = await cookies();
  const storedState = cookieStore.get('integration_state')?.value;
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(
      `${appUrl}/integrations?error=invalid_state`,
    );
  }

  // Clear the state cookie
  cookieStore.delete('integration_state');

  const stateData = verifyState(state);
  if (!stateData) {
    return NextResponse.redirect(
      `${appUrl}/integrations?error=invalid_state`,
    );
  }

  const provider = getProvider(providerId);
  if (!provider) {
    return NextResponse.redirect(
      `${appUrl}/integrations?error=unknown_provider`,
    );
  }

  const redirectUri = `${appUrl}/api/integrations/${providerId}/callback`;

  try {
    // Exchange code for tokens
    const tokens = await provider.exchangeCode(code, redirectUri);

    // Encrypt tokens before storing
    const accessTokenEnc = encrypt(tokens.accessToken);
    const refreshTokenEnc = tokens.refreshToken
      ? encrypt(tokens.refreshToken)
      : '';

    // Fetch user profile from provider for providerUserId
    let providerUserId = 'unknown';
    try {
      const profileRes = await fetch(
        'https://api.prod.whoop.com/developer/v2/user/profile/basic',
        { headers: { Authorization: `Bearer ${tokens.accessToken}` } },
      );
      if (profileRes.ok) {
        const profile = (await profileRes.json()) as {
          user_id?: number;
          first_name?: string;
          last_name?: string;
        };
        providerUserId = String(profile.user_id ?? 'unknown');
      }
    } catch {
      // Non-critical — proceed with 'unknown'
    }

    const db = getDb();
    await upsertConnection(db, {
      userId: stateData.userId,
      provider: providerId,
      providerUserId,
      accessTokenEnc,
      refreshTokenEnc,
      tokenExpiresAt: tokens.expiresAt,
      scopes: provider.scopes.join(','),
    });

    return NextResponse.redirect(
      `${appUrl}/integrations?connected=${providerId}`,
    );
  } catch (err) {
    console.error(`[integrations/${providerId}/callback] Error:`, err);
    return NextResponse.redirect(
      `${appUrl}/integrations?error=exchange_failed`,
    );
  }
}
