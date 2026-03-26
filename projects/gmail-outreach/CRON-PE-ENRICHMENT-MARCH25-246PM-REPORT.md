# PE Research & Enrichment Report
**Run Date:** March 25, 2026 - 2:46 PM CST  
**Status:** ✓ Completed  
**Script:** `cron-pe-enrichment-final-march25-246pm.js`

## Summary

**Firms Processed:** 5  
**Firms Enriched:** 0  
**Firms Flagged for Manual Research:** 5

## Findings

All 5 firms needing enrichment are **not in Apollo's database**. This is common for private equity firms as they are often private companies with limited public data.

### Firms Flagged for Manual Research

1. **Lightyear Capital** (Row 1256)
   - Website: https://www.lycap.com
   - Current: No contact, no email
   - Status: Flagged - Apollo has no data

2. **Huron Capital Partners** (Row 1257)
   - Website: https://www.huroncapital.com
   - Current: No contact, no email
   - Status: Flagged - Apollo has no data

3. **HGGC** (Row 1258)
   - Website: https://www.hggc.com
   - Current: No contact, no email
   - Status: Flagged - Apollo has no data

4. **Arsenal Capital Partners** (Row 1259)
   - Website: https://www.arsenalcapital.com
   - Current: No contact, no email
   - Status: Flagged - Apollo has no data

5. **Behrman Capital** (Row 1260)
   - Website: https://www.behrmancap.com
   - Current: No contact, no email
   - Status: Flagged - Apollo has no data

## Actions Taken

- ✓ All 5 firms updated with notes: "Apollo search: No contacts found (2026-03-25). Firm not in Apollo database. Manual research needed: website team pages, LinkedIn site: search, or press releases."
- ✓ Ready for manual enrichment workflow

## Manual Research Recommendations

For these firms, try:

1. **Website Team/Contact Pages:**
   - Look for "Team", "About", "People", "Leadership" pages
   - Check "Contact" for direct emails (not info@)

2. **LinkedIn Site Search:**
   - Use `site:linkedin.com "Lightyear Capital" partner`
   - Target: Managing Partner, Operating Partner, Principal, Partner

3. **Press Releases & News:**
   - Look for deal announcements with contact names
   - Conference speaker bios
   - Industry publications

4. **SEC Filings:**
   - Form ADV for registered investment advisors
   - May list key personnel

## Sheet Status

**Total Rows:** 1260  
**Firms Needing Enrichment:** 5 (0.4%)  
**Sheet Enrichment Status:** 99.6% complete

All remaining firms require manual research as they are not in Apollo's database.

## Next Steps

- Manual research pass on these 5 firms
- Consider alternative data sources (ZoomInfo, Pitchbook, Crunchbase)
- Monitor for when these firms appear in Apollo

## Technical Notes

- Fixed Apollo API authentication (moved API key to X-Api-Key header)
- Confirmed API endpoint migration to `mixed_people/api_search`
- Rate limiting: 2 seconds between successful enrichments, 1 second for not-found
