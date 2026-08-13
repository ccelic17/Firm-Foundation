const { jsonError } = require('./lib/oauth');

const API_BASE = 'https://api.ouraring.com/v2/usercollection';
const PER_REQUEST_TIMEOUT_MS = 4000;

// Oura readiness is 0–100 like WHOOP recovery, so the same bands apply and the
// result drops straight into applyScore() on the client.
function labelFor(score) {
  if (score === null) return null;
  return score >= 67 ? 'Green' : score >= 34 ? 'Yellow' : 'Red';
}

/** Oura wants an inclusive ISO date window; a 2-day window covers timezone skew. */
function dateWindow() {
  const end = new Date();
  const start = new Date(end.getTime() - 2 * 86400000);
  const iso = d => d.toISOString().split('T')[0];
  return { start_date: iso(start), end_date: iso(end) };
}

async function getCollection(path, headers) {
  const { start_date, end_date } = dateWindow();
  const url = `${API_BASE}/${path}?${new URLSearchParams({ start_date, end_date })}`;
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(PER_REQUEST_TIMEOUT_MS) });
  if (!res.ok) return { res, latest: null };
  const data = await res.json().catch(() => null);
  // Oura returns oldest-first; the last entry is the most recent day.
  const records = Array.isArray(data?.data) ? data.data : [];
  return { res, latest: records.length ? records[records.length - 1] : null };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return jsonError(405, 'Method not allowed');

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return jsonError(400, 'Invalid JSON');
  }

  const { access_token } = body;
  if (!access_token) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'error',
        message: 'No access_token provided',
        hint: 'Connect Oura from Profile → Biometric Sources first',
        timestamp: new Date().toISOString()
      })
    };
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${access_token}`
  };

  try {
    const { res: readinessRes, latest: readiness } = await getCollection('daily_readiness', headers);

    if (readinessRes.status === 401) {
      return jsonError(401, 'Oura token expired');
    }
    if (!readinessRes.ok) {
      console.error('[oura-sync] readiness request failed:', readinessRes.status);
      return jsonError(readinessRes.status, `Oura API error: ${readinessRes.status}`);
    }

    // Sleep is best-effort — losing it should not sink the whole sync.
    let sleep = null;
    try {
      const { res: sleepRes, latest } = await getCollection('daily_sleep', headers);
      if (sleepRes.ok) sleep = latest;
      else console.warn('[oura-sync] sleep request failed:', sleepRes.status);
    } catch (e) {
      console.warn('[oura-sync] sleep request threw:', e.name, e.message);
    }

    const score = typeof readiness?.score === 'number' ? readiness.score : null;

    // HRV balance and resting HR live in the readiness contributors block.
    const contributors = readiness?.contributors || {};
    const hrv = typeof contributors.hrv_balance === 'number' ? contributors.hrv_balance : null;
    const rhr = typeof contributors.resting_heart_rate === 'number' ? contributors.resting_heart_rate : null;

    const sleepSeconds = sleep?.contributors?.total_sleep ?? null;
    const sleepHours = typeof sleepSeconds === 'number'
      ? Math.round((sleepSeconds / 3600) * 10) / 10
      : null;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        score,
        hrv,
        rhr,
        sleepHours,
        label: labelFor(score),
        syncedAt: new Date().toISOString()
      })
    };
  } catch (e) {
    const timedOut = e.name === 'TimeoutError' || e.name === 'AbortError';
    console.error('[oura-sync] threw:', e.name, e.message);
    return jsonError(timedOut ? 504 : 500, timedOut ? 'Oura request timed out' : e.message);
  }
};
