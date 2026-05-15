const fetch = require('node-fetch');

exports.handler = async (event) => {
  const { code, action } = event.queryStringParameters || {};

  // Step 1 — Redirect user to WHOOP login
  if (action === 'login') {
    const params = new URLSearchParams({
      client_id: process.env.WHOOP_CLIENT_ID,
      redirect_uri: 'https://thefirmfoundation.app/.netlify/functions/whoop-auth',
      response_type: 'code',
      scope: 'read:recovery read:sleep read:profile offline',
    });
    return {
      statusCode: 302,
      headers: { Location: `https://api.prod.whoop.com/oauth/oauth2/auth?${params}` }
    };
  }

  // Step 2 — Handle callback from WHOOP with auth code
  if (code) {
    try {
      const tokenRes = await fetch('https://api.prod.whoop.com/oauth/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: process.env.WHOOP_CLIENT_ID,
          client_secret: process.env.WHOOP_CLIENT_SECRET,
          redirect_uri: 'https://thefirmfoundation.app/.netlify/functions/whoop-auth',
        })
      });
      const tokens = await tokenRes.json();
      if (!tokens.access_token) throw new Error('No access token returned');

      const fragment = encodeURIComponent(JSON.stringify({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
        connected: true
      }));
      return {
        statusCode: 302,
        headers: { Location: `https://thefirmfoundation.app/?whoop_tokens=${fragment}` }
      };
    } catch(e) {
      return {
        statusCode: 302,
        headers: { Location: `https://thefirmfoundation.app/?whoop_error=1` }
      };
    }
  }

  return {
    statusCode: 400,
    body: JSON.stringify({ status: 'error', message: 'Bad request', timestamp: new Date().toISOString() })
  };
};
