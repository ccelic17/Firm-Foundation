# Firm Foundation — Product Document

> Describes what is **built and shipping**. Anything planned but not yet built lives
> in "Not Yet Built" at the end, so this document can be trusted as a description of
> the real app. Engineering detail lives in `CLAUDE.md`.

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

## Structure

**Four tabs.** The Council is a pane inside Journal, not a tab of its own, and the Bible reader lives inside Spirit — there is no separate Word tab.

| Tab | Contains |
|---|---|
| Today | Command centre — check-in, priorities, rings, 90-day goal |
| Spirit | Streak, scripture, prayer, Bible reader, Sabbath Mode |
| Journal | Daily log, prayer lists, and **The Council** |
| Profile | Covenant, biometrics, reminders, subscription |

---

## Core Feature Set

### Today Tab
The command centre. Everything a man needs to execute his day in one scroll.

- **AI Personalised Opening** — Claude-generated greeting keyed to time of day, streak length, and recovery score. Cached per day + streak so it generates once, not on every open.
- **Morning Check-in** — 4-step modal: mood, energy, mental clarity (1–5 each), prayer minutes. Feeds domain scores.
- **Evening Card** — Rate the day (1–5) plus one thing God did today. Closes the loop.
- **Body Metrics Strip** — Live recovery %, sleep hours, HRV. Tappable to sync.
- **Governor Banner** — Appears when recovery ≤ 39%. Claude generates a short Biblical coaching message granting permission to reduce load without guilt. Cached daily.
- **Today's Priorities** — User-defined. Add, check off, delete.
- **Daily Checks** — Non-negotiables across Body, Spirit, Mind.
- **90-Day Performance Engine** — Goal with AI-decomposed phases, weekly milestones, and daily actions.
- **Domain Score Rings** — Live Body / Spirit / Mind completion.

### Spirit Tab
- **Streak Counter** — Current covenant streak in days.
- **Word for the Week** — Weekly scripture anchor.
- **Verse of the Day** — Fetched daily, saveable to Scripture Library.
- **Today's Prayer** — Prayer list with answered-prayer tracking, plus AI prayer prompts.
- **Your Daily Disciplines** — Bible reading, fasting, silence, and similar.
- **Bible Reader** — Browse by book and chapter, OT and NT, with chapter navigation. Text is **KJV**, fetched from a scripture API. KJV is public domain outside the UK; the UK Crown copyright notice is displayed wherever scripture text appears.
- **AI Scripture Search** — Natural language question returns relevant verses with references and context.
- **Scripture Library** — Personal verse collection, saveable from the reader, verse of the day, or search.
- **Sabbath Mode** — Offered on the designated Sabbath day. Flags the day as rest.

### Journal Tab
- **Daily Log** — Free-form entries tied to date, in a timeline view.
- **Prayer panes** — Active and answered prayers.
- **The Council** — see below. Sessions are saveable to Journal.

### The Council *(pane inside Journal)*
Five AI mentors respond simultaneously to one question. Each has a distinct voice, domain, and theological posture.

| Mentor | Domain | Voice |
|---|---|---|
| The Sentinel | Body & Stewardship | Zero tolerance. Straight truth about the body. |
| The Scribe | Mind & Clarity | Names the real question beneath your question. |
| The Monk | Spirit & Prayer | Speaks from Scripture. Anchors, not motivates. |
| The Elder | Legacy & Family | Speaks in decades. Asks what will outlast you. |
| The Builder | Mission & Work | Work is worship. What must be done today? |

Context injected into every session: covenant streak, covenant text, 90-day goal, today's body readiness score.

Suggested prompt chips: Where am I drifting? / What needs to change? / How do I lead my family? / What holds me back? / Where should I focus?

**Every mentor answers in parallel, so one question is five Claude calls** — the most expensive interaction in the app, and the reason it is the most tightly metered.

### Profile Tab
- **Identity Confirmation** — Daily written declaration of covenant identity. Text, not audio.
- **Covenant** — Personal written covenant statement, displayed as a living document.
- **90-Day Vision** — Active goal.
- **Biometric Sources** — Connect WHOOP or Oura by OAuth. Disconnect and resync controls.
- **Reminders** — Push schedule: morning check-in, streak protection, prayer. Powered by OneSignal.
- **My System** — Visual architecture of how Body, Spirit and Mind interact.
- **Subscription** — Annual and monthly plans, plus Restore Purchase.
- **Share** — Generate a shareable State of the Man card.

---

## Monetisation

The principle: **gate what costs money per use, keep free what builds the daily habit.** A man has to be able to live in this app for months without paying, or he never builds the streak that makes a subscription worth buying.

**Free forever, unlimited** — check-ins, streaks, domain rings, priorities, daily checks, journal, prayer lists, Bible reader, verse of the day, Scripture Library, Sabbath Mode, WHOOP/Oura sync, State of the Man card. Also the **personalised opening and governor**, which are AI but cached once a day: capping them would degrade the free product for no real saving.

**Metered, because each use is a Claude call:**

| Feature | Cost per use | Free tier | Paid |
|---|---|---|---|
| AI prayer prompts | 1 call | 3 / day | unlimited |
| **The Council** | **5 calls** | 1 / week | unlimited |
| Scripture search | 1 call | 3 / day, shared across both search paths | unlimited |
| 90-day plan generation | 1 call | 1 / week | unlimited |

**Trial:** 7 days of full access from first launch. When it ends the app stays free at the limits above — it does not lock.

**Pricing:** $9.99/month or $79/year.

The paywall copy must name only features that are actually gated. It previously advertised Sabbath Mode, State of the Man reports and scripture alerts as paid unlocks while all three were free to everyone; a test now guards against that returning.

---

## AI Features (Claude)

All AI calls route through `/.netlify/functions/claude`. Default model `claude-haiku-4-5-20251001`; 90-day goal decomposition uses `claude-sonnet-4-6` for the heavier structured-JSON task.

**Every call carries a theological guardrail** prepended to the system prompt at the single transport choke point, so no feature can drift from the exclusivity of Christ regardless of which persona or prompt is calling.

| Feature | Trigger | Caching / metering |
|---|---|---|
| Personalised Opening | Every app open | Cached by date + streak |
| Governor Message | Sync when score ≤ 39% | Cached by date |
| AI Prayer Prompt | Manual tap | Fresh each time; 3/day free |
| Council Responses | Manual tap | Fresh each time; 1 session/week free |
| AI Scripture Search | Manual tap | Fresh each time; 3/day free |
| 90-Day Decomposition | Manual tap | Stored in state; 1/week free |

Caching and allowance counters persist through the app's IndexedDB wrapper, not `localStorage`.

---

## Biometrics

### WHOOP (direct OAuth)
Connect via `/.netlify/functions/whoop-auth` → WHOOP login → tokens returned to the app in the URL fragment. Sync and refresh have their own endpoints. Returns recovery score, HRV, resting heart rate, and sleep hours.

Recovery labels: Green ≥ 67%, Yellow ≥ 34%, Red < 34%. The Governor triggers at ≤ 39%.

### Oura (direct OAuth)
Same shape as WHOOP — auth, sync and refresh endpoints, normalised to the same score/HRV/RHR/sleep result. **Dormant until `OURA_CLIENT_ID` and `OURA_CLIENT_SECRET` are set.**

### Sync priority
If WHOOP tokens exist, use WHOOP; otherwise fall back to the generic path.

> **Terra has been removed.** Garmin, Fitbit and Google Fit are no longer supported. Oura is now connected directly rather than through Terra.

---

## Notifications

OneSignal Web Push. App ID loaded at runtime from `/.netlify/functions/config`. User tags set for streak status and reminder preferences.

---

## Payments

Stripe payment links for the annual and monthly plans, shown in a paywall modal.

**Each link's post-payment redirect must return to `/app`, never `/`.** The site serves the marketing page at `/` and the app at `/app`; a payment returning to `/` never runs the unlock handler, so the customer is charged and stays locked out with nothing to explain why. A Stripe hosted confirmation message and a redirect are mutually exclusive — adding the message removes the redirect, and with it the unlock. Any post-purchase message therefore belongs in the app, not in Stripe.

**Restore Purchase** looks the customer's email up in Stripe through `/.netlify/functions/restore` and restores access if a live subscription exists. Active, trialing and past-due all count as entitled — past-due means the card failed and Stripe is retrying, so locking the customer out mid-dunning punishes someone who has not cancelled.

**Known limit:** entitlement is a client-side flag, so it is spoofable by a determined user. Acceptable while the app is web-only; server-side entitlement is a prerequisite for App Store in-app purchase.

---

## Distribution

Progressive Web App, installed to the home screen. `/` serves the marketing page; `/app` serves the app; the install manifest launches directly into `/app`.

App Store distribution is planned and would require, in order: server-side entitlement and accounts, a native wrapper, in-app purchase reconciled against web subscriptions, and store review assets. Apple requires in-app purchase for digital subscriptions, so Stripe links cannot be the payment path inside a native iOS build.

---

## Brand Personality

**Anchored. Rigorous. Alive.**

Not military (external command) and not monk (withdrawal from the world). The Firm Foundation man is fully in the world — engaged in work, family, community. He is anchored from the inside. He does not drift because he has built something internal that holds.

**Voice:** Direct, concise, trusting. Never coaxing. Never apologetic. Speaks to a man who has already decided.

**Palette:** near-black ground (`#07090F`) with metallic gold (`#C4911A`) as the primary mark. One colour per domain — bronze for Body, blue for Mind, gold for Spirit, green for growth.

**Type:** Barlow Condensed for headings (tight, uppercase, industrial), DM Sans for body, Playfair Display for scripture. The serif is what keeps it from reading as a fitness app.

**Mark:** two mirrored F's forming a cross, brushed gold on black — faith and discipline as one shape rather than two ideas side by side.

---

## Design Principles

1. **Weight without heaviness.** The app should feel weighty: like it matters, like something serious is happening here. Never heavy: no guilt, no burden, no obligation. The difference lives in type scale, gold warmth against dark, copy that trusts the user.
2. **The man has already decided.** Never coax. Never explain why discipline matters. Treat the user as someone who has already committed and is here to execute.
3. **One integrated system.** Body, mind, and spirit are not separate tabs that happen to live in one app. They are one architecture. Every design decision should reinforce that the domains are interconnected, not siloed.
4. **Mirror, not motivator.** Show exactly where you are. Not where you could be. Not a streak of encouragements. The truth of the day, clearly displayed.
5. **Earn every pixel.** The design is spare and structured because the man's attention is finite and his morning is not for browsing. Every element on screen must justify its presence.
6. **Say only what is true.** Copy that promises something the app does not do is a defect, not marketing. This applies hardest where money changes hands.

---

## Anti-References

- **Habit tracker with Bible verses bolted on.** YouVersion, Streaks, Habitify with a cross. The discipline system here is architecturally theological, not decorative. The moment it looks like a generic productivity app with scripture references it has lost its identity.
- **Megachurch aesthetic.** Bright white, friendly rounded fonts, stock photos of diverse smiling people in a field, orange and teal gradients. That aesthetic signals "come as you are, no commitment required." This signals the opposite.
- **Meditation-soft.** Calm, Headspace, breathe animations, whispering sans-serifs, soft gradients. Those apps reduce tension. This one builds something. The emotional register is closer to a pre-dawn workout than a Sunday morning.
- **Church management tool.** No small group rosters, no giving dashboards, no event calendars. This is personal. It lives on the man's phone like his workout app and his Bible: private, daily, non-negotiable.
- **Aspirational without accountability.** Most faith apps show you what you could be. This shows exactly where you are today.

---

## Accessibility

WCAG AA minimum. Primary surface is mobile, held in hand in low light (pre-dawn context). Contrast ratios must work in dark conditions; the dark theme is not a preference but a use-case requirement. Animations should be purposeful: timed to feel like weight settling, not bouncing.

---

## Not Yet Built

Kept here rather than deleted, because the intent still stands — but none of it is in the app today, and this document should not claim otherwise.

- **Milestone celebration** — streak milestones are counted but pass unmarked; there is no confetti or animation.
- **Audio identity loop** — the daily declaration is written text; there is no guided audio.
- **Daily reading plan** — the Bible reader browses by book and chapter, but nothing auto-advances through a schedule.
- **Anniversary cards** — journal milestones are not surfaced as cards.
- **Accountability pairs and groups** (Phase 2) — no sharing between users.
- **Server-side entitlement and accounts** — required before App Store.
