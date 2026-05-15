const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };
  const { refresh_token } = JSON.parse(event.body || '{}');
  if (!refresh_token) {
    return {
      statusCode: 400,
      body: JSON.stringify({ status: 'error', message: 'No refresh token', timestamp: new Date().toISOString() })
    };
  }

  try {
    const res = await fetch('https://api.prod.whoop.com/oauth/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token,
        client_id: process.env.WHOOP_CLIENT_ID,
        client_secret: process.env.WHOOP_CLIENT_SECRET,
      })
    });
    const tokens = await res.json();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tokens)
    };
  } catch(e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ status: 'error', message: e.message, timestamp: new Date().toISOString() })
    };
  }
};
