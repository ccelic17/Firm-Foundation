# Firm Foundation — Product Document

## What It Is

A daily discipline operating system for the whole man. The architecture is theologically grounded: Physical as stewardship, Discipline as mechanism, Mental as operating system, Spiritual as the WHY. That architecture must stay visible and intentional in every screen.

Not a habit tracker. Not a faith app. A personal accountability mirror: it shows exactly where you are today and whether you showed up. The streak is not gamification — it is a mirror.

Success looks like: a man opens this at 5am before anyone else is awake, sees his domains, knows what is required, and does the work.

---

## Users

**Primary:** Christian men who take faith and physical discipline seriously and refuse to separate them. Not casual churchgoers. Not men who want to feel spiritual on Sunday and drift the other six days. Men who understand that body, mind, and spirit are one system, and that slipping in one domain bleeds into the others.

**Phase 1:** The builder himself. That is the correct starting point. Eventually: any man who has already decided to be disciplined, not men who need to be coaxed into deciding.

**Phase 2:** Accountability pairs and small groups of men who share their discipline records with men they respect.

---

## Core Feature Set

### Today Tab
The command centre. Everything a man needs to execute his day in one scroll.

- **AI Personalised Opening** — Claude-generated 2-sentence greeting keyed to time of day, streak length, and recovery score. Cached per day + streak combination so it generates once, not on every open.
- **Morning Check-in** — 4-step modal: mood (1–5), energy (1–5), mental clarity (1–5), prayer minutes. Submits to domain score calculation.
- **Evening Card** — Prompted at end of day: rate the day (1–5) + one thing God did today. Closes the loop.
- **Body Metrics Strip** — Live WHOOP/Terra data: Recovery %, Sleep hours, HRV ms. Tappable to sync.
- **Governor Banner** — Appears when recovery ≤ 39%. Claude generates a 3-sentence Biblical coaching message. Grants permission to reduce load without guilt. Cached daily so it does not regenerate on every sync.
- **Today's Priorities** — User-defined daily priorities. Add, check off, delete.
- **Daily Checks** — Integral non-negotiables across Body, Spirit, Mind domains. Checked once per day.
- **90-Day Performance Engine** — Active goal with AI-decomposed weekly actions. Progress tracked against a 13-week arc.
- **Domain Score Rings** — Live visual for Body, Spirit, Mind completion percentages.

### Spirit Tab
- **Streak Counter** — Current covenant streak in days. Fires confetti on milestones.
- **Word for the Week** — Weekly scripture anchor.
- **Verse of the Day** — Fetched from scripture API daily. Saveable to Scripture Library.
- **Today's Prayer** — Active prayer list with answered prayer tracking. AI-generated prayer prompt available.
- **Your Daily Disciplines** — Spiritual disciplines (Bible reading, fasting, silence, etc.).
- **Scripture Library** — Personal verse collection. Searchable. Verses saved from VOTD or AI search.
- **Sabbath Mode** — Offered automatically on designated Sabbath day. Silences non-essential notifications and flags the day as rest.

### Journal Tab
- **Daily Log** — Free-form journal entries tied to date. Timeline view.
- **Council sessions** saved here automatically.
- **Anniversary Cards** — Milestone celebrations pulled from journal history.

### The Council Tab
Five AI mentor personas that respond simultaneously to one question. Each has a distinct voice, domain, and theological posture.

| Mentor | Domain | Voice |
|---|---|---|
| The Sentinel | Body & Stewardship | Zero tolerance. Straight truth about the body. |
| The Scribe | Mind & Clarity | Names the real question beneath your question. |
| The Monk | Spirit & Prayer | Speaks from Scripture. Anchors, not motivates. |
| The Elder | Legacy & Family | Speaks in decades. Asks what will outlast you. |
| The Builder | Mission & Work | Work is worship. What must be done today? |

Context injected into every Council session: covenant streak, covenant text, 90-day goal, today's body readiness score.

Suggested prompt chips: Where am I drifting? / What needs to change? / How do I lead my family? / What holds me back? / Where should I focus?

Sessions are saveable to Journal.

### Word Tab (Bible)
- **AI Scripture Search** — Natural language → Claude returns 3 relevant verses with references and context.
- **Full Bible Reader** — Browse by book and chapter. OT and NT. Chapter navigation.
- **Daily Reading Plan** — Auto-advances through a reading schedule.
- Save any verse directly to Scripture Library.

### Profile Tab
- **Identity Confirmation** — Daily declaration loop: audio-guided affirmation of the man's covenant identity.
- **Covenant** — Personal written covenant statement. Displayed as a living document.
- **90-Day Vision** — Active goal visible here.
- **Biometric Sources** — Connect WHOOP (OAuth) or Terra (Garmin, Oura, Fitbit, Google). Disconnect and resync controls.
- **Reminders** — Push notification schedule: morning check-in, streak protection, prayer reminders. Powered by OneSignal.
- **My System** — Visual architecture diagram showing the Body/Spirit/Mind system and how the domains interact.
- **Subscription** — Annual and monthly plans via Stripe.
- **Share** — Generate a shareable discipline card.

---

## AI Features (Claude)

All AI calls route through `/.netlify/functions/claude` using `claude-haiku-4-5-20251001`.

| Feature | Trigger | Caching |
|---|---|---|
| Personalised Opening | Every app open | Cached by date + streak in localStorage |
| Governor Message | WHOOP sync when score ≤ 39% | Cached by date in `ff_governor_date` |
| AI Prayer Prompt | Manual tap | None (intentional — fresh each time) |
| Council Responses | Manual tap | None (intentional) |
| AI Scripture Search | Manual tap | None |
| 90-Day Goal Decomposition | Manual tap | Stored in state |

---

## Biometrics Architecture

### WHOOP (direct OAuth)
- User connects via `/.netlify/functions/whoop-auth` → redirects to WHOOP login → callback returns tokens to app via URL fragment
- Tokens stored in `state.whoopTokens` / `ff_whoop_tokens`
- Sync via `/.netlify/functions/whoop-sync` (POST with access_token)
- Token refresh via `/.netlify/functions/whoop-refresh` (POST with refresh_token)
- Returns: recovery score, HRV, resting heart rate, sleep hours
- Recovery labels: Green ≥ 67%, Yellow ≥ 34%, Red < 34%

### Terra (Garmin, Oura, Fitbit, Google)
- Widget session generated via `/.netlify/functions/biometrics?action=connect`
- Sync via `/.netlify/functions/biometrics?action=sync&terra_user_id=...`
- Disconnect via `/.netlify/functions/biometrics?action=disconnect&terra_user_id=...`
- Returns normalised readiness score + HRV + sleep

### Sync Priority
`syncWhoop()` → if WHOOP OAuth tokens exist, call `syncWHOOP()` (direct API); otherwise call `syncBiometrics()` (Terra/generic).

---

## Notifications

OneSignal Web Push. App ID loaded at runtime from `/.netlify/functions/config` (reads `ONESIGNAL_APP_ID` env var). User tags set for streak status and reminder preferences.

---

## Payments

Stripe payment links for Annual and Monthly plans. Displayed in a paywall modal after the free trial period.

---

## Brand Personality

**Anchored. Rigorous. Alive.**

Not military (external command) and not monk (withdrawal from the world). The Firm Foundation man is fully in the world — engaged in work, family, community. He is anchored from the inside. He does not drift because he has built something internal that holds.

**Voice:** Direct, concise, trusting. Never coaxing. Never apologetic. Speaks to a man who has already decided.

---

## Design Principles

1. **Weight without heaviness.** The app should feel weighty: like it matters, like something serious is happening here. Never heavy: no guilt, no burden, no obligation. The difference lives in type scale, gold warmth against dark, copy that trusts the user.
2. **The man has already decided.** Never coax. Never explain why discipline matters. Treat the user as someone who has already committed and is here to execute.
3. **One integrated system.** Body, mind, and spirit are not separate tabs that happen to live in one app. They are one architecture. Every design decision should reinforce that the domains are interconnected, not siloed.
4. **Mirror, not motivator.** Show exactly where you are. Not where you could be. Not a streak of encouragements. The truth of the day, clearly displayed.
5. **Earn every pixel.** The design is spare and structured because the man's attention is finite and his morning is not for browsing. Every element on screen must justify its presence.

---

## Anti-References

- **Habit tracker with Bible verses bolted on.** YouVersion, Streaks, Habitify with a cross. The discipline system here is architecturally theological, not decorative. The moment it looks like a generic productivity app with scripture references it has lost its identity.
- **Megachurch aesthetic.** Bright white, friendly rounded fonts, stock photos of diverse smiling people in a field, orange and teal gradients. That aesthetic signals "come as you are, no commitment required." This signals the opposite.
- **Meditation-soft.** Calm, Headspace, breathe animations, whispering sans-serifs, soft gradients. Those apps reduce tension. This one builds something. The emotional register is closer to a pre-dawn workout than a Sunday morning.
- **Church management tool.** No small group rosters, no giving dashboards, no event calendars. This is personal. It lives on the man's phone like his workout app and his Bible: private, daily, non-negotiable.
- **Aspirational without accountability.** Most faith apps show you what you could be. This shows exactly where you are today.

---

## Accessibility

WCAG AA minimum. Primary surface is iOS mobile, held in hand in low light (pre-dawn context). Contrast ratios must work in dark conditions; the dark theme is not a preference but a use-case requirement. No reduced-motion requirement identified, but animations should be purposeful: timed to feel like weight settling, not bouncing.
