# SASSA Grant Dates — independent payment-dates & amounts hub

**Independent website — not SASSA, not the South African Government.**

Answers one question fast: *when is my SASSA grant paid, how much is it, and what do I do if it isn't there?* Static HTML/CSS/JS, no framework, no backend, no sign-up, no accounts.

## Pages (12)

| Page | What it does |
|---|---|
| `index.html` | This month (December 2026): payment table + countdown, amounts summary, quick answers, FAQ JSON-LD |
| `payment-dates.html` | Full 2026/27 calendar, all 12 months, November 2026 flagged Revised |
| `grant-amounts.html` | Amounts table + April 2026 increase history |
| `calculator.html` | Household grant calculator (client-side only) |
| `srd-eligibility.html` | SRD eligibility self-check, 5 questions, no personal data |
| `how-to-check-status.html` | Official status-check guide + scam warning |
| `grant-not-paid.html` | Reviews, banking details, Postbank Black Card, appeals |
| `updates.html` | Dated update log + conflicts we did not hide |
| `about.html` / `contact.html` / `privacy.html` / `terms.html` | Trust pages |

## Facts — verified 26 November 2026

- **Payment calendar:** Department of Social Development 2026/27 schedule (Treasury approved 20 March 2026). November 2026 revised once-off per SASSA statements of 14 and 28 October 2026 (local government elections 4 Nov); December 2026–March 2027 unchanged.
- **December 2026:** Older Persons Wed 2 Dec, Disability Thu 3 Dec, Children's Fri 4 Dec.
- **Amounts (April 2026):** Older Persons/Disability/Care Dependency R2,400; 75+ and War Veterans R2,420; Child Support and Grant-in-Aid R580; Child Support Top-up R280; SRD R370. **Foster Child: R1,290 Apr–Sep 2026, R1,300 from 1 October 2026** (Budget 2026 two-step increase — the research report's April-only figure was superseded).
- **SRD:** November 2026 paid 23 & 25 November. **December 2026 SRD dates not yet announced** — the site says so plainly instead of inventing dates.
- **SRD extension:** funded to 31 Mar 2027; October 2026 mini-budget announced continuation to 31 Mar 2028, subject to formal steps.
- **Channels:** srd.sassa.gov.za/sc19/status, USSD `*120*3210#`, WhatsApp 082 601 0111, toll-free 0800 601 011, appeals at srd.sassa.gov.za/appeals (90 days, per month, tribunal 60–90 days).

## Must NOT build (v1 exclusions, honoured)

No status-check form (no ID/phone/OTP field anywhere — grep-verified), no login/accounts/app/forum/comments, no "apply here" flow (links to official site only), no loan/credit/betting offers, no auto-generated monthly doorway pages, no grocery/fuel/NSFAS/jobs/salary sections, no paywall, no email capture, no push notifications. No SASSA logo or branding used.

## AdSense

AdSense-ready only: `js/ads.js` renders nothing unless `ADSENSE_CLIENT_ID` is set in `config.js`. No pub ID is hard-coded; no `ads.txt` until approval. After deploy: add the site in AdSense under musehacks007@gmail.com (the confirmed owning account), set the client ID, add root `ads.txt`, redeploy, request review.

## Deploy

Static site — Vercel: import repo, no framework, no build command, no env vars. Canonical/OG/sitemap URLs assume `https://sassa-grant-dates.vercel.app` — update `config.js` (`SITE_URL`), canonical/OG tags, `robots.txt` and `sitemap.xml` if the live URL differs.

## Tests

`node tests/test-site.js` — checks the data (12-month schedule, amounts, December dates, SRD unannounced), calculator maths, eligibility logic, and that every internal link resolves. Run before every push.
