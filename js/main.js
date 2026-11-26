// Shared client-side logic. Everything runs in the browser; nothing is sent
// or stored anywhere. No personal data is collected on this site.
(function () {
  var D = window.SASSA_DATA;
  if (!D) return;

  function parseDate(iso) {
    var p = iso.split("-");
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }
  function fmt(iso) {
    var d = parseDate(iso);
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return days[d.getDay()] + ", " + d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear();
  }
  // en-ZA uses spaces/commas differently in some browsers; force R1,300 style.
  function moneyFmt(n) {
    return "R" + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // ---- Homepage countdown: next payment day from today ----
  var cd = document.getElementById("countdown");
  if (cd) {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var upcoming = [];
    D.schedule.forEach(function (row) {
      [["Older Persons Grant", row.older], ["Disability Grant", row.disability], ["Children's Grants", row.children]].forEach(function (pair) {
        var d = parseDate(pair[1]);
        if (d >= today) upcoming.push({ name: pair[0], date: d, iso: pair[1], month: row.month });
      });
    });
    upcoming.sort(function (a, b) { return a.date - b.date; });
    if (upcoming.length) {
      var next = upcoming[0];
      var diffDays = Math.round((next.date - today) / 86400000);
      var when = diffDays === 0 ? "today" : diffDays === 1 ? "tomorrow" : "in " + diffDays + " days";
      cd.innerHTML = "Next payment: <span class=\"big\">" + next.name + "</span><br>" +
        fmt(next.iso) + " — " + when + " (" + next.month + ").";
    }
  }

  // ---- Homepage "this month" table ----
  var thisMonth = document.getElementById("this-month-table");
  if (thisMonth) {
    var now = new Date();
    // Show the next month that still has a payment day ahead (or the current month).
    var row = null;
    for (var i = 0; i < D.schedule.length; i++) {
      var last = parseDate(D.schedule[i].children);
      var todayMid = new Date(); todayMid.setHours(0, 0, 0, 0);
      if (last >= todayMid) { row = D.schedule[i]; break; }
    }
    if (!row) row = D.schedule[D.schedule.length - 1];
    document.getElementById("this-month-title").textContent = row.month + " payment dates";
    thisMonth.innerHTML =
      "<tr><th>Grant</th><th>Payment date</th><th>Amount</th></tr>" +
      "<tr><td>Older Persons Grant</td><td>" + fmt(row.older) + (row.revised ? '<span class="flag">Revised</span>' : "") + "</td><td class=\"num\">R2,400 <span class=\"small\">(R2,420 at 75+)</span></td></tr>" +
      "<tr><td>Disability Grant</td><td>" + fmt(row.disability) + (row.revised ? '<span class="flag">Revised</span>' : "") + "</td><td class=\"num\">R2,400</td></tr>" +
      "<tr><td>Children&rsquo;s Grants</td><td>" + fmt(row.children) + (row.revised ? '<span class="flag">Revised</span>' : "") + "</td><td class=\"num\">R580 <span class=\"small\">per child</span></td></tr>" +
      "<tr><td>SRD Grant (R370)</td><td colspan=\"2\">No fixed day. Paid in batches in the last week of the month. " +
      (D.srd.december2026 ? "December 2026 dates: " + D.srd.december2026 + "." : "December 2026 dates have not been announced yet. In November 2026 SASSA paid SRD on " + D.srd.november2026 + ".") +
      " Check your own date on the official SRD portal.</td></tr>";
    if (row.revised) {
      document.getElementById("this-month-note").textContent = row.note;
      document.getElementById("this-month-note").style.display = "block";
    }
  }

  // ---- Full calendar table ----
  var cal = document.getElementById("calendar-table");
  if (cal) {
    var html = "<tr><th>Month</th><th>Older Persons</th><th>Disability</th><th>Children&rsquo;s</th></tr>";
    D.schedule.forEach(function (row) {
      html += "<tr><td>" + row.month + (row.revised ? '<span class="flag">Revised</span>' : "") + "</td>" +
        "<td>" + fmt(row.older) + "</td><td>" + fmt(row.disability) + "</td><td>" + fmt(row.children) + "</td></tr>";
    });
    cal.innerHTML = html;
  }

  // ---- Amounts table ----
  var amt = document.getElementById("amounts-table");
  if (amt) {
    var ahtml = "<tr><th>Grant</th><th class=\"num\">Amount</th></tr>";
    D.amounts.forEach(function (a) {
      ahtml += "<tr><td>" + a.name + (a.note ? "<br><span class=\"small\">" + a.note + "</span>" : "") + "</td><td class=\"num\">" + moneyFmt(a.amount) + "<br><span class=\"small\">" + a.per + "</span></td></tr>";
    });
    amt.innerHTML = ahtml;
  }

  // ---- Household grant calculator ----
  var calc = document.getElementById("household-calculator");
  if (calc) {
    var rows = "";
    D.amounts.forEach(function (a) {
      rows += '<div class="calc-row" data-id="' + a.id + '" data-amount="' + a.amount + '">' +
        '<label>' + a.name + ' <span class="amt">' + moneyFmt(a.amount) + ' ' + a.per + '</span></label>';
      rows += '<span class="qty"><button type="button" data-act="minus" aria-label="One fewer">−</button><output>0</output><button type="button" data-act="plus" aria-label="One more">+</button></span>';
      rows += '</div>';
    });
    calc.innerHTML = rows +
      '<p class="calc-total">Household total: <span id="calc-total">R0</span> per month</p>' +
      '<p class="calc-lines" id="calc-lines">Tick the grants your household receives. Nothing you enter here leaves your phone or computer.</p>';
    function updateTotal() {
      var total = 0, lines = [];
      calc.querySelectorAll(".calc-row").forEach(function (row) {
        var amount = +row.getAttribute("data-amount");
        var name = row.querySelector("label").textContent.trim();
        var qty = 0;
        var out = row.querySelector("output");
        if (out) qty = +out.textContent;
        if (qty > 0) {
          total += amount * qty;
          lines.push(name + (qty > 1 ? " × " + qty : "") + ": " + moneyFmt(amount * qty));
        }
      });
      document.getElementById("calc-total").textContent = moneyFmt(total);
      document.getElementById("calc-lines").textContent = lines.length
        ? lines.join(" · ") + ". Total " + moneyFmt(total) + " per month."
        : "Tick the grants your household receives. Nothing you enter here leaves your phone or computer.";
    }
    calc.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-act]");
      if (!btn) return;
      var out = btn.parentElement.querySelector("output");
      var v = +out.textContent + (btn.getAttribute("data-act") === "plus" ? 1 : -1);
      if (v < 0) v = 0;
      if (v > 20) v = 20;
      out.textContent = v;
      updateTotal();
    });
    calc.addEventListener("change", updateTotal);
  }

  // ---- SRD eligibility self-check ----
  var quiz = document.getElementById("srd-quiz");
  if (quiz) {
    var questions = [
      { q: "Are you between 18 and 60 years old?", yes: true },
      { q: "Are you a South African citizen, permanent resident, refugee or asylum seeker living in South Africa?", yes: true },
      { q: "Are you currently unemployed — no job and no UIF payments?", yes: true },
      { q: "Do you receive any other social grant, NSFAS funding or UIF money?", yes: false },
      { q: "Does less than R624 a month go into your bank account? (This is the income test SASSA uses.)", yes: true }
    ];
    var step = 0, failed = null;
    var qEl = document.getElementById("quiz-question");
    var progEl = document.getElementById("quiz-progress");
    var resultEl = document.getElementById("quiz-result");
    function showStep() {
      if (step >= questions.length) { finish(); return; }
      progEl.textContent = "Question " + (step + 1) + " of " + questions.length;
      qEl.textContent = questions[step].q;
      resultEl.innerHTML = "";
    }
    function finish() {
      quiz.querySelector(".quiz-buttons").style.display = "none";
      progEl.textContent = "Your result";
      qEl.textContent = "";
      if (failed === null) {
        resultEl.innerHTML = '<div class="good"><strong>You may qualify for the SRD grant.</strong><p>Based on your answers, you meet the basic conditions SASSA lists. SASSA still has to check your details — this is a guide, not a decision.</p><p><a class="btn" href="https://srd.sassa.gov.za/">Apply on the official SRD site &rarr;</a></p></div>';
      } else {
        resultEl.innerHTML = '<div class="notice"><strong>You likely do not qualify for the SRD grant.</strong><p>' + failed + '</p><p>If your situation has changed, you can still apply and let SASSA decide — applying is free. Do not pay anyone to apply for you.</p><p><a class="btn btn-secondary" href="https://srd.sassa.gov.za/">Go to the official SRD site &rarr;</a></p></div>';
      }
    }
    var reasons = [
      "The SRD grant is for people aged 18 to 60.",
      "The SRD grant is for South African citizens, permanent residents, refugees and asylum seekers living in South Africa.",
      "The SRD grant is for people who are unemployed and not receiving UIF.",
      "You cannot get the SRD grant while you receive another social grant, NSFAS funding or UIF money.",
      "SASSA checks your bank account. If R624 or more a month goes in, you do not pass the income test."
    ];
    quiz.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-answer]");
      if (!btn) return;
      var answerYes = btn.getAttribute("data-answer") === "yes";
      if (answerYes !== questions[step].yes) { failed = reasons[step]; }
      step++;
      showStep();
    });
    showStep();
  }

  // Expose formatters for tests.
  window.SASSA_UTILS = { parseDate: parseDate, fmt: fmt, moneyFmt: moneyFmt };
})();
