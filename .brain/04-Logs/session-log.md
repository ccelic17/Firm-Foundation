# Session Log

Newest first. Append; do not overwrite.

---

## 2026-08-13 — Firm Foundation upgrade pass (faith.tools feedback + audit)

**Repo:** `3-the-firm-foundation` · **Branch:** `claude/firm-foundation-upgrade-j62zbw` · **PR:** [#5](https://github.com/ccelic17/Firm-Foundation/pull/5) (draft)

**BLUF:** Shipped all four faith.tools items, the Oura foundation, a real 7-day trial, and a codebase audit. Two findings were more serious than the reported symptoms: a CDN failure could kill the entire app, and nobody who paid was ever unlocked.

### Scope correction
The brief assumed React Native / Expo / TypeScript and four local reference repos. **None exist** — the app is a single-file Vanilla JS PWA (`index.html`, ~5,600 lines) with zero `.ts`/`.tsx`/`.jsx` files, and the reference repos were unreachable Windows paths. Habitica gamification, `react-native-reusables`, and RevenueCat were dropped as inapplicable; RevenueCat was superseded by fixing the web paywall.

### faith.tools items
| Item | Outcome |
|---|---|
| **WHOOP OAuth** | Added the entirely-missing CSRF `state` (cookie-backed, constant-time compare). Moved tokens from query string → URL fragment; the old code leaked access **and refresh** tokens to server logs, `Referer` headers, and browser history. Widened scopes. Fixed `/sleep` → `/activity/sleep` (wrong path meant sleep hours were always null). |
| **Council guardrail** | `THEOLOGICAL_GUARDRAIL` prepended inside `window.claude.complete` — the one transport all 9 AI call sites use, so it cannot be bypassed. John 14:6 / Acts 4:12 / 1 Tim 2:5, with explicit bans on universalist hedging and punting. |
| **KJV attribution** | Cambridge Crown notice in reader, VOTD, and search results; conditional on the translation actually rendered. |
| **Oura** | `oura-{auth,sync,refresh}.js` mirroring the hardened WHOOP structure, normalised to the same response shape. Gated off pending env vars. |

### Root causes behind the reported symptoms
- **"Connection drops"** was a *display* bug: `state.whoop.error` was written in three places and read in **none**, and the `.whoop-chip.error` CSS was never applied. Every failure was invisible.
- **Council hedging** — prompts were scattered across nine call sites with no shared guardrail.

### Audit — most serious findings
1. **App-killing:** `new Dexie()` ran at the top level of the single script block. A failed CDN load threw during evaluation, leaving *every* function undefined and all 143 inline handlers throwing — a fully rendered but completely dead UI. Now guarded with an in-memory fallback.
2. **Revenue:** `ff_subscribed` was read but **written nowhere**. Both Stripe links were test-mode. Nobody who paid was unlocked and no money was collected.
3. `initDB().then()` had no `.catch()` → silent blank app on Safari private mode.
4. No `window.onerror` / `unhandledrejection` handlers against ~20 floating promises.
5. No timeout on any of 10 `fetch` sites.
6. `state.bodyScore` read by the Body ring but assigned nowhere — showed 0% while the share card showed real recovery.
7. Offline body-score fallback used different maths than the server.
8. Service worker pinned users to their first-installed version forever.

### Also this session
- Restored `#domain-strip` / `#system-bar` mount points — both renderers were complete but had nowhere to draw.
- Built a **real 7-day trial** (`ff_trial_started`, `isInTrial()`, `hasFullAccess()`); paywall copy tracks actual state instead of advertising a trial that didn't exist.
- Generated `assets/icon-192.png`, `icon-512.png`, `favicon.ico` (valid images via `zlib`, no Pillow) and repointed every reference. PWA is now installable.

### Verification
`npm run check` — **38/38**. Functions parse, all inline handlers resolve, and a headless-Chromium suite runs twice: once with Dexie deliberately blocked (proving the degraded path holds) and once normally.

### Commits
- `3f2d782` Harden WHOOP OAuth: CSRF state, fragment tokens, real errors
- `9b0e95a` Add Oura Ring integration foundation (Oura API v2)
- `505545e` Harden the Claude proxy: guard parse, fix timeout, allow larger replies
- `ffc1387` App: theological guardrail, KJV attribution, resilience, entitlement fix
- `e13cc16` Fix PWA caching, drop dead config and stale files, add check suite
- _(+ this session's follow-up commit: mount points, trial, icons, `.brain/`)_

### Open — needs the user
- **Live Stripe links** (placeholders now; `handleSubscribe` refuses to open one). Set post-payment redirect to `…/?payment=success&session_id={CHECKOUT_SESSION_ID}`.
- **Real brand icons** to replace the generated placeholders in `assets/`.
- **SRI hash for Dexie** — unpkg is proxy-blocked so it couldn't be computed; command left in a `TODO(security)` comment.
- **`@anthropic-ai/sdk` pinned `^0.30.0`** — old, unverifiable to bump in-container.
- **`.brain/` is in the wrong place** — written into the Firm Foundation repo because the Windows workspace path is unreachable. Move it to the workspace root and delete it from the repo.
