// Restores access on a new device by asking Stripe whether the given email
// has a live subscription.
//
// This exists because restorePurchase() in index.html used to *tell* the user
// "we will match it against your Stripe receipt" and then only write a local
// flag — no email sent, nothing reaching Stripe. A customer who paid and
// reinstalled waited for a message that never came.
//
// Scope note: this makes Restore work. It does NOT make the paywall
// enforceable — the unlock it drives is still a client-side flag. Moving the
// gate server-side is a separate change.

const STRIPE_API = 'https://api.stripe.com/v1';

// Statuses that should still grant access. past_due is deliberate: the card
// failed but Stripe is retrying and the subscription has not been cancelled,
// so locking them out mid-dunning punishes a customer who is still paying.
const ENTITLED = new Set(['active', 'trialing', 'past_due']);

const TIMEOUT_MS = Number(process.env.STRIPE_TIMEOUT_MS || 6000);

function fail(statusCode, message) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'error', message, timestamp: new Date().toISOString() })
  };
}

async function stripeGet(path, key) {
  const res = await fetch(`${STRIPE_API}${path}`, {
    headers: { Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Stripe ${res.status} on ${path}: ${detail.slice(0, 200)}`);
  }
  return res.json();
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    // Configuration gap, not a customer problem — say so plainly rather than
    // reporting "no subscription found" and sending a paying user away.
    console.error('[restore] STRIPE_SECRET_KEY is not set');
    return fail(503, 'Restore is temporarily unavailable. Please contact support.');
  }

  let email;
  try {
    ({ email } = JSON.parse(event.body));
  } catch {
    return fail(400, 'Invalid JSON');
  }

  if (typeof email !== 'string' || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
    return fail(400, 'A valid email address is required');
  }
  email = email.trim().toLowerCase();

  try {
    const customers = await stripeGet(
      `/customers?email=${encodeURIComponent(email)}&limit=10`, key
    );

    // One person can hold several customer records — a second checkout with a
    // different card makes another. Check every one before giving up.
    for (const customer of customers.data || []) {
      const subs = await stripeGet(
        `/subscriptions?customer=${encodeURIComponent(customer.id)}&status=all&limit=20`, key
      );
      const live = (subs.data || []).find(s => ENTITLED.has(s.status));
      if (live) {
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscribed: true,
            status: live.status,
            currentPeriodEnd: live.current_period_end || null
          })
        };
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscribed: false })
    };
  } catch (err) {
    console.error('[restore] lookup failed:', err.message);
    return fail(502, 'Could not reach Stripe. Please try again shortly.');
  }
};
