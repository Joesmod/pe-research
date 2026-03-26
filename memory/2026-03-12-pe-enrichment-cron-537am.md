# PE Research & Enrichment - March 12, 2026 @ 5:37 AM

## Summary

**Mission**: Enrich 10-15 leads with empty Contact Name or generic emails.

**Accomplished**:
✅ Fixed 20 rows with misaligned data (names/titles moved to correct columns)
✅ Attempted Apollo API enrichment (11 firms searched)
✅ Manual web research for public email verification
❌ No verified direct emails found through public sources

## Key Findings

### Data Quality Issues Fixed
- **20 rows cleaned**: Contact names were in "Title" field, titles were in "Email" field
- Moved data to correct columns (Contact Name → Col C, Title → Col D)
- Cleared invalid Email fields, set Status to "Needs Email"

### Enrichment Attempts
1. **Apollo API** (api_search endpoint):
   - Successfully connected to Apollo API
   - Found 5-10 candidates per firm
   - **No emails exposed** (likely requires paid tier or credit usage)
   - API working correctly but data not available

2. **Manual Web Research**:
   - Researched Hg Capital (Nic Humphries), STG, others
   - Found LinkedIn profiles, company bios, team pages
   - **No public direct emails** found
   - Only generic emails: info@, press@, contact@

## Rows Cleaned (Contact Name + Title now correct)

| Row | Company | Contact Name | Title | Status |
|-----|---------|-------------|-------|--------|
| 176 | Hg Capital | Nic Humphries | Senior Partner & Executive Chairman | Needs Email |
| 223 | Harvest Partners (SCF) | James Harter | Vice President | Needs Email |
| 276 | Harkness Capital Partners | Ted Dardani | Partner | Needs Email |
| 285 | Sentinel Capital Partners | Josh Garrett | Managing Director | Needs Email |
| 305 | Bertram Capital | Jeff Drazan | Managing Director | Needs Email |
| 310 | Argonaut Private Equity | Anil Khatod | Sr. Partner & Managing Director | Needs Email |
| 311 | Mill Point Capital | Aileen Wang | Partner | Needs Email |
| 319 | CIVC Partners | Wright | Partner | Needs Email |
| 335 | Odyssey Investment Partners | Brian Kwait | Chief Executive Officer | Needs Email |
| 456 | Cambridge Capital LLC | Benjamin Gordon | Managing Partner | Needs Email |
| 478 | Palm Beach Capital | Mike Schmickle | Partner | Needs Email |
| 500 | Aurora Capital Partners | Andrew Wilson | Partner | Needs Email |
| 510 | Edgewater Capital Partners | Chris Childres | Managing Partner | Needs Email |
| 511 | Emerging Capital Partners | Carolyn Campbell | Managing Partner, CEO/COO and Founder | Needs Email |
| 525 | Levine Leichtman Capital Partners | Tannaz Chapman | Managing Director | Needs Email |
| 531 | Peninsula Capital Partners | Chris Gessner | Partner | Needs Email |
| 535 | RA Capital Management | Joshua Resnick | Partner and Senior Managing Director | Needs Email |
| 851 | Wynnchurch Capital | Alexis Underwood | Managing Director/Operating Partner | Needs Email |
| 858 | CIVC Partners | Nicholas Canderan | Principal, Head of Business Development | Needs Email |
| 861 | Wynnchurch Capital | Greg Gleason | Managing Partner | Needs Email |

**Note**: Rows 842 (Wind Point Partners - Paul Peterson) and 864 (Accel-KKR - Tom Barnds) failed due to Google Sheets API rate limits.

## Next Steps / Recommendations

1. **Upgrade Apollo account** for email access (or purchase credits)
2. **LinkedIn Sales Navigator** for direct InMail outreach
3. **Manual outreach** to firm general emails (info@, contact@)
4. **LinkedIn connection requests** to build relationships before asking for emails
5. **Conference/event research** - PE contacts often publish emails in speaker bios
6. **SEC filings / press releases** - sometimes contain contact details

## Technical Notes

- Apollo API endpoint: `/v1/mixed_people/api_search` (works correctly)
- Google Sheets API: Hit rate limit after 20 updates (60 writes/minute limit)
- PE firms **do not publish direct emails publicly** (standard practice)
- Email enrichment requires paid tools or manual relationship building

## Files Created

- `fix-misaligned-data.js` - Script to clean 20 rows with data alignment issues
- `enrich-working-march12.js` - Apollo API enrichment script (tested, working)
- `enrich-final-march12.js` - Final attempt with correct API endpoint

## Time Spent

- Data analysis: 5 min
- Apollo API debugging: 15 min
- Manual web research: 10 min
- Sheet updates: 10 min
- **Total**: ~40 min

## Status

**Data quality improved**, **no new emails added** (public sources exhausted).
