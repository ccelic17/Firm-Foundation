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

const PLAYWRIGHT = '/opt/node22/lib/node_modules/playwright';
const CHROMIUM = '/opt/pw-browsers/chromium';
const REPO = path.resolve(__dirname, '..');

const { chromium } = require(PLAYWRIGHT);

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
  const browser = await chromium.launch({ executablePath: CHROMIUM });
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

  let failed = 0;
  for (const r of results) {
    if (!r.pass) failed++;
    console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.detail && !r.pass ? `  → ${r.detail}` : ''}`);
  }
  console.log(`\n${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('boot-test crashed:', e); process.exit(1); });
