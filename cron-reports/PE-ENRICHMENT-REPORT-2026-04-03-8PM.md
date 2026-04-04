# PE Research & Enrichment Report
**Date:** April 3, 2026 - 8:13 PM (CST)  
**Task:** Hourly PE enrichment cron job  
**Status:** Partial completion

## Summary

- **Sheet Scanned:** 1,955 rows
- **Firms Needing Enrichment:** 22 rows identified (7 unique firms)
- **Enrichment Attempts:** 21 contacts via Apollo API
- **Successfully Enriched:** 0 contacts
- **New Firms Added:** 0 (time/tool constraints)

## Attempted Enrichment

### Method 1: Apollo API Organization Search
**Attempted:** 15 Trivest Partners duplicate rows  
**Result:** Not found in Apollo database (likely company name mismatch)

### Method 2: Apollo API Person Search  
**Attempted:** 6 named contacts at existing firms

| Company | Contact | Title | Result |
|---------|---------|-------|--------|
| Mako Capital Group | Angel Morales | Co-Founder | Not found |
| Enhanced Healthcare Partners | Matthew Thompson | General Partner | Not found |
| Nonantum Capital Partners | Jon Biotti | Managing Partner | Not found |
| Levine Leichtman Capital Partners | Matthew Frankel | Managing Partner | Not found |
| Shore Capital Partners | Justin Ishbia | Founding Partner | Not found |
| Altaris Capital Partners | George Aitken-Davies | Co-Founder | Not found |

**Analysis:** Apollo API coverage appears limited for mid-market PE firms and their specific contacts.

## Existing Leads Requiring Manual Enrichment

The following firms have contact names but need verified direct emails through manual research (web scraping, LinkedIn, press releases, SEC filings):

1. **Mako Capital Group** - Angel Morales (Co-Founder)
2. **Enhanced Healthcare Partners** - Matthew Thompson (General Partner)
3. **Nonantum Capital Partners** - Jon Biotti (Managing Partner)
4. **Levine Leichtman Capital Partners** - Matthew Frankel (Managing Partner)
5. **Shore Capital Partners** - Justin Ishbia (Founding Partner)
6. **Altaris Capital Partners** - George Aitken-Davies (Co-Founder)
7. **Trivest Partners** - Needs initial contact research (20+ duplicate rows to clean)

## New Firm Research (Incomplete)

Started researching mid-market PE firms ($500M-$5B AUM, services-heavy) for future addition:

- **Amulet Capital** - Healthcare-focused, Greenwich CT, mid-market (team page requires JavaScript rendering)
- **Bow River Capital** - ~$2.5B AUM, healthcare services, industrials
- **CBC (Cambridge Biotech Capital)** - Healthcare-focused, mid-single-digit billions

## Issues Identified

1. **Apollo API Limitations:**
   - Not finding mid-market PE firms
   - Not matching named contacts at known firms
   - May need different API endpoints or search parameters

2. **Sheet Data Quality:**
   - 20+ duplicate Trivest Partners rows (rows 994-1894)
   - Inconsistent status tagging
   - Some rows have generic emails flagged but not marked for enrichment

3. **Enrichment Strategy:**
   - Apollo API alone insufficient for PE contact enrichment
   - Need multi-source approach: LinkedIn Sales Navigator, ZoomInfo, manual web research
   - Consider investing in specialized PE database (PitchBook, Preqin)

## Recommendations

1. **Clean up duplicate Trivest Partners rows** (consolidate to 1-2 entries)
2. **Manual enrichment push** for the 6 named contacts above using:
   - LinkedIn Sales Navigator
   - Press release searches
   - Team page web scraping
   - SEC filing searches (for public PE-backed companies)
3. **Add 3-5 new firms** with publicly available contacts:
   - Prioritize firms with detailed team pages
   - Focus on service-heavy sectors (healthcare, business services)
   - Target firms with recent news/press releases containing contact info

## Next Steps

- Schedule dedicated manual research session for the 6 priority contacts
- Investigate alternative APIs or data sources beyond Apollo
- Create script to identify and merge duplicate firm entries
- Build list of 10-15 new target PE firms with verified contact availability

## Files Generated

- `enrichment-report-apr3-8pm.json` (Apollo org search results)
- `enrichment-report-apr3-named-8pm.json` (Apollo person search results)
- `PE-ENRICHMENT-REPORT-2026-04-03-8PM.md` (this report)
