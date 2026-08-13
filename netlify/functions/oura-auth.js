const {
  redirectUri,
  createState,
  stateCookie,
  clearStateCookie,
  readCookie,
  statesMatch,
  redirectWithTokens,
  redirectWithError,
  jsonError
} = require('./lib/oauth');

const PROVIDER = 'oura';
const STATE_COOKIE = 'oura_oauth_state';
const REDIRECT_URI = redirectUri('oura-auth');

// Oura API v2 OAuth endpoints.
const AUTH_URL = 'https://cloud.ouraring.com/oauth/authorize';
const TOKEN_URL = 'https://api.ouraring.com/oauth/token';

// daily_readiness covers the readiness score; daily_sleep the sleep summary;
// heartrate backs the HRV/resting-HR figures the app displays.
const SCOPES = 'daily heartrate workout personal';

exports.handler = async (event) => {
  const { code, action, state, error: providerError } = event.queryStringParameters || {};

  // ── Step 1: send the user to Oura ───────────────────────────────────
  if (action === 'login') {
    if (!process.env.OURA_CLIENT_ID) {
      console.error('[oura-auth] OURA_CLIENT_ID is not configured');
      return redirectWithError(PROVIDER, 'not_configured');
    }

    const oauthState = createState();

    const params = new URLSearchParams({
      client_id: process.env.OURA_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: SCOPES,
      state: oauthState
    });

    return {
      statusCode: 302,
      headers: {
        Location: `${AUTH_URL}?${params.toString()}`,
        'Set-Cookie': stateCookie(STATE_COOKIE, oauthState),
        'Cache-Control': 'no-store'
      },
      body: ''
    };
  }

  // ── Step 2: Oura redirects back here ────────────────────────────────
  const expiredCookie = { 'Set-Cookie': clearStateCookie(STATE_COOKIE) };

  if (providerError) {
    console.warn('[oura-auth] provider returned error:', providerError);
    const code = providerError === 'access_denied' ? 'access_denied' : 'provider_error';
    return redirectWithError(PROVIDER, code, expiredCookie);
  }

  if (code) {
    const expectedState = readCookie(event, STATE_COOKIE);

    if (!expectedState) {
      console.warn('[oura-auth] no state cookie present on callback');
      return redirectWithError(PROVIDER, 'state_missing', expiredCookie);
    }

    if (!statesMatch(state, expectedState)) {
      console.error('[oura-auth] state mismatch — possible CSRF attempt');
      return redirectWithError(PROVIDER, 'state_mismatch', expiredCookie);
    }

    try {
      const tokenRes = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: process.env.OURA_CLIENT_ID,
          client_secret: process.env.OURA_CLIENT_SECRET,
          redirect_uri: REDIRECT_URI
        }),
        signal: AbortSignal.timeout(9000)
      });

      const raw = await tokenRes.text();
      let tokens;
      try {
        tokens = JSON.parse(raw);
      } catch {
        console.error('[oura-auth] token endpoint returned non-JSON:', tokenRes.status, raw.slice(0, 300));
        return redirectWithError(PROVIDER, 'token_exchange_failed', expiredCookie);
      }

      if (!tokenRes.ok || !tokens.access_token) {
        console.error(
          '[oura-auth] token exchange failed:',
          tokenRes.status,
          tokens.error || '(no error field)',
          tokens.error_description || ''
        );
        return redirectWithError(PROVIDER, 'token_exchange_failed', expiredCookie);
      }

      return redirectWithTokens(
        PROVIDER,
        {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_in: tokens.expires_in,
          expires_at: tokens.expires_in ? Date.now() + tokens.expires_in * 1000 : null
        },
        expiredCookie
      );
    } catch (e) {
      const timedOut = e.name === 'TimeoutError' || e.name === 'AbortError';
      console.error('[oura-auth] token exchange threw:', e.name, e.message);
      return redirectWithError(PROVIDER, timedOut ? 'timeout' : 'token_exchange_failed', expiredCookie);
    }
  }

  return jsonError(400, 'Bad request — expected ?action=login or an OAuth callback');
};
