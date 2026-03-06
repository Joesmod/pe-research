# PE Research & Enrichment - Hourly Cron Run
**Date:** March 5, 2026 - 3:06 PM CST  
**Run ID:** cron:8fbfb70e-b09d-4ab1-9906-ab0a33373945  
**Status:** ✅ COMPLETE

## Summary
Successfully enriched **15 PE firms** with verified decision-maker contacts using Apollo API. All contacts have verified emails and LinkedIn profiles.

## Enrichment Results

### Firms Enriched (15 total)

| Row | Company | Contact | Title | Email | Source |
|-----|---------|---------|-------|-------|--------|
| 51 | Genstar Capital | Darren Tan | Vice President | dtan@gencap.com | Apollo |
| 154 | Thoma Bravo | Caroline Kjorlien | Vice President | ckjorlien@thomabravo.com | Apollo |
| 168 | Clearlake Capital Group | Jeffrey Hahn | Vice President | jhahn@clearlake.com | Apollo |
| 455 | Cabrera Capital Markets | John Medall | Vice President | jmedall@cabreracapital.com | Apollo |
| 696 | 3G Capital | Flavio Montini | CFO | fmontini@3g-capital.com | Apollo |
| 701 | AMR Action Fund | John Vancura | Chief Financial Officer | john.vancura@amractionfund.com | Apollo |
| 705 | Apis & Heritage Capital Partners | Jason Ollison | Partner | jason@apisheritage.com | Apollo |
| 710 | Atlanta Capital Management Co., LLC | Juliene Ehmig | VP/Controller | julie.ehmig@atlcap.com | Apollo |
| 711 | Atlantic Street Capital Advisors, Inc. | Amy Mills | PE Operating Advisor & Executive CHRO | amy@ascoperators.com | Apollo |
| 712 | Auctus Capital Partners | Ingo Krocke | CEO, Managing Partner | krocke@auctus.com | Apollo |
| 713 | Avista Healthcare Partners | Hao Zhao | Vice President | zhao@avistacap.com | Apollo |
| 714 | BDT & MSD Partners | Bong Shinn | Partner & Chief Technology Officer | bshinn@bdtmsd.com | Apollo |
| 715 | BH3 Management | Cameron Bean | Vice President | cameron@bh3llc.com | Apollo |
| 716 | Bloom Equity Partners | Jeffrey Hsiang | Partner | jeff.h@bloomequitypartners.co | Apollo |
| 717 | Bravia Capital | Aditya Bhise | Chief Operating Officer | ab@braviacapital.com | Apollo |

## Actions Completed

### 1. ✅ Apollo API Enrichment
- Searched 15 PE firms for decision-makers
- Cast wide net: Partners, C-level, Directors, VPs
- Retrieved verified email addresses and LinkedIn profiles
- 100% success rate (15/15 firms enriched)

### 2. ✅ Google Sheet Updates
- Updated Contact Name, Title, Email, LinkedIn for all 15 firms
- Changed Status from "Partial" → "Enriched"
- Added enrichment date and source notes
- All updates completed successfully

### 3. ✅ GitHub Dossiers Updated
- Created 14 new dossiers
- Updated 1 existing dossier (3G Capital)
- All dossiers include verified contact information
- Committed and pushed to master branch

**Commit:** `11cb545` - "Automated enrichment: Added 14 new PE firm contacts + updated 3G Capital (2026-03-05 3PM cron)"  
**GitHub:** https://github.com/Joesmod/pe-research/commit/11cb545

## Title Diversity
Decision-makers identified across multiple levels:
- **Partners:** 3 (Jason Ollison, Bong Shinn, Jeffrey Hsiang)
- **C-Level:** 3 (Flavio Montini CFO, John Vancura CFO, Ingo Krocke CEO, Aditya Bhise COO)
- **Vice Presidents:** 8 (majority)
- **Operating/Advisory:** 1 (Amy Mills)

## Technical Details
- **API Used:** Apollo API (search + enrichment)
- **Rate Limiting:** 1 second between searches, 500ms between enrichments
- **Data Source:** Apollo verified emails only
- **Quality:** All emails verified by Apollo's email verification system
- **LinkedIn Coverage:** 100% (all contacts have LinkedIn profiles)

## Next Steps
These 15 firms now have verified contacts and are ready for outreach when needed. Status = "Enriched" in CRM.

## Files Generated
- `enrichment-results-2026-03-05-21-11.json` - Full enrichment data
- `enrichment-targets-cron-2026-03-05.json` - Original target list
- 15 GitHub dossier updates in `pe-research/PE-firms/`

---

**Run Duration:** ~2 minutes  
**API Calls:** 30 (15 searches + 15 enrichments)  
**Success Rate:** 100%  
**Email Verification:** All contacts have verified emails
