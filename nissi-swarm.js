// ================================================================
// NISSI ASSET MANAGEMENT LLC
// 22-AGENT AUTONOMOUS REAL ESTATE SWARM
// Google Apps Script — Production Script v2.1
// ================================================================


// ----------------------------------------------------------------
// CONFIGURATION — edit these lines only
// ----------------------------------------------------------------
const SHEET_NAME             = "Leads";
const GOOGLE_DRIVE_FOLDER_ID = "1msLnK-IFe6Gj-qJjf3d5vaOKkXY5EaDb";
const DEAL_SURGE_FOLDER_NAME = "Deal Surge Imports";
const EMAIL_SCORE_THRESHOLD  = 60;
const EMAIL_SENDER_NAME      = "Nissi Asset Management";
const EMAIL_REPLY_TO         = "ccelic17@gmail.com";

// Claude model — full ID required
const CLAUDE_MODEL_FAST   = "claude-haiku-4-5-20251001";
const CLAUDE_MODEL_HEAVY  = "claude-sonnet-4-6";
const CLAUDE_MAX_TOKENS   = 2048;


// ----------------------------------------------------------------
// COLUMN MAP
// A=LeadID  B=RawContent  C=Category  D=PropertyDetails(JSON)
// E=MissingInfo  F=DraftResponse  G=Status  H=ProcessedAt
// I=ImageURL  J=PDFLink  K=DealScore  L=EmailSentStatus
// ----------------------------------------------------------------
const COL = {
  LEAD_ID:          1,
  RAW_CONTENT:      2,
  CATEGORY:         3,
  PROPERTY_DETAILS: 4,
  MISSING_INFO:     5,
  DRAFT_RESPONSE:   6,
  STATUS:           7,
  PROCESSED_AT:     8,
  IMAGE_URL:        9,
  PDF_LINK:         10,
  DEAL_SCORE:       11,
  EMAIL_STATUS:     12
};


// ----------------------------------------------------------------
// STATUS CONSTANTS — the routing brain of the entire swarm
// ----------------------------------------------------------------
const S = {
  NEW:            "Pod1:New",
  GOV_DONE:       "Pod1:GovSniped",
  VISION_DONE:    "Pod1:VisionScouted",
  MARKET_DONE:    "Pod1:MarketScouted",
  SKIP_DONE:      "Pod1:SkipTraced",
  POD1_DONE:      "Pod1:Complete",
  MATH_DONE:      "Pod2:MathAudited",
  REHAB_DONE:     "Pod2:RehabEstimated",
  EXIT_DONE:      "Pod2:ExitStrategized",
  LIEN_DONE:      "Pod2:LienDetected",
  SUBTO_DONE:     "Pod2:SubToAnalyzed",
  SCORE_DONE:     "Pod2:DealScored",
  RISK_DONE:      "Pod2:RiskAssessed",
  COMP_DONE:      "Pod2:CompAnalyzed",
  POD2_DONE:      "Pod2:Complete",
  CLOSER_DONE:    "Pod3:CloserDrafted",
  OBJECTION_DONE: "Pod3:ObjectionHandled",
  SMS_DONE:       "Pod3:SMSDrafted",
  ANCHOR_DONE:    "Pod3:AnchorSet",
  SUBJECT_DONE:   "Pod3:SubjectLinesSet",
  SEQUENCE_DONE:  "Pod3:SequenceBuilt",
  QUALIFIER_DONE: "Pod3:QualifierDone",
  PDF_DONE:       "Pod3:PDFCreated",
  EMAIL_DONE:     "Pod3:EmailSent",
  POD3_DONE:      "Pod3:Complete",
  COMPLETE:       "COMPLETE"
};


// ================================================================
// CORE API LAYER
// ================================================================

/**
 * Calls the Anthropic Claude API with retry logic.
 * Requires ANTHROPIC_API_KEY in Project > Settings > Script Properties.
 *
 * @param {string} prompt       - User message
 * @param {string} systemPrompt - System message
 * @param {string} [model]      - Optional model override
 * @returns {string}            - Raw text response from Claude
 */
function callClaude(prompt, systemPrompt, model) {
  const apiKey = PropertiesService.getScriptProperties().getProperty("ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set in Script Properties");

  model = model || CLAUDE_MODEL_FAST;

  const payload = {
    model:      model,
    max_tokens: CLAUDE_MAX_TOKENS,
    system:     systemPrompt,
    messages:   [{ role: "user", content: prompt }]
  };

  const options = {
    method:          "post",
    contentType:     "application/json",
    headers: {
      "x-api-key":          apiKey,
      "anthropic-version":  "2023-06-01"
    },
    payload:          JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const backoff = [3000, 6000, 12000];
  for (let attempt = 0; attempt < 4; attempt++) {
    const res  = UrlFetchApp.fetch("https://api.anthropic.com/v1/messages", options);
    const code = res.getResponseCode();
    const body = JSON.parse(res.getContentText());

    if (code === 200) return body.content[0].text;

    // Retry on rate-limit or server errors
    if ((code === 429 || code >= 500) && attempt < 3) {
      Logger.log(`[Claude] HTTP ${code} on attempt ${attempt + 1} — retrying in ${backoff[attempt] / 1000}s`);
      Utilities.sleep(backoff[attempt]);
      continue;
    }

    throw new Error(`Claude API error ${code}: ${body.error?.message || res.getContentText().substring(0, 300)}`);
  }
}


/**
 * Calls Claude with a real image (fetches URL → base64 → multimodal API).
 * Falls back to text-only analysis if the image cannot be fetched.
 *
 * @param {string} prompt       - Instruction for the image analysis
 * @param {string} imageUrl     - Publicly accessible image URL
 * @param {string} systemPrompt - System message
 * @returns {string}            - Raw text response from Claude
 */
function callClaudeWithImage(prompt, imageUrl, systemPrompt) {
  const apiKey = PropertiesService.getScriptProperties().getProperty("ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set in Script Properties");

  // Attempt to fetch and encode the image
  let imageContent;
  try {
    const imgRes = UrlFetchApp.fetch(imageUrl, { muteHttpExceptions: true });
    if (imgRes.getResponseCode() !== 200) throw new Error(`HTTP ${imgRes.getResponseCode()}`);
    const blob      = imgRes.getBlob();
    const mediaType = blob.getContentType() || "image/jpeg";
    const b64       = Utilities.base64Encode(blob.getBytes());
    imageContent    = { type: "image", source: { type: "base64", media_type: mediaType, data: b64 } };
  } catch(e) {
    Logger.log(`[VisionScout] Image fetch failed (${e.message}) — falling back to text-only`);
    return callClaude(
      `${prompt}\n\n(Note: Image at ${imageUrl} could not be loaded — estimate based on any textual context available.)`,
      systemPrompt
    );
  }

  const payload = {
    model:      CLAUDE_MODEL_FAST,
    max_tokens: CLAUDE_MAX_TOKENS,
    system:     systemPrompt,
    messages:   [{
      role:    "user",
      content: [imageContent, { type: "text", text: prompt }]
    }]
  };

  const options = {
    method:             "post",
    contentType:        "application/json",
    headers: {
      "x-api-key":         apiKey,
      "anthropic-version": "2023-06-01"
    },
    payload:            JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const res  = UrlFetchApp.fetch("https://api.anthropic.com/v1/messages", options);
  const code = res.getResponseCode();
  const body = JSON.parse(res.getContentText());

  if (code !== 200) throw new Error(`Vision API error ${code}: ${body.error?.message || "Unknown"}`);
  return body.content[0].text;
}


// ================================================================
// UTILITIES
// ================================================================

function readDetails(sheet, rowIndex) {
  const raw = sheet.getRange(rowIndex, COL.PROPERTY_DETAILS).getValue();
  if (!raw) return {};
  try { return JSON.parse(raw); } catch(e) { return {}; }
}

function writeDetails(sheet, rowIndex, newData) {
  const existing = readDetails(sheet, rowIndex);
  const merged   = Object.assign({}, existing, newData);
  sheet.getRange(rowIndex, COL.PROPERTY_DETAILS).setValue(JSON.stringify(merged, null, 2));
  return merged;
}

function setStatus(sheet, rowIndex, status) {
  sheet.getRange(rowIndex, COL.STATUS).setValue(status);
}

function parseJSON(text, agentName) {
  const cleaned = text.trim()
    .replace(/^```json\n?/, "")
    .replace(/\n?```$/, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch(e) {
    const ctx = agentName ? ` [${agentName}]` : "";
    throw new Error(`JSON parse failed${ctx}: ${e.message} — Raw: ${cleaned.substring(0, 300)}`);
  }
}

/** Detect lead category from free text (shared by Gmail and CSV importers). */
function detectCategory(text) {
  const t = text.toLowerCase();
  if (t.includes("subject-to") || t.includes("subject to") || t.includes("sub-to") || t.includes("sub to"))
    return "Subject-To";
  if (t.includes("pre-foreclosure") || t.includes("preforeclosure"))
    return "Wholesale Pre-Foreclosure";
  if (t.includes("land bank") || t.includes("tax deed") || t.includes("tax lien") || t.includes("hud reo"))
    return "Government/Land Bank";
  if (t.includes("probate") || t.includes("estate sale") || t.includes("inherited"))
    return "Wholesale Probate";
  return "Wholesale";
}


// ================================================================
// PHASE 1 — INTAKE & VISION POD (Agents 1–4)
// ================================================================

function agent_GovSniper(sheet, rowIndex, rawContent) {
  const sys = `You are a government real estate program specialist for Nissi Asset Management.
Scan the lead for signals it is tied to a government or land bank program.

Programs to detect: Land Bank, Tax Deed/Tax Lien Auction (especially FL), HUD/FHA/VA REO,
USDA Rural Development, State forfeiture/escheat, City-owned vacant/abandoned programs,
CDBG-linked sales, Side-Lot programs, Opportunity Zone designations.

Return ONLY this JSON:
{
  "is_government_deal": false,
  "program_type": "Land Bank" | "Tax Deed" | "HUD REO" | "Municipal" | "USDA" | "Opportunity Zone" | "Other" | null,
  "program_confidence": "High" | "Medium" | "Low",
  "detected_keywords": [],
  "estimated_acquisition_type": "Direct Purchase" | "Auction" | "Negotiated" | "Application-Based" | null,
  "gov_notes": "One sentence on what was detected and why it matters"
}`;

  const r = parseJSON(callClaude(`Analyze for government/land bank signals:\n\n${rawContent}`, sys), "GovSniper");
  writeDetails(sheet, rowIndex, { gov_sniper: r });
  setStatus(sheet, rowIndex, S.GOV_DONE);
  Logger.log(`[GovSniper] Row ${rowIndex}: ${r.is_government_deal ? r.program_type : "No gov signal"}`);
}


function agent_VisionScout(sheet, rowIndex) {
  const imageUrl = sheet.getRange(rowIndex, COL.IMAGE_URL).getValue();

  if (!imageUrl) {
    writeDetails(sheet, rowIndex, { vision_scout: { zombie_score: null, distress_signals: [], notes: "No image URL in Column I." } });
    setStatus(sheet, rowIndex, S.VISION_DONE);
    return;
  }

  const sys = `You are a property distress analyst. Score visible distress signals in this property image.

Zombie signals (with point weights):
- Boarded windows/doors: 20pts each
- Roof tarps/damage: 20pts
- Overgrown lawn: 10pts
- Broken windows: 10pts
- Severe exterior deterioration: 10pts
- Fire damage: 15pts
- Posted notices on door: 10pts
- Structural lean/sagging: 15pts
- Abandoned vehicles: 5pts

Return ONLY this JSON:
{
  "zombie_score": 0,
  "distress_signals": [],
  "estimated_condition": "Excellent" | "Good" | "Fair" | "Poor" | "Severe",
  "rehab_complexity": "Cosmetic" | "Moderate" | "Heavy" | "Gut Rehab",
  "vision_notes": "Two sentences describing what you see"
}`;

  // Uses multimodal API — Claude actually sees the image
  const r = parseJSON(callClaudeWithImage("Analyze this property image for distress signals.", imageUrl, sys), "VisionScout");
  writeDetails(sheet, rowIndex, { vision_scout: r });
  setStatus(sheet, rowIndex, S.VISION_DONE);
  Logger.log(`[VisionScout] Row ${rowIndex}: Zombie Score = ${r.zombie_score}`);
}


function agent_MarketScout(sheet, rowIndex, rawContent) {
  const details = readDetails(sheet, rowIndex);

  const sys = `You are a state-specific real estate market analyst for Nissi Asset Management.
Identify the state and apply the correct investment rules.

FLORIDA: Tax Deed auctions primary vehicle. 2-year right of redemption. No POS inspection.
  Homestead exemption complicates Sub-To exits. Key counties: Duval, Hillsborough, Broward, Polk.
OHIO: POS inspection required in many municipalities. Ohio Land Bank most active in Cuyahoga,
  Franklin, Lucas. Sheriff sale market strong. Community Reinvestment Areas = tax abatement.
  Key cities: Cleveland, Columbus, Cincinnati, Dayton.
NORTH CAROLINA: Upset bid process (10-day window). No right of redemption post-sale.
  Strong BRRRR market in Charlotte/Raleigh/Greensboro.
SOUTH CAROLINA: Tax sales with 12-month redemption. Charleston/Greenville strong appreciation.

Return ONLY this JSON:
{
  "state": "FL" | "OH" | "NC" | "SC" | "Other" | null,
  "city": null,
  "county": null,
  "market_tier": "Primary" | "Secondary" | "Tertiary",
  "primary_acquisition_vehicle": "Tax Deed Auction" | "Land Bank" | "Sheriff Sale" | "Direct" | "MLS" | null,
  "state_rules_applied": [],
  "redemption_period_days": null,
  "pos_inspection_required": false,
  "market_notes": "Two sentences on strategy for this market"
}`;

  const r = parseJSON(callClaude(
    `Gov data: ${JSON.stringify(details.gov_sniper)}\n\nLead:\n${rawContent}`, sys
  ), "MarketScout");
  writeDetails(sheet, rowIndex, { market_scout: r });
  setStatus(sheet, rowIndex, S.MARKET_DONE);
  Logger.log(`[MarketScout] Row ${rowIndex}: ${r.state} — ${r.primary_acquisition_vehicle}`);
}


function agent_SkipTracer(sheet, rowIndex, rawContent) {
  const details = readDetails(sheet, rowIndex);

  const sys = `You are an absentee owner detection specialist.
Detect signals that the owner is out of state or absentee.

Signals: mailing address differs from property, out-of-state area codes, LLC/corporate ownership,
inherited property with out-of-state heirs, vacant with no local contact, property manager mentioned.

Return ONLY this JSON:
{
  "owner_type": "Owner Occupied" | "Local Landlord" | "Out-of-State Owner" | "Corporate/LLC" | "Estate/Probate" | "Unknown",
  "absentee_confidence": "High" | "Medium" | "Low",
  "skip_trace_recommended": false,
  "skip_trace_priority": "Urgent" | "Standard" | "Low" | null,
  "detected_signals": [],
  "suggested_skip_tools": [],
  "owner_notes": "One sentence on what was detected"
}`;

  const r = parseJSON(callClaude(
    `Gov: ${JSON.stringify(details.gov_sniper)}\nMarket: ${JSON.stringify(details.market_scout)}\n\nLead:\n${rawContent}`, sys
  ), "SkipTracer");
  writeDetails(sheet, rowIndex, { skip_tracer: r });
  // Advance directly to POD1_DONE (skip_tracer is the last Pod 1 agent)
  setStatus(sheet, rowIndex, S.POD1_DONE);
  Logger.log(`[SkipTracer] Row ${rowIndex}: ${r.owner_type} | Skip: ${r.skip_trace_recommended}`);
}


// ================================================================
// PHASE 2 — DEEP-UNDERWRITING POD (Agents 5–12)
// ================================================================

function agent_MathAuditor(sheet, rowIndex, rawContent) {
  const details  = readDetails(sheet, rowIndex);
  const category = sheet.getRange(rowIndex, COL.CATEGORY).getValue();

  const sys = `You are the chief underwriting skeptic at Nissi Asset Management. Find holes, not reasons to proceed.

10x Logic Rules:
1. Wholesale/Gov: Entry cost must be ≤50% of ARV minus rehab for a viable deal
2. Sub-To: Monthly payment must leave ≥$200/mo positive cash flow after PITI + 10% vacancy
3. ARV missing = deal CANNOT be scored — force_reanalysis must be true
4. Asking price >65% ARV = flag as "Retail Priced — Negotiate Hard or Pass"
5. Land Bank/Gov target: $10k–$15k all-in
6. Sub-To rate >6% = creative wrap math weakens significantly

Return ONLY this JSON:
{
  "math_valid": true,
  "critical_missing": [],
  "force_reanalysis": false,
  "reanalysis_reason": null,
  "entry_cost_estimate": null,
  "arv_estimate": null,
  "max_offer": null,
  "deal_viability": "Strong" | "Viable" | "Marginal" | "Pass",
  "auditor_flags": [],
  "auditor_notes": "Two sentences of hard-nosed assessment"
}`;

  const r = parseJSON(callClaude(
    `Category: ${category}\n\nAll data:\n${JSON.stringify(details, null, 2)}\n\nRaw Lead:\n${rawContent}`, sys
  ), "MathAuditor");
  writeDetails(sheet, rowIndex, { math_auditor: r });

  if (r.force_reanalysis) {
    sheet.getRange(rowIndex, COL.MISSING_INFO).setValue(
      `AUDITOR HALT: ${r.reanalysis_reason} | Missing: ${r.critical_missing.join(", ")}`
    );
    setStatus(sheet, rowIndex, `${S.MATH_DONE}:HALTED`);
  } else {
    setStatus(sheet, rowIndex, S.MATH_DONE);
  }
  Logger.log(`[MathAuditor] Row ${rowIndex}: ${r.deal_viability} | Force reanalysis: ${r.force_reanalysis}`);
}


function agent_RehabEstimator(sheet, rowIndex) {
  const details = readDetails(sheet, rowIndex);

  const sys = `You are a construction cost estimator for distressed residential properties.

Cost benchmarks (2024–2025 Southeast/Midwest US):
- Cosmetic: $15–$25/sqft (paint, flooring, fixtures, landscaping)
- Moderate: $35–$55/sqft (kitchen/bath update, HVAC service, windows)
- Heavy: $60–$90/sqft (roof replacement, HVAC, electrical panel, plumbing)
- Gut Rehab: $95–$140/sqft (structural, foundation, full systems replacement)

Land Bank $10k–$15k target: Cosmetic to Moderate ONLY.
If Heavy or Gut Rehab detected, flag exceeds_land_bank_budget as true.

Return ONLY this JSON:
{
  "rehab_complexity": "Cosmetic" | "Moderate" | "Heavy" | "Gut Rehab",
  "cost_per_sqft_low": 0,
  "cost_per_sqft_high": 0,
  "sqft_used": null,
  "total_rehab_low": 0,
  "total_rehab_high": 0,
  "rehab_line_items": {
    "roof": null, "hvac": null, "plumbing": null, "electrical": null,
    "kitchen": null, "bathrooms": null, "flooring": null,
    "paint_exterior": null, "paint_interior": null,
    "landscaping": null, "windows": null, "foundation": null
  },
  "exceeds_land_bank_budget": false,
  "rehab_notes": "One sentence recommendation"
}`;

  const r = parseJSON(callClaude(
    `Vision: ${JSON.stringify(details.vision_scout)}\nMath: ${JSON.stringify(details.math_auditor)}`, sys
  ), "RehabEstimator");
  writeDetails(sheet, rowIndex, { rehab_estimator: r });
  setStatus(sheet, rowIndex, S.REHAB_DONE);
  Logger.log(`[RehabEstimator] Row ${rowIndex}: $${r.total_rehab_low}–$${r.total_rehab_high} (${r.rehab_complexity})`);
}


function agent_ExitStrategist(sheet, rowIndex) {
  const details = readDetails(sheet, rowIndex);

  const sys = `You are a real estate investment exit strategy analyst for Nissi Asset Management.
Calculate ROI for three exits: BRRRR, Wholesale, Creative Wrap.

BRRRR: Cash-on-cash = Annual Net Income / Total Cash Invested. Refi at 75% LTV post-rehab ARV.
WHOLESALE: Assignment fee = Max Offer - Entry Cost. Target $8k–$20k. 30–60 day close.
CREATIVE WRAP: Monthly spread = (Wrap Rate - Sub-To Rate) × Balance / 100 / 12.

Return ONLY this JSON:
{
  "recommended_exit": "BRRRR" | "Wholesale" | "Creative Wrap",
  "brrrr": {
    "all_in_cost": null, "post_rehab_arv": null, "refi_proceeds": null,
    "cash_left_in": null, "estimated_monthly_rent": null,
    "monthly_cash_flow": null, "cash_on_cash_return": null, "viable": false
  },
  "wholesale": {
    "entry_cost": null, "max_offer_to_investor_buyer": null,
    "assignment_fee": null, "days_to_close_estimate": null, "viable": false
  },
  "creative_wrap": {
    "underlying_rate": null, "wrap_rate": null,
    "monthly_spread_income": null, "loan_balance": null, "viable": false
  },
  "exit_notes": "Two sentences on why this exit was chosen"
}`;

  const r = parseJSON(callClaude(
    `Market: ${JSON.stringify(details.market_scout)}\nMath: ${JSON.stringify(details.math_auditor)}\nRehab: ${JSON.stringify(details.rehab_estimator)}`, sys
  ), "ExitStrategist");
  writeDetails(sheet, rowIndex, { exit_strategist: r });
  setStatus(sheet, rowIndex, S.EXIT_DONE);
  Logger.log(`[ExitStrategist] Row ${rowIndex}: Recommended = ${r.recommended_exit}`);
}


function agent_LienDetective(sheet, rowIndex, rawContent) {
  const sys = `You are a title and lien research specialist.
Detect all liens, judgments, or encumbrances mentioned in the lead.

Types to detect: IRS Federal Tax Liens (survives most sales), State Tax Liens, Mechanic's Liens,
HOA Liens (super-priority in FL), Utility Liens (run with land), Municipal Code Violation Liens,
Second Mortgages/HELOCs, Child Support/Alimony Judgments, Personal Injury Judgments, Lis Pendens.

Return ONLY this JSON:
{
  "liens_detected": false,
  "lien_types": [],
  "estimated_lien_total": null,
  "irs_lien_present": false,
  "hoa_super_priority_risk": false,
  "lis_pendens_present": false,
  "title_risk": "Clean" | "Low" | "Moderate" | "High" | "Do Not Proceed",
  "negotiation_impact": "No Impact" | "Negotiate Into Price" | "Seller Must Clear" | "Deal Killer",
  "lien_notes": "One sentence on most important finding and recommended action"
}`;

  const r = parseJSON(callClaude(`Raw lead:\n${rawContent}`, sys), "LienDetective");
  writeDetails(sheet, rowIndex, { lien_detective: r });
  setStatus(sheet, rowIndex, S.LIEN_DONE);
  Logger.log(`[LienDetective] Row ${rowIndex}: ${r.title_risk} | ${r.lien_types.join(", ") || "No liens"}`);
}


function agent_SubToAnalyzer(sheet, rowIndex, rawContent) {
  const details  = readDetails(sheet, rowIndex);
  const category = sheet.getRange(rowIndex, COL.CATEGORY).getValue();

  if (!category.includes("Subject-To")) {
    writeDetails(sheet, rowIndex, { subto_analyzer: { applicable: false } });
    setStatus(sheet, rowIndex, S.SUBTO_DONE);
    return;
  }

  const sys = `You are a Subject-To and creative financing analyst.

Viability tiers:
- Ideal: Rate ≤4.5%, Balance <70% ARV, seller motivated, current on payments
- Workable: Rate ≤5.5%, seller cooperative, some equity
- Risky: Seller behind on payments (increases due-on-sale risk)
- Deal-Killer: Rate >7%, no equity, hostile seller

Due-on-Sale Risk: Low (community bank/credit union, loan <$150k) |
  Moderate (Fannie/Freddie conventional) | High (FHA/VA)

Return ONLY this JSON:
{
  "subto_viable": true,
  "viability_tier": "Ideal" | "Workable" | "Risky" | "Deal-Killer",
  "underlying_rate": null,
  "underlying_balance": null,
  "monthly_payment": null,
  "due_on_sale_risk": "Low" | "Moderate" | "High",
  "wrap_viable": false,
  "proposed_wrap_rate": null,
  "monthly_wrap_spread": null,
  "recommended_structure": "Straight Sub-To" | "Sub-To + Wrap" | "Sub-To + Lease Option" | "Pass",
  "subto_notes": "Two sentences on structure recommendation"
}`;

  const r = parseJSON(callClaude(
    `Math: ${JSON.stringify(details.math_auditor)}\nExit: ${JSON.stringify(details.exit_strategist)}\n\nLead:\n${rawContent}`, sys
  ), "SubToAnalyzer");
  writeDetails(sheet, rowIndex, { subto_analyzer: r });
  setStatus(sheet, rowIndex, S.SUBTO_DONE);
  Logger.log(`[SubToAnalyzer] Row ${rowIndex}: ${r.viability_tier} | ${r.recommended_structure}`);
}


function agent_DealScorer(sheet, rowIndex) {
  const details = readDetails(sheet, rowIndex);

  const sys = `You are the head of acquisitions at Nissi Asset Management. Score this deal 0–100 conservatively.

Scoring weights:
- Deal Viability (Math Auditor): 25pts max
- Exit Strategy Strength: 20pts max
- Title/Lien Cleanliness: 15pts max
- Market Quality: 15pts max
- Distress Level/Motivation: 15pts max
- Sub-To Structure (if applicable): 10pts max

Benchmarks: 80–100 = Priority | 60–79 = Strong | 40–59 = Viable | 20–39 = Marginal | 0–19 = Pass

Return ONLY this JSON:
{
  "deal_score": 0,
  "score_tier": "Priority" | "Strong" | "Viable" | "Marginal" | "Pass",
  "score_breakdown": {
    "deal_viability": 0,
    "exit_strength": 0,
    "title_cleanliness": 0,
    "market_quality": 0,
    "distress_motivation": 0,
    "subto_structure": 0
  },
  "one_line_verdict": "Single sentence deal verdict for the acquisition team"
}`;

  const r = parseJSON(callClaude(`Full deal data:\n${JSON.stringify(details, null, 2)}`, sys), "DealScorer");
  writeDetails(sheet, rowIndex, { deal_scorer: r });
  sheet.getRange(rowIndex, COL.DEAL_SCORE).setValue(r.deal_score);
  setStatus(sheet, rowIndex, S.SCORE_DONE);
  Logger.log(`[DealScorer] Row ${rowIndex}: ${r.deal_score}/100 (${r.score_tier}) — ${r.one_line_verdict}`);
}


function agent_RiskAssessor(sheet, rowIndex, rawContent) {
  const details = readDetails(sheet, rowIndex);

  const sys = `You are the risk management officer at Nissi Asset Management.
Identify all material risks and mitigation strategies.

Risk categories: Title, Market, Regulatory (FL POS/OH inspection), Counterparty,
Financial (rehab overruns, vacancy), Legal (due-on-sale, deed issues).

Return ONLY this JSON:
{
  "overall_risk": "Low" | "Moderate" | "High" | "Extreme",
  "risks": [
    {
      "type": "string",
      "description": "string",
      "severity": "Low" | "Moderate" | "High",
      "mitigation": "string"
    }
  ],
  "go_no_go": "Go" | "Go with Caution" | "Needs More Info" | "No Go",
  "risk_notes": "One sentence final risk assessment"
}`;

  const r = parseJSON(callClaude(
    `All deal data:\n${JSON.stringify(details, null, 2)}\n\nRaw lead:\n${rawContent}`, sys
  ), "RiskAssessor");
  writeDetails(sheet, rowIndex, { risk_assessor: r });
  setStatus(sheet, rowIndex, S.RISK_DONE);
  Logger.log(`[RiskAssessor] Row ${rowIndex}: ${r.overall_risk} | ${r.go_no_go}`);
}


function agent_CompAnalyzer(sheet, rowIndex, rawContent) {
  const details = readDetails(sheet, rowIndex);

  const sys = `You are a comparative market analysis specialist.
Validate ARV assumptions and recommend comp search parameters.

Return ONLY this JSON:
{
  "arv_provided": null,
  "arv_assessment": "Conservative" | "Reasonable" | "Aggressive" | "Unknown",
  "comp_search_params": {
    "radius_miles": 0.5,
    "sqft_variance": 200,
    "year_built_range": 10,
    "bed_bath_match": true,
    "sold_within_days": 180
  },
  "suggested_comp_sources": ["PropStream", "Redfin", "Zillow Sold", "MLS via Agent"],
  "arv_adjustment_needed": false,
  "arv_adjustment_direction": "Increase" | "Decrease" | "None",
  "comp_notes": "One sentence on comp confidence and recommended next step"
}`;

  const r = parseJSON(callClaude(
    `Market: ${JSON.stringify(details.market_scout)}\nMath: ${JSON.stringify(details.math_auditor)}\n\nLead:\n${rawContent}`, sys
  ), "CompAnalyzer");
  writeDetails(sheet, rowIndex, { comp_analyzer: r });
  // Advance directly to POD2_DONE (comp_analyzer is the last Pod 2 agent)
  setStatus(sheet, rowIndex, S.POD2_DONE);
  Logger.log(`[CompAnalyzer] Row ${rowIndex}: ARV = ${r.arv_assessment}`);
}


// ================================================================
// PHASE 3 — NEGOTIATION & BRANDING POD (Agents 13–20)
// ================================================================

function agent_BeastModeCloser(sheet, rowIndex, rawContent) {
  const details  = readDetails(sheet, rowIndex);
  const category = sheet.getRange(rowIndex, COL.CATEGORY).getValue();
  const state    = details.market_scout?.state || "Unknown";
  const score    = sheet.getRange(rowIndex, COL.DEAL_SCORE).getValue();

  const sys = `You are the lead acquisition specialist at Nissi Asset Management LLC — a private investment firm.
You represent institutional-grade capital, not a solo wholesaler.

Tone: Warm, confident, authoritative. Never desperate. Never pushy.

State-specific messaging:
FLORIDA: Lead with "Auction Avoidance." Use: "We close before the auction date." "No courthouse steps."
OHIO: Lead with "Community Reinvestment." Use: "We're actively investing in [neighborhood]."
NC/SC: Lead with certainty and speed — cash, as-is, on your timeline.
UNKNOWN: Professional tone, speed and certainty.

Name fallback rule: If seller name is unknown, use the street name approach:
  "Hi, I'm reaching out about the property on [STREET NAME]..."
  Never use generic placeholders like [SELLER NAME].

Channel selection:
- Wholesale/Gov = short text under 160 chars
- Sub-To Standard = warm text or short email
- Sub-To High Priority = priority email — mention you move fast on the right situations
- Retail = professional email only

Return ONLY this JSON:
{
  "channel": "text" | "email",
  "subject": null,
  "message": "Full message — no generic placeholders",
  "tone_used": "Auction Avoidance" | "Community Reinvestment" | "Speed & Certainty" | "Creative Financing" | "Standard",
  "word_count": 0
}`;

  const seller = details.seller_name || null;
  const street = details.street_name || details.property_address || "your property";

  const r = parseJSON(callClaude(
    `Category: ${category} | State: ${state} | Deal Score: ${score}\nSeller: ${seller || "Unknown — use street: " + street}\n\nFull data:\n${JSON.stringify(details, null, 2)}`, sys
  ), "BeastModeCloser");
  writeDetails(sheet, rowIndex, { beast_closer: r });
  sheet.getRange(rowIndex, COL.DRAFT_RESPONSE).setValue(
    `[${r.channel.toUpperCase()}]${r.subject ? "\nSubject: " + r.subject : ""}\n\n${r.message}`
  );
  setStatus(sheet, rowIndex, S.CLOSER_DONE);
  Logger.log(`[BeastModeCloser] Row ${rowIndex}: ${r.channel} | Tone: ${r.tone_used}`);
}


function agent_ObjectionHandler(sheet, rowIndex) {
  const details = readDetails(sheet, rowIndex);

  const sys = `You are a creative deal structuring specialist at Nissi Asset Management.
Generate a "Plan B" offer for cases where a cash offer will likely be rejected.

Common objection scenarios:
- "I need more than your offer" → Seller finance / terms deal
- "I don't want to pay capital gains all at once" → Installment sale / land contract
- "I don't want to move out yet" → Leaseback option post-close
- "My family wants to keep it" → Partial interest purchase or LLC partnership
- "The agent says it's worth more" → Hybrid: partial cash now + deferred payment tied to resale

Return ONLY this JSON:
{
  "likely_objection": "string",
  "plan_b_structure": "Seller Finance" | "Installment Sale" | "Leaseback" | "Partnership" | "Hybrid Cash + Deferred" | "Lease Option",
  "plan_b_terms": {
    "down_payment": null,
    "monthly_payment": null,
    "interest_rate": null,
    "term_months": null,
    "balloon_payment": null
  },
  "plan_b_pitch": "2-sentence script for presenting Plan B to the seller",
  "objection_notes": "One sentence on why Plan B fits this seller"
}`;

  const r = parseJSON(callClaude(`Full deal data:\n${JSON.stringify(details, null, 2)}`, sys), "ObjectionHandler");
  writeDetails(sheet, rowIndex, { objection_handler: r });
  setStatus(sheet, rowIndex, S.OBJECTION_DONE);
  Logger.log(`[ObjectionHandler] Row ${rowIndex}: Plan B = ${r.plan_b_structure}`);
}


function agent_SMSDrafter(sheet, rowIndex) {
  const details = readDetails(sheet, rowIndex);
  const score   = details.deal_scorer?.deal_score || "N/A";
  const tier    = details.deal_scorer?.score_tier || "N/A";

  const sys = `You are a real estate acquisition SMS specialist at Nissi Asset Management.
Write a short internal text alert (under 140 chars) to notify the Nissi Acquisition Team
when a high-value lead has been processed. Include deal score, category, and key signal.
Sound urgent but professional. No emojis.

Return ONLY this JSON: {"sms_alert": "string under 140 chars"}`;

  const r = parseJSON(callClaude(
    `Score: ${score} | Tier: ${tier}\nAuditor: ${JSON.stringify(details.math_auditor)}\nRisk: ${details.risk_assessor?.go_no_go}`, sys
  ), "SMSDrafter");
  writeDetails(sheet, rowIndex, { sms_draft: r });
  setStatus(sheet, rowIndex, S.SMS_DONE);
  Logger.log(`[SMSDrafter] Row ${rowIndex}: "${r.sms_alert}"`);
}


function agent_AnchorSet(sheet, rowIndex) {
  const details = readDetails(sheet, rowIndex);
  const math    = details.math_auditor || {};
  const lien    = details.lien_detective || {};

  const sys = `You are the lead negotiator at Nissi Asset Management.
Set the psychological anchor price strategy before any seller call.

Rules:
- Open 20–30% below max offer to create negotiation room
- Walk-away = max offer (never exceed this number)
- Build lien payoffs into walk-away if liens are present
- Land Bank/Gov deals: anchor at $8k–$10k, walk away at $15k
- Sub-To: anchor is terms-based, not price-based — focus on monthly payment

Return ONLY this JSON:
{
  "low_anchor": null,
  "high_anchor": null,
  "walk_away_price": null,
  "opening_terms_pitch": null,
  "lien_deduction_built_in": null,
  "strategy": "Two sentences on negotiation approach for this specific seller"
}`;

  const r = parseJSON(callClaude(
    `Math: ${JSON.stringify(math)}\nLiens: ${JSON.stringify(lien)}\nSub-To: ${JSON.stringify(details.subto_analyzer)}`, sys
  ), "AnchorSet");
  writeDetails(sheet, rowIndex, { anchor_bot: r });
  setStatus(sheet, rowIndex, S.ANCHOR_DONE);
  Logger.log(`[AnchorSet] Row ${rowIndex}: Open $${r.low_anchor} | Walk $${r.walk_away_price}`);
}


function agent_SubjectLinesSet(sheet, rowIndex) {
  const details = readDetails(sheet, rowIndex);
  const closer  = details.beast_closer || {};

  if (closer.channel !== "email") {
    writeDetails(sheet, rowIndex, { subject_lines: { applicable: false, subject_lines: [] } });
    setStatus(sheet, rowIndex, S.SUBJECT_DONE);
    return;
  }

  const sys = `You are an email open-rate specialist.
Generate 3 A/B subject line variants for this real estate acquisition email.

Rules: No spam words (free, urgent, act now). No exclamation points. All under 50 chars.
- Variant A: Curiosity / pattern interrupt
- Variant B: Direct and specific (mention street name or situation)
- Variant C: Soft and human (sounds like a friend reaching out)

Return ONLY this JSON:
{
  "subject_lines": ["Variant A", "Variant B", "Variant C"],
  "recommended": "Variant A" | "Variant B" | "Variant C",
  "recommendation_reason": "One sentence"
}`;

  const street = details.street_name || details.property_address || "the property";
  const r = parseJSON(callClaude(
    `Street: ${street}\nTone: ${closer.tone_used}\nMessage excerpt: ${(closer.message || "").substring(0, 200)}`, sys
  ), "SubjectLinesSet");
  writeDetails(sheet, rowIndex, { subject_lines: r });
  setStatus(sheet, rowIndex, S.SUBJECT_DONE);
  Logger.log(`[SubjectLinesSet] Row ${rowIndex}: Recommended: ${r.recommended} — "${r.subject_lines[0]}"`);
}


function agent_SequenceBuilt(sheet, rowIndex) {
  const details  = readDetails(sheet, rowIndex);
  const category = sheet.getRange(rowIndex, COL.CATEGORY).getValue();
  const score    = details.deal_scorer?.deal_score || 0;

  const sys = `You are a real estate acquisition follow-up strategist at Nissi Asset Management.
Build a 5-touch follow-up sequence for sellers who don't respond to the initial outreach.

Rules:
- Vary channel each touch: text, email, voicemail, handwritten_note, door_knock
- Standard timeline: Days 3, 7, 14, 21, 30
- Sub-To High Priority: compress to Days 2, 5, 10, 17, 25
- Touch 5 is a "breakup message" — soft, no pressure, easy to respond
- Each touch gets shorter and softer than the last

Return ONLY this JSON:
{
  "sequence": [
    {
      "day": 3,
      "touchpoint": "text" | "email" | "voicemail" | "handwritten_note" | "door_knock",
      "core_angle": "string",
      "message": "Full message or script for this touch"
    }
  ]
}`;

  const r = parseJSON(callClaude(
    `Category: ${category} | Deal Score: ${score}\nCloser tone: ${details.beast_closer?.tone_used}\nPlan B: ${details.objection_handler?.plan_b_structure}`, sys
  ), "SequenceBuilt");
  writeDetails(sheet, rowIndex, { sequence_builder: r });
  setStatus(sheet, rowIndex, S.SEQUENCE_DONE);
  Logger.log(`[SequenceBuilt] Row ${rowIndex}: ${r.sequence.length}-touch sequence built`);
}


function agent_QualifierDone(sheet, rowIndex) {
  const details = readDetails(sheet, rowIndex);

  const sys = `You are a compliance officer at Nissi Asset Management.
Review all generated outreach messages for TCPA violations or predatory/illegal language.

Check for: unsolicited commercial text violations, debt collection language,
misrepresentation of intent, predatory urgency tactics, fair housing violations,
discriminatory language, deceptive claims about offer terms.

Return ONLY this JSON:
{
  "compliant": true,
  "violation_found": null,
  "sanitized_message_override": null
}

If non-compliant: set compliant=false, describe violation_found,
and provide a sanitized_message_override that fixes the issue.`;

  const r = parseJSON(callClaude(`All outreach content:\n${JSON.stringify(details, null, 2)}`, sys), "QualifierDone");
  writeDetails(sheet, rowIndex, { compliance_check: r });

  if (r.compliant === false && r.sanitized_message_override) {
    sheet.getRange(rowIndex, COL.DRAFT_RESPONSE).setValue(
      `[COMPLIANCE OVERRIDE — Violation: ${r.violation_found}]\n\n${r.sanitized_message_override}`
    );
    Logger.log(`[ComplianceQualifier] Row ${rowIndex}: VIOLATION FOUND — ${r.violation_found}`);
  }

  setStatus(sheet, rowIndex, S.QUALIFIER_DONE);
  Logger.log(`[ComplianceQualifier] Row ${rowIndex}: Compliant = ${r.compliant}`);
}


function agent_PDFCreated(sheet, rowIndex) {
  const details  = readDetails(sheet, rowIndex);
  const score    = sheet.getRange(rowIndex, COL.DEAL_SCORE).getValue();
  const leadId   = sheet.getRange(rowIndex, COL.LEAD_ID).getValue();
  const math     = details.math_auditor    || {};
  const exit     = details.exit_strategist || {};
  const rehab    = details.rehab_estimator || {};
  const risk     = details.risk_assessor   || {};
  const subto    = details.subto_analyzer  || {};
  const closer   = details.beast_closer    || {};
  const anchor   = details.anchor_bot      || {};
  const seq      = details.sequence_builder || {};
  const city     = details.market_scout?.city  || "Unknown City";
  const state    = details.market_scout?.state || "Unknown State";
  const docTitle = `NISSI_MEMO_${leadId}_${city.toUpperCase()}_Score${score}`;

  const memoBody = `
NISSI ASSET MANAGEMENT LLC
CONFIDENTIAL INVESTMENT MEMORANDUM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DEAL ID: ${leadId}
DEAL SCORE: ${score}/100 (${details.deal_scorer?.score_tier || "N/A"})
VERDICT: ${details.deal_scorer?.one_line_verdict || "N/A"}
DATE: ${new Date().toLocaleDateString()}

━━━ PROPERTY OVERVIEW ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Address:          ${details.property_address || "TBD"}
City / State:     ${city}, ${state}
Condition:        ${details.vision_scout?.estimated_condition || "TBD"}
Zombie Score:     ${details.vision_scout?.zombie_score ?? "N/A"}/100
Distress Signals: ${(details.vision_scout?.distress_signals || []).join(", ") || "None"}
Owner Type:       ${details.skip_tracer?.owner_type || "Unknown"}
Skip Trace Needed: ${details.skip_tracer?.skip_trace_recommended ? "YES" : "No"}

━━━ ACQUISITION ECONOMICS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Entry Cost Estimate: $${math.entry_cost_estimate?.toLocaleString() || "TBD"}
ARV Estimate:        $${math.arv_estimate?.toLocaleString() || "TBD"}
Max Offer:           $${math.max_offer?.toLocaleString() || "TBD"}
Opening Anchor:      $${anchor.low_anchor?.toLocaleString() || "TBD"}
Walk-Away Price:     $${anchor.walk_away_price?.toLocaleString() || "TBD"}
Deal Viability:      ${math.deal_viability || "TBD"}
Auditor Notes:       ${math.auditor_notes || "N/A"}

━━━ REHAB ESTIMATE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Complexity:      ${rehab.rehab_complexity || "TBD"}
Low Estimate:    $${rehab.total_rehab_low?.toLocaleString() || "TBD"}
High Estimate:   $${rehab.total_rehab_high?.toLocaleString() || "TBD"}
Exceeds Land Bank Budget: ${rehab.exceeds_land_bank_budget ? "YES — FLAG" : "No"}

━━━ EXIT STRATEGY ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Recommended Exit:   ${exit.recommended_exit || "TBD"}
BRRRR Cash-on-Cash: ${exit.brrrr?.cash_on_cash_return || "N/A"}%
BRRRR Monthly Flow: $${exit.brrrr?.monthly_cash_flow?.toLocaleString() || "N/A"}
Wholesale Fee:      $${exit.wholesale?.assignment_fee?.toLocaleString() || "N/A"}
Wrap Monthly Spread:$${exit.creative_wrap?.monthly_spread_income?.toLocaleString() || "N/A"}/mo
Notes: ${exit.exit_notes || "N/A"}

${subto.applicable !== false ? `━━━ SUBJECT-TO ANALYSIS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Viability Tier:       ${subto.viability_tier || "N/A"}
Underlying Rate:      ${subto.underlying_rate || "N/A"}%
Monthly Payment:      $${subto.monthly_payment?.toLocaleString() || "N/A"}
Due-on-Sale Risk:     ${subto.due_on_sale_risk || "N/A"}
Recommended Structure:${subto.recommended_structure || "N/A"}
Wrap Viable: ${subto.wrap_viable ? "Yes — $" + (subto.monthly_wrap_spread || "TBD") + "/mo spread" : "No"}
` : "━━━ SUBJECT-TO: Not Applicable ━━━━━━━━━━━━━━━━━━━━━━"}

━━━ TITLE & LIEN STATUS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Title Risk:          ${details.lien_detective?.title_risk || "TBD"}
Liens Found:         ${details.lien_detective?.liens_detected ? (details.lien_detective?.lien_types || []).join(", ") : "None detected"}
Lien Total Estimate: $${details.lien_detective?.estimated_lien_total?.toLocaleString() || "N/A"}
Negotiation Impact:  ${details.lien_detective?.negotiation_impact || "N/A"}
IRS Lien:            ${details.lien_detective?.irs_lien_present ? "YES — CRITICAL" : "No"}

━━━ RISK ASSESSMENT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Overall Risk: ${risk.overall_risk || "TBD"}
Go/No-Go:     ${risk.go_no_go || "TBD"}
${(risk.risks || []).map(r => `- ${r.type} (${r.severity}): ${r.description}\n  Mitigation: ${r.mitigation}`).join("\n")}

━━━ COMPLIANCE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Outreach Compliant: ${details.compliance_check?.compliant ? "Yes" : "NO — OVERRIDE APPLIED"}
${details.compliance_check?.compliant === false ? "Violation: " + (details.compliance_check?.violation_found || "N/A") : ""}

━━━ OUTREACH DRAFTED ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Channel:      ${closer.channel?.toUpperCase() || "TBD"}
Tone:         ${closer.tone_used || "TBD"}
Plan B:       ${details.objection_handler?.plan_b_structure || "N/A"}
Plan B Pitch: ${details.objection_handler?.plan_b_pitch || "N/A"}

━━━ FOLLOW-UP SEQUENCE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${(seq.sequence || []).map(t => `Day ${t.day} [${t.touchpoint.toUpperCase()}]: ${t.core_angle}`).join("\n")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nissi Asset Management LLC | Private & Confidential
Generated: ${new Date().toLocaleString()}
  `.trim();

  try {
    const doc  = DocumentApp.create(docTitle);
    const body = doc.getBody();
    body.setText(memoBody);
    body.setFontFamily("Courier New");
    doc.saveAndClose();

    const file = DriveApp.getFileById(doc.getId());
    if (GOOGLE_DRIVE_FOLDER_ID !== "PASTE_YOUR_FOLDER_ID") {
      DriveApp.getFolderById(GOOGLE_DRIVE_FOLDER_ID).addFile(file);
      DriveApp.getRootFolder().removeFile(file);
    }

    sheet.getRange(rowIndex, COL.PDF_LINK).setValue(doc.getUrl());
    writeDetails(sheet, rowIndex, { pdf_memo: { url: doc.getUrl(), title: docTitle } });
    setStatus(sheet, rowIndex, S.PDF_DONE);
    Logger.log(`[PDFCreated] Row ${rowIndex}: ${doc.getUrl()}`);

  } catch(e) {
    sheet.getRange(rowIndex, COL.STATUS).setValue(`ERROR (PDF): ${e.message}`);
    Logger.log(`[PDFCreated] Row ${rowIndex} ERROR: ${e.message}`);
  }
}


// ================================================================
// AGENT 21 — AUTO-EMAIL SENDER
// ================================================================

function agent_AutoEmailSender(sheet, rowIndex) {
  const details    = readDetails(sheet, rowIndex);
  const score      = Number(sheet.getRange(rowIndex, COL.DEAL_SCORE).getValue());
  const draftCol   = sheet.getRange(rowIndex, COL.DRAFT_RESPONSE).getValue();
  const compliance = details.compliance_check || {};
  const closer     = details.beast_closer     || {};
  const subjectObj = details.subject_lines    || {};

  const markDone = (emailStatusMsg, logEntry) => {
    writeDetails(sheet, rowIndex, { auto_email: logEntry });
    sheet.getRange(rowIndex, COL.EMAIL_STATUS).setValue(emailStatusMsg);
    sheet.getRange(rowIndex, COL.PROCESSED_AT).setValue(new Date().toLocaleString());
    setStatus(sheet, rowIndex, S.COMPLETE);
  };

  // Safety gate: score threshold
  if (score < EMAIL_SCORE_THRESHOLD) {
    markDone(`SKIPPED — Score ${score}`, { sent: false, reason: `Score ${score} below threshold of ${EMAIL_SCORE_THRESHOLD}` });
    return;
  }

  // Safety gate: compliance (use strict === false so missing compliance_check doesn't block)
  if (compliance.compliant === false) {
    markDone("BLOCKED — Compliance Failed", { sent: false, reason: "TCPA compliance failed — manual review required" });
    return;
  }

  // Safety gate: channel must be email
  if (closer.channel !== "email") {
    markDone(`SKIPPED — Channel is ${closer.channel}`, { sent: false, reason: `Channel is ${closer.channel} — use SMS/text output instead` });
    return;
  }

  const sellerEmail = details.email || details.seller_email || null;
  if (!sellerEmail) {
    markDone("NO EMAIL — Manual Required", { sent: false, reason: "No seller email found — manual send required" });
    return;
  }

  // Build message body
  let messageBody = draftCol || closer.message || "";
  if (messageBody.startsWith("[EMAIL]")) {
    messageBody = messageBody.replace(/^\[EMAIL\]\n?(Subject:[^\n]*)?\n\n?/, "").trim();
  }

  // Pick subject line from A/B variants
  let subject = closer.subject || "Reaching out about your property";
  if (subjectObj.subject_lines?.length) {
    const rec = (subjectObj.recommended || "Variant A").toLowerCase();
    if      (rec.includes("a") || rec.includes("1")) subject = subjectObj.subject_lines[0] || subject;
    else if (rec.includes("b") || rec.includes("2")) subject = subjectObj.subject_lines[1] || subject;
    else if (rec.includes("c") || rec.includes("3")) subject = subjectObj.subject_lines[2] || subject;
  }

  const fullBody = messageBody + `\n\n—\n${EMAIL_SENDER_NAME}\nPrivate Real Estate Acquisitions`;

  try {
    GmailApp.sendEmail(sellerEmail, subject, fullBody, {
      name:    EMAIL_SENDER_NAME,
      replyTo: EMAIL_REPLY_TO
    });

    const sentAt = new Date().toLocaleString();
    markDone(`SENT ${sentAt}`, {
      sent:          true,
      sent_to:       sellerEmail,
      subject:       subject,
      sent_at:       sentAt,
      score_at_send: score,
      body_preview:  messageBody.substring(0, 300)
    });
    Logger.log(`[AutoEmail] Row ${rowIndex}: SENT to ${sellerEmail} | Subject: "${subject}"`);

  } catch(e) {
    sheet.getRange(rowIndex, COL.STATUS).setValue(`ERROR (AutoEmail): ${e.message}`);
    sheet.getRange(rowIndex, COL.EMAIL_STATUS).setValue(`ERROR: ${e.message}`);
    Logger.log(`[AutoEmail] Row ${rowIndex}: FAILED — ${e.message}`);
  }
}


// ================================================================
// AGENT 22 — FOLLOW-UP EXECUTOR
// Set on a separate daily trigger (9am).
// ================================================================

function agent_FollowUpExecutor() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) return;
  const rows  = sheet.getDataRange().getValues();
  const today = new Date();
  let sent    = 0;

  for (let i = 1; i < rows.length; i++) {
    const rowIndex = i + 1;
    const status   = rows[i][COL.STATUS - 1];
    if (status !== S.COMPLETE) continue;

    const details   = readDetails(sheet, rowIndex);
    const autoEmail = details.auto_email || {};
    const sequence  = details.sequence_builder?.sequence || [];
    if (!autoEmail.sent_at || !sequence.length) continue;

    const sentDate  = new Date(autoEmail.sent_at);
    const daysSince = Math.floor((today - sentDate) / (1000 * 60 * 60 * 24));
    const followUps = details.follow_up_log || [];

    sequence.forEach(touch => {
      if (touch.day > daysSince) return;
      if (followUps.some(f => f.day === touch.day)) return;

      if (touch.touchpoint === "email") {
        const toEmail = details.email || details.seller_email;
        if (!toEmail) return;

        try {
          GmailApp.sendEmail(
            toEmail,
            `Following up — ${details.street_name || details.property_address || "your property"}`,
            touch.message + `\n\n—\n${EMAIL_SENDER_NAME}`,
            { name: EMAIL_SENDER_NAME, replyTo: EMAIL_REPLY_TO }
          );
          followUps.push({ day: touch.day, touchpoint: "email", sent_at: new Date().toLocaleString(), status: "sent" });
          sent++;
          Logger.log(`[FollowUpExecutor] Row ${rowIndex}: Day ${touch.day} email sent`);
        } catch(e) {
          Logger.log(`[FollowUpExecutor] Row ${rowIndex}: Day ${touch.day} error — ${e.message}`);
        }

      } else {
        followUps.push({
          day:        touch.day,
          touchpoint: touch.touchpoint,
          logged_at:  new Date().toLocaleString(),
          status:     "MANUAL REQUIRED",
          message:    touch.message
        });
        Logger.log(`[FollowUpExecutor] Row ${rowIndex}: Day ${touch.day} — manual ${touch.touchpoint} logged`);
      }
    });

    writeDetails(sheet, rowIndex, { follow_up_log: followUps });
    Utilities.sleep(500);
  }

  Logger.log(`[FollowUpExecutor] Done. ${sent} follow-up emails sent.`);
}


// ================================================================
// HUNTERS — autonomously find and ingest leads
// ================================================================

function hunter_DealSurgeImport() {
  const sheet   = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const folders = DriveApp.getFoldersByName(DEAL_SURGE_FOLDER_NAME);
  if (!folders.hasNext()) {
    Logger.log(`[DealSurgeHunter] Folder not found: "${DEAL_SURGE_FOLDER_NAME}"`);
    return;
  }

  const folder      = folders.next();
  const files       = folder.getFilesByType(MimeType.CSV);
  const existingIds = sheet.getRange(2, COL.LEAD_ID, Math.max(sheet.getLastRow() - 1, 1), 1)
    .getValues().flat().map(v => v.toString());

  while (files.hasNext()) {
    const file     = files.next();
    const fileName = file.getName();
    if (fileName.startsWith("IMPORTED_")) continue;

    Logger.log(`[DealSurgeHunter] Processing: ${fileName}`);
    const csv  = file.getBlob().getDataAsString();
    const rows = Utilities.parseCsv(csv);
    if (rows.length < 2) { file.setName("IMPORTED_" + fileName); continue; }

    const headers = rows[0].map(h => h.toLowerCase().trim());
    const idx = {
      address:  headers.findIndex(h => h.includes("address") || h.includes("street")),
      city:     headers.findIndex(h => h === "city"),
      state:    headers.findIndex(h => h === "state"),
      zip:      headers.findIndex(h => h.includes("zip")),
      owner:    headers.findIndex(h => h.includes("owner") && !h.includes("mail")),
      phone:    headers.findIndex(h => h.includes("phone")),
      email:    headers.findIndex(h => h.includes("email")),
      beds:     headers.findIndex(h => h.includes("bed")),
      baths:    headers.findIndex(h => h.includes("bath")),
      sqft:     headers.findIndex(h => h.includes("sqft") || h.includes("sq ft")),
      year:     headers.findIndex(h => h.includes("year")),
      value:    headers.findIndex(h => h.includes("value") || h.includes("arv") || h.includes("avm")),
      equity:   headers.findIndex(h => h.includes("equity")),
      mortgage: headers.findIndex(h => h.includes("mortgage") || h.includes("balance")),
      leadType: headers.findIndex(h => h.includes("lead type") || h.includes("list type")),
      aiScore:  headers.findIndex(h => h.includes("score") || h.includes("ai")),
      mailing:  headers.findIndex(h => h.includes("mailing") || h.includes("mail address")),
    };

    let imported = 0;
    for (let i = 1; i < rows.length; i++) {
      const r       = rows[i];
      const address = idx.address >= 0 ? r[idx.address]?.trim() : null;
      if (!address) continue;

      const leadId = `DS-${address.replace(/\s+/g, "-").toUpperCase()}-${r[idx.zip] || ""}`;
      if (existingIds.includes(leadId)) continue;

      const g       = (colIdx) => (colIdx >= 0 ? r[colIdx] : "");
      const mailing = g(idx.mailing);
      const rawContent = [
        `DEAL SURGE LEAD | File: ${fileName}`,
        `Address: ${address}, ${g(idx.city)}, ${g(idx.state)} ${g(idx.zip)}`,
        (g(idx.beds) || g(idx.baths) || g(idx.sqft)) ? `Property: ${g(idx.beds)} bed / ${g(idx.baths)} bath, ${g(idx.sqft)} sqft, built ${g(idx.year)}` : null,
        g(idx.value)    ? `Estimated Value/ARV: $${g(idx.value)}`         : null,
        g(idx.equity)   ? `Equity: $${g(idx.equity)}`                    : null,
        g(idx.mortgage) ? `Mortgage Balance: $${g(idx.mortgage)}`        : null,
        g(idx.leadType) ? `Lead Type: ${g(idx.leadType)}`                : null,
        g(idx.aiScore)  ? `Deal Surge AI Score: ${g(idx.aiScore)}/1000`  : null,
        g(idx.owner)    ? `Owner: ${g(idx.owner)}`                        : null,
        (mailing && mailing !== address) ? `Owner Mailing Address: ${mailing} (ABSENTEE OWNER)` : null,
        g(idx.phone)    ? `Phone: ${g(idx.phone)}`                        : null,
        g(idx.email)    ? `Email: ${g(idx.email)}`                        : null,
      ].filter(Boolean).join("\n");

      const category = detectCategory(g(idx.leadType));

      const lastRow = sheet.getLastRow() + 1;
      sheet.getRange(lastRow, COL.LEAD_ID).setValue(leadId);
      sheet.getRange(lastRow, COL.RAW_CONTENT).setValue(rawContent);
      sheet.getRange(lastRow, COL.CATEGORY).setValue(category);
      sheet.getRange(lastRow, COL.STATUS).setValue(S.NEW);
      existingIds.push(leadId);
      imported++;
    }

    Logger.log(`[DealSurgeHunter] Imported ${imported} new leads from ${fileName}`);
    file.setName("IMPORTED_" + fileName);
  }
}


function hunter_GmailLeads() {
  const sheet       = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const existingIds = sheet.getRange(2, COL.LEAD_ID, Math.max(sheet.getLastRow() - 1, 1), 1)
    .getValues().flat().map(v => v.toString());

  const threads = GmailApp.search(
    "subject:(deal OR wholesale OR motivated OR distressed OR foreclosure OR \"for sale\") newer_than:3d",
    0, 20
  );

  threads.forEach(thread => {
    const msg   = thread.getMessages()[0];
    const msgId = msg.getId();
    if (existingIds.includes(msgId)) return;

    const subject = msg.getSubject();
    const body    = msg.getPlainBody().substring(0, 2000);
    const sender  = msg.getFrom();
    const date    = msg.getDate().toLocaleDateString();

    const rawContent = `EMAIL LEAD\nFrom: ${sender}\nDate: ${date}\nSubject: ${subject}\n\n${body}`;
    const category   = detectCategory(subject + " " + body);
    const lastRow    = sheet.getLastRow() + 1;

    sheet.getRange(lastRow, COL.LEAD_ID).setValue(msgId);
    sheet.getRange(lastRow, COL.RAW_CONTENT).setValue(rawContent);
    sheet.getRange(lastRow, COL.CATEGORY).setValue(category);
    sheet.getRange(lastRow, COL.STATUS).setValue(S.NEW);
    existingIds.push(msgId);
    Logger.log(`[GmailHunter] Imported "${subject}" from ${sender} as [${category}]`);
  });
}


// ================================================================
// CENTRAL CONTROLLER — one agent per trigger run
// ================================================================

function runCentralOrchestrator() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) { Logger.log(`Sheet "${SHEET_NAME}" not found.`); return; }

  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const rowIndex = i + 1;
    const raw      = data[i][COL.RAW_CONTENT - 1];
    let   status   = data[i][COL.STATUS - 1];

    if (!raw) continue;
    if (status === S.COMPLETE) continue;
    if (status && status.includes("HALTED")) continue;
    if (status && status.startsWith("ERROR")) continue;

    if (!status || status === "") {
      status = S.NEW;
      setStatus(sheet, rowIndex, S.NEW);
    }

    try {
      // Phase 1
      if (status === S.NEW)          { agent_GovSniper(sheet, rowIndex, raw);        return; }
      if (status === S.GOV_DONE)     { agent_VisionScout(sheet, rowIndex);           return; }
      if (status === S.VISION_DONE)  { agent_MarketScout(sheet, rowIndex, raw);      return; }
      if (status === S.MARKET_DONE)  { agent_SkipTracer(sheet, rowIndex, raw);       return; }
      // Phase 2
      if (status === S.POD1_DONE)    { agent_MathAuditor(sheet, rowIndex, raw);      return; }
      if (status === S.MATH_DONE)    { agent_RehabEstimator(sheet, rowIndex);        return; }
      if (status === S.REHAB_DONE)   { agent_ExitStrategist(sheet, rowIndex);        return; }
      if (status === S.EXIT_DONE)    { agent_LienDetective(sheet, rowIndex, raw);    return; }
      if (status === S.LIEN_DONE)    { agent_SubToAnalyzer(sheet, rowIndex, raw);    return; }
      if (status === S.SUBTO_DONE)   { agent_DealScorer(sheet, rowIndex);            return; }
      if (status === S.SCORE_DONE)   { agent_RiskAssessor(sheet, rowIndex, raw);     return; }
      if (status === S.RISK_DONE)    { agent_CompAnalyzer(sheet, rowIndex, raw);     return; }
      // Phase 3
      if (status === S.POD2_DONE)       { agent_BeastModeCloser(sheet, rowIndex, raw);  return; }
      if (status === S.CLOSER_DONE)     { agent_ObjectionHandler(sheet, rowIndex);       return; }
      if (status === S.OBJECTION_DONE)  { agent_SMSDrafter(sheet, rowIndex);             return; }
      if (status === S.SMS_DONE)        { agent_AnchorSet(sheet, rowIndex);              return; }
      if (status === S.ANCHOR_DONE)     { agent_SubjectLinesSet(sheet, rowIndex);        return; }
      if (status === S.SUBJECT_DONE)    { agent_SequenceBuilt(sheet, rowIndex);          return; }
      if (status === S.SEQUENCE_DONE)   { agent_QualifierDone(sheet, rowIndex);          return; }
      if (status === S.QUALIFIER_DONE)  { agent_PDFCreated(sheet, rowIndex);             return; }
      if (status === S.PDF_DONE)        { agent_AutoEmailSender(sheet, rowIndex);        return; }

    } catch(err) {
      sheet.getRange(rowIndex, COL.STATUS).setValue(`ERROR: ${err.message}`);
      Logger.log(`[Orchestrator] Row ${rowIndex} FAILED: ${err.message}`);
      return;
    }
  }

  Logger.log("[Orchestrator] All leads fully processed.");
}


// ================================================================
// BATCH RUNNER — manual use only (runs all agents on one lead)
// Do NOT set as a trigger — it will hit the 6-minute execution limit.
// ================================================================

function runSwarmOnActiveLeads() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) { Logger.log(`Sheet "${SHEET_NAME}" not found.`); return; }

  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const rowIndex   = i + 1;
    const rawContent = data[i][COL.RAW_CONTENT - 1];
    const status     = data[i][COL.STATUS - 1];

    if (!rawContent) continue;
    // Only pick up truly new leads (empty status or S.NEW)
    if (status && status !== S.NEW) continue;

    sheet.getRange(rowIndex, COL.STATUS).setValue("In Progress...");
    SpreadsheetApp.flush();

    try {
      Logger.log(`[BatchRunner] Row ${rowIndex}: Starting all agents...`);
      agent_GovSniper(sheet, rowIndex, rawContent);
      agent_VisionScout(sheet, rowIndex);
      agent_MarketScout(sheet, rowIndex, rawContent);
      agent_SkipTracer(sheet, rowIndex, rawContent);
      agent_MathAuditor(sheet, rowIndex, rawContent);
      agent_RehabEstimator(sheet, rowIndex);
      agent_ExitStrategist(sheet, rowIndex);
      agent_LienDetective(sheet, rowIndex, rawContent);
      agent_SubToAnalyzer(sheet, rowIndex, rawContent);
      agent_DealScorer(sheet, rowIndex);
      agent_RiskAssessor(sheet, rowIndex, rawContent);
      agent_CompAnalyzer(sheet, rowIndex, rawContent);
      agent_BeastModeCloser(sheet, rowIndex, rawContent);
      agent_ObjectionHandler(sheet, rowIndex);
      agent_SMSDrafter(sheet, rowIndex);
      agent_AnchorSet(sheet, rowIndex);
      agent_SubjectLinesSet(sheet, rowIndex);
      agent_SequenceBuilt(sheet, rowIndex);
      agent_QualifierDone(sheet, rowIndex);
      agent_PDFCreated(sheet, rowIndex);
      agent_AutoEmailSender(sheet, rowIndex);
      Logger.log(`[BatchRunner] Row ${rowIndex}: Complete.`);
    } catch(err) {
      sheet.getRange(rowIndex, COL.STATUS).setValue(`ERROR: ${err.message}`);
      sheet.getRange(rowIndex, COL.MISSING_INFO).setValue(err.message);
      Logger.log(`[BatchRunner] Row ${rowIndex} ERROR: ${err.message}`);
    }

    // One lead per manual run — call again to process the next
    break;
  }
}


// ================================================================
// MASTER AUTONOMOUS TRIGGER — set on 30-minute timer
// ================================================================

function runFullAutonomousSwarm() {
  hunter_DealSurgeImport();
  hunter_GmailLeads();
  runCentralOrchestrator();
}


// ================================================================
// SETUP — run once to initialize the spreadsheet and triggers
// ================================================================

/**
 * Run this ONCE after pasting the script.
 * Creates the Leads sheet with headers and sets up all time triggers.
 */
function setupSwarm() {
  validateConfig();
  initializeSheetHeaders();
  setupTriggers();
  Logger.log("[Setup] Swarm is ready. Add leads to the Leads sheet and wait for the trigger.");
}

function initializeSheetHeaders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

  const headers = [
    "Lead ID", "Raw Content", "Category", "Property Details (JSON)",
    "Missing Info", "Draft Response", "Status", "Processed At",
    "Image URL", "PDF Link", "Deal Score", "Email Sent Status"
  ];
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setFontWeight("bold");
  headerRange.setBackground("#1a1a2e");
  headerRange.setFontColor("#ffffff");
  sheet.setFrozenRows(1);
  sheet.setColumnWidth(COL.RAW_CONTENT, 300);
  sheet.setColumnWidth(COL.PROPERTY_DETAILS, 400);
  sheet.setColumnWidth(COL.DRAFT_RESPONSE, 300);
  Logger.log(`[Setup] Sheet "${SHEET_NAME}" initialized with headers.`);
}

function setupTriggers() {
  // Remove any existing triggers to prevent duplicates
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));

  // Main swarm loop — every 30 minutes
  ScriptApp.newTrigger("runFullAutonomousSwarm")
    .timeBased()
    .everyMinutes(30)
    .create();

  // Follow-up sender — daily at 9am
  ScriptApp.newTrigger("agent_FollowUpExecutor")
    .timeBased()
    .atHour(9)
    .everyDays(1)
    .create();

  Logger.log("[Setup] Triggers created: runFullAutonomousSwarm (every 30min), agent_FollowUpExecutor (9am daily)");
}

function validateConfig() {
  const issues = [];
  const props  = PropertiesService.getScriptProperties();

  if (!props.getProperty("ANTHROPIC_API_KEY"))
    issues.push("MISSING: ANTHROPIC_API_KEY — set in Project Settings > Script Properties");
  if (GOOGLE_DRIVE_FOLDER_ID === "PASTE_YOUR_FOLDER_ID")
    issues.push("MISSING: GOOGLE_DRIVE_FOLDER_ID — paste your Drive folder ID in the config section");

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet)
    issues.push(`MISSING: Sheet tab named "${SHEET_NAME}" — run initializeSheetHeaders() first`);

  if (issues.length) {
    Logger.log("[Config] ⚠ ISSUES FOUND — fix before running:\n" + issues.map(s => "  • " + s).join("\n"));
  } else {
    Logger.log("[Config] All configuration checks passed.");
  }
  return issues;
}


// ================================================================
// UTILITIES — manual helpers
// ================================================================

/** Reset a lead row to NEW so the swarm reprocesses it from the start. */
function resetLead(rowIndex) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  sheet.getRange(rowIndex, COL.STATUS).setValue(S.NEW);
  sheet.getRange(rowIndex, COL.PROPERTY_DETAILS).setValue("");
  sheet.getRange(rowIndex, COL.DRAFT_RESPONSE).setValue("");
  sheet.getRange(rowIndex, COL.MISSING_INFO).setValue("");
  sheet.getRange(rowIndex, COL.DEAL_SCORE).setValue("");
  sheet.getRange(rowIndex, COL.EMAIL_STATUS).setValue("");
  sheet.getRange(rowIndex, COL.PDF_LINK).setValue("");
  sheet.getRange(rowIndex, COL.PROCESSED_AT).setValue("");
  Logger.log(`[Reset] Row ${rowIndex} reset to ${S.NEW}`);
}

/** Print a health summary of all leads in the Logger. */
function swarmStatusReport() {
  const sheet  = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const rows   = sheet.getDataRange().getValues();
  const counts = {};
  let totalScore = 0, scored = 0;

  for (let i = 1; i < rows.length; i++) {
    if (!rows[i][COL.RAW_CONTENT - 1]) continue;
    const status = rows[i][COL.STATUS - 1] || "New";
    counts[status] = (counts[status] || 0) + 1;
    const score = Number(rows[i][COL.DEAL_SCORE - 1]);
    if (score > 0) { totalScore += score; scored++; }
  }

  Logger.log("========== NISSI SWARM STATUS ==========");
  Object.entries(counts).sort().forEach(([s, c]) => Logger.log(`  ${s}: ${c} lead(s)`));
  Logger.log(`  Average Deal Score: ${scored ? (totalScore / scored).toFixed(1) : "N/A"}`);
  Logger.log(`  Total Scored Leads: ${scored}`);
  Logger.log("=========================================");
}
