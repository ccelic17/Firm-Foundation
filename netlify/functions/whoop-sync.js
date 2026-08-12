const { jsonError } = require('./lib/oauth');

const API_BASE = 'https://api.prod.whoop.com/developer/v1';

// Netlify's synchronous functions are capped (10s by default), so each
// upstream call gets its own short budget rather than sharing one controller
// whose timer may already have fired.
const PER_REQUEST_TIMEOUT_MS = 4000;

function labelFor(score) {
  if (score === null) return null;
  return score >= 67 ? 'Green' : score >= 34 ? 'Yellow' : 'Red';
}

async function getJSON(path, headers) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers,
    signal: AbortSignal.timeout(PER_REQUEST_TIMEOUT_MS)
  });
  return { res, data: res.ok ? await res.json().catch(() => null) : null };
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
        hint: 'Connect WHOOP from Profile → Biometric Sources first',
        timestamp: new Date().toISOString()
      })
    };
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${access_token}`
  };

  try {
    const { res: recoveryRes, data: recoveryData } = await getJSON('/recovery?limit=1', headers);

    // Surfaced distinctly so the client knows to refresh rather than disconnect.
    if (recoveryRes.status === 401) {
      return jsonError(401, 'WHOOP token expired');
    }

    if (!recoveryRes.ok) {
      console.error('[whoop-sync] recovery request failed:', recoveryRes.status);
      return jsonError(recoveryRes.status, `WHOOP API error: ${recoveryRes.status}`);
    }

    const latest = recoveryData?.records?.[0];

    // Sleep is best-effort — a failure here should not sink the whole sync.
    let latestSleep = null;
    try {
      const { res: sleepRes, data: sleepData } = await getJSON('/activity/sleep?limit=1', headers);
      if (sleepRes.ok) {
        latestSleep = sleepData?.records?.[0] ?? null;
      } else {
        console.warn('[whoop-sync] sleep request failed:', sleepRes.status);
      }
    } catch (e) {
      console.warn('[whoop-sync] sleep request threw:', e.name, e.message);
    }

    const score = latest?.score?.recovery_score ?? null;
    const hrv = latest?.score?.hrv_rmssd_milli ?? null;
    const rhr = latest?.score?.resting_heart_rate ?? null;

    // Report time actually asleep, not time in bed — in-bed time overstates
    // sleep by however long the user lay awake.
    const stages = latestSleep?.score?.stage_summary;
    let sleepHours = null;
    if (stages?.total_in_bed_time_milli) {
      const asleepMilli = stages.total_in_bed_time_milli - (stages.total_awake_time_milli || 0);
      sleepHours = Math.round((asleepMilli / 3600000) * 10) / 10;
    }

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
    console.error('[whoop-sync] threw:', e.name, e.message);
    return jsonError(timedOut ? 504 : 500, timedOut ? 'WHOOP request timed out' : e.message);
  }
};
