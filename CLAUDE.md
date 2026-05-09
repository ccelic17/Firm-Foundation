# Firm Foundation — CLAUDE.md

## Project Overview

**Firm Foundation** ("Don't Drift") is a personal discipleship and performance-tracking web app. It helps users maintain daily disciplines across three pillars: **Spirit**, **Body**, and **Mind**. The app is delivered as a self-contained single HTML file with no build toolchain, no dependencies, and no server.

**Tagline**: "Don't Drift" — a daily check-in system to stay on track with spiritual and physical goals.

---

## Repository Structure

```
Firm-Foundation/
├── Firm Foundation.html          # Main app — full source (~2470 lines)
└── Firm Foundation (standalone).html  # Bundled/portable version (~186 lines)
```

There is no `package.json`, `node_modules`, build config, or test suite. This is intentional — the project is a prototype/MVP living in a single file.

---

## Architecture

### Single-File App

`Firm Foundation.html` is one self-contained file containing:
- All HTML markup
- All CSS (embedded `<style>`)
- All JavaScript (embedded `<script>`)
- External font loads (Google Fonts — Barlow Condensed, DM Sans)

The app renders as a 390×844 iPhone mockup in the browser, simulating a native mobile UI.

### Standalone Bundler Format

`Firm Foundation (standalone).html` is a portable export produced by a separate bundler. It contains:
- `<script type="__bundler/manifest">` — Base64+gzip asset manifest
- `<script type="__bundler/template">` — The HTML template string
- A JS unpacker that decompresses assets via `DecompressionStream`, creates Blob URLs, and replaces the page with the real app

When modifying the app, **only edit `Firm Foundation.html`**. The standalone file is a generated artifact.

---

## App Screens (Tabs)

Four tabs, each mapping to a `<div class="screen" id="s-*">`:

| Tab | Screen ID | Label |
|-----|-----------|-------|
| Today | `s-today` | 01 Today |
| Spirit | `s-spirit` | 02 Spirit |
| Journal | `s-journal` | 03 Journal |
| Profile | `s-profile` | 04 Profile |

### Today (`s-today`)
- **Three-Ring Dashboard**: Animated SVG rings for Body (green/WHOOP), Spirit (gold), Mind (blue)
- **Priorities**: CRUD list of daily top priorities with checkboxes
- **Non-Negotiables**: CRUD list of daily commitments (e.g., "Word & Prayer", "Train or Move")
- **Health Strip**: Recovery/Body Battery stats from connected biometric source
- **90-Day Goal Card**: AI-generated performance plan with phases, weekly milestones, daily actions
- **Scripture Alert**: Context-sensitive Bible verse overlay when a ring score is low
- **Sabbath Mode**: Offered when Spirit/Body/Mind have been low for 3+ days

### Spirit (`s-spirit`)
- **Streak Display**: Current consecutive check-in streak
- **Word for the Week**: Weekly scripture focus
- **Verse of the Day (VOTD)**: Daily verse with heart-save action
- **Prayer Arc**: Circular progress showing minutes prayed today vs. goal
- **AI Prayer Prompt**: `getAIPrayerPrompt()` — generates a contextual prayer prompt via `window.claude`
- **Spiritual Disciplines**: CRUD toggles (Scripture reading, fasting, tithing, etc.)
- **Saved Verse Library**: User verse collection + AI verse search (`aiVerseSearch()`)

### Journal (`s-journal`)
- **Prayer Journal**: Two sub-tabs — Active Prayers / Answered Prayers
- **Timeline**: Chronological prayer log with expand/collapse
- **Add Prayer**: Freeform prayer entry
- **Mark Answered**: Records answered prayer with reflection text

### Profile (`s-profile`)
- **User Profile**: Name, member-since date
- **WHOOP Banner**: Connection status, sync button
- **Biometric Sources**: Toggle between WHOOP, Garmin, Apple Health
- **Settings**: Prayer goal duration, sabbath controls

---

## State Management

All application state lives in a single global `let state = { ... }` object, initialized from `localStorage` with fallback defaults.

### Persistence

```js
// Read helper (with default)
ls.get('ff_streak', 47)

// Write helper
ls.set('ff_streak', state.streak)

// Flush entire state to localStorage
persist()
```

**Always call `persist()` after mutating state.**

### localStorage Keys

All keys use the `ff_` prefix:

| Key | Type | Description |
|-----|------|-------------|
| `ff_streak` | number | Consecutive check-in streak |
| `ff_last_checkin` | string\|null | ISO date of last check-in |
| `ff_priorities_v2` | array | Today's priority items `{id, text, done}` |
| `ff_nonneg_v2` | array | Non-negotiable items `{id, text, done}` |
| `ff_disciplines_v2` | array | Spiritual discipline toggles `{id, title, sub, on}` |
| `ff_verses_v2` | array | Saved verse library `{id, ref, text}` |
| `ff_prayers` | array | Prayer journal entries `{id, date, dateMs, text, status, ...}` |
| `ff_prayer_min` | number | Minutes prayed today |
| `ff_prayer_goal` | number | Daily prayer goal in minutes |
| `ff_whoop` | object | WHOOP connection state (legacy compat) |
| `ff_sources` | array | Biometric sources `{id, name, metric, connected, value, lastSync}` |
| `ff_goal90` | object\|null | 90-day goal plan |
| `ff_daily_action_checks` | object | `{actionId: ISO-date}` completion map |
| `ff_low_since` | object | `{body, spirit, mind}` — date each ring went below threshold |
| `ff_sabbath` | object | Sabbath mode state `{active, startedAt, dismissedAt}` |
| `ff_alerts_shown` | object | `{body, spirit, mind}` — last date alert was shown per ring |
| `ff_member_since` | string | Member since date display string |
| `ff_tab` | string | Last active tab (restored on boot) |

### Data Migrations

The app auto-migrates legacy state on load. Example: `ff_priorities` (string array) is migrated to `ff_priorities_v2` (object array). Never remove this migration code without first verifying no users have old-format data.

---

## Design System

### CSS Variables

```css
:root {
  /* Backgrounds */
  --bg: #080B14;         /* page background */
  --surface: #0F1525;    /* card/section background */
  --elevated: #192036;   /* elevated/hover state */

  /* Brand Colors */
  --gold: #F5C842;       /* Spirit ring, CTAs, active state */
  --blue: #2E6FD4;       /* Mind ring, WHOOP banner */
  --green: #27AE60;      /* Body/recovery ring */
  --yellow: #F39C12;     /* Warnings */
  --red: #E74C3C;        /* Errors, destructive actions */

  /* Dim/border variants */
  --gold-dim: rgba(245,200,66,0.12);
  --gold-border: rgba(245,200,66,0.22);
  --blue-dim: rgba(46,111,212,0.12);
  --blue-border: rgba(46,111,212,0.25);
  --border: #2D3A5C;

  /* Text */
  --tp: #FFFFFF;         /* primary text */
  --ts: #8A94A6;         /* secondary/muted text */

  /* Fonts */
  --fd: 'Barlow Condensed', sans-serif;   /* display/headings */
  --fb: 'DM Sans', sans-serif;            /* body/UI text */
}
```

### Typography Conventions

- `Barlow Condensed` (var `--fd`): Screen titles, ring labels, tab labels, modal headings, numeric displays — always `text-transform: uppercase`
- `DM Sans` (var `--fb`): Body copy, descriptions, prayer text, verse text

### Phone Mockup

The app renders inside `.phone-screen` (390×844px). The `.phone-frame` div creates the bezels/buttons. All screens use `position: absolute; inset: 0` within `.screens`.

### Animation Patterns

- **Ring animations**: SVG `stroke-dasharray` animated in `animateRings()` using `requestAnimationFrame`
- **Tab transitions**: CSS `opacity` + `translateX` on `.screen` / `.screen.active`
- **Modals**: `.modal` becomes `.modal.open` (sets `display: flex`)

---

## AI Integration

The app uses `window.claude.complete()` for three AI features. All AI calls have deterministic offline fallbacks.

### Pattern

```js
if (window.claude && window.claude.complete) {
  const reply = await window.claude.complete({
    system: '...',
    messages: [{ role: 'user', content: '...' }]
  });
  // parse reply
} else {
  // use hardcoded fallback
}
```

### AI Features

| Function | Trigger | Behavior |
|----------|---------|----------|
| `getAIPrayerPrompt()` | "Get a prompt →" button | Returns a contextual prayer prompt |
| `aiVerseSearch()` | Search field on Spirit tab | Matches verses to emotional state or query |
| `aiDecomposeGoal(goal)` | "Generate Plan with AI" in goal modal | Returns JSON `{phases, milestones, dailyActions}` |

### Goal Decomposition JSON Contract

```json
{
  "phases": [{"month": 1, "title": "...", "focus": "..."}, ...],
  "milestones": [{"week": 1, "title": "..."}, ...],
  "dailyActions": [{"text": "..."}, ...]
}
```
- Exactly 3 phases, 12 milestones, 4 daily actions
- No emoji or markdown in AI responses

---

## WHOOP / Biometric Integration

### Architecture

Three supported sources in priority order: WHOOP → Garmin → Apple Health.

```js
state.sources = [
  { id: 'whoop',  name: 'WHOOP',        metric: 'Recovery',      connected: true,  value: 83 },
  { id: 'garmin', name: 'Garmin',        metric: 'Body Battery',  connected: false, value: null },
  { id: 'apple',  name: 'Apple Health',  metric: 'Readiness',     connected: false, value: null }
]
```

### Current Status (MVP)

All biometric data is **simulated**. `fetchWhoopRecovery()` and `fetchSourceValue()` return mock values with slight jitter. Real OAuth2 flow is stubbed but not implemented:

```
WHOOP OAuth endpoints (for future implementation):
  Auth:     GET  https://api.prod.whoop.com/oauth/oauth2/auth
  Token:    POST https://api.prod.whoop.com/oauth/oauth2/token
  Recovery: GET  https://api.prod.whoop.com/developer/v1/recovery?limit=1
```

To implement real WHOOP integration: uncomment the `fetch()` calls in `fetchWhoopRecovery()` and wire up the OAuth redirect flow.

### Key Functions

- `syncBiometrics()` — finds active source, calls `fetchSourceValue()`, updates state + UI
- `toggleSource(srcId)` — connects/disconnects a source, recalculates active source
- `renderBiometrics()` — rebuilds the biometric settings panel
- `renderWhoop()` — updates the health strip on the Today screen

---

## Key Functions Reference

### Render System

All rendering is triggered by `renderAll()` which calls each sub-renderer:

```js
renderAll() {
  renderDate()           // date label + greeting
  renderVOTD()           // verse of the day
  renderPriorities()     // today's priority list
  renderNonneg()         // non-negotiables list
  renderDisciplines()    // spiritual discipline toggles
  renderVerses()         // → filterVerses()
  renderStreakAndPrayer() // streak + prayer timer
  renderWhoop()          // health strip (body ring source)
  renderBiometrics()     // profile biometric section
  renderGoal90()         // 90-day goal card
  renderSabbathState()   // sabbath mode UI
  renderPrayers()        // active prayer list
  renderAnswered()       // answered prayer list
  animateRings()         // SVG ring animation
}
```

Call `renderAll()` after any broad state change. For targeted updates, call the specific sub-renderer and `persist()`.

### Score Computation

```js
spiritPct()  // 0-100: weighted combination of streak, prayer minutes, disciplines, VOTD
mindPct()    // 0-100: based on priorities + non-negotiables completed
// Body % comes directly from state.whoop.recovery (biometric source value)
```

### Modal System

Modals are `<div class="modal">` elements inside `.phone-screen`. Open/close by toggling `.open` class:

```js
document.getElementById('modal-id').classList.add('open')     // open
document.getElementById('modal-id').classList.remove('open')  // close
```

ESC key closes all modals via a global `keydown` listener.

### Check-in Flow (`openCheckin`)

Multi-step modal (`ci-modal`). Steps controlled by `nextStep(n)` / `prevStep()`. On submit:
- Logs prayer minutes to `state.prayerMin`
- Updates streak and `state.lastCheckin`
- Calls `checkAlerts(values)` to evaluate scripture alert triggers
- Calls `persist()` then `renderAll()`

### Sabbath Mode

Triggered when any ring has been below threshold for 3+ consecutive days (`shouldOfferSabbath()`). During sabbath, Spirit-specific sections are hidden via `.sabbath-hide` CSS class.

---

## Coding Conventions

### ID Naming

- Screen containers: `s-{name}` (e.g., `s-today`, `s-spirit`)
- Ring elements: `arc-{name}`, `ring-{name}-val` (e.g., `arc-body`, `ring-spirit-val`)
- Modal IDs: descriptive noun (e.g., `ci-modal`, `goal-modal`, `prayer-modal`)

### Item CRUD Pattern

All four CRUD lists (priorities, nonneg, disciplines, verses) follow this pattern:

```js
// Open modal
openItemModal(kind, id?)   // kind = 'prio'|'nonneg'|'disc'|'verse'

// Save
saveItem()   // inspects modal kind, updates state array, calls persist() + render*()

// Delete
deleteItem() // removes from state array, calls persist() + render*()

// Toggle completion
togglePriority(id) / toggleNonneg(id) / toggleDiscipline(id)
```

### Unique ID Generation

```js
uid()  // returns a short random string used as item IDs
```

### Date Utilities

```js
fmtDate(d)          // Date → "May 5" format
diffDays(aMs, bMs)  // millisecond timestamps → day difference
```

### HTML Escaping

Always escape user-generated content before inserting into innerHTML:
```js
escapeHtml(s)  // escapes &, <, >, ", '
```

---

## Development Workflow

### Editing the App

1. Open `Firm Foundation.html` in a browser directly (no server needed)
2. Make changes to the file
3. Hard-refresh the browser (`Ctrl+Shift+R` / `Cmd+Shift+R`)
4. localStorage persists between refreshes — use DevTools → Application → Storage → Clear to reset state

### Resetting State

Open browser DevTools console and run:
```js
localStorage.clear(); location.reload();
```

Or clear specific keys:
```js
localStorage.removeItem('ff_goal90'); renderAll();
```

### Adding a New CRUD Section

1. Add items array to `state` with `ls.get('ff_key', [...])` default
2. Add `ls.set('ff_key', state.newItems)` inside `persist()`
3. Write `renderNewSection()` following the existing pattern (map to HTML, set `innerHTML`)
4. Add `openItemModal` case for the new kind
5. Add `saveItem` / `deleteItem` case
6. Call `renderNewSection()` from `renderAll()`

### Adding a New Screen

1. Add `<div class="screen" id="s-name" data-screen-label="0N Label">` inside `.screens`
2. Add a `<button class="tab" data-tab="name">` with SVG icon inside `.tab-bar`
3. `switchTab(id, btn)` handles the rest via data attributes

---

## Deployment

The app is a static HTML file. Deploy by hosting either HTML file on any static server:

- **Netlify**: drag-and-drop the file into the Netlify dashboard
- **GitHub Pages**: commit to a `gh-pages` branch
- **Local**: open the file directly in a browser

No build step required. The standalone file (`Firm Foundation (standalone).html`) is suitable for sharing as an email attachment or single-file download since it bundles all assets.

---

## Known Limitations / Future Work

- WHOOP OAuth is stubbed — `fetchWhoopRecovery()` returns simulated values
- Garmin and Apple Health integrations are placeholders
- `window.claude.complete` is injected by the host environment (e.g., Claude.ai bundler); not available in plain browser opens without that context
- No user accounts, sync, or backend — all data is local-only via `localStorage`
- No automated tests — test manually by opening in Chrome/Safari and exercising each tab
