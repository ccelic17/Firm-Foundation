// Boots index.html in headless Chromium and exercises the main surfaces.
//
// Two runs:
//   A. Dexie blocked   → the degraded-storage path must keep the app alive.
//   B. Dexie stubbed   → the normal path; assert the real behaviour.
//
// External hosts (fonts, OneSignal, bible-api) are always blocked, so this
// doubles as an offline smoke test. Netlify functions are not running, so
// every /.netlify/functions/* call returns 503 — the app must cope.
//
// Usage: node scripts/boot-test.js
const path = require('path');
const fs = require('fs');

const REPO = path.resolve(__dirname, '..');

// Playwright comes from node_modules on CI. In the dev container it is only
// installed globally, so fall back to that path rather than requiring a local
// install there.
const GLOBAL_PLAYWRIGHT = '/opt/node22/lib/node_modules/playwright';

function loadPlaywright() {
  try {
    return require('playwright');
  } catch (localErr) {
    try {
      return require(GLOBAL_PLAYWRIGHT);
    } catch {
      console.error(
        'Could not load Playwright.\n' +
        '  Tried: require("playwright") — ' + localErr.message + '\n' +
        '  Tried: ' + GLOBAL_PLAYWRIGHT + '\n' +
        'Run `npm ci` (and `npx playwright install chromium`) first.'
      );
      process.exit(1);
    }
  }
}

const { chromium } = loadPlaywright();

// The dev container ships a prebuilt Chromium; CI uses the one Playwright
// downloads itself. Passing a non-existent executablePath is a hard failure,
// so only set it when the file is actually there.
const CONTAINER_CHROMIUM = '/opt/pw-browsers/chromium';
const LAUNCH_OPTS = fs.existsSync(CONTAINER_CHROMIUM)
  ? { executablePath: CONTAINER_CHROMIUM }
  : {};

// Minimal in-memory stand-in for the Dexie surface this app uses:
// new Dexie(name), .version().stores(), .kv.toArray/put/clear
const DEXIE_STUB = `
window.Dexie = function () {
  const rows = new Map();
  this.version = () => ({ stores: () => {} });
  this.kv = {
    toArray: () => Promise.resolve([...rows.values()]),
    put: (row) => { rows.set(row.key, row); return Promise.resolve(); },
    clear: () => { rows.clear(); return Promise.resolve(); }
  };
};
`;

function makeRouter(page, { stubDexie }) {
  return page.route('**/*', async route => {
    const url = route.request().url();

    if (url.startsWith('http://localhost/')) {
      const rel = decodeURIComponent(new URL(url).pathname).replace(/^\//, '') || 'index.html';
      const file = path.join(REPO, rel);
      if (fs.existsSync(file) && fs.statSync(file).isFile()) {
        const ext = path.extname(file);
        const type = ext === '.html' ? 'text/html'
          : ext === '.js' ? 'application/javascript'
          : ext === '.json' ? 'application/json' : 'text/plain';
        return route.fulfill({ status: 200, contentType: type, body: fs.readFileSync(file) });
      }
      // Netlify functions do not run locally.
      return route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: '{"status":"error","message":"offline"}'
      });
    }

    if (url.includes('dexie')) {
      if (!stubDexie) return route.abort();
      return route.fulfill({ status: 200, contentType: 'application/javascript', body: DEXIE_STUB });
    }

    // Everything else third-party: unreachable.
    return route.abort();
  });
}

async function boot(stubDexie) {
  const browser = await chromium.launch(LAUNCH_OPTS);
  const page = await browser.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  await makeRouter(page, { stubDexie });
  await page.goto('http://localhost/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  return { browser, page, errors };
}

/** Errors we deliberately caused by blocking the network. */
function realErrors(errors) {
  return errors.filter(e =>
    !/Failed to load resource|net::ERR_FAILED|ERR_BLOCKED|503|fonts\.googleapis|onesignal|bible-api|unpkg|unknown error occurred when fetching the script|Stripe link placeholder not replaced/i.test(e)
  );
}

const results = [];
function check(name, pass, detail) {
  results.push({ name, pass: !!pass, detail });
}

(async () => {
  // ── Run A: Dexie blocked ────────────────────────────────────────────
  {
    const { browser, page, errors } = await boot(false);

    const dexieLoaded = await page.evaluate(() => typeof Dexie !== 'undefined');
    const stateInit = await page.evaluate(() => typeof state !== 'undefined' && state !== null);
    const deadScreen = await page.evaluate(() => !!document.getElementById('startup-failure'));
    const warned = await page.evaluate(() => !!document.getElementById('storage-warning'));
    const fnDefined = await page.evaluate(() => typeof switchTab === 'function' && typeof syncBiometricSource === 'function');
    const noRefError = !errors.some(e => /ReferenceError/.test(e));

    check('A: Dexie genuinely unavailable', !dexieLoaded);
    check('A: app still defines its functions (no cascade failure)', fnDefined);
    check('A: state still initialises', stateInit);
    check('A: no ReferenceError', noRefError, errors.filter(e => /ReferenceError/.test(e)).join('; '));
    check('A: no dead startup screen', !deadScreen);
    check('A: storage warning shown', warned);

    await browser.close();
  }

  // ── Run B: Dexie stubbed ────────────────────────────────────────────
  {
    const { browser, page, errors } = await boot(true);

    check('B: state initialises', await page.evaluate(() => typeof state !== 'undefined' && state !== null));
    check('B: no dead startup screen',
      !(await page.evaluate(() => !!document.getElementById('startup-failure'))));

    // Guardrail present and actually applied by the transport.
    check('B: guardrail cites all three passages', await page.evaluate(() =>
      typeof THEOLOGICAL_GUARDRAIL === 'string' &&
      THEOLOGICAL_GUARDRAIL.includes('John 14:6') &&
      THEOLOGICAL_GUARDRAIL.includes('Acts 4:12') &&
      THEOLOGICAL_GUARDRAIL.includes('1 Timothy 2:5')));

    check('B: guardrail forbids the punting phrases', await page.evaluate(() =>
      THEOLOGICAL_GUARDRAIL.includes("God's reach exceeds our categories") &&
      /universalist/i.test(THEOLOGICAL_GUARDRAIL)));

    const guardApplied = await page.evaluate(async () => {
      let sent = null;
      const orig = window.fetch;
      window.fetch = (u, o) => { sent = JSON.parse(o.body); return Promise.reject(new Error('stub')); };
      try { await window.claude.complete({ system: 'PERSONA_MARKER', messages: [{ role: 'user', content: 'hi' }] }); } catch {}
      window.fetch = orig;
      return sent && sent.system.startsWith('You operate inside a Christian') && sent.system.includes('PERSONA_MARKER');
    });
    check('B: guardrail prepended to every call', guardApplied);

    // All five Council personas still present.
    check('B: five Council mentors', await page.evaluate(() => COUNCIL_MENTORS.length) === 5);

    // KJV notice — exact wording is legally mandated.
    const EXPECTED = 'Scripture quotations marked KJV are from The Authorized (King James) Version. ' +
      'Rights in the Authorized Version in the United Kingdom are vested in the Crown. ' +
      "Reproduced by permission of the Crown's patentee, Cambridge University Press.";
    check('B: KJV notice wording exact',
      (await page.evaluate(() => KJV_ATTRIBUTION)) === EXPECTED);

    check('B: KJV notice shows on KJV, hides on WEB', await page.evaluate(() => {
      renderKJVAttribution('bible-kjv-attribution', 'KJV');
      const shown = document.getElementById('bible-kjv-attribution').style.display !== 'none';
      renderKJVAttribution('bible-kjv-attribution', 'WEB');
      const hidden = document.getElementById('bible-kjv-attribution').style.display === 'none';
      return shown && hidden;
    }));

    // First launch shows the onboarding overlay, which covers the tab bar.
    check('B: onboarding shown on first launch', await page.evaluate(() => {
      const el = document.getElementById('onboarding-overlay');
      return !!el && el.style.display !== 'none';
    }));
    await page.evaluate(() => closeOnboarding());
    await page.waitForTimeout(150);

    // Tabs.
    for (const t of ['today', 'spirit', 'journal', 'profile']) {
      const btn = await page.$(`.tab[data-tab="${t}"]`);
      if (btn) {
        await btn.click();
        await page.waitForTimeout(150);
      }
      const active = await page.evaluate(id => {
        const el = document.getElementById('s-' + id);
        return el ? el.classList.contains('active') : false;
      }, t);
      check(`B: tab "${t}" activates`, active);
    }

    // Bible book grid renders.
    check('B: Bible book grid renders', await page.evaluate(() => {
      renderBibleBookGrid();
      return document.getElementById('bible-book-grid').children.length;
    }) === 39);

    // Drive the REAL check-in through its offline fallback: the function call
    // 503s, so submitBodyCheckin() must fall back to scoreLocally() and still
    // set state.bodyScore (which nothing used to assign).
    // sleep 7, energy 5, soreness 9 → (7*.40)+(5*.35)+(9*.25) = 6.8 → 68 "Moderate",
    // matching netlify/functions/body-score.js exactly.
    const bodyResult = await page.evaluate(async () => {
      openBodyModal();
      document.getElementById('body-sleep').value = 7;
      document.getElementById('body-energy').value = 5;
      document.getElementById('body-soreness').value = 9;
      await submitBodyCheckin();
      return {
        score: state.bodyScore,
        recovery: state.whoop.recovery,
        label: document.getElementById('body-result-label').textContent
      };
    });
    check('B: offline fallback matches server formula (68 Moderate)',
      bodyResult.score === 68 && bodyResult.label === 'Moderate Readiness', JSON.stringify(bodyResult));
    check('B: state.bodyScore assigned (Body ring no longer stuck at 0)',
      bodyResult.score === bodyResult.recovery && bodyResult.score === 68, JSON.stringify(bodyResult));

    // The check-in above left its modal open; it would swallow later clicks.
    await page.evaluate(() => closeBodyModal());
    await page.waitForTimeout(100);

    // Restored Today-tab mount points must exist AND populate.
    await page.click('.tab[data-tab="today"]');
    await page.waitForTimeout(150);
    const mounts = await page.evaluate(() => {
      animateRings();
      const strip = document.getElementById('domain-strip');
      const bar = document.getElementById('system-bar');
      return {
        stripCards: strip ? strip.children.length : -1,
        barFilled: bar ? bar.innerHTML.includes('System Coherence') : false
      };
    });
    check('B: #domain-strip renders 4 domain cards', mounts.stripCards === 4, JSON.stringify(mounts));
    check('B: #system-bar renders coherence bar', mounts.barFilled, JSON.stringify(mounts));

    // 7-day trial: real logic, not just copy.
    const trial = await page.evaluate(() => {
      const out = {};
      out.startedOnBoot = ls.get('ff_trial_started', null) !== null;
      out.inTrialFresh = isInTrial();
      out.accessFresh = hasFullAccess();
      out.daysFresh = trialDaysRemaining();
      // Rewind the clock 8 days — trial must lapse and access must close.
      ls.set('ff_trial_started', Date.now() - 8 * 86400000);
      out.inTrialExpired = isInTrial();
      out.accessExpired = hasFullAccess();
      out.daysExpired = trialDaysRemaining();
      // A paid subscription must restore access even after expiry.
      grantSubscription('cs_test_trial');
      out.accessAfterPaying = hasFullAccess();
      ls.set('ff_subscribed', false);
      ls.set('ff_trial_started', Date.now());
      return out;
    });
    check('B: trial starts on first launch', trial.startedOnBoot, JSON.stringify(trial));
    check('B: fresh install has full access for 7 days',
      trial.inTrialFresh && trial.accessFresh && trial.daysFresh === 7, JSON.stringify(trial));
    check('B: trial lapses on day 8 and access closes',
      !trial.inTrialExpired && !trial.accessExpired && trial.daysExpired === 0, JSON.stringify(trial));
    check('B: paying restores access after trial expiry', trial.accessAfterPaying, JSON.stringify(trial));

    // Paywall copy must track trial state rather than advertising a stale offer.
    const copy = await page.evaluate(() => {
      ls.set('ff_trial_started', Date.now() - 8 * 86400000);
      showPaywall();
      const expired = document.getElementById('paywall-terms').textContent;
      ls.set('ff_trial_started', Date.now());
      showPaywall();
      const active = document.getElementById('paywall-terms').textContent;
      const eyebrow = document.getElementById('paywall-eyebrow').textContent;
      closePaywall();
      return { expired, active, eyebrow };
    });
    check('B: paywall states trial has ended when expired',
      /trial has ended/i.test(copy.expired) && /3 AI prayer prompts per day/i.test(copy.expired), copy.expired);
    check('B: paywall shows days remaining during trial',
      /7 days remaining/i.test(copy.active) && /left in your trial/i.test(copy.eyebrow), copy.eyebrow + ' || ' + copy.active);

    // Subscription unlock.
    check('B: subscription unlock works', await page.evaluate(() => {
      const before = isSubscribed();
      grantSubscription('cs_test_123');
      const after = isSubscribed();
      ls.set('ff_subscribed', false);
      return before === false && after === true;
    }));

    // Placeholder Stripe links must refuse to open.
    check('B: placeholder Stripe link refuses to open', await page.evaluate(() => {
      let opened = false;
      const orig = window.open;
      window.open = () => { opened = true; return null; };
      handleSubscribe('annual');
      window.open = orig;
      return opened === false;
    }));

    const leftover = realErrors(errors);
    check('B: no unexpected console errors', leftover.length === 0, leftover.join(' | '));

    await browser.close();
  }

  // ── Asset integrity (filesystem, no browser needed) ─────────────────
  {
    const manifest = JSON.parse(fs.readFileSync(path.join(REPO, 'manifest.json'), 'utf8'));
    const missing = manifest.icons
      .map(i => i.src.replace(/^\//, ''))
      .filter(rel => !fs.existsSync(path.join(REPO, rel)));
    check('assets: every manifest icon exists on disk', missing.length === 0, missing.join(', '));

    // Real image files, not empty placeholders.
    const png192 = fs.readFileSync(path.join(REPO, 'assets/icon-192.png'));
    const png512 = fs.readFileSync(path.join(REPO, 'assets/icon-512.png'));
    const ico = fs.readFileSync(path.join(REPO, 'assets/favicon.ico'));
    const isPng = b => b.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    check('assets: icon-192.png is a valid PNG of the right size',
      isPng(png192) && png192.readUInt32BE(16) === 192 && png192.readUInt32BE(20) === 192);
    check('assets: icon-512.png is a valid PNG of the right size',
      isPng(png512) && png512.readUInt32BE(16) === 512 && png512.readUInt32BE(20) === 512);
    check('assets: favicon.ico is a valid ICO', ico.readUInt32LE(0) === 0x00010000);

    // Nothing may still point at the deleted logo filenames.
    const html = fs.readFileSync(path.join(REPO, 'index.html'), 'utf8');
    check('assets: no stale firm_foundation_logo references', !/firm_foundation_logo/.test(html));
  }

  // ── OAuth/Stripe return routing ─────────────────────────────────────
  // This class of bug is invisible to the browser suite: the functions send
  // the browser somewhere, and if that somewhere does not serve index.html
  // the return handler never runs and the payload is silently discarded.
  // Cross-check the redirect target against netlify.toml's actual rewrites.
  {
    const oauth = require(path.join(REPO, 'netlify/functions/lib/oauth.js'));
    const toml = fs.readFileSync(path.join(REPO, 'netlify.toml'), 'utf8');

    // Parse the [[redirects]] blocks into from -> to pairs.
    const rewrites = [];
    const blockRe = /\[\[redirects\]\]([\s\S]*?)(?=\[\[|\[build|$)/g;
    let b;
    while ((b = blockRe.exec(toml)) !== null) {
      const from = /from\s*=\s*"([^"]+)"/.exec(b[1]);
      const to = /to\s*=\s*"([^"]+)"/.exec(b[1]);
      if (from && to) rewrites.push({ from: from[1], to: to[1] });
    }

    const target = oauth.APP_PATH;
    const match = rewrites.find(r => r.from === target);
    const servesApp = match && match.to.endsWith('index.html');

    check('routing: OAuth return path serves the app, not the landing page',
      servesApp,
      `APP_PATH="${target}" resolves to "${match ? match.to : '(no rewrite — serves the file at that path)'}"`);

    // Guard the specific regression: "/" is rewritten to the marketing page,
    // which has no JavaScript and cannot process a return payload.
    const rootRewrite = rewrites.find(r => r.from === '/');
    check('routing: APP_PATH is not the landing-page route',
      !(rootRewrite && target === '/'),
      rootRewrite ? `"/" rewrites to ${rootRewrite.to}` : '"/" has no rewrite');
  }

  let failed = 0;
  for (const r of results) {
    if (!r.pass) failed++;
    console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.detail && !r.pass ? `  → ${r.detail}` : ''}`);
  }
  console.log(`\n${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('boot-test crashed:', e); process.exit(1); });
