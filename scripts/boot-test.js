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
      return sent && {
        // Safety leads, so it cannot be buried under the directness rules.
        safetyFirst: sent.system.startsWith('SAFETY'),
        hasCrisis: /988/.test(sent.system) && /findahelpline/.test(sent.system),
        hasDoctrine: sent.system.includes('You operate inside a Christian'),
        keepsPersona: sent.system.includes('PERSONA_MARKER')
      };
    });
    check('B: guardrail prepended to every call',
      guardApplied && guardApplied.hasDoctrine && guardApplied.keepsPersona,
      JSON.stringify(guardApplied));

    // The mentors are instructed to be direct and never to punt. Without an
    // explicit override, a man in crisis gets confrontation rather than a
    // route to real help — so the safety block must lead and must name
    // where to go.
    check('B: crisis safety overrides the directness rules',
      guardApplied && guardApplied.safetyFirst,
      JSON.stringify(guardApplied));
    check('B: guardrail carries crisis resources',
      guardApplied && guardApplied.hasCrisis,
      JSON.stringify(guardApplied));

    check('B: punting rule carves out the safety case', await page.evaluate(() =>
      /does not apply to the SAFETY section/i.test(THEOLOGICAL_GUARDRAIL)));

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
      /trial has ended/i.test(copy.expired) && /3 AI prayer prompts/i.test(copy.expired), copy.expired);

    // The paywall must not sell features that are free to everyone. Sabbath
    // Mode, State of the Man and scripture alerts were all advertised as paid
    // unlocks while being ungated — four things promised, one delivered.
    // Asserted against both trial states because the copy is rebuilt per state.
    const oversold = /unlocks Sabbath Mode|State of the Man reports|scripture-triggered alerts/i;
    check('B: paywall does not sell ungated features',
      !oversold.test(copy.expired) && !oversold.test(copy.active),
      copy.expired);

    // Everything named as a paid unlock must be a metered AI feature.
    check('B: paywall names the metered features it actually gates',
      /Council/i.test(copy.expired) && /prayer prompt/i.test(copy.expired),
      copy.expired);
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

    // Checkout must open the configured live link, and the placeholder guard
    // must still fire if anyone reintroduces one. The stub returns a truthy
    // window: handleSubscribe() falls back to window.location.href when
    // window.open returns null, which would navigate this page to Stripe.
    const checkout = await page.evaluate(() => {
      const orig = window.open;
      let openedWith = null;
      window.open = (url) => { openedWith = url; return {}; };

      handleSubscribe('annual');
      const annual = openedWith;
      openedWith = null;
      handleSubscribe('monthly');
      const monthly = openedWith;

      // Guard still works: put a placeholder back and confirm nothing opens.
      const real = STRIPE_LINKS.annual;
      STRIPE_LINKS.annual = 'https://buy.stripe.com/YOUR_LIVE_ANNUAL_LINK';
      openedWith = null;
      handleSubscribe('annual');
      const placeholderOpened = openedWith;
      STRIPE_LINKS.annual = real;

      window.open = orig;
      return { annual, monthly, placeholderOpened };
    });

    check('B: checkout opens the configured annual link',
      typeof checkout.annual === 'string' && checkout.annual.startsWith('https://buy.stripe.com/'),
      String(checkout.annual));
    check('B: checkout opens the configured monthly link',
      typeof checkout.monthly === 'string' && checkout.monthly.startsWith('https://buy.stripe.com/'),
      String(checkout.monthly));

    // Test-mode links take no real money. That is what shipped here once.
    check('B: Stripe links are live mode, not test mode',
      !/buy\.stripe\.com\/test_/.test(checkout.annual + ' ' + checkout.monthly),
      checkout.annual + ' | ' + checkout.monthly);

    check('B: annual and monthly are different links',
      checkout.annual !== checkout.monthly,
      checkout.annual + ' | ' + checkout.monthly);

    check('B: placeholder Stripe link refuses to open',
      checkout.placeholderOpened === null, String(checkout.placeholderOpened));

    // ── Metered AI allowances ────────────────────────────────────────
    // These gate the only features that cost money per use. The Council is
    // five Claude calls per question and was previously ungated entirely.
    const gates = await page.evaluate(() => {
      const reset = () => {
        ls.set('ff_subscribed', false);
        ls.set('ff_trial_started', Date.now() - 99 * 86400000); // trial long over
        ['ff_allow_prompt', 'ff_allow_council', 'ff_allow_search', 'ff_allow_goal']
          .forEach(k => ls.set(k, { window: '', count: 0 }));
      };

      // Daily allowance: 3 through, 4th refused.
      reset();
      const daily = [1, 2, 3, 4].map(() => consumeAllowance('ff_allow_prompt', 3, 'day'));

      // Weekly Council allowance: 1 through, 2nd refused.
      reset();
      const council = [1, 2].map(() => consumeAllowance('ff_allow_council', 1, 'week'));

      // Both searches draw on one shared daily pool.
      reset();
      const shared = [1, 2, 3, 4].map(() => consumeAllowance('ff_allow_search', 3, 'day'));

      // Paying lifts every limit.
      reset();
      for (let i = 0; i < 5; i++) consumeAllowance('ff_allow_council', 1, 'week');
      ls.set('ff_subscribed', true);
      const paidCouncil = consumeAllowance('ff_allow_council', 1, 'week');
      const paidLeft = allowanceLeft('ff_allow_council', 1, 'week');

      // A stale window from a previous day must not carry over.
      ls.set('ff_subscribed', false);
      ls.set('ff_allow_prompt', { window: 'dThu Jan 01 1970', count: 99 });
      const newWindow = consumeAllowance('ff_allow_prompt', 3, 'day');

      reset();
      return { daily, council, shared, paidCouncil, paidLeft, newWindow };
    });

    check('B: daily AI allowance stops at the limit',
      JSON.stringify(gates.daily) === JSON.stringify([true, true, true, false]),
      JSON.stringify(gates.daily));
    check('B: Council is metered weekly (5 Claude calls per ask)',
      JSON.stringify(gates.council) === JSON.stringify([true, false]),
      JSON.stringify(gates.council));
    check('B: both scripture searches share one daily pool',
      JSON.stringify(gates.shared) === JSON.stringify([true, true, true, false]),
      JSON.stringify(gates.shared));
    check('B: paying lifts every allowance',
      gates.paidCouncil === true && gates.paidLeft === Infinity,
      `${gates.paidCouncil} / ${gates.paidLeft}`);
    check('B: a stale allowance window resets rather than stranding the user',
      gates.newWindow === true, String(gates.newWindow));

    // The gates must run before any Claude call. Council previously set the
    // button to "Consulting..." before doing any work, so a refusal would
    // have left it stuck there with nothing coming back.
    const noCall = await page.evaluate(async () => {
      ls.set('ff_subscribed', false);
      ls.set('ff_trial_started', Date.now() - 99 * 86400000);
      ls.set('ff_allow_council', { window: '', count: 0 });
      consumeAllowance('ff_allow_council', 1, 'week'); // spend it

      let called = 0;
      const orig = window.claude.complete;
      window.claude.complete = async () => { called++; return 'x'; };
      const q = document.getElementById('council-question');
      if (q) q.value = 'Should I fast this week?';
      await askTheCouncil();
      window.claude.complete = orig;

      const btn = document.getElementById('council-ask-btn');
      const stuck = btn ? (btn.disabled || /Consulting/i.test(btn.textContent)) : false;
      closePaywall();
      return { called, stuck };
    });
    check('B: refused Council makes no Claude call', noCall.called === 0, `calls=${noCall.called}`);
    check('B: refused Council leaves the button usable', noCall.stuck === false, `stuck=${noCall.stuck}`);


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

    // An installed PWA launches at manifest.start_url. It was "/", which the
    // rewrite above sends to landing.html — so tapping the home-screen icon
    // opened the marketing page, not the app, and the user had to find the
    // link into ./index.html themselves.
    const mf = JSON.parse(fs.readFileSync(path.join(REPO, 'manifest.json'), 'utf8'));
    const startRewrite = rewrites.find(r => r.from === mf.start_url);
    const startServesApp = startRewrite
      ? startRewrite.to.endsWith('index.html')
      : mf.start_url.endsWith('index.html');
    // The published policy pages are generated from PRIVACY.md / TERMS.md.
    // If they drift, users read a policy that no longer describes the app —
    // which is the specific liability a privacy policy is meant to remove.
    const legal = require(path.join(REPO, 'scripts/build-legal.js'));
    for (const pg of legal.PAGES) {
      const md = fs.readFileSync(path.join(REPO, pg.md), 'utf8');
      const expected = legal.page(pg.title, legal.render(md), pg.path, pg.desc);
      const onDisk = fs.existsSync(path.join(REPO, pg.html))
        ? fs.readFileSync(path.join(REPO, pg.html), 'utf8') : '';
      check(`legal: ${pg.html} matches ${pg.md}`, onDisk === expected,
        onDisk ? 'stale — run node scripts/build-legal.js' : 'missing');
    }

    // ── SEO surface ──────────────────────────────────────────────────
    // /app and / previously shipped byte-identical titles, descriptions and
    // canonicals, so the app declared itself a duplicate of the marketing
    // page. Distinctness is the assertion that would have caught it.
    const SEO_PAGES = [
      { file: 'landing.html', canonical: 'https://thefirmfoundation.app' },
      { file: 'index.html',   canonical: 'https://thefirmfoundation.app/app' },
      { file: 'privacy.html', canonical: 'https://thefirmfoundation.app/privacy' },
      { file: 'terms.html',   canonical: 'https://thefirmfoundation.app/terms' },
      { file: '404.html',     canonical: 'https://thefirmfoundation.app/404' }
    ];
    const titles = new Map(), canons = new Map();
    for (const pg of SEO_PAGES) {
      const html = fs.readFileSync(path.join(REPO, pg.file), 'utf8');
      const title = (/<title>([^<]*)<\/title>/.exec(html) || [])[1] || '';
      const canon = (/<link rel="canonical" href="([^"]+)"/.exec(html) || [])[1] || '';
      const h1s = (html.match(/<h1[\s>]/g) || []).length;

      check(`seo: ${pg.file} has exactly one <h1>`, h1s === 1, `found ${h1s}`);
      check(`seo: ${pg.file} canonical is its own path`, canon === pg.canonical, canon || 'missing');
      check(`seo: ${pg.file} has a title and description`,
        title.length > 10 && /<meta name="description" content="[^"]{20,}"/.test(html), title);

      titles.set(pg.file, title);
      canons.set(pg.file, canon);
    }
    check('seo: every page title is unique',
      new Set(titles.values()).size === titles.size,
      [...titles.values()].join(' | '));
    check('seo: no two pages share a canonical',
      new Set(canons.values()).size === canons.size,
      [...canons.values()].join(' | '));

    // The card is summary_large_image, which renders 1200x630. The 512 square
    // icon that was here before cropped on every platform.
    const ogPath = path.join(REPO, 'assets/og-image.png');
    check('seo: og-image exists at 1200x630', (() => {
      if (!fs.existsSync(ogPath)) return false;
      const buf = fs.readFileSync(ogPath);
      return buf.readUInt32BE(16) === 1200 && buf.readUInt32BE(20) === 630;
    })(), 'assets/og-image.png');

    for (const f of ['robots.txt', 'sitemap.xml', 'llms.txt', '404.html']) {
      check(`seo: ${f} exists`, fs.existsSync(path.join(REPO, f)));
    }

    // A sitemap advertising a URL that does not resolve is worse than none.
    {
      const xml = fs.readFileSync(path.join(REPO, 'sitemap.xml'), 'utf8');
      const locs = [...xml.matchAll(/<loc>https:\/\/thefirmfoundation\.app([^<]*)<\/loc>/g)]
        .map(m => m[1] || '/');
      const resolves = p => p === '/' || rewrites.some(r => r.from === p);
      const broken = locs.filter(p => !resolves(p));
      check('seo: every sitemap URL resolves through netlify.toml',
        locs.length > 0 && broken.length === 0, broken.join(', ') || `${locs.length} URLs`);
    }

    // Structured data claimed price 0 after the app started charging.
    {
      const html = fs.readFileSync(path.join(REPO, 'landing.html'), 'utf8');
      const raw = (/<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html) || [])[1];
      let ld = null;
      try { ld = JSON.parse(raw); } catch {}
      const offers = ld && [].concat(ld.offers || []);
      const prices = (offers || []).map(o => o.price);
      check('seo: JSON-LD parses and prices match what is charged',
        !!ld && prices.includes('9.99') && prices.includes('79.00'),
        JSON.stringify(prices));
    }

    // Leftover scaffolding from whatever originally generated index.html.
    check('seo: no bundler placeholder left in index.html',
      !fs.readFileSync(path.join(REPO, 'index.html'), 'utf8').includes('__bundler_thumbnail'));

    // The catch-all must be last, or it swallows /app, /privacy and /terms.
    check('seo: 404 catch-all is the last redirect',
      rewrites.length > 0 && rewrites[rewrites.length - 1].from === '/*',
      rewrites.map(r => r.from).join(' → '));

    // Both must be reachable on the domain, or the in-app links 404.
    for (const route of ['/privacy', '/terms']) {
      const r = rewrites.find(x => x.from === route);
      check(`legal: ${route} is served`, !!r && r.to.endsWith('.html'),
        r ? r.to : 'no rewrite');
    }

    check('routing: installed PWA launches into the app, not the landing page',
      startServesApp,
      `start_url="${mf.start_url}" resolves to "${startRewrite ? startRewrite.to : mf.start_url}"`);
  }

  let failed = 0;
  for (const r of results) {
    if (!r.pass) failed++;
    console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.detail && !r.pass ? `  → ${r.detail}` : ''}`);
  }
  console.log(`\n${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('boot-test crashed:', e); process.exit(1); });
