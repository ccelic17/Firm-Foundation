const Anthropic = require('@anthropic-ai/sdk');

const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';
const DEFAULT_MAX_TOKENS = 1024;
const MAX_TOKENS_CEILING = 4096;

// Must stay under the Netlify synchronous-function limit (10s by default),
// otherwise the platform kills the invocation before our own abort can fire
// and the caller gets an opaque 502 instead of a clean timeout.
// Raise this only if the function timeout is raised in Netlify too.
const TIMEOUT_MS = Number(process.env.CLAUDE_TIMEOUT_MS || 9000);

function errorResponse(statusCode, status, message) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, message, timestamp: new Date().toISOString() })
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return errorResponse(405, 'error', 'Method Not Allowed');
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('[claude] ANTHROPIC_API_KEY is not configured');
    return errorResponse(500, 'error', 'AI is not configured');
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    // Previously this threw out of the handler, so a malformed body produced a
    // raw 502 whose HTML body then broke res.json() on the client.
    return errorResponse(400, 'error', 'Invalid JSON');
  }

  const { system, messages, model, max_tokens } = payload;

  if (!Array.isArray(messages) || messages.length === 0) {
    return errorResponse(400, 'error', 'messages must be a non-empty array');
  }

  // Callers that ask for a large structured response (the 90-day goal
  // decomposition returns 12 milestones as JSON) need more than the old
  // hardcoded 1024, or the reply truncates and JSON.parse fails silently.
  const maxTokens = Math.min(
    Math.max(Number(max_tokens) || DEFAULT_MAX_TOKENS, 256),
    MAX_TOKENS_CEILING
  );

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    // `signal` belongs in the options object (second argument). Putting it in
    // the params object serialises it to {} and the API rejects the request.
    const response = await client.messages.create(
      {
        model: model || DEFAULT_MODEL,
        max_tokens: maxTokens,
        system,
        messages
      },
      { signal: controller.signal }
    );

    const text = response?.content?.[0]?.text;
    if (typeof text !== 'string') {
      console.error('[claude] unexpected response shape:', JSON.stringify(response?.content)?.slice(0, 300));
      return errorResponse(502, 'error', 'AI returned an unexpected response');
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text, stop_reason: response.stop_reason })
    };
  } catch (err) {
    const isTimeout = err.name === 'AbortError' || err.name === 'TimeoutError';
    console.error('[claude] request failed:', err.name, err.message);
    return errorResponse(
      isTimeout ? 504 : 500,
      isTimeout ? 'timeout' : 'error',
      isTimeout ? `Request timed out after ${Math.round(TIMEOUT_MS / 1000)} seconds` : err.message
    );
  } finally {
    clearTimeout(timeout);
  }
};
