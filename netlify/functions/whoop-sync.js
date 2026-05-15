const fetch = require('node-fetch');

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
        hint: 'Connect WHOOP from Profile \u2192 Biometric Sources first',
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
    const recoveryData = await recoveryRes.json();
    const latest = recoveryData.records?.[0];

    const sleepRes = await fetch(
      'https://api.prod.whoop.com/developer/v1/sleep?limit=1',
      { headers, signal: controller.signal }
    );
    const sleepData = await sleepRes.json();
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
        label: score >= 67 ? 'Green' : score >= 34 ? 'Yellow' : 'Red',
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
