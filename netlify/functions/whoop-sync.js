exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  let body = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch(e) {
    return {
      statusCode: 400,
      body: JSON.stringify({ status: 'error', message: 'Invalid JSON', timestamp: new Date().toISOString() })
    };
  }

  const { access_token } = body;
  if (!access_token) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        status: 'error',
        message: 'No access_token provided',
        hint: 'Connect WHOOP from Profile → Biometric Sources first',
        received_keys: Object.keys(body),
        timestamp: new Date().toISOString()
      })
    };
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${access_token}`
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const recoveryRes = await fetch(
      'https://api.prod.whoop.com/developer/v1/recovery?limit=1',
      { headers, signal: controller.signal }
    );

    // Surface WHOOP auth failures so the client can trigger a token refresh
    if (recoveryRes.status === 401) {
      clearTimeout(timeout);
      return {
        statusCode: 401,
        body: JSON.stringify({ status: 'error', message: 'WHOOP token expired', timestamp: new Date().toISOString() })
      };
    }

    if (!recoveryRes.ok) {
      clearTimeout(timeout);
      return {
        statusCode: recoveryRes.status,
        body: JSON.stringify({ status: 'error', message: `WHOOP API error: ${recoveryRes.status}`, timestamp: new Date().toISOString() })
      };
    }

    const recoveryData = await recoveryRes.json();
    const latest = recoveryData.records?.[0];

    const sleepRes = await fetch(
      'https://api.prod.whoop.com/developer/v1/sleep?limit=1',
      { headers, signal: controller.signal }
    );
    const sleepData = sleepRes.ok ? await sleepRes.json() : {};
    const latestSleep = sleepData.records?.[0];

    clearTimeout(timeout);

    const score = latest?.score?.recovery_score ?? null;
    const hrv   = latest?.score?.hrv_rmssd_milli ?? null;
    const rhr   = latest?.score?.resting_heart_rate ?? null;
    const sleepHours = latestSleep?.score?.stage_summary?.total_in_bed_time_milli
      ? Math.round(latestSleep.score.stage_summary.total_in_bed_time_milli / 3600000 * 10) / 10
      : null;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        score,
        hrv,
        rhr,
        sleepHours,
        label: score !== null ? (score >= 67 ? 'Green' : score >= 34 ? 'Yellow' : 'Red') : null,
        syncedAt: new Date().toISOString()
      })
    };
  } catch(e) {
    clearTimeout(timeout);
    const isTimeout = e.name === 'AbortError';
    return {
      statusCode: isTimeout ? 504 : 500,
      body: JSON.stringify({
        status: isTimeout ? 'timeout' : 'error',
        message: isTimeout ? 'WHOOP request timed out after 15 seconds' : e.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};
