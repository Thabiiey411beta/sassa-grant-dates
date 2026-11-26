// Single source of truth for payment dates and grant amounts.
// Dates verified 26 November 2026 against:
//  - Department of Social Development, "SASSA Confirms 2026/2027 Social Grant
//    Payment Schedule And Increases" (schedule approved by National Treasury,
//    20 March 2026)
//  - SASSA media statement, 28 October 2026: November 2026 dates were a
//    once-off change; December 2026 to March 2027 remain as originally announced.
//  - Budget 2026 (amounts from 1 April 2026; Foster Child R1,290 Apr-Sep 2026,
//    R1,300 from 1 October 2026).
// November 2026 SRD: paid 23 and 25 November 2026 (SASSA notice).
// December 2026 SRD dates: NOT yet announced by SASSA — do not invent them.
window.SASSA_DATA = {
  lastChecked: "26 November 2026",
  currentMonth: "December 2026",
  schedule: [
    { month: "April 2026",    older: "2026-04-02", disability: "2026-04-07", children: "2026-04-08", revised: false },
    { month: "May 2026",      older: "2026-05-05", disability: "2026-05-06", children: "2026-05-07", revised: false },
    { month: "June 2026",     older: "2026-06-02", disability: "2026-06-03", children: "2026-06-04", revised: false },
    { month: "July 2026",     older: "2026-07-02", disability: "2026-07-03", children: "2026-07-06", revised: false },
    { month: "August 2026",   older: "2026-08-04", disability: "2026-08-05", children: "2026-08-06", revised: false },
    { month: "September 2026",older: "2026-09-02", disability: "2026-09-03", children: "2026-09-04", revised: false },
    { month: "October 2026",  older: "2026-10-02", disability: "2026-10-05", children: "2026-10-06", revised: false },
    { month: "November 2026", older: "2026-10-30", disability: "2026-11-02", children: "2026-11-03", revised: true,
      note: "Revised once-off for the local government elections on 4 November 2026 (SASSA, 14 October 2026). Grants under review were paid on 5 November 2026." },
    { month: "December 2026", older: "2026-12-02", disability: "2026-12-03", children: "2026-12-04", revised: false },
    { month: "January 2027",  older: "2027-01-05", disability: "2027-01-06", children: "2027-01-07", revised: false },
    { month: "February 2027", older: "2027-02-02", disability: "2027-02-03", children: "2027-02-04", revised: false },
    { month: "March 2027",    older: "2027-03-02", disability: "2027-03-03", children: "2027-03-04", revised: false }
  ],
  // SRD has no fixed day. SASSA announces the dates each month.
  srd: {
    november2026: "23 and 25 November 2026",
    december2026: null, // not yet announced — shown as "not yet announced" on the site
    note: "The SRD grant is paid in batches during the last week of each month. There is no fixed day. Your own date is shown on the official SRD portal."
  },
  amounts: [
    { id: "older",        name: "Older Persons Grant (60–74)",        amount: 2400, per: "per month" },
    { id: "older75",      name: "Older Persons Grant (75 and older)", amount: 2420, per: "per month" },
    { id: "war",          name: "War Veterans Grant",                  amount: 2420, per: "per month" },
    { id: "disability",   name: "Disability Grant",                   amount: 2400, per: "per month" },
    { id: "care",         name: "Care Dependency Grant",              amount: 2400, per: "per month" },
    { id: "foster",       name: "Foster Child Grant",                 amount: 1300, per: "per child, per month", countable: true,
      note: "R1,290 from April to September 2026; R1,300 from 1 October 2026." },
    { id: "child",        name: "Child Support Grant",                amount: 580,  per: "per child, per month", countable: true },
    { id: "topup",        name: "Child Support Grant Top-up",         amount: 280,  per: "per child, per month", countable: true,
      note: "For children who have lost one or both parents. With the Child Support Grant, that is R860 per child." },
    { id: "aid",          name: "Grant-in-Aid",                       amount: 580,  per: "per month" },
    { id: "srd",          name: "Social Relief of Distress (SRD)",    amount: 370,  per: "per month",
      note: "Extended until 31 March 2028, announced in the October 2026 mini-budget, subject to the formal steps being completed." }
  ]
};
