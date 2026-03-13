# PE Research & Enrichment - March 12, 2026 @ 5:37 AM

## Mission
Enrich 10-15 leads in Google Sheet with verified contacts (names, titles, direct emails).

## Results

### ✅ Data Quality Improvements
- **20 rows cleaned**: Fixed misaligned data (names were in Title field, titles in Email field)
- Moved Contact Names to Column C, Titles to Column D
- Set Status to "Needs Email" for rows with cleaned data

### ❌ New Email Enrichments
- **0 new emails added** (no publicly available direct emails found)
- Apollo API searched 11 firms, found candidates but no exposed emails
- Manual web research found LinkedIn profiles, bios, but no direct emails

### 🔍 Key Finding
**PE firms do not publish direct emails publicly.** All research sources (company websites, LinkedIn, press releases) only show:
- Generic emails: info@, press@, contact@
- Job titles and names (verified)
- LinkedIn profiles (no email addresses)

## Rows Cleaned (20 total)

| Company | Contact | Title | Row |
|---------|---------|-------|-----|
| Hg Capital | Nic Humphries | Senior Partner & Executive Chairman | 176 |
| Harvest Partners (SCF) | James Harter | Vice President | 223 |
| Harkness Capital Partners | Ted Dardani | Partner | 276 |
| Sentinel Capital Partners | Josh Garrett | Managing Director | 285 |
| Bertram Capital | Jeff Drazan | Managing Director | 305 |
| Argonaut Private Equity | Anil Khatod | Sr. Partner & Managing Director | 310 |
| Mill Point Capital | Aileen Wang | Partner | 311 |
| CIVC Partners | Wright | Partner | 319 |
| Odyssey Investment Partners | Brian Kwait | Chief Executive Officer | 335 |
| Cambridge Capital LLC | Benjamin Gordon | Managing Partner | 456 |
| Palm Beach Capital | Mike Schmickle | Partner | 478 |
| Aurora Capital Partners | Andrew Wilson | Partner | 500 |
| Edgewater Capital Partners | Chris Childres | Managing Partner | 510 |
| Emerging Capital Partners | Carolyn Campbell | Managing Partner, CEO/COO and Founder | 511 |
| Levine Leichtman Capital Partners | Tannaz Chapman | Managing Director | 525 |
| Peninsula Capital Partners | Chris Gessner | Partner | 531 |
| RA Capital Management | Joshua Resnick | Partner and Senior Managing Director | 535 |
| Wynnchurch Capital | Alexis Underwood | Managing Director/Operating Partner | 851 |
| CIVC Partners | Nicholas Canderan | Principal, Head of Business Development | 858 |
| Wynnchurch Capital | Greg Gleason | Managing Partner | 861 |

## Recommendations

1. **Upgrade Apollo** to paid tier for email access
2. **LinkedIn Sales Navigator** for InMail outreach
3. **Conference/event research** - speakers often list emails in bios
4. **Manual relationship building** before requesting emails
5. **SEC filings** - sometimes contain contact details

## Technical Notes

- Apollo API endpoint `/v1/mixed_people/api_search` - working correctly
- Google Sheets API rate limit hit after 20 updates (60 writes/minute)
- Email enrichment requires paid tools or manual networking

## Next Cron

Continue monitoring for new leads to enrich. Focus on:
- Firms with complete websites/team pages
- Recent news mentions with contact info
- Conference speaker lists

**Status**: Data quality improved, no new emails (public sources exhausted).
