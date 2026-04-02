# PE Research Log - April 2, 2026

## Session Summary
**Date**: 2026-04-02, 11:06 PM CT  
**Type**: Cron job - Enrichment focus  
**Researcher**: Jim  
**Leads Enriched**: 10  

## Objective
Enrich existing leads in Google Sheet (ID: 11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4) with:
- Contact names
- Verified titles
- Direct email addresses (from official sources only)
- LinkedIn URLs

## Methodology
1. Identified leads with missing Contact Name or generic/empty emails
2. Searched multiple sources:
   - Official firm websites (team pages)
   - Press releases (Business Wire, PR Newswire)
   - Industry publications (PE Professional)
   - SEC filings
   - LinkedIn (for profile verification)
3. **Verification Standard**: ONLY used data from official published sources
4. Rejected data aggregator results (RocketReach, ZoomInfo, etc.) as not official

## Results

### Successfully Enriched (10 leads)

| Row | Firm | Contact | Title | Email | LinkedIn |
|-----|------|---------|-------|-------|----------|
| 70 | GreyLion Capital | Chip Baird | Co-Founder & Managing Partner | ✅ chip@greylion.com | ✅ |
| 24 | Littlejohn | Gentry S. Klein | Managing Director | ❌ | ✅ |
| 42 | Searchlight Capital | Michele Scheggia | Managing Director | ❌ | ✅ |
| 249 | Brightstar Capital | Sam Totusek | Managing Director | ❌ | ❌ |
| 250 | Providence Equity | Davis Noell | Senior MD, Co-Head NA | ❌ | ✅ |
| 251 | MidOcean Partners | Dan Ryan | MD, Head of BD | ❌ | ✅ |
| 261 | Providence Equity | Paul Stocker | CTO & Managing Director | ❌ | ✅ |
| 265 | Altamont Capital | Jesse Rogers | Co-Founder & MD | ❌ | ✅ |
| 268 | Altamont Capital | Jesse Rogers | Co-Founder & Chairman | ❌ | ✅ |
| 264 | Wynnchurch Capital | Steve Welborn | Managing Director | ❌ | ✅ |

### Email Findings
- **1 verified email found** from official source (Chip Baird @ GreyLion)
- **9 contacts** enriched with titles and LinkedIn, but emails not found in official sources
- **Email source**: PE Professional article (industry publication), June 2020

## Key Insights

### Email Accessibility Challenge
**Finding**: Most PE firms do NOT publish executive email addresses on:
- Official firm websites (team pages show bios only)
- Press releases (Business Wire, PR Newswire)
- SEC filings
- LinkedIn profiles

**Data Aggregators** (RocketReach, ZoomInfo, Apollo, ContactOut, etc.):
- Often show email patterns (e.g., `d.noell@provequity.com`)
- Suggest emails with partial obfuscation
- **NOT USED** per strict instruction: "ONLY use emails found on official published sources"

### Successful Strategies
1. **Press releases mentioning executives**: Sometimes include contact emails
2. **Industry publications**: PE Professional, PitchBook occasionally publish contact details
3. **LinkedIn verification**: Reliable for confirming names, titles, firm affiliation
4. **Firm websites**: Excellent for verifying titles and backgrounds

### Unsuccessful Approaches
1. Apollo.io API: Found people but didn't return emails (requires paid credits)
2. SEC filings: No personal contact information found
3. Direct firm website contact pages: Generic info@ addresses only

## Recommendations

### For Future Enrichment
1. **Focus on LinkedIn + Title verification** first (always available)
2. **Search industry publications** specifically for contact info
3. **Monitor press releases** for new announcements with contacts
4. **Consider outreach via firm contact forms** to request direct contact
5. **Build email patterns** from verified examples (but note as unverified)

### Next Actions
- Continue monitoring Business Wire for PE announcements
- Track any new press releases mentioning target contacts
- Consider alternative contact methods (LinkedIn InMail, firm contact forms)
- Build relationships with verified contacts who may introduce others

## Files Updated
- Google Sheet: 10 rows enriched
- Dossiers created:
  - `greylion-capital.md`
  - `providence-equity.md`
  - `searchlight-capital.md`

## Time Spent
~30 minutes total (web research + enrichment + documentation)

## Next Research Session
- Priority: Continue enriching remaining 168 leads needing contact names
- Alternative strategy: Focus on finding ANY decision-maker at firm vs. specific titles
- Consider broadening search to include VPs, Directors (not just C-level/Partners)

---
**Status**: ✅ Complete  
**Commit**: Pending
