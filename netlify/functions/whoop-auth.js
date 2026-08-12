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

const PROVIDER = 'whoop';
const STATE_COOKIE = 'whoop_oauth_state';
const REDIRECT_URI = redirectUri('whoop-auth');

const AUTH_URL = 'https://api.prod.whoop.com/oauth/oauth2/auth';
const TOKEN_URL = 'https://api.prod.whoop.com/oauth/oauth2/token';

// WHOOP rejects the whole request if any scope is unavailable to the app,
// so these must match what the WHOOP developer dashboard grants.
const SCOPES = 'read:recovery read:cycles read:workout read:sleep offline';

exports.handler = async (event) => {
  const { code, action, state, error: providerError } = event.queryStringParameters || {};

  // ── Step 1: send the user to WHOOP ──────────────────────────────────
  if (action === 'login') {
    if (!process.env.WHOOP_CLIENT_ID) {
      console.error('[whoop-auth] WHOOP_CLIENT_ID is not configured');
      return redirectWithError(PROVIDER, 'not_configured');
    }

    // Bind the callback to this browser. Without this, an attacker can feed
    // the user a callback URL carrying their own code and silently link the
    // victim's account to the attacker's WHOOP data.
    const oauthState = createState();

    const params = new URLSearchParams({
      client_id: process.env.WHOOP_CLIENT_ID,
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

  // ── Step 2: WHOOP redirects back here ───────────────────────────────
  const expiredCookie = { 'Set-Cookie': clearStateCookie(STATE_COOKIE) };

  // The user denied consent, or WHOOP itself failed.
  if (providerError) {
    console.warn('[whoop-auth] provider returned error:', providerError);
    const code = providerError === 'access_denied' ? 'access_denied' : 'provider_error';
    return redirectWithError(PROVIDER, code, expiredCookie);
  }

  if (code) {
    const expectedState = readCookie(event, STATE_COOKIE);

    if (!expectedState) {
      // Cookie expired, was blocked, or the user took >10 min at the WHOOP screen.
      console.warn('[whoop-auth] no state cookie present on callback');
      return redirectWithError(PROVIDER, 'state_missing', expiredCookie);
    }

    if (!statesMatch(state, expectedState)) {
      console.error('[whoop-auth] state mismatch — possible CSRF attempt');
      return redirectWithError(PROVIDER, 'state_mismatch', expiredCookie);
    }

    try {
      const tokenRes = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: process.env.WHOOP_CLIENT_ID,
          client_secret: process.env.WHOOP_CLIENT_SECRET,
          redirect_uri: REDIRECT_URI
        }),
        signal: AbortSignal.timeout(9000)
      });

      const raw = await tokenRes.text();
      let tokens;
      try {
        tokens = JSON.parse(raw);
      } catch {
        console.error('[whoop-auth] token endpoint returned non-JSON:', tokenRes.status, raw.slice(0, 300));
        return redirectWithError(PROVIDER, 'token_exchange_failed', expiredCookie);
      }

      if (!tokenRes.ok || !tokens.access_token) {
        // Log the real reason — previously every failure collapsed to a bare
        // whoop_error=1 with the cause discarded, which made this unfixable.
        console.error(
          '[whoop-auth] token exchange failed:',
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
          // Absolute expiry so the client can refresh proactively instead of
          // waiting to discover expiry via a 401.
          expires_at: tokens.expires_in ? Date.now() + tokens.expires_in * 1000 : null
        },
        expiredCookie
      );
    } catch (e) {
      const timedOut = e.name === 'TimeoutError' || e.name === 'AbortError';
      console.error('[whoop-auth] token exchange threw:', e.name, e.message);
      return redirectWithError(PROVIDER, timedOut ? 'timeout' : 'token_exchange_failed', expiredCookie);
    }
  }

  return jsonError(400, 'Bad request — expected ?action=login or an OAuth callback');
};
