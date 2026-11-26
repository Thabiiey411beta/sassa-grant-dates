// Tests for the SASSA Grant Dates hub. No dependencies — run with:
//   node tests/test-site.js
// from the site root. Exit code 0 = all pass.
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log("PASS  " + name); }
  else { fail++; console.log("FAIL  " + name + (extra ? " — " + extra : "")); }
}

// Load the data file in a sandbox (no DOM needed).
const dataSrc = fs.readFileSync(path.join(ROOT, "js", "data.js"), "utf8");
const sandbox = {};
new Function("window", dataSrc)(sandbox);
const D = sandbox.SASSA_DATA;

// --- Schedule ---
check("schedule has 12 months", D.schedule.length === 12, "got " + D.schedule.length);
const months = D.schedule.map(r => r.month);
check("schedule runs Apr 2026–Mar 2027",
  months[0] === "April 2026" && months[11] === "March 2027");
const dec = D.schedule.find(r => r.month === "December 2026");
check("Dec 2026: older 2 Dec", dec.older === "2026-12-02", dec.older);
check("Dec 2026: disability 3 Dec", dec.disability === "2026-12-03", dec.disability);
check("Dec 2026: children 4 Dec", dec.children === "2026-12-04", dec.children);
check("Dec 2026 not flagged revised", dec.revised === false);
const nov = D.schedule.find(r => r.month === "November 2026");
check("Nov 2026 revised: older 30 Oct", nov.older === "2026-10-30" && nov.revised === true);
check("Nov 2026 revised: disability 2 Nov", nov.disability === "2026-11-02");
check("Nov 2026 revised: children 3 Nov", nov.children === "2026-11-03");
const jan = D.schedule.find(r => r.month === "January 2027");
check("Jan 2027: 5/6/7 Jan", jan.older === "2027-01-05" && jan.disability === "2027-01-06" && jan.children === "2027-01-07");
// Dates are ordered within each month.
D.schedule.forEach(r => {
  check("order " + r.month, r.older <= r.disability && r.disability <= r.children);
});
// No other month is flagged revised.
check("only November is revised",
  D.schedule.filter(r => r.revised).length === 1);

// --- SRD ---
check("SRD Nov 2026 dates recorded", D.srd.november2026 === "23 and 25 November 2026");
check("SRD Dec 2026 NOT invented (null)", D.srd.december2026 === null);

// --- Amounts ---
const amt = Object.fromEntries(D.amounts.map(a => [a.id, a.amount]));
check("older persons R2,400", amt.older === 2400);
check("older 75+ R2,420", amt.older75 === 2420);
check("war veterans R2,420", amt.war === 2420);
check("disability R2,400", amt.disability === 2400);
check("care dependency R2,400", amt.care === 2400);
check("foster child R1,300 (current, from 1 Oct 2026)", amt.foster === 1300);
check("child support R580", amt.child === 580);
check("top-up R280", amt.topup === 280);
check("grant-in-aid R580", amt.aid === 580);
check("SRD R370", amt.srd === 370);

// --- Calculator maths (mirror of js/main.js logic) ---
function householdTotal(selections) {
  let total = 0;
  for (const [id, qty] of Object.entries(selections)) {
    const a = D.amounts.find(x => x.id === id);
    total += a.amount * qty;
  }
  return total;
}
check("calc: 1 older + 2 child support = 2400 + 1160",
  householdTotal({ older: 1, child: 2 }) === 3560);
check("calc: 2 older75 + 1 foster + 1 srd = 4840+1300+370",
  householdTotal({ older75: 2, foster: 1, srd: 1 }) === 6510);
check("calc: child + top-up = 860 per child",
  householdTotal({ child: 1, topup: 1 }) === 860);
check("calc: empty household = 0", householdTotal({}) === 0);
check("calc: full set sample",
  householdTotal({ older: 1, disability: 1, child: 3, foster: 1, srd: 1 }) === 2400 + 2400 + 1740 + 1300 + 370);

// --- Eligibility logic (mirror of the 5 questions) ---
function eligible(answers) {
  // answers: [age18-60, resident, unemployed, otherGrant, incomeUnder624]
  // pass = yes,yes,yes,no,yes
  const want = [true, true, true, false, true];
  return answers.every((a, i) => a === want[i]);
}
check("eligibility: all pass -> may qualify",
  eligible([true, true, true, false, true]) === true);
check("eligibility: under 18 -> no", eligible([false, true, true, false, true]) === false);
check("eligibility: employed -> no", eligible([true, true, false, false, true]) === false);
check("eligibility: other grant -> no", eligible([true, true, true, true, true]) === false);
check("eligibility: income R624+ -> no", eligible([true, true, true, false, false]) === false);

// --- Internal links resolve ---
const htmlFiles = fs.readdirSync(ROOT).filter(f => f.endsWith(".html"));
check("12 HTML pages", htmlFiles.length === 12, "got " + htmlFiles.length);
const allFiles = new Set();
(function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p);
    else allFiles.add(path.relative(ROOT, p).replace(/\\/g, "/"));
  }
})(ROOT);
let broken = [];
for (const file of htmlFiles) {
  const src = fs.readFileSync(path.join(ROOT, file), "utf8");
  const hrefs = [...src.matchAll(/href="([^"#]+)(#[^"]*)?"/g)].map(m => m[1]);
  const srcs = [...src.matchAll(/src="([^"]+)"/g)].map(m => m[1]);
  for (const link of [...hrefs, ...srcs]) {
    if (/^(https?:|mailto:|tel:)/.test(link)) continue;
    if (!allFiles.has(link)) broken.push(file + " -> " + link);
  }
}
check("no broken internal links", broken.length === 0, broken.join("; "));

// --- No status-check form fields anywhere ---
const forbidden = /<input[^>]*\b(id|name|placeholder)\s*=\s*"[^"]*(id[-_ ]?number|idnumber|cellphone|cell[-_ ]?number|phone[-_ ]?number|otp|one[-_ ]?time[-_ ]?pin|reference[-_ ]?number)[^"]*"/i;
let badFiles = [];
for (const f of allFiles) {
  if (!/\.(html|js)$/.test(f)) continue;
  if (f.startsWith("tests/")) continue; // the test file itself mentions <input>
  const src = fs.readFileSync(path.join(ROOT, f), "utf8");
  if (forbidden.test(src)) badFiles.push(f);
  if (/<input/i.test(src)) badFiles.push(f + " (has an <input> tag)");
}
check("no ID/phone/OTP/reference input field anywhere", badFiles.length === 0, badFiles.join("; "));

// --- "Not SASSA" disclaimer on every page ---
let missingDisclaimer = [];
for (const file of htmlFiles) {
  const src = fs.readFileSync(path.join(ROOT, file), "utf8");
  if (!/not SASSA, not the South African Government/i.test(src)) missingDisclaimer.push(file);
}
check("disclaimer on every page", missingDisclaimer.length === 0, missingDisclaimer.join(", "));

// --- No AdSense pub ID hard-coded; no ads.txt ---
let pubLeaks = [];
for (const f of allFiles) {
  if (!/\.(html|js)$/.test(f)) continue;
  if (f.startsWith("tests/")) continue; // the test file itself contains the pattern
  const src = fs.readFileSync(path.join(ROOT, f), "utf8");
  if (/ca-pub-\d+/.test(src)) pubLeaks.push(f);
}
check("no AdSense pub ID hard-coded", pubLeaks.length === 0, pubLeaks.join(", "));
check("no ads.txt yet", !allFiles.has("ads.txt"));

// --- Sitemap covers all pages ---
const sitemap = fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8");
const sitemapMissing = htmlFiles.filter(f => !sitemap.includes(f === "index.html" ? "vercel.app/" : f));
check("sitemap lists all 12 pages", sitemapMissing.length === 0, sitemapMissing.join(", "));

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
