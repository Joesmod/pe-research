# PE Enrichment Report
**Date:** March 8, 2026 - 9:06 AM CST  
**Agent:** Jim (PE Research)

## Summary

**Enrichment Run:** Apollo API search for 12 firms needing contacts  
**Status:** 11/12 firms enriched with contact names and titles  
**Issue:** Emails not revealed (requires additional enrichment API call)

## Firms Enriched (Contact Names Found)

1. **HRCap, Inc.** - Stella (CEO & President)
2. **HSP - Henkel Search Partners** - Alyson (CFO)
3. **Jett Capital Advisors** - Matt (Partner)
4. **Kinect Capital** - Danielle (Marketing Director)
5. **Odyssey Search Partners** - Chris (Partner)
6. **TAP Advisors** - David (Partner)
7. **Valiant Capital Management** - Matt (Partner)
8. **Victory Capital** - Denise (Strategic Operations Partner)
9. **Wall Street Oasis** - Guus (CFO)
10. **Wall Street Prep** - Andrew (CMO)
11. **Wefunder** - Greg (Cofounder/CTO)

## Issues Identified

### 1. Not Actual PE Firms
Several enriched firms are NOT mid-market PE firms:
- **Wall Street Oasis** - Financial career community/forum
- **Wall Street Prep** - Financial training/education
- **Wefunder** - Equity crowdfunding platform
- **Kinect Capital** - Non-profit/foundation (.org domain)

**Action Needed:** Mark these as "Dead - Not a PE Firm" in sheet

### 2. Incomplete Email Data
Apollo search API returns contact info but NOT emails. Emails require:
- Separate enrichment API call (`/v1/people/enrich`)
- Credits consumed per enrichment
- May still return "guessed" vs "verified"

### 3. Missing Last Names
API response format shows `undefined` for last names - needs fix in parsing

## Recommendations

### Short-term: Manual Research for Top 20 PE Firms
For high-value targets with $500M-$5B AUM, do manual research:
1. Check firm website team pages
2. LinkedIn site search for partners/MDs
3. Press releases and conference bios
4. SEC filings (for regulated firms)

**Priority firms still needing enrichment:**
- AEA Investors ($18B AUM)
- Siris Capital Group ($6B+ AUM)
- The Jordan Company (TJC) - $12B+ AUM (enriched partially)
- Oak HC/FT - Healthcare/fintech focused
- JMI Equity - Software-focused growth equity

### Mid-term: Apollo Email Enrichment
- Implement email enrichment endpoint
- Batch process the 11 contacts found today
- Filter for "verified" or "likely" status only
- Track credit usage

### Long-term: Quality over Quantity
- Focus on fewer, higher-quality leads
- Prioritize firms with clear service/tech needs
- Verify PE focus before enrichment (avoid non-PE firms)

## Sheet Updates Made

**Updated 11 rows** with:
- Contact Name (first name only - last name parsing issue)
- Title
- LinkedIn URL (where available)
- Status: "Enriched"
- Source: "Apollo API"
- Notes: "Apollo enriched - 2026-03-08"

## Next Steps

1. **Fix dead firm statuses** - Mark non-PE firms as "Dead"
2. **Implement email enrichment** - Add Apollo enrich endpoint
3. **Manual research top 5-10 firms** - Target high-value leads
4. **Update enrichment script** - Fix last name parsing
5. **Add firm validation** - Check AUM/PE focus before enriching

## Files Generated

- `apollo-enrich-fix-906am.js` - Working enrichment script (contact search)
- `enrichment-report-march8-906am.md` - This report

## Credits Used

- Apollo API search calls: 12 (free endpoint)
- Apollo email enrichments: 0 (not yet implemented)

---

**Next cron run:** Continue enrichment with email reveal calls for the 11 contacts found.
