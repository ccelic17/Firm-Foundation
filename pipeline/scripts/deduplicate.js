'use strict';

/**
 * Deduplication engine.
 *
 * Primary key: parcel_id (APN / folio) — exact match.
 * Secondary key: normalized street address + zip — fuzzy match.
 *
 * Window: configurable rolling days (default 90).
 * When a duplicate is found: the record with the higher composite_score is kept
 * as UNIQUE; the lower-scored record is marked DUPLICATE.
 */

const DEDUP_WINDOW_DAYS = 90;

/**
 * Normalize an address string for comparison:
 * lowercase, strip unit numbers and directional prefixes, collapse whitespace.
 */
function normalizeAddress(street) {
  if (!street) return '';
  return street
    .toLowerCase()
    .replace(/\b(apt|unit|ste|suite|#)\s*[\w-]+/gi, '')
    .replace(/\b(north|south|east|west|ne|nw|se|sw|n|s|e|w)\b\.?\s*/gi, '')
    .replace(/\b(street|st|avenue|ave|boulevard|blvd|road|rd|drive|dr|lane|ln|court|ct|place|pl|way|circle|cir)\b\.?/gi, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Build a dedup key from a lead.
 * Returns { parcelKey, addressKey }
 */
function buildDedupKeys(lead) {
  const parcelKey = lead.property?.parcel_id
    ? `pid:${lead.property.parcel_id.toLowerCase().replace(/[^a-z0-9]/g, '')}`
    : null;

  const street = normalizeAddress(lead.property?.address?.street);
  const zip = (lead.property?.address?.zip || '').trim();
  const addressKey = street && zip ? `addr:${street}|${zip}` : null;

  return { parcelKey, addressKey };
}

/**
 * Check whether a lead falls within the dedup window relative to now.
 */
function isWithinWindow(lead, windowDays) {
  const ingestedAt = lead.ingested_at;
  if (!ingestedAt) return true;
  const age = (Date.now() - new Date(ingestedAt).getTime()) / (1000 * 60 * 60 * 24);
  return age <= windowDays;
}

/**
 * Select which of two duplicate leads to keep (higher composite score wins;
 * more recent ingestion date breaks ties).
 */
function pickWinner(existing, incoming) {
  const existScore = existing.lead_scoring?.composite_score ?? 0;
  const incomScore = incoming.lead_scoring?.composite_score ?? 0;

  if (incomScore > existScore) return { winner: incoming, loser: existing };
  if (existScore > incomScore) return { winner: existing, loser: incoming };

  // Tiebreak: more recent ingestion wins
  const existDate = new Date(existing.ingested_at || 0);
  const incomDate = new Date(incoming.ingested_at || 0);
  return incomDate > existDate
    ? { winner: incoming, loser: existing }
    : { winner: existing, loser: incoming };
}

/**
 * Deduplicate a batch of normalized leads.
 *
 * Optionally pass an existingIndex built from previously processed records
 * to catch cross-batch duplicates.
 *
 * @param {Object[]} leads - Normalized (and optionally scored) leads
 * @param {Object} existingIndex - { parcelKeys: Set, addressKeys: Set, leadMap: Map<key, lead> }
 * @param {number} windowDays - Rolling dedup window in days
 * @returns {{ unique: Object[], duplicates: Object[], updatedIndex: Object }}
 */
function deduplicateBatch(leads, existingIndex = {}, windowDays = DEDUP_WINDOW_DAYS) {
  const parcelKeys = existingIndex.parcelKeys ? new Map(existingIndex.parcelKeys) : new Map();
  const addressKeys = existingIndex.addressKeys ? new Map(existingIndex.addressKeys) : new Map();

  const unique = [];
  const duplicates = [];

  for (const lead of leads) {
    if (!isWithinWindow(lead, windowDays)) {
      // Expired from window — treat as unique, don't add to index
      lead.pipeline_status.dedup_status = 'unique';
      unique.push(lead);
      continue;
    }

    const { parcelKey, addressKey } = buildDedupKeys(lead);

    let existingDuplicate = null;

    if (parcelKey && parcelKeys.has(parcelKey)) {
      existingDuplicate = parcelKeys.get(parcelKey);
    } else if (addressKey && addressKeys.has(addressKey)) {
      existingDuplicate = addressKeys.get(addressKey);
    }

    if (existingDuplicate) {
      const { winner, loser } = pickWinner(existingDuplicate, lead);

      // Mark loser as duplicate
      loser.pipeline_status.dedup_status = 'duplicate';
      loser.pipeline_status.duplicate_of_lead_id = winner.lead_id;
      loser.metadata.updated_at = new Date().toISOString();
      duplicates.push(loser);

      // If the winner changed (incoming beat existing), swap in the index
      if (winner.lead_id === lead.lead_id) {
        winner.pipeline_status.dedup_status = 'unique';
        if (parcelKey) parcelKeys.set(parcelKey, winner);
        if (addressKey) addressKeys.set(addressKey, winner);
        // Remove loser from unique, add winner
        const loserIdx = unique.findIndex(u => u.lead_id === existingDuplicate.lead_id);
        if (loserIdx !== -1) unique.splice(loserIdx, 1);
        unique.push(winner);
      }
    } else {
      lead.pipeline_status.dedup_status = 'unique';
      if (parcelKey) parcelKeys.set(parcelKey, lead);
      if (addressKey) addressKeys.set(addressKey, lead);
      unique.push(lead);
    }
  }

  return {
    unique,
    duplicates,
    updatedIndex: { parcelKeys, addressKeys }
  };
}

/**
 * Build a fresh index from an existing array of leads (for cross-batch dedup).
 */
function buildIndexFromLeads(leads) {
  const parcelKeys = new Map();
  const addressKeys = new Map();

  for (const lead of leads) {
    if (lead.pipeline_status.dedup_status !== 'unique') continue;
    const { parcelKey, addressKey } = buildDedupKeys(lead);
    if (parcelKey) parcelKeys.set(parcelKey, lead);
    if (addressKey) addressKeys.set(addressKey, lead);
  }

  return { parcelKeys, addressKeys };
}

module.exports = { deduplicateBatch, buildIndexFromLeads, normalizeAddress, buildDedupKeys };
