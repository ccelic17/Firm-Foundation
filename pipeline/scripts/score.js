'use strict';

const SCORE_VERSION = '1.0.0';

/**
 * Calculate distress score (0–100) from distress_signals.
 */
function calcDistressScore(distress, scoringConfig) {
  const pts = scoringConfig.distress_signal_points;
  let raw = 0;

  // Tax delinquency — tiered by years
  if (distress.tax_delinquent) {
    const years = distress.tax_years_delinquent;
    if (years >= 3) raw += pts.tax_delinquent_3yr_plus;
    else if (years === 2) raw += pts.tax_delinquent_2yr;
    else if (years === 1) raw += pts.tax_delinquent_1yr;
    else raw += pts.tax_delinquent_1yr; // unknown years — credit minimum
  }

  // Foreclosure signals — pick the most severe applicable
  if (distress.foreclosure_stage === 'auction_scheduled') {
    raw += pts.foreclosure_stage_auction;
  } else if (distress.foreclosure_stage === 'notice_of_sale') {
    raw += pts.foreclosure_stage_auction;
  } else if (distress.foreclosure_stage === 'pre_foreclosure' || distress.lis_pendens || distress.nod_filed) {
    raw += distress.nod_filed ? pts.nod_filed : pts.lis_pendens_active;
  }

  // Probate / inherited
  if (distress.probate) raw += pts.probate;
  else if (distress.inherited) raw += pts.inherited;

  // Code violations
  const violations = distress.code_violation_count || (distress.code_violations ? 1 : 0);
  if (violations >= 2) raw += pts.code_violations_2plus;
  else if (violations === 1) raw += pts.code_violations_1;

  // Vacant
  if (distress.vacant_confirmed) raw += pts.vacant_confirmed;
  else if (distress.vacant) raw += pts.vacant_unconfirmed;

  // Bankruptcy
  if (distress.bankruptcy) raw += pts.bankruptcy_active;

  // Divorce
  if (distress.divorce) raw += pts.divorce;

  // Stacking bonus
  const count = distress.signal_count || 0;
  const bonus = scoringConfig.stacking_bonus;
  if (count >= 4) raw += bonus['4plus_signals'];
  else if (count === 3) raw += bonus['3_signals'];
  else if (count === 2) raw += bonus['2_signals'];

  return Math.min(raw, scoringConfig.distress_score_cap);
}

/**
 * Calculate equity score (0–100) using tiered lookup table.
 */
function calcEquityScore(equityPct, scoringConfig) {
  if (equityPct === null || equityPct === undefined) return null;
  const table = scoringConfig.equity_score_table;
  for (const tier of table) {
    if (equityPct >= tier.min_pct) return tier.score;
  }
  return 0;
}

/**
 * Calculate motivation score addons from time-sensitive signals.
 */
function calcMotivationScore(lead, scoringConfig) {
  const mpts = scoringConfig.motivation_score_factors;
  const distress = lead.distress_signals;
  let score = 0;

  const now = new Date();
  const daysUntil = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d) ? null : Math.ceil((d - now) / (1000 * 60 * 60 * 24));
  };

  // Tax deed auction urgency
  const taxAuctionDays = daysUntil(distress.tax_deed_auction_date);
  if (taxAuctionDays !== null) {
    if (taxAuctionDays <= 90) score += mpts.tax_auction_within_90_days;
    else if (taxAuctionDays <= 180) score += mpts.tax_auction_within_180_days;
  }

  // Foreclosure auction urgency
  const fcAuctionDays = daysUntil(distress.foreclosure_auction_date);
  if (fcAuctionDays !== null && fcAuctionDays <= 60) {
    score += mpts.foreclosure_auction_within_60_days;
  }

  // Out-of-state absentee
  if (lead.owner.is_out_of_state) score += mpts.out_of_state_absentee;

  // Multiple liens
  if (lead.valuation?.lien_count > 1) score += mpts.multiple_liens;

  return Math.min(score, 100);
}

/**
 * Assign a priority tier (1–4) from composite score.
 */
function assignTier(compositeScore, scoringConfig) {
  const tiers = scoringConfig.priority_tiers;
  if (compositeScore >= tiers['1'].min_score) return 1;
  if (compositeScore >= tiers['2'].min_score) return 2;
  if (compositeScore >= tiers['3'].min_score) return 3;
  return 4;
}

/**
 * Compute data quality score (0–100) based on field presence.
 */
function calcDataQualityScore(lead, scoringConfig) {
  const weights = scoringConfig.data_quality_weights;
  let earned = 0;

  if (lead.property.parcel_id) earned += weights.has_parcel_id;
  if (lead.owner.phone_1 || lead.owner.phone_2) earned += weights.has_phone;
  if (lead.owner.email_1) earned += weights.has_email;
  if (lead.owner.mailing_address?.street) earned += weights.has_mailing_address;
  if (lead.property.year_built) earned += weights.has_year_built;
  if (lead.property.sqft_living) earned += weights.has_sqft;
  if (lead.property.beds !== null && lead.property.baths !== null) earned += weights.has_beds_baths;
  if (lead.valuation.last_sale_price) earned += weights.has_last_sale;
  if (lead.valuation.estimated_equity_pct !== null) earned += weights.has_equity_estimate;

  return earned;
}

/**
 * Score a single lead and mutate lead_scoring + metadata.
 *
 * @param {Object} lead - Canonical lead record (must have passed filter)
 * @param {Object} scoringConfig - Parsed scoring.json
 * @returns {Object} The mutated lead (same reference)
 */
function scoreLead(lead, scoringConfig) {
  const distressScore = calcDistressScore(lead.distress_signals, scoringConfig);
  const equityScore = calcEquityScore(lead.valuation.estimated_equity_pct, scoringConfig);
  const motivationScore = calcMotivationScore(lead, scoringConfig);

  // Composite = distress × weight + equity × weight (motivation used as tiebreaker bonus)
  let composite = null;
  if (equityScore !== null) {
    composite = (distressScore * scoringConfig.weights.distress) +
                (equityScore * scoringConfig.weights.equity);
    // Motivation adds up to +10 as a tiebreaker
    composite = Math.min(100, composite + (motivationScore * 0.10));
    composite = Math.round(composite * 10) / 10;
  } else {
    // No equity data — score distress only, cap at Tier 3 max
    composite = Math.min(54, distressScore * scoringConfig.weights.distress);
    composite = Math.round(composite * 10) / 10;
  }

  const tier = assignTier(composite, scoringConfig);
  const dataQuality = calcDataQualityScore(lead, scoringConfig);

  lead.lead_scoring = {
    distress_score: distressScore,
    equity_score: equityScore,
    motivation_score: motivationScore,
    composite_score: composite,
    priority_tier: tier,
    scored_at: new Date().toISOString(),
    score_version: SCORE_VERSION
  };

  lead.metadata.data_quality_score = dataQuality;
  lead.metadata.updated_at = new Date().toISOString();

  // Tag tier for easy CRM filtering
  lead.pipeline_status.tags = lead.pipeline_status.tags.filter(t => !t.startsWith('tier_'));
  lead.pipeline_status.tags.push(`tier_${tier}`);

  // Auto-tag hyper-focus counties
  const tierLabel = scoringConfig.priority_tiers[String(tier)]?.label;
  if (tierLabel) lead.pipeline_status.tags.push(`priority_${tierLabel.toLowerCase()}`);

  return lead;
}

/**
 * Score an array of leads. Only leads with filter_status='pass' are scored.
 *
 * @param {Object[]} leads
 * @param {Object} scoringConfig
 * @returns {{ scored: Object[], skipped: Object[] }}
 */
function scoreBatch(leads, scoringConfig) {
  const scored = [];
  const skipped = [];

  for (const lead of leads) {
    if (lead.pipeline_status.filter_status !== 'pass') {
      skipped.push(lead);
    } else {
      scoreLead(lead, scoringConfig);
      scored.push(lead);
    }
  }

  return { scored, skipped };
}

/**
 * Group scored leads by tier.
 */
function groupByTier(scoredLeads) {
  return scoredLeads.reduce((acc, lead) => {
    const tier = lead.lead_scoring.priority_tier;
    if (!acc[tier]) acc[tier] = [];
    acc[tier].push(lead);
    return acc;
  }, {});
}

module.exports = { scoreLead, scoreBatch, groupByTier, calcDistressScore, calcEquityScore };
