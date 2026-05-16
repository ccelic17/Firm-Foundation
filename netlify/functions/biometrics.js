const TERRA_API_KEY = process.env.TERRA_API_KEY;
const TERRA_DEV_ID  = process.env.TERRA_DEV_ID;
const TERRA_BASE    = 'https://api.tryterra.co/v2';

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const action = event.queryStringParameters?.action || '';

  try {
    if (action === 'connect') {
      const userId = event.queryStringParameters?.user_id || 'ff-user';
      const redirect = event.queryStringParameters?.redirect || '';
      const res = await fetch(`${TERRA_BASE}/auth/generateWidgetSession`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': TERRA_API_KEY,
          'dev-id': TERRA_DEV_ID,
        },
        body: JSON.stringify({
          reference_id: userId,
          providers: 'WHOOP,GARMIN,OURA,FITBIT,GOOGLE',
          language: 'en',
          auth_success_redirect_url: redirect,
        }),
      });
      const data = await res.json();
      return { statusCode: 200, headers, body: JSON.stringify({ url: data.url, session_id: data.session_id }) };
    }

    if (action === 'sync') {
      const terraUserId = event.queryStringParameters?.terra_user_id;
      if (!terraUserId) return { statusCode: 400, headers, body: JSON.stringify({ status: 'error', message: 'terra_user_id required', timestamp: new Date().toISOString() }) };

      const today     = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      const res = await fetch(
        `${TERRA_BASE}/daily?user_id=${terraUserId}&start_date=${yesterday}&end_date=${today}&to_webhook=false`,
        { headers: { 'x-api-key': TERRA_API_KEY, 'dev-id': TERRA_DEV_ID } }
      );
      const data = await res.json();
      const record = data.data?.[0];

      if (!record) return { statusCode: 200, headers, body: JSON.stringify({ value: null, source: 'none' }) };

      const value = normalizeReadiness(record);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          value,
          source: record.metadata?.device_data?.name || 'wearable',
          hrv:         record.heart_rate_data?.hrv?.avg_hrv_rmssd || null,
          resting_hr:  record.heart_rate_data?.resting_heart_rate || null,
          sleep_hours: record.sleep_durations_data?.asleep?.duration_asleep_state_seconds
                         ? Math.round(record.sleep_durations_data.asleep.duration_asleep_state_seconds / 3600 * 10) / 10
                         : null,
          synced_at: new Date().toISOString(),
        }),
      };
    }

    if (action === 'disconnect') {
      const terraUserId = event.queryStringParameters?.terra_user_id;
      if (!terraUserId) return { statusCode: 400, headers, body: JSON.stringify({ status: 'error', message: 'terra_user_id required', timestamp: new Date().toISOString() }) };
      await fetch(`${TERRA_BASE}/auth/deauthenticateUser?user_id=${terraUserId}`, {
        method: 'DELETE',
        headers: { 'x-api-key': TERRA_API_KEY, 'dev-id': TERRA_DEV_ID },
      });
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ status: 'error', message: 'Unknown action', timestamp: new Date().toISOString() }) };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ status: 'error', message: err.message, timestamp: new Date().toISOString() })
    };
  }
};

function normalizeReadiness(record) {
  if (record.recovery_data?.recovery_score != null)   return Math.round(record.recovery_data.recovery_score);
  if (record.readiness_data?.score != null)           return Math.round(record.readiness_data.score);
  if (record.energy_data?.avg_stress_level != null)   return Math.round(Math.max(0, 100 - record.energy_data.avg_stress_level));
  if (record.heart_rate_data?.hrv?.avg_hrv_rmssd != null) {
    const hrv = record.heart_rate_data.hrv.avg_hrv_rmssd;
    return Math.round(Math.min(100, Math.max(0, ((hrv - 20) / 80) * 100)));
  }
  return null;
}
