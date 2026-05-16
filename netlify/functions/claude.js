const Anthropic = require('@anthropic-ai/sdk');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  const { system, messages, model } = JSON.parse(event.body);
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    const response = await client.messages.create(
      {
        model: model || 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system,
        messages,
      },
      { signal: controller.signal }
    );
    clearTimeout(timeout);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: response.content[0].text }),
    };
  } catch (err) {
    clearTimeout(timeout);
    const isTimeout = err.name === 'AbortError';
    return {
      statusCode: isTimeout ? 504 : 500,
      body: JSON.stringify({
        status: isTimeout ? 'timeout' : 'error',
        message: isTimeout ? 'Request timed out after 25 seconds' : err.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};
