# Apps Overview

Three projects under `C:\Users\cceli\workspace\`. **Check this file before assuming any project's stack** — they share almost nothing.

---

## 1 — Wholesale Real Estate (`1-wholesale-real-estate/`)

| | |
|---|---|
| **Stack** | Next.js, Python |
| **Scraping / automation** | `browser-use`, `firecrawl` |
| **Gateway** | AgentReach MCP Gateway |
| **Notes** | See `01-Projects/agentreach-wholesale-integration.md` |

---

## 2 — Permit AI (`2-permit-ai/`)

| | |
|---|---|
| **Framework** | Next.js 16, TypeScript |
| **Styling** | Tailwind **v4**, Motion, `shadcn/ui` |
| **Agents** | `crewAI` |
| **Parsing** | `unstructured` |
| **Notes** | Tailwind v4 uses CSS-first config — no `tailwind.config.js`. Don't apply v3 patterns. |

---

## 3 — The Firm Foundation (`3-the-firm-foundation/`)

| | |
|---|---|
| **Stack** | **Single-file Vanilla JS HTML PWA** — `index.html`, ~5,600 lines, all HTML/CSS/JS inline |
| **Build** | None. No bundler, no framework, no build step. |
| **Persistence** | Dexie / IndexedDB via the internal `ls.set()` / `ls.get()` wrapper |
| **Backend** | Netlify Functions (Node 18+, native `fetch`) |
| **AI** | Anthropic Claude via `/.netlify/functions/claude` |
| **Biometrics** | WHOOP OAuth (direct); Oura API v2 (foundation laid, gated off) |
| **Push** | OneSignal Web Push v16 |
| **Payments** | Stripe payment links + client-side entitlement |

### Hard rules
- ❌ **No React Native, no Expo, no `src/`.** There are zero `.ts`/`.tsx`/`.jsx` files. Do not go looking for them.
- ❌ **Never use raw `localStorage`.** All reads and writes go through `ls.get()` / `ls.set()` — the Dexie wrapper. A raw `localStorage.setItem` is invisible to `ls.get()` and the feature will silently not work.
- ✅ `persist()` must be called after every `state` mutation.
- ✅ Full model IDs only — `claude-haiku-4-5-20251001`, never `haiku`.
- ✅ `window.claude.complete()` returns a **string**, not `{content:[...]}`.

See `3-the-firm-foundation/CLAUDE.md` for the complete developer contract.

---

## Local model fallback — Ollama / Qwen

| | |
|---|---|
| **Endpoint** | `http://localhost:11434/v1` (OpenAI-compatible) |
| **GPU** | RTX 3060, **6 GB VRAM** |
| **Role** | Fallback when cloud inference is unavailable, rate-limited, or cost-sensitive |

**6 GB is the binding constraint.** Practical implications:
- Prefer **quantised** builds (Q4_K_M or smaller) of 7B-class Qwen models.
- A 14B model will not fit without heavy offload; expect CPU spillover and a large latency hit.
- Keep context modest — KV cache competes with weights for the same 6 GB.
- Run one model at a time; concurrent loads will OOM.

---

## Odysseus (Docker)

| | |
|---|---|
| **Endpoint** | `http://localhost:7000` |
| **Runtime** | Docker |

Confirm the container is up before routing traffic to it — a dead endpoint should degrade to the cloud path, not hang the caller. Apply a request timeout on every call (the Firm Foundation codebase learned this the hard way: ten `fetch` sites with no deadline meant a hung backend froze the UI with no way back).
