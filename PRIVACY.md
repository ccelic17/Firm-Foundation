# Privacy Policy — Firm Foundation

**Last updated:** 27 August 2026
**Applies to:** thefirmfoundation.app and the Firm Foundation app
**Contact:** support@thefirmfoundation.app

> This policy describes what the app actually does, verified against the source code.
> It is not a template. It has not been reviewed by a lawyer — see "Status" at the end.

---

## 1. The short version

**Most of your data never leaves your device.** Your journal, prayers, check-ins, streak, disciplines and priorities are stored in your browser's local database (IndexedDB) on the device you use. We do not have a server that holds them, and we cannot read them.

A specific, limited set of information **is** sent out — to power the AI, take payment, sync your wearable, and send notifications. Section 3 lists every recipient and exactly what each one gets.

We do not sell your data. We do not run advertising. We do not use third-party analytics or tracking pixels.

---

## 2. What we collect, and where it lives

### Stays on your device
Held in your browser's local storage and never transmitted to us:

- Journal entries and timeline
- Prayer lists, answered prayers, prayer minutes
- Morning and evening check-ins (mood, energy, mental clarity, day rating, gratitude)
- Your covenant statement
- Streak, longest streak, member-since date
- Daily disciplines, non-negotiables, priorities and their completion
- 90-day goal and its generated plan
- Saved scripture and reading position
- Your first name and gender selection, if you enter them
- Settings: reminder preferences, Sabbath day, active tab
- Subscription flag, trial start date, and AI usage counters

Clearing your browser data, or uninstalling the app, deletes all of it permanently. We hold no copy and cannot restore it.

### Held by others on our behalf
- **Payment details** — held by Stripe. We never see or store your card number.
- **Email address** — given to Stripe at checkout, and used by us only to look up your subscription when you tap Restore Purchase.
- **Wearable access tokens** — stored on your device; used to fetch your data from WHOOP or Oura.
- **Push subscription** — held by OneSignal if you enable notifications.

### We do not collect
No account is required to use the app. We do not collect your address, phone number, contacts, photos, precise location, or browsing activity on other sites.

---

## 3. Third parties, and exactly what each receives

| Service | What it receives | Why |
|---|---|---|
| **Anthropic** (Claude) | Your question or request, plus context: covenant streak, covenant statement, 90-day goal, and recovery percentage | Powers all AI features |
| **Stripe** | Email, payment details, billing country | Subscriptions and Restore Purchase |
| **WHOOP** / **Oura** | OAuth authorisation; returns recovery, HRV, resting heart rate, sleep | Biometric sync, only if you connect one |
| **OneSignal** | Push subscription and streak/reminder tags | Push notifications, only if you enable them |
| **bible-api.com** | The verse reference or search phrase you request | Scripture text |
| **Netlify** | Standard server request logs, including IP address | Hosting and backend functions |
| **Google Fonts**, **unpkg** | IP address, inherent to loading a file | Fonts and one JavaScript library |

**Your journal entries and prayer lists are not sent to any of these.** They stay on your device. The exception is obvious but worth stating: if you type something from your journal *into* a Council question, that text goes to Anthropic as part of your question.

---

## 4. AI — how it is used and what that means

Firm Foundation uses **Anthropic's Claude** for the personalised opening, the Governor message, prayer prompts, scripture search, 90-day goal decomposition, and The Council.

- **What is sent:** your question or request, and the context listed in section 3.
- **How it is processed:** through Anthropic's API. Under Anthropic's commercial terms, API inputs are not used to train their models. Their policies govern their handling and may change; see anthropic.com/legal.
- **We do not keep AI conversations on a server.** Saved Council sessions live in your journal, on your device.

**AI output is generated, not verified.** It can be wrong, and it can misquote or invent scripture despite instructions not to. Check any scripture reference against your Bible. AI output in this app is spiritual encouragement — **it is not medical, psychological, legal or financial advice**, and it is not a substitute for your pastor, your doctor, or a licensed counsellor.

**Crisis situations.** The AI is instructed to respond to expressions of self-harm, suicidal thinking, or crisis by directing you to real human help rather than continuing as a mentor. **It is not a crisis service and must not be relied on as one.** In the US call or text **988**; internationally, **findahelpline.com**; if anyone is in immediate danger, contact emergency services.

---

## 5. Your choices and rights

- **See your data** — it is on your device; the app displays all of it.
- **Delete your data** — clear the site's browser data, or uninstall. That is a genuine, complete deletion: we hold no copy.
- **Delete what others hold** — email support@thefirmfoundation.app and we will delete your Stripe customer record (subject to legally required financial retention) and your OneSignal subscription. We will confirm when it is done.
- **Disconnect a wearable** — disconnect in Profile; this removes the stored tokens from your device.
- **Turn off notifications** — in Profile, or in your browser or OS settings.
- **Withdraw from AI features** — the AI features are optional; the rest of the app works without using them.

If you are in the UK, EU, or a US state with a privacy statute, you may have rights of access, correction, deletion, portability, and objection. Because we store almost nothing about you, most of these you can exercise yourself on your device. For anything held by Stripe or OneSignal, email us and we will act within 30 days.

## 6. Retention

Device data stays until you delete it. Stripe retains payment and subscription records as long as legally required for financial and tax purposes, which is typically seven years and is outside our control. OneSignal holds your push subscription until you unsubscribe or we delete it on request. Netlify request logs are retained on Netlify's standard schedule.

## 7. Security

Everything travels over HTTPS. API keys and secrets are held server-side in backend functions and are never present in the app you download. On-device data uses your browser's own storage protections; it is not additionally encrypted by us, so a person with access to your unlocked device can read it — treat the app as you would a paper journal in a drawer.

No system is perfectly secure, and we cannot promise otherwise.

## 8. Children

Not intended for anyone under 16. We do not knowingly collect data from children. If you believe a child has used the app, email us and we will delete what we can reach.

## 9. Changes

Material changes will be noted in-app and by the date at the top of this document. Revision history is in the public repository's git log, which is the audit trail for when this policy changed and what changed.

---

## Status — read this

This policy was written to describe the app truthfully, from its source code. **It has not been reviewed by a lawyer.** Before public launch — especially paid launch or App Store submission — have a qualified solicitor or attorney review it against the jurisdictions where you have users. GDPR, UK GDPR, CCPA/CPRA and state privacy statutes each add requirements this document does not attempt to satisfy, including identifying a data controller and, where applicable, an EU/UK representative.

Accuracy is the part that matters most and the part this gets right: a generic copied policy that misdescribes your data flows is worse than none.
