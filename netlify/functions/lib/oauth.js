// Shared OAuth helpers for the biometric providers (WHOOP, Oura).
//
// Lives in lib/ so Netlify does not publish it as its own function —
// only top-level files in netlify/functions/ become endpoints.

const { randomBytes, timingSafeEqual } = require('node:crypto');

// Where the browser gets sent back to once the OAuth dance is done.
// Overridable per-environment so the redirect target is not hardcoded.
const APP_ORIGIN = process.env.APP_ORIGIN || 'https://thefirmfoundation.app';

// The path that actually serves the app.
//
// This MUST NOT be "/" — netlify.toml rewrites "/" to landing.html, which is a
// static marketing page with no executable JavaScript. Returning there drops
// the OAuth payload on the floor: handleBiometricReturn() never runs, the
// tokens are discarded, and the connection appears to fail for no reason.
// Keep this in sync with the "/app" -> "/index.html" rewrite in netlify.toml.
const APP_PATH = process.env.APP_PATH || '/app';

const STATE_MAX_AGE_SECONDS = 600; // 10 minutes is plenty for a login round-trip

function appOrigin() {
  return APP_ORIGIN;
}

function redirectUri(functionName) {
  return `${APP_ORIGIN}/.netlify/functions/${functionName}`;
}

/** Unguessable value used to bind the callback to the browser that started the flow. */
function createState() {
  return randomBytes(32).toString('hex');
}

function stateCookie(name, value) {
  return `${name}=${value}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${STATE_MAX_AGE_SECONDS}`;
}

function clearStateCookie(name) {
  return `${name}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

function readCookie(event, name) {
  const header = (event.headers && (event.headers.cookie || event.headers.Cookie)) || '';
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) return part.slice(idx + 1).trim();
  }
  return null;
}

/** Constant-time comparison so a mismatch cannot be probed by timing. */
function statesMatch(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Both success and failure come back to the app in the URL *fragment*, never
 * the query string. Fragments are not sent to servers, so tokens stay out of
 * access logs, Referer headers, and upstream proxies. The client reads the
 * fragment and immediately strips it with history.replaceState.
 *
 * Envelope is always: #<uriEncoded JSON> with a `provider` discriminator.
 */
function redirectFragment(payload, extraHeaders) {
  const fragment = encodeURIComponent(JSON.stringify(payload));
  return {
    statusCode: 302,
    headers: { Location: `${APP_ORIGIN}${APP_PATH}#${fragment}`, ...(extraHeaders || {}) },
    body: ''
  };
}

function redirectWithTokens(provider, tokens, extraHeaders) {
  return redirectFragment({ provider, connected: true, ...tokens }, extraHeaders);
}

function redirectWithError(provider, code, extraHeaders) {
  return redirectFragment({ provider, error: code }, extraHeaders);
}

function jsonError(statusCode, message) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'error', message, timestamp: new Date().toISOString() })
  };
}

module.exports = {
  APP_ORIGIN,
  APP_PATH,
  appOrigin,
  redirectUri,
  createState,
  stateCookie,
  clearStateCookie,
  readCookie,
  statesMatch,
  redirectFragment,
  redirectWithTokens,
  redirectWithError,
  jsonError
};
