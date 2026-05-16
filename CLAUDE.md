# CLAUDE.md — Developer Context for Firm Foundation

## What This Is

Single-file HTML/CSS/JS PWA (`index.html`) deployed on Netlify with serverless functions. No build step. No framework. No bundler. The entire app — all HTML, all CSS (~500 lines), all JS (~4000 lines) — lives in `index.html`.

The landing page is `landing.html`. The app is `index.html`, served at `/app` and `/`.

---

## Repository Structure

```
/
├── index.html                      # Entire app (HTML + CSS + JS)
├── landing.html                    # Marketing landing page
├── netlify.toml                    # Build config and redirects
├── netlify/functions/
│   ├── claude.js                   # Anthropic API proxy
│   ├── config.js                   # Public runtime config (OneSignal App ID, etc.)
│   ├── whoop-auth.js               # WHOOP OAuth redirect + callback
│   ├── whoop-sync.js               # WHOOP data fetch (recovery, sleep, HRV)
│   ├── whoop-refresh.js            # WHOOP token refresh
│   ├── body-score.js               # Body score calculation (sleep/energy/soreness)
│   └── package.json                # @anthropic-ai/sdk dependency
├── PRODUCT.md                      # Product and brand document
└── CLAUDE.md                       # This file
```

---

## Tech Stack

- **Runtime:** Browser-only PWA. No SSR. No build step.
- **Persistence:** Dexie.js (IndexedDB wrapper) with an in-memory write-through cache (`ls`).
- **AI:** Anthropic Claude via `/.netlify/functions/claude` — never call the Anthropic API directly from the frontend.
- **Biometrics:** WHOOP OAuth (direct) or Terra (Garmin/Oura/Fitbit/Google).
- **Push:** OneSignal Web Push SDK v16.
- **Payments:** Stripe payment links.
- **Functions runtime:** Node.js 18+ (native `fetch` available — do not use `node-fetch` or `require('node-fetch')`).

---

## State Management

### The `ls` object
Thin wrapper over Dexie.js (IndexedDB). Every read/write goes through the in-memory `_cache` first, so reads are synchronous. Dexie writes are async and fire-and-forget.

```js
ls.get('ff_streak', 0)      // reads from cache (synchronous)
ls.set('ff_streak', 7)      // writes cache + queues Dexie write
```

All state keys are prefixed `ff_`. The full list is in `persist()` (~line 2181).

### The `state` object
In-memory object initialised from `ls` after Dexie is ready (`initDB()`). All mutations write to `state` first, then call `persist()` which flushes to `ls`.

**Do not bypass `persist()`** — changes to `state` without `persist()` are lost on reload.

### Key `ls` keys beyond `persist()`

| Key | Purpose |
|---|---|
| `ff_opening_cache` | Cached AI greeting text |
| `ff_opening_cache_key` | Cache key: `YYYY-MM-DD-sN` (date + streak) |
| `ff_governor_date` | Date governor message was last generated (skip regen if matches today) |
| `ff_last_hrv` | HRV from last biometric sync |
| `ff_last_resting_hr` | RHR from last biometric sync |
| `ff_last_sleep_hours` | Sleep hours from last biometric sync |
| `ff_covenant` | User's covenant statement text |
| `ff_gender` | `'man'` or `'woman'` (verse pool selection) |
| `ff_pwa_dismissed` | PWA install banner dismissed flag |

---

## AI Calls

All Claude calls go through `window.claude.complete(params)` which POSTs to `/.netlify/functions/claude`.

```js
const text = await window.claude.complete({
  system: '...',
  messages: [{ role: 'user', content: '...' }],
  model: 'claude-haiku-4-5-20251001'   // always use full model ID
});
// returns string directly — NOT an object
```

**Critical:** `window.claude.complete()` returns a plain string. Do not do `reply.content[0].text`.

**Model IDs** (use the full version string, never a short alias):
- `claude-haiku-4-5-20251001` — default for all in-app calls
- `claude-sonnet-4-6` — available for heavier tasks if needed

### Caching policy
- **Opening greeting** — cache by `${date}-s${streak}` in `localStorage`. Already implemented.
- **Governor message** — cache by date in `ff_governor_date`. Already implemented.
- **Prayer prompt, Bible search** — intentionally uncached (user explicitly triggers, expects fresh response).
- **Goal decomposition** — stored in `state.goal90` after first generation.

---

## Netlify Functions

All functions are in `/netlify/functions/`. They run Node.js 18+.

### `claude.js`
Anthropic API proxy. Accepts `{ system, messages, model }`. 25-second timeout via `AbortController`.

**Critical pattern:** `signal` must be the **second argument** to `client.messages.create()`, not inside the params object:
```js
// CORRECT
client.messages.create({ model, max_tokens, system, messages }, { signal })

// WRONG — AbortSignal serialises to {} and causes 400
client.messages.create({ model, max_tokens, system, messages, signal })
```

### `config.js`
Returns public runtime config as JSON. Currently serves `ONESIGNAL_APP_ID`. Use this for any env var that the frontend needs but is not a secret (OneSignal App IDs are public).

### `whoop-auth.js`
Two-step OAuth flow:
1. `?action=login` → 302 redirect to WHOOP authorization page
2. `?code=...` (WHOOP callback) → exchanges code for tokens → 302 redirect back to app with tokens in URL fragment

Redirect URI (hardcoded): `https://thefirmfoundation.app/.netlify/functions/whoop-auth`

### `whoop-sync.js`
POST with `{ access_token }`. Returns `{ score, hrv, rhr, sleepHours, label, syncedAt }`. Returns 401 when WHOOP token is expired (frontend handles refresh + retry).

### `whoop-refresh.js`
POST with `{ refresh_token }`. Returns new token set from WHOOP.

### `body-score.js`
POST with `{ sleep, energy, soreness }` (0–100 each). Returns `{ score, label }`. Weights: sleep 40%, energy 35%, soreness 25%.

---

## WHOOP Sync Flow

```
syncWhoop()
  ├─ if state.whoopTokens?.access_token → syncWHOOP()   // direct OAuth path
  └─ else → syncBiometrics()                             // Terra/generic path

syncWHOOP()
  ├─ POST /whoop-sync with access_token
  ├─ if 401 → refreshWHOOPToken() → retry once (retried flag guards against infinite loop)
  └─ on success → applyScore(score, label) → checkGovernor(score)

checkGovernor(score)
  ├─ if score ≤ 39 AND ff_governor_date !== today → call Claude → cache date
  ├─ if score ≤ 39 AND already cached → renderGovernor() immediately (no API call)
  └─ if score > 39 → clear governor state
```

---

## Screens / Tabs

4 tabs. There is no standalone `s-council` tab — do not add or restore one.

| Tab | id | Screen element |
|---|---|---|
| Today | `today` | `#s-today` |
| Spirit (Covenant) | `spirit` | `#s-spirit` |
| Journal | `journal` | `#s-journal` |
| Profile | `profile` | (profile section) |

**Council** is a sub-pane inside Journal (`#j-counsel`), accessed via the "Counsel" tab within that screen. Council JS (`askTheCouncil`, `renderCouncilHistory`, etc.) runs against that pane.

Tab switching: `switchTab(id, btn)`. Journal sub-tabs: `switchJTab(el)`.

---

## Required Environment Variables

| Variable | Used by | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | `claude.js` | Anthropic API key |
| `ONESIGNAL_APP_ID` | `config.js` | OneSignal Web Push App ID |
| `WHOOP_CLIENT_ID` | `whoop-auth.js`, `whoop-refresh.js` | WHOOP OAuth client ID |
| `WHOOP_CLIENT_SECRET` | `whoop-auth.js`, `whoop-refresh.js` | WHOOP OAuth client secret |

> Terra integration removed — Phase 2.

Stripe payment links are hardcoded in `index.html` (search `buy.stripe.com`). Replace with production links before launch.

---

## Common Pitfalls

1. **`signal` placement in `claude.js`** — must be in the options object (second arg), not the params object (first arg). Already fixed. Do not regress.

2. **`syncWhoop` vs `syncWHOOP`** — two different functions. `syncWhoop()` (lowercase h) is the dispatcher called from the UI. `syncWHOOP()` (uppercase H) is the actual WHOOP OAuth sync. Never call `syncWHOOP()` directly from the UI.

3. **`window.claude.complete()` returns a string** — not `{ content: [...] }`. Using `.content[0].text` on the result will throw.

4. **`ls.get()` is synchronous** — reads from the in-memory cache, not IndexedDB directly. Safe to call anywhere. Only valid after `initDB()` resolves on startup.

5. **`persist()` must be called after every `state` mutation** — state changes are lost on reload otherwise.

6. **Model ID must be the full string** — `'claude-haiku-4-5-20251001'`, not `'claude-haiku-4-5'` or `'haiku'`. Invalid model IDs cause 400 errors.

7. **Node 18+ native fetch** — Netlify functions use Node 18. Do not add `node-fetch` or any fetch polyfill.

8. **Error response shape from functions** — all functions return `{ status: 'error', message: '...', timestamp: '...' }`. Check `data.status === 'error'`, not `data.error`.

