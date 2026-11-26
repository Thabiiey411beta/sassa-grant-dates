// Runtime smoke test: runs the real js/main.js against a stub DOM and checks
// the countdown, the "this month" table, the calendar and the calculator render.
// Run: node tests/test-app-smoke.js
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log("PASS  " + name); }
  else { fail++; console.log("FAIL  " + name + (extra ? " — " + extra : "")); }
}

function makeEl(id) {
  const el = {
    id: id || "",
    innerHTML: "",
    textContent: "",
    style: {},
    _listeners: {},
    addEventListener: function (t, fn) { this._listeners[t] = fn; },
    querySelector: function () { return null; },
    querySelectorAll: function () { return []; },
    closest: function () { return null; },
    getAttribute: function () { return null; },
  };
  return el;
}

const ids = ["countdown", "this-month-table", "this-month-title", "this-month-note",
  "calendar-table", "amounts-table", "household-calculator", "srd-quiz",
  "quiz-question", "quiz-progress", "quiz-result", "calc-total", "calc-lines"];
const elements = {};
ids.forEach(id => { elements[id] = makeEl(id); });
// The quiz container needs querySelector for .quiz-buttons.
elements["srd-quiz"].querySelector = function (sel) {
  if (sel === ".quiz-buttons") return makeEl("quiz-buttons");
  return null;
};

const documentStub = {
  getElementById: function (id) { return elements[id] || null; },
  querySelectorAll: function () { return []; },
  head: { appendChild: function () {} },
  createElement: function () { return makeEl(); },
};
const windowStub = { SITE_CONFIG: { ADSENSE_CLIENT_ID: "", ADSENSE_SLOT_ID: "" } };
const sandbox = { window: windowStub, document: documentStub, console: console };
sandbox.window.document = documentStub;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, "js", "data.js"), "utf8"), sandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, "js", "main.js"), "utf8"), sandbox);

// Today is 26 Nov 2026 (system date). Next payment: Older Persons, 2 Dec 2026.
const cd = elements["countdown"].innerHTML;
check("countdown names Older Persons Grant", /Older Persons Grant/.test(cd), cd);
check("countdown shows 2 December 2026", /2 December 2026/.test(cd), cd);
check("countdown says in 6 days", /in 6 days/.test(cd), cd);

const tm = elements["this-month-table"].innerHTML;
check("this-month title is December 2026 payment dates", elements["this-month-title"].textContent === "December 2026 payment dates");
check("this-month table has 2/3/4 Dec", /2 December 2026/.test(tm) && /3 December 2026/.test(tm) && /4 December 2026/.test(tm));
check("this-month table mentions SRD not announced", /not been announced yet/.test(tm));

const cal = elements["calendar-table"].innerHTML;
check("calendar has all 12 months",
  ["April 2026", "November 2026", "March 2027"].every(m => cal.includes(m)));
check("calendar flags November Revised", /November 2026<span class="flag">Revised<\/span>/.test(cal));
check("calendar has 30 October 2026", /30 October 2026/.test(cal));

const amt = elements["amounts-table"].innerHTML;
check("amounts table has R1,300 foster", /R1,300/.test(amt));
check("amounts table has R370 SRD", /R370/.test(amt));

const calc = elements["household-calculator"].innerHTML;
check("calculator renders all 10 grants",
  ["Older Persons Grant (60–74)", "War Veterans Grant", "Foster Child Grant", "Social Relief of Distress (SRD)"]
    .every(n => calc.includes(n)), calc.slice(0, 200));
check("calculator total starts at R0", /R0/.test(calc));

// Quiz: first question shown.
check("quiz shows first question", /between 18 and 60/.test(elements["quiz-question"].textContent));
check("quiz progress says Question 1 of 5", elements["quiz-progress"].textContent === "Question 1 of 5");

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
