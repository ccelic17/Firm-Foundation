# AgentReach MCP Gateway — Wholesale Real Estate

**Project:** `1-wholesale-real-estate/` · **Stack:** Next.js + Python

**BLUF:** AgentReach is the MCP gateway fronting the two data-acquisition tools — **Firecrawl** (structured page extraction) and **Browser-Use** (agentic browser driving). Both reach the app through the gateway rather than being called directly, so credentials, rate limits, and retries live in one place.

> ⚠️ **Scope note:** this document was written from the brief, not from reading the repo — `1-wholesale-real-estate/` was not accessible from the session that generated it. Treat the config shapes below as the intended design to reconcile against the actual code, not as verified fact.

---

## Why a gateway

| Without | With AgentReach |
|---|---|
| Each caller holds its own API keys | Keys live gateway-side; callers hold none |
| Rate limits enforced per-caller, inconsistently | One budget, centrally enforced |
| Retry/backoff reimplemented per integration | Single retry policy |
| No shared audit trail | One place to log every outbound scrape |

---

## Tool split

### Firecrawl — structured extraction
Use when the target is **a page whose content you want**, and the page will render its data without being driven.

- Listing detail pages, county record pages, tax-assessor results
- Returns clean markdown/JSON rather than raw DOM
- **Cheaper and faster than Browser-Use — reach for it first**

### Browser-Use — agentic driving
Use only when the target **requires interaction** to reach the data.

- Multi-step search forms, session/login walls, pagination behind JS
- Anything needing click → wait → read sequences
- **Costs more and is slower.** Do not use it for a page Firecrawl can read directly.

**Selection rule:** if the data is present on a URL you can construct, use Firecrawl. If you must *act* to make the data exist, use Browser-Use.

---

## Configuration shape

Credentials come from the environment, never from source:

```
AGENTREACH_GATEWAY_URL=
AGENTREACH_API_KEY=
FIRECRAWL_API_KEY=
BROWSER_USE_API_KEY=
```

MCP server registration (reconcile against the repo's actual config file):

```json
{
  "mcpServers": {
    "agentreach": {
      "url": "${AGENTREACH_GATEWAY_URL}",
      "transport": "http",
      "auth": { "type": "bearer", "token": "${AGENTREACH_API_KEY}" },
      "tools": ["firecrawl_scrape", "firecrawl_crawl", "browser_use_run"]
    }
  }
}
```

---

## Operational rules

- **Timeout every call.** Browser-Use runs can be long; give them an explicit ceiling and a cancel path rather than letting a request hang.
- **Respect `robots.txt` and site terms.** Wholesale lead-gen sits close to lines worth not crossing — scrape public listing data, not gated personal records.
- **Rate-limit at the gateway**, not in each caller, or the limits drift apart.
- **Cache aggressively.** County and assessor records change slowly; re-scraping the same parcel daily is wasted spend.
- **Log every outbound scrape** (URL, tool, timestamp, outcome) so a blocked domain or a silently-empty extractor is diagnosable.
- **Fail loud.** A scraper returning zero rows should surface as an error, not an empty result set that looks like "no matches."

---

## Open items

- [ ] Reconcile this document against the repo's real MCP config
- [ ] Confirm which Firecrawl plan/limits are in effect
- [ ] Decide the cache TTL per source type (listings vs. assessor records)
- [ ] Add the audit-log sink
