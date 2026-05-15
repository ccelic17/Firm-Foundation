const crypto = require('crypto');

exports.handler = async (event) => {
  const signature = event.headers['terra-signature'];
  const secret    = process.env.TERRA_WEBHOOK_SECRET || '';

  if (secret && signature) {
    const expected = crypto.createHmac('sha256', secret).update(event.body).digest('hex');
    if (signature !== expected) return { statusCode: 401, body: 'Invalid signature' };
  }

  try {
    const payload = JSON.parse(event.body);
    console.log(`Terra webhook: type=${payload.type}, user=${payload.user?.user_id}`);
    return { statusCode: 200, body: 'OK' };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ status: 'error', message: err.message, timestamp: new Date().toISOString() })
    };
  }
};
