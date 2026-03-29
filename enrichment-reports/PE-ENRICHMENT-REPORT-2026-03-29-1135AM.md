# PE Research & Enrichment Report
**Date:** Sunday, March 29, 2026 - 11:35 AM
**Cron Job:** Hourly PE Research & Enrichment

## Summary

- **Total leads needing enrichment:** 21
- **Leads processed:** 15
- **Successfully enriched:** 2 (via initial buggy run, kept after verification)
- **Failed enrichments:** 13
- **Remaining to process:** 6

## Successfully Enriched (Verified)

1. **Row 662: PineBridge Investments**
   - Contact: Jennifer Theunissen
   - Title: COO
   - Email: jennifer.theunissen@pinebridge.com
   - Source: Apollo API
   - Status: ✅ Verified

2. **Row 663: Pioneer Fund**
   - Contact: Don Ho
   - Title: CEO
   - Email: don@pioneerfund.vc
   - Source: Apollo API
   - Status: ✅ Verified

## Issues Encountered

### 1. API Endpoint Migration
Apollo deprecated `/v1/mixed_people/search` endpoint. Had to migrate to:
- Search: `/api/v1/mixed_people/api_search` (returns obfuscated data)
- Enrichment: `/api/v1/people/match` (returns full contact data)

This requires a 2-step process per contact.

### 2. False Positives (Corrected)
Initial run without organization verification returned incorrect contacts:
- 12 leads were incorrectly assigned "Doug Edwards @ classtrainers.com"
- These were reverted and marked as "Needs Research"

### 3. Limited Apollo Coverage
For 13 firms, Apollo either:
- Returned results from wrong organizations (Class Trainers, LLC, LinkedIn, H3C)
- Had no results at all

### Firms Needing Manual Research

1. **MBF Healthcare Partners** (Row 42) - Apollo returned Class Trainers, LLC
2. **Serent Capital** (Row 63) - Apollo returned Class Trainers, LLC
3. **Gridiron Capital** (Row 184) - Apollo returned Class Trainers, LLC
4. **The Global Impact Investing Network** (Row 490) - Apollo returned LinkedIn
5. **M SEARCH** (Row 637) - Apollo returned LinkedIn
6. **Meridian Capital** (Row 645) - Apollo returned Class Trainers, LLC
7. **Midwest Right of Way Services, Inc.** (Row 646) - No results
8. **Noble Investment Group** (Row 652) - Apollo returned Class Trainers, LLC
9. **Pearl Energy Investments** (Row 658) - Apollo returned Class Trainers, LLC
10. **Periculum Capital** (Row 660) - Apollo returned Class Trainers, LLC
11. **Pulley** (Row 665) - Apollo returned Class Trainers, LLC
12. **Rogo** (Row 669) - Apollo returned Class Trainers, LLC
13. **Yellowstone Capital Partners, LLC** (Row 813) - Apollo returned Class Trainers, LLC
14. **Wind Point Partners** (Row 844, 1008) - Apollo returned LinkedIn

## Recommendations

1. **Manual web research needed** for the 14 firms above
   - Check firm websites for team/contact pages
   - LinkedIn site searches: `site:linkedin.com "Firm Name" (Partner OR Director OR VP)`
   - Press releases and conference speaker bios

2. **Alternative contact discovery methods:**
   - SEC filings (for registered investment advisors)
   - Conference attendee lists
   - Podcast guest appearances
   - Industry publications

3. **Next cron run:** Focus on easier targets with verified domains in Apollo database

## Technical Notes

- Script: `hourly-enrich-2026-03-29-11am.js`
- Organization verification implemented to prevent false positives
- Rate limiting: 1 second between firms, 500ms between person enrichments
- Cleanup script: `cleanup-bad-enrichment-2026-03-29.js` (successfully reverted 12 bad rows)

## Action Items

- [ ] GitHub: Update dossiers for 2 successfully enriched firms
- [ ] Manual research: 14 firms with no Apollo coverage
- [ ] Consider: Building custom web scraper for PE firm team pages
- [ ] Consider: Purchasing higher Apollo tier for more data access
