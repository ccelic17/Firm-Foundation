'use strict';

/**
 * Main ingestion orchestrator.
 *
 * Pipeline order:
 *   1. Parse CSV/JSON input
 *   2. Normalize rows → canonical lead schema
 *   3. Hard-filter exclusions
 *   4. Deduplicate (parcel ID → address fallback)
 *   5. Score (distress + equity + motivation → composite + tier)
 *   6. Output: tiered JSON export + summary report
 *
 * Usage:
 *   node ingest.js --source propstream --file ./data/input.csv --batch-id 2026-06-09_FL_01
 *   node ingest.js --source batchleads --file ./data/input.json --batch-id 2026-06-09_TX_01
 */

const fs = require('fs');
const path = require('path');
const { parse: parseCsv } = require('csv-parse/sync');

const { normalizeBatch } = require('./normalize');
const { filterBatch } = require('./filter');
const { deduplicateBatch } = require('./deduplicate');
const { scoreBatch, groupByTier } = require('./score');

const marketConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/markets.json'), 'utf8'));
const scoringConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/scoring.json'), 'utf8'));

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { source: null, file: null, batchId: null, outputDir: './output', dedupIndexPath: null };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--source') opts.source = args[++i];
    else if (args[i] === '--file') opts.file = args[++i];
    else if (args[i] === '--batch-id') opts.batchId = args[++i];
    else if (args[i] === '--output-dir') opts.outputDir = args[++i];
    else if (args[i] === '--dedup-index') opts.dedupIndexPath = args[++i];
  }
  return opts;
}

function readInput(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const raw = fs.readFileSync(filePath, 'utf8');
  if (ext === '.json') return JSON.parse(raw);
  if (ext === '.csv') {
    return parseCsv(raw, { columns: true, skip_empty_lines: true, trim: true, relax_quotes: true });
  }
  throw new Error(`Unsupported file extension: ${ext}. Use .csv or .json`);
}

function loadDedupIndex(indexPath) {
  if (!indexPath || !fs.existsSync(indexPath)) return {};
  const raw = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  return {
    parcelKeys: new Map(raw.parcelKeys || []),
    addressKeys: new Map(raw.addressKeys || [])
  };
}

function saveDedupIndex(index, outputDir) {
  const indexPath = path.join(outputDir, 'dedup_index.json');
  fs.writeFileSync(indexPath, JSON.stringify({
    parcelKeys: Array.from(index.parcelKeys.entries()),
    addressKeys: Array.from(index.addressKeys.entries()),
    saved_at: new Date().toISOString()
  }, null, 2));
  return indexPath;
}

function writeOutput(outputDir, batchId, tierGroups, allLeads, summary) {
  fs.mkdirSync(outputDir, { recursive: true });

  // Per-tier files for outreach sequence ingestion
  for (const [tier, leads] of Object.entries(tierGroups)) {
    if (leads.length === 0) continue;
    const filename = `tier${tier}_${batchId}.json`;
    fs.writeFileSync(path.join(outputDir, filename), JSON.stringify(leads, null, 2));
  }

  // Full processed batch (all statuses)
  fs.writeFileSync(
    path.join(outputDir, `full_batch_${batchId}.json`),
    JSON.stringify(allLeads, null, 2)
  );

  // Summary report
  fs.writeFileSync(
    path.join(outputDir, `summary_${batchId}.json`),
    JSON.stringify(summary, null, 2)
  );
}

function buildSummary(opts, rawCount, normalizeResults, filterResults, dedupResults, tierGroups) {
  const normOk = normalizeResults.filter(r => r.ok).length;
  const normFail = normalizeResults.filter(r => !r.ok).length;

  const tierCounts = {};
  for (const [tier, leads] of Object.entries(tierGroups)) {
    tierCounts[`tier_${tier}`] = leads.length;
  }

  return {
    batch_id: opts.batchId,
    source: opts.source,
    processed_at: new Date().toISOString(),
    input: {
      raw_rows: rawCount,
      normalized_ok: normOk,
      normalized_fail: normFail
    },
    filter: {
      passed: filterResults.passed.length,
      failed: filterResults.failed.length,
      top_fail_reasons: topFailReasons(filterResults.failed)
    },
    dedup: {
      unique: dedupResults.unique.length,
      duplicates: dedupResults.duplicates.length
    },
    scoring: tierCounts,
    skip_trace_queue: (tierGroups[1]?.length || 0) + (tierGroups[2]?.length || 0),
    outreach_ready: tierGroups[1]?.length || 0
  };
}

function topFailReasons(failedLeads) {
  const counts = {};
  for (const lead of failedLeads) {
    for (const reason of (lead.pipeline_status.filter_fail_reasons || [])) {
      const key = reason.split(':')[0];
      counts[key] = (counts[key] || 0) + 1;
    }
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => ({ reason: k, count: v }));
}

async function run() {
  const opts = parseArgs();

  if (!opts.source || !opts.file) {
    console.error('Usage: node ingest.js --source <propstream|batchleads> --file <path> --batch-id <id>');
    process.exit(1);
  }

  if (!opts.batchId) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    opts.batchId = `${date}_${opts.source}_batch`;
  }

  console.log(`[INGEST] Batch: ${opts.batchId} | Source: ${opts.source} | File: ${opts.file}`);

  // Step 1: Parse
  const rawRows = readInput(opts.file);
  console.log(`[PARSE]  ${rawRows.length} rows loaded`);

  // Step 2: Normalize
  const normalizeResults = normalizeBatch(rawRows, opts.source, opts.batchId, marketConfig);
  const normalized = normalizeResults.filter(r => r.ok).map(r => r.lead);
  const normErrors = normalizeResults.filter(r => !r.ok);
  console.log(`[NORM]   ${normalized.length} normalized | ${normErrors.length} errors`);

  // Step 3: Filter
  const filterResults = filterBatch(normalized, marketConfig);
  console.log(`[FILTER] ${filterResults.passed.length} passed | ${filterResults.failed.length} failed`);

  // Step 4: Deduplicate (passed leads only — failed leads are archived separately)
  const existingIndex = loadDedupIndex(opts.dedupIndexPath);
  const dedupResults = deduplicateBatch(filterResults.passed, existingIndex);
  console.log(`[DEDUP]  ${dedupResults.unique.length} unique | ${dedupResults.duplicates.length} duplicates`);

  // Step 5: Score unique leads
  const scoreResults = scoreBatch(dedupResults.unique, scoringConfig);
  console.log(`[SCORE]  ${scoreResults.scored.length} scored`);

  const tierGroups = groupByTier(scoreResults.scored);
  for (const [tier, leads] of Object.entries(tierGroups).sort()) {
    const cfg = scoringConfig.priority_tiers[tier];
    console.log(`         Tier ${tier} (${cfg?.label}): ${leads.length} leads`);
  }

  // Step 6: Output
  const allLeads = [
    ...scoreResults.scored,
    ...dedupResults.duplicates,
    ...filterResults.failed
  ];

  const summary = buildSummary(opts, rawRows.length, normalizeResults, filterResults, dedupResults, tierGroups);

  fs.mkdirSync(opts.outputDir, { recursive: true });
  writeOutput(opts.outputDir, opts.batchId, tierGroups, allLeads, summary);

  const indexPath = saveDedupIndex(dedupResults.updatedIndex, opts.outputDir);

  console.log(`\n[DONE]   Output → ${opts.outputDir}/`);
  console.log(`         Summary → summary_${opts.batchId}.json`);
  console.log(`         Dedup index → ${indexPath}`);
  console.log(`\n[REPORT] Skip-trace queue (Tier 1+2): ${summary.skip_trace_queue}`);
  console.log(`         Outreach-ready (Tier 1 HOT): ${summary.outreach_ready}`);

  return summary;
}

run().catch(err => {
  console.error('[ERROR]', err.message);
  process.exit(1);
});
