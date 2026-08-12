const { jsonError } = require('./lib/oauth');

const TOKEN_URL = 'https://api.prod.whoop.com/oauth/oauth2/token';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return jsonError(405, 'Method not allowed');

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return jsonError(400, 'Invalid JSON');
  }

  const { refresh_token } = body;
  if (!refresh_token) return jsonError(400, 'No refresh token');

  try {
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token,
        client_id: process.env.WHOOP_CLIENT_ID,
        client_secret: process.env.WHOOP_CLIENT_SECRET,
        // WHOOP requires the offline scope to be re-requested on refresh,
        // otherwise the response comes back without a new refresh_token.
        scope: 'offline'
      }),
      signal: AbortSignal.timeout(9000)
    });

    const raw = await res.text();
    let tokens;
    try {
      tokens = JSON.parse(raw);
    } catch {
      console.error('[whoop-refresh] non-JSON from WHOOP:', res.status, raw.slice(0, 300));
      return jsonError(502, 'WHOOP returned an unreadable response');
    }

    // Previously this returned 200 with WHOOP's error body attached, so an
    // expired grant looked like a success to the caller.
    if (!res.ok || !tokens.access_token) {
      console.error(
        '[whoop-refresh] refresh failed:',
        res.status,
        tokens.error || '(no error field)',
        tokens.error_description || ''
      );
      const expired = res.status === 400 || res.status === 401;
      return jsonError(expired ? 401 : 502, expired ? 'Refresh token expired' : 'WHOOP refresh failed');
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
        expires_at: tokens.expires_in ? Date.now() + tokens.expires_in * 1000 : null
      })
    };
  } catch (e) {
    const timedOut = e.name === 'TimeoutError' || e.name === 'AbortError';
    console.error('[whoop-refresh] threw:', e.name, e.message);
    return jsonError(timedOut ? 504 : 500, timedOut ? 'WHOOP refresh timed out' : e.message);
  }
};
