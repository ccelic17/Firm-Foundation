#!/usr/bin/env node
/**
 * Renders PRIVACY.md and TERMS.md into standalone pages served at /privacy
 * and /terms.
 *
 * The markdown is the single source of truth. Hand-maintaining a second HTML
 * copy is how documents drift out of sync with what they describe, which is
 * the whole failure this repo has already had to correct once. boot-test.js
 * re-runs this and fails if the committed HTML does not match, so the pages
 * cannot silently fall behind the policy.
 *
 * Deliberately dependency-free: this repo has no build step and Netlify
 * publishes the directory as-is.
 *
 * Run: node scripts/build-legal.js
 */
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
const ORIGIN = 'https://thefirmfoundation.app';

const PAGES = [
  { md: 'PRIVACY.md', html: 'privacy.html', title: 'Privacy Policy', path: '/privacy',
    desc: 'What Firm Foundation collects, what stays on your device, and every third party that receives data.' },
  { md: 'TERMS.md', html: 'terms.html', title: 'Terms of Service', path: '/terms',
    desc: 'Free and paid tiers, billing and cancellation, and the limits of the AI in Firm Foundation.' }
];

const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Inline: code, bold, italic, links. Order matters — code first so its content is left alone. */
function inline(t) {
  return esc(t)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function render(md) {
  const lines = md.split('\n');
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (/^\s*$/.test(line)) { i++; continue; }

    if (/^---+$/.test(line.trim())) { out.push('<hr>'); i++; continue; }

    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) { const n = h[1].length; out.push(`<h${n}>${inline(h[2])}</h${n}>`); i++; continue; }

    // Table: header row, separator, then body until a non-pipe line.
    if (/^\s*\|/.test(line) && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1] || '')) {
      const cells = r => r.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
      const head = cells(line);
      i += 2;
      const body = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) { body.push(cells(lines[i])); i++; }
      out.push(
        '<div class="scroll"><table><thead><tr>' +
        head.map(c => `<th>${inline(c)}</th>`).join('') +
        '</tr></thead><tbody>' +
        body.map(r => '<tr>' + r.map(c => `<td>${inline(c)}</td>`).join('') + '</tr>').join('') +
        '</tbody></table></div>'
      );
      continue;
    }

    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, '')); i++; }
      out.push(`<blockquote>${inline(buf.join(' '))}</blockquote>`);
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { buf.push(lines[i].replace(/^\s*[-*]\s+/, '')); i++; }
      out.push('<ul>' + buf.map(b => `<li>${inline(b)}</li>`).join('') + '</ul>');
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { buf.push(lines[i].replace(/^\s*\d+\.\s+/, '')); i++; }
      out.push('<ol>' + buf.map(b => `<li>${inline(b)}</li>`).join('') + '</ol>');
      continue;
    }

    const buf = [];
    while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^(#{1,6}\s|>|\s*[-*]\s|\s*\d+\.\s|\s*\|)/.test(lines[i]) && !/^---+$/.test(lines[i].trim())) {
      buf.push(lines[i]); i++;
    }
    if (buf.length) out.push(`<p>${inline(buf.join(' '))}</p>`);
  }
  return out.join('\n');
}

const page = (title, body, path = '', desc = '') => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} — Firm Foundation</title>
<meta name="description" content="${desc || title + ' for Firm Foundation.'}">
<link rel="canonical" href="${ORIGIN}${path}">
<meta property="og:title" content="${title} — Firm Foundation">
<meta property="og:description" content="${desc || title + ' for Firm Foundation.'}">
<meta property="og:url" content="${ORIGIN}${path}">
<meta property="og:type" content="website">
<meta property="og:image" content="${ORIGIN}/assets/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Firm Foundation — Body. Spirit. Mind.">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#C4911A">
<link rel="icon" href="/assets/favicon.ico">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root{--bg:#07090F;--surface:#0D1119;--gold:#C4911A;--tp:#E8ECF4;--tm:#8A96B0;--ts:#4E5A72;--border:#1E2B42}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--tp);font-family:'DM Sans',system-ui,sans-serif;font-size:15px;line-height:1.7}
  .wrap{max-width:720px;margin:0 auto;padding:32px 22px 80px}
  .back{display:inline-block;font-size:12px;color:var(--gold);text-decoration:none;margin-bottom:28px;letter-spacing:1px;text-transform:uppercase}
  .back:hover{text-decoration:underline}
  h1{font-family:'Barlow Condensed',sans-serif;font-size:38px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 6px;line-height:1.05}
  h2{font-family:'Barlow Condensed',sans-serif;font-size:22px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;margin:38px 0 10px;color:var(--gold)}
  h3{font-size:15px;font-weight:600;margin:24px 0 6px;color:var(--tp)}
  p,li{color:var(--tm)}
  strong{color:var(--tp)}
  a{color:var(--gold)}
  ul,ol{padding-left:20px}
  li{margin-bottom:5px}
  hr{border:none;border-top:1px solid var(--border);margin:34px 0}
  blockquote{margin:18px 0;padding:12px 16px;border-left:3px solid var(--gold);background:var(--surface);color:var(--tm);font-size:14px}
  code{background:var(--surface);padding:1px 5px;border-radius:3px;font-size:13px;color:var(--gold)}
  .scroll{overflow-x:auto;margin:16px 0}
  table{border-collapse:collapse;width:100%;font-size:13.5px;min-width:420px}
  th,td{text-align:left;padding:9px 11px;border-bottom:1px solid var(--border);vertical-align:top}
  th{color:var(--gold);font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600}
  footer{margin-top:56px;padding-top:20px;border-top:1px solid var(--border);font-size:12px;color:var(--ts)}
  footer a{color:var(--tm)}
</style>
</head>
<body>
<div class="wrap">
<a class="back" href="/app">← Back to the app</a>
${body}
<footer>
  <a href="/">Home</a> · <a href="/app">The app</a> ·
  <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> ·
  <a href="mailto:support@thefirmfoundation.app">support@thefirmfoundation.app</a>
</footer>
</div>
</body>
</html>
`;

let changed = 0;
for (const p of PAGES) {
  const md = fs.readFileSync(path.join(REPO, p.md), 'utf8');
  const html = page(p.title, render(md), p.path, p.desc);
  const dest = path.join(REPO, p.html);
  const current = fs.existsSync(dest) ? fs.readFileSync(dest, 'utf8') : null;
  if (current !== html) { fs.writeFileSync(dest, html); changed++; console.log(`wrote ${p.html}`); }
  else console.log(`${p.html} up to date`);
}
process.exitCode = 0;
module.exports = { render, page, PAGES };
