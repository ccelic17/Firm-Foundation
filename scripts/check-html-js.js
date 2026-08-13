// Extracts every inline <script> block from an HTML file and syntax-checks it.
// Also verifies that each inline on*= handler names a function that is defined.
const fs = require('fs');
const vm = require('vm');

const file = process.argv[2];
const html = fs.readFileSync(file, 'utf8');

// ── 1. Syntax-check each inline script block ────────────────────────
const blockRe = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
let m, idx = 0, failed = false;
while ((m = blockRe.exec(html)) !== null) {
  idx++;
  const code = m[1];
  if (!code.trim()) continue;
  const line = html.slice(0, m.index).split('\n').length;
  try {
    new vm.Script(code, { filename: `${file}:block${idx}@line${line}` });
    console.log(`OK   script block #${idx} (starts line ${line}, ${code.split('\n').length} lines)`);
  } catch (e) {
    failed = true;
    console.error(`FAIL script block #${idx} (starts line ${line}): ${e.message}`);
  }
}

// ── 2. Every on*="fn(...)" handler must reference a defined function ─
const allCode = [...html.matchAll(blockRe)].map(x => x[1]).join('\n');
const defined = new Set();
for (const re of [
  /\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g,
  /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:function\b|\()/g,
]) {
  let d;
  while ((d = re.exec(allCode)) !== null) defined.add(d[1]);
}
// Browser/global builtins reachable from a handler.
const builtins = new Set(['window', 'document', 'this', 'alert', 'confirm', 'console', 'event', 'navigator', 'history']);

const handlerRe = /\bon[a-z]+\s*=\s*"([^"]*)"/gi;
const missing = new Map();
let h;
while ((h = handlerRe.exec(html)) !== null) {
  const body = h[1];
  let c;
  // Negative lookbehind on "." so member calls (document.getElementById,
  // str.replace) are not mistaken for bare global function references.
  const callRe = /(?<![.\w$])([A-Za-z_$][\w$]*)\s*\(/g;
  while ((c = callRe.exec(body)) !== null) {
    const name = c[1];
    if (defined.has(name) || builtins.has(name)) continue;
    if (/^(if|for|while|switch|catch|return|typeof|new|function|var)$/.test(name)) continue;
    const line = html.slice(0, h.index).split('\n').length;
    if (!missing.has(name)) missing.set(name, []);
    missing.get(name).push(line);
  }
}

if (missing.size) {
  failed = true;
  console.error('\nUNDEFINED handler targets:');
  for (const [name, lines] of missing) {
    console.error(`  ${name}()  referenced at line(s) ${lines.join(', ')}`);
  }
} else {
  console.log('OK   all inline on*= handlers resolve to defined functions');
}

process.exit(failed ? 1 : 0);
