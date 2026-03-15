# PE Research & Enrichment Report
**Date:** March 12, 2026 — 11:37 AM (CST)  
**Type:** Hourly Cron Job  
**Mission:** Enrich existing leads in Google Sheet with verified contact information

## Summary
- **Total rows analyzed:** 1,056
- **Rows needing enrichment:** 101
- **Priority firms targeted:** 15
- **Apollo API searches:** 15
- **Contacts found via Apollo:** 0
- **Manual research firms:** 5

## Key Findings

### Apollo API Limitations
Apollo API returned NO usable contacts for large PE firms. Reasons:
1. Large PE firms (Thomas H. Lee, Hg Capital, etc.) don't have employee emails in Apollo's database
2. API only returns generic emails (info@, contact@) which we filter out
3. These firms actively protect employee contact information

### Alternative Research Methods Required
For established PE firms, need to use:
- **LinkedIn Sales Navigator** searches
- **Manual website scraping** (team pages, press releases)
- **SEC filings** for portfolio company board members
- **Conference speaker bios** and **industry publications**
- **Inferred email patterns** from RocketReach/Hunter.io (with verification)

## Manual Research Results

### 1. Thomas H. Lee Partners (Row 161)
- **Domain:** thl.com
- **Leadership:**
  - Tony DiNovi - Chairman (since 2021, Co-CEO for 17 years prior)
  - Tom Hagerty - Managing Director (joined 1998, Financial Services & Technology vertical)
- **Status:** Names confirmed via thl.com/people, NO direct emails found publicly
- **Next Step:** LinkedIn outreach or use email pattern (likely first.last@thl.com)
- **Source:** https://thl.com/people/tony-dinovi/, https://thl.com/people/tom-hagerty/

### 2. Hg Capital (Row 176)
- **Domain:** hgcapital.com
- **Status:** No contacts found in Apollo API, needs manual website research
- **Recommendation:** Check hgcapital.com/team for Managing Partners

### 3. WindPoint Partners (Row 220)
- **Domain:** wppartners.com  
- **Note from sheet:** Email pattern verified 89.4% via RocketReach: [first_initial][last]@wppartners.com
- **Status:** Pattern known, need to identify specific contact name

### 4-15. Remaining Priority Firms
All returned 0 contacts from Apollo API. These established PE firms require:
- Manual LinkedIn searches
- Website team page scraping
- Email pattern inference (not guessing)

## Recommendations

### Immediate Actions (Next Cron Run)
1. **Shift focus to smaller/newer PE firms** (rows 942-1057) — more likely to have public contacts
2. **Use web scraping** for team pages of priority firms
3. **Document email patterns** from RocketReach/Hunter (don't invent, only use verified)
4. **LinkedIn Sales Navigator** bulk export if available

### Manual Research Priority (Top 10)
Focus manual effort on these high-value firms:
1. Thomas H. Lee Partners - $34B+ AUM
2. Sentinel Capital Partners - Mid-market PE
3. Harkness Capital Partners
4. Odyssey Investment Partners
5. CIVC Partners
6. Mill Point Capital
7. Bertram Capital
8. Argonaut Private Equity
9. Harvest Partners (SCF)
10. The Jordan Company

### Alternative Approach: "Newer" Firms (Easier to Enrich)
Rows 942-1057 include:
- **Whistler Capital Partners** (row 942)
- **Tritium Partners** (row 943)
- **Primus Capital** (row 944)
- **Monroe Capital** (row 945)
- **Bow River Capital** (row 952, 955, 974, 1022, 1055)
- **K1 Investment Management** (row 954)
- **Amulet Capital** (row 975)
- **Trivest Partners** (row 976)

These may have:
- Smaller teams with more accessible contacts
- Founders still active in operations
- Public LinkedIn profiles with email addresses
- Less restrictive email policies

## Technical Notes
- Apollo API endpoint: `https://api.apollo.io/api/v1/mixed_people/api_search`
- Rate limit: 1 second between requests
- Titles searched: CEO, COO, CTO, Managing Partner, Managing Director, VP Technology, VP Operations, etc.
- Filter: Exclude info@, contact@, sales@, ir@ addresses

## Next Steps for This Cron Job
1. **Switch target list to rows 942-1057** (smaller/newer firms)
2. Try 10-15 of these firms with Apollo API
3. If Apollo fails again, use web_search + web_fetch to scrape team pages
4. Document all findings with sources
5. Update Google Sheet with verified contacts only

## Files Generated
- `enrichment-results-march12-1137am.json` - Full results log
- `CRON-ENRICHMENT-2026-03-12-1137AM.md` - This report

---
**Status:** ⚠️ PARTIAL SUCCESS - Strategy pivot needed  
**Time Spent:** ~20 minutes  
**API Credits Used:** 15 Apollo searches  
**Rows Updated:** 0 (no verified contacts found)
