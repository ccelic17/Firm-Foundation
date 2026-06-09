'use strict';

const { PROPSTREAM_FIELD_MAP, PROPERTY_TYPE_MAP: PS_TYPE_MAP } = require('../mappings/propstream');
const { BATCHLEADS_FIELD_MAP, PROPERTY_TYPE_MAP: BL_TYPE_MAP } = require('../mappings/batchleads');
const { v4: uuidv4 } = require('uuid');

const SOURCE_MAPS = {
  propstream: { fields: PROPSTREAM_FIELD_MAP, types: PS_TYPE_MAP },
  batchleads: { fields: BATCHLEADS_FIELD_MAP, types: BL_TYPE_MAP }
};

/**
 * Set a value at a dot-path on an object, creating intermediate objects as needed.
 */
function setPath(obj, path, value) {
  const parts = path.split('.');
  let cursor = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cursor[parts[i]] || typeof cursor[parts[i]] !== 'object') {
      cursor[parts[i]] = {};
    }
    cursor = cursor[parts[i]];
  }
  cursor[parts[parts.length - 1]] = value;
}

/**
 * Normalize a raw CSV row key to lowercase with spaces (for propstream) or
 * lowercase with underscores (for batchleads).
 */
function normalizeKey(key, source) {
  const k = key.trim().toLowerCase();
  return source === 'batchleads' ? k.replace(/\s+/g, '_') : k.replace(/_/g, ' ');
}

/**
 * Coerce string values to their typed equivalents.
 */
function coerce(value, targetPath) {
  if (value === null || value === undefined || value === '' || value === 'N/A' || value === 'n/a') {
    return null;
  }

  const boolPaths = [
    'owner.is_absentee', 'owner.is_out_of_state', 'property.garage', 'property.pool',
    'distress_signals.lis_pendens', 'distress_signals.nod_filed', 'distress_signals.tax_delinquent',
    'distress_signals.code_violations', 'distress_signals.probate', 'distress_signals.vacant',
    'distress_signals.inherited', 'distress_signals.bankruptcy', 'distress_signals.divorce'
  ];

  const numericPaths = [
    'property.year_built', 'property.sqft_living', 'property.sqft_lot',
    'property.beds', 'property.baths', 'property.stories',
    'valuation.assessed_value', 'valuation.assessed_land_value', 'valuation.assessed_improvement_value',
    'valuation.estimated_market_value', 'valuation.last_sale_price', 'valuation.estimated_equity_amt',
    'valuation.estimated_equity_pct', 'valuation.mortgage_balance_est', 'valuation.open_lien_amt',
    'valuation.lien_count', 'owner.years_owned',
    'distress_signals.tax_years_delinquent', 'distress_signals.tax_amount_owed',
    'distress_signals.code_violation_count'
  ];

  if (boolPaths.includes(targetPath)) {
    const v = String(value).toLowerCase().trim();
    return v === 'yes' || v === 'true' || v === '1' || v === 'y' || v === 'x';
  }

  if (numericPaths.includes(targetPath)) {
    const cleaned = String(value).replace(/[$,%]/g, '').trim();
    const num = Number(cleaned);
    if (isNaN(num)) return null;
    if (targetPath === 'valuation.estimated_equity_pct' && num > 1) {
      return num / 100;
    }
    return num;
  }

  return String(value).trim();
}

/**
 * Normalize property type string to canonical enum value.
 */
function normalizePropertyType(raw, typeMap) {
  if (!raw) return null;
  const key = String(raw).toLowerCase().trim();
  return typeMap[key] || 'OTHER';
}

/**
 * Derive absentee/out-of-state status if not explicitly flagged.
 */
function deriveAbsenteeStatus(lead) {
  const propState = lead.property?.address?.state;
  const mailState = lead.owner?.mailing_address?.state;
  const propCity = (lead.property?.address?.city || '').toLowerCase();
  const mailCity = (lead.owner?.mailing_address?.city || '').toLowerCase();
  const mailStreet = (lead.owner?.mailing_address?.street || '').toLowerCase();
  const propStreet = (lead.property?.address?.street || '').toLowerCase();

  if (lead.owner.is_absentee === null || lead.owner.is_absentee === undefined) {
    lead.owner.is_absentee = !!(mailState && (mailState !== propState || mailCity !== propCity || mailStreet !== propStreet));
  }
  if (lead.owner.is_out_of_state === null || lead.owner.is_out_of_state === undefined) {
    lead.owner.is_out_of_state = !!(mailState && propState && mailState !== propState);
  }
}

/**
 * Derive equity percent from amount and assessed value if missing.
 */
function deriveEquity(lead) {
  const val = lead.valuation;
  if (!val) return;

  const base = val.estimated_market_value || val.assessed_value;
  if (!base || base <= 0) return;

  if (val.estimated_equity_pct === null && val.estimated_equity_amt !== null) {
    val.estimated_equity_pct = val.estimated_equity_amt / base;
  }

  if (val.estimated_equity_amt === null && val.estimated_equity_pct !== null) {
    val.estimated_equity_amt = val.estimated_equity_pct * base;
  }

  if (val.estimated_equity_amt === null && val.mortgage_balance_est !== null) {
    val.estimated_equity_amt = base - val.mortgage_balance_est;
    val.estimated_equity_pct = val.estimated_equity_amt / base;
  }
}

/**
 * Assemble owner full name from first/last if separate fields were used.
 */
function assembleOwnerName(lead, extras) {
  if (extras._owner_first || extras._owner_last) {
    const first = (extras._owner_first || '').trim();
    const last = (extras._owner_last || '').trim();
    if (!lead.owner.owner_1_name && (first || last)) {
      lead.owner.owner_1_name = [first, last].filter(Boolean).join(' ');
    }
  }
}

/**
 * Compute the signal_count on distress_signals.
 */
function computeSignalCount(distress) {
  let count = 0;
  if (distress.lis_pendens || distress.nod_filed) count++;
  if (distress.tax_delinquent) count++;
  if (distress.code_violations) count++;
  if (distress.probate || distress.inherited) count++;
  if (distress.vacant) count++;
  if (distress.bankruptcy) count++;
  if (distress.divorce) count++;
  distress.signal_count = count;
}

/**
 * Derive market_tier from city name using config.
 */
function deriveMarketTier(lead, marketConfig) {
  const city = (lead.market.city || lead.property?.address?.city || '').toLowerCase();
  const state = lead.market.state;
  const primaryCities = (marketConfig.market_tier_map?.primary?.[state] || []).map(c => c.toLowerCase());
  if (primaryCities.some(c => city.includes(c))) {
    lead.market.market_tier = 'primary';
  } else if (city) {
    lead.market.market_tier = 'secondary';
  } else {
    lead.market.market_tier = 'tertiary';
  }
}

/**
 * Build an empty canonical lead skeleton.
 */
function emptyLead(source, batchId) {
  const now = new Date().toISOString();
  return {
    lead_id: uuidv4(),
    ingested_at: now,
    source,
    import_batch_id: batchId || null,
    market: { state: null, county: null, city: null, zip: null, msa: null, market_tier: null },
    property: {
      address: { street: null, unit: null, city: null, state: null, zip: null, county: null, standardized: false },
      parcel_id: null, property_type: null, year_built: null, sqft_living: null, sqft_lot: null,
      beds: null, baths: null, stories: null, garage: null, pool: null, zoning: null, condition: null
    },
    valuation: {
      assessed_value: null, assessed_land_value: null, assessed_improvement_value: null,
      last_sale_price: null, last_sale_date: null, estimated_market_value: null, estimated_arv: null,
      estimated_equity_pct: null, estimated_equity_amt: null, mortgage_balance_est: null,
      lien_count: null, open_lien_amt: null
    },
    owner: {
      owner_1_name: null, owner_2_name: null,
      mailing_address: { street: null, city: null, state: null, zip: null },
      is_absentee: null, is_out_of_state: null, years_owned: null, owner_type: 'unknown',
      phone_1: null, phone_1_type: null, phone_2: null, phone_2_type: null, phone_3: null,
      email_1: null, email_2: null, skip_traced: false, skip_traced_at: null, skip_trace_source: null
    },
    distress_signals: {
      lis_pendens: false, lis_pendens_date: null, nod_filed: false, nod_date: null,
      foreclosure_stage: null, foreclosure_auction_date: null,
      tax_delinquent: false, tax_years_delinquent: null, tax_amount_owed: null, tax_deed_auction_date: null,
      code_violations: false, code_violation_count: null, code_violation_types: [],
      probate: false, probate_case_number: null, probate_filing_date: null,
      inherited: false, vacant: false, vacant_confirmed: false,
      divorce: false, bankruptcy: false, bankruptcy_chapter: null,
      signal_count: 0
    },
    lead_scoring: {
      distress_score: null, equity_score: null, motivation_score: null,
      composite_score: null, priority_tier: null, scored_at: null, score_version: null
    },
    pipeline_status: {
      dedup_status: 'pending', duplicate_of_lead_id: null,
      filter_status: 'pending', filter_fail_reasons: [],
      outreach_channel: null, outreach_status: 'queued', outreach_attempts: 0,
      last_outreach_at: null, crm_id: null, crm_sync_at: null, tags: [], notes: null
    },
    metadata: {
      created_at: now, updated_at: now, data_quality_score: null, raw_source_record: null
    }
  };
}

/**
 * Normalize a single raw source row into a canonical lead record.
 *
 * @param {Object} rawRow - Raw CSV row as key/value object
 * @param {string} source - 'propstream' | 'batchleads' | 'county_clerk' | 'manual'
 * @param {string} batchId - Import batch identifier
 * @param {Object} marketConfig - Parsed markets.json
 * @returns {Object} Canonical lead record
 */
function normalizeRow(rawRow, source, batchId, marketConfig) {
  const mapping = SOURCE_MAPS[source];
  if (!mapping) throw new Error(`Unknown source: ${source}. Supported: ${Object.keys(SOURCE_MAPS).join(', ')}`);

  const lead = emptyLead(source, batchId);
  const extras = {};

  for (const [rawKey, rawValue] of Object.entries(rawRow)) {
    const normalizedKey = normalizeKey(rawKey, source);
    const targetPath = mapping.fields[normalizedKey];
    if (!targetPath) continue;

    if (targetPath.startsWith('_')) {
      extras[targetPath] = rawValue;
      continue;
    }

    const coerced = coerce(rawValue, targetPath);
    if (coerced === null) continue;

    if (targetPath === 'property.property_type') {
      setPath(lead, targetPath, normalizePropertyType(coerced, mapping.types));
    } else {
      setPath(lead, targetPath, coerced);
    }
  }

  assembleOwnerName(lead, extras);

  // Sync address fields into market
  if (!lead.market.state) lead.market.state = lead.property.address.state;
  if (!lead.market.city) lead.market.city = lead.property.address.city;
  if (!lead.market.zip) lead.market.zip = lead.property.address.zip;
  if (!lead.market.county && lead.property.address.county) lead.market.county = lead.property.address.county;

  deriveAbsenteeStatus(lead);
  deriveEquity(lead);
  computeSignalCount(lead.distress_signals);
  deriveMarketTier(lead, marketConfig);

  lead.metadata.raw_source_record = rawRow;

  return lead;
}

/**
 * Normalize an array of raw rows.
 */
function normalizeBatch(rows, source, batchId, marketConfig) {
  return rows.map((row, i) => {
    try {
      return { ok: true, lead: normalizeRow(row, source, batchId, marketConfig) };
    } catch (err) {
      return { ok: false, row_index: i, error: err.message, raw: row };
    }
  });
}

module.exports = { normalizeRow, normalizeBatch, emptyLead };
