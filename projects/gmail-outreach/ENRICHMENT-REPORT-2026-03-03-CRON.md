# PE Research & Enrichment Report
**Date:** March 3, 2026 11:36 AM CST
**Type:** Hourly Cron Job

## Summary
- **Total firms searched:** 14
- **Leads successfully enriched:** 12
- **Success rate:** 86%
- **Verified emails found:** 11
- **Name/title only updates:** 1

## Enriched Leads

### Batch 1 (10 leads)

1. **Argonaut Private Equity**
   - Contact: Anil Khatod
   - Title: Sr. Partner & Managing Director
   - Email: akhatod@kfoc.net (verified)
   - Row: 307

2. **Calvert Street Investment Partners**
   - Contact: Reidan Cruz
   - Title: Managing Director, Investor Relations
   - Email: rcruz@calvertst.com (verified)
   - Row: 368

3. **Caprae Capital Partners**
   - Contact: Madeline Younas
   - Title: Limited Partner
   - Email: (none found - partial update)
   - Row: 369

4. **Infinity Capital Partners**
   - Contact: Chris Mehalko
   - Title: Vice President, Business Development
   - Email: cmehalko@infinityfunds.com (verified)
   - Row: 374

5. **Cambridge Capital LLC**
   - Contact: Stephen Edenbaum
   - Title: Vice President, Business Development
   - Email: stephen.edenbaum@cambridgehomes.com (verified)
   - Row: 456

6. **Palm Beach Capital**
   - Contact: Mike Schmickle
   - Title: Partner
   - Email: mschmickle@pbcap.com (verified)
   - Row: 478

7. **Stronghold Investment Management**
   - Contact: Quin Cogdell
   - Title: Managing Director
   - Email: quin.cogdell@srp-ok.com (verified)
   - Row: 485

8. **Aurora Capital Partners**
   - Contact: Matthew Laycock
   - Title: Partner
   - Email: mlaycock@auroracap.com (verified)
   - Row: 500

9. **Edgewater Capital Partners**
   - Contact: Tom Edson
   - Title: President & CEO
   - Email: tom@edgewaterfund.com (verified)
   - Row: 510

10. **Emerging Capital Partners - ECP**
    - Contact: Carolyn Campbell
    - Title: Managing Partner, CEO/COO and Founder
    - Email: campbellc@ecpinvestments.com (verified)
    - Row: 511

### Batch 2 (2 leads)

11. **Levine Leichtman Capital Partners, LLC**
    - Contact: David Wolmer
    - Title: Partner, Co-Chief Operating Officer and General Counsel
    - Email: dwolmer@llcp.com (verified)
    - Row: 525

12. **Peninsula Capital Partners L.L.C.**
    - Contact: Andrew Wiegand
    - Title: Partner
    - Email: wiegand@peninsulafunds.com (verified)
    - Row: 531

## Firms Not Found
- **Pritzker Group Private Capital** - No results (firm may use different name/website)
- **Frontenac Company** - No results

## Method
- Apollo API (`mixed_people/api_search` + `people/match`)
- Target titles: Managing Director, Partner, Principal, CEO, President, COO, CTO, VP Business Development, VP Technology, VP Operations
- Email verification: Apollo verified status
- Rate limiting: 1.5s between requests

## Next Steps
1. ✅ Update Google Sheet (completed)
2. ⏳ Update GitHub dossiers in pe-research repo
3. ⏳ Continue monitoring for Pritzker and Frontenac (try alternative searches)

## Files Generated
- `enrichment-log-2026-03-03.json`
- `enrichment-log-batch2-2026-03-03.json`
- `enrich-cron-batch.js`
- `enrich-cron-batch2.js`
