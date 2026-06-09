'use strict';

/**
 * Hard exclusion filter engine.
 * Returns { pass: boolean, reasons: string[] }
 *
 * A lead FAILS if ANY hard rule triggers.
 * Rules enforce: target state, asset class, equity floor, year built,
 * sqft/bed ranges, luxury ceiling, owner type, and zoning.
 */

function getLuxuryCeiling(lead, marketConfig) {
  const state = lead.market.state;
  const county = lead.market.county;
  const stateCeilings = marketConfig.luxury_ceiling_by_state?.[state];
  if (!stateCeilings) return null;
  return stateCeilings[county] || stateCeilings['default'] || null;
}

function getYearBuiltFloor(lead, marketConfig) {
  const state = lead.market.state;
  return marketConfig.year_built_floor?.[state] ?? marketConfig.year_built_floor?.default ?? 1950;
}

function zoningExcluded(zoning, excludedKeywords) {
  if (!zoning) return false;
  const z = zoning.toLowerCase();
  return excludedKeywords.some(kw => z.includes(kw));
}

/**
 * Apply all hard exclusion rules to a normalized lead.
 *
 * @param {Object} lead - Canonical lead record
 * @param {Object} marketConfig - Parsed markets.json
 * @returns {{ pass: boolean, reasons: string[] }}
 */
function applyHardFilters(lead, marketConfig) {
  const reasons = [];
  const state = lead.market.state;
  const prop = lead.property;
  const val = lead.valuation;
  const owner = lead.owner;

  // 1. Target state
  if (!state || !marketConfig.target_states.includes(state)) {
    reasons.push(`state_not_targeted: ${state}`);
  }

  // 2. Asset type
  if (!prop.property_type || !marketConfig.target_asset_types.includes(prop.property_type)) {
    reasons.push(`property_type_excluded: ${prop.property_type}`);
  }

  // 3. Equity floor (skip if equity data is completely missing — flag for enrichment instead)
  const equityPct = val.estimated_equity_pct;
  if (equityPct !== null && equityPct !== undefined) {
    if (equityPct < marketConfig.equity_floor_pct) {
      reasons.push(`equity_below_floor: ${(equityPct * 100).toFixed(1)}% < ${(marketConfig.equity_floor_pct * 100)}%`);
    }
  }

  // 4. Year built
  const yearBuiltFloor = getYearBuiltFloor(lead, marketConfig);
  if (prop.year_built !== null && prop.year_built < yearBuiltFloor) {
    reasons.push(`year_built_too_old: ${prop.year_built} < ${yearBuiltFloor}`);
  }

  // 5. Square footage range
  const { min: sqftMin, max: sqftMax } = marketConfig.sqft_range;
  if (prop.sqft_living !== null) {
    if (prop.sqft_living < sqftMin) reasons.push(`sqft_too_small: ${prop.sqft_living} < ${sqftMin}`);
    if (prop.sqft_living > sqftMax) reasons.push(`sqft_too_large: ${prop.sqft_living} > ${sqftMax}`);
  }

  // 6. Bed range
  const { min: bedMin, max: bedMax } = marketConfig.bed_range;
  if (prop.beds !== null) {
    if (prop.beds < bedMin) reasons.push(`beds_too_few: ${prop.beds} < ${bedMin}`);
    if (prop.beds > bedMax) reasons.push(`beds_too_many: ${prop.beds} > ${bedMax}`);
  }

  // 7. Luxury ceiling
  const luxuryCeiling = getLuxuryCeiling(lead, marketConfig);
  const marketValue = val.estimated_market_value || val.assessed_value;
  if (luxuryCeiling && marketValue && marketValue > luxuryCeiling) {
    reasons.push(`value_above_luxury_ceiling: $${marketValue.toLocaleString()} > $${luxuryCeiling.toLocaleString()}`);
  }

  // 8. Excluded owner types (institutional)
  if (marketConfig.excluded_owner_types.includes(owner.owner_type)) {
    reasons.push(`owner_type_excluded: ${owner.owner_type}`);
  }

  // 9. Zoning exclusion
  if (zoningExcluded(prop.zoning, marketConfig.excluded_zoning_keywords)) {
    reasons.push(`zoning_excluded: ${prop.zoning}`);
  }

  // 10. Missing critical address data
  if (!prop.address.street || !prop.address.zip) {
    reasons.push('address_incomplete: missing street or zip');
  }

  // 11. Missing owner name
  if (!owner.owner_1_name) {
    reasons.push('owner_name_missing');
  }

  return { pass: reasons.length === 0, reasons };
}

/**
 * Apply filters to an array of leads and update pipeline_status in-place.
 *
 * @param {Object[]} leads - Array of canonical lead records
 * @param {Object} marketConfig - Parsed markets.json
 * @returns {{ passed: Object[], failed: Object[] }}
 */
function filterBatch(leads, marketConfig) {
  const passed = [];
  const failed = [];

  for (const lead of leads) {
    const { pass, reasons } = applyHardFilters(lead, marketConfig);
    lead.pipeline_status.filter_status = pass ? 'pass' : 'fail';
    lead.pipeline_status.filter_fail_reasons = reasons;
    lead.metadata.updated_at = new Date().toISOString();
    (pass ? passed : failed).push(lead);
  }

  return { passed, failed };
}

module.exports = { applyHardFilters, filterBatch };
