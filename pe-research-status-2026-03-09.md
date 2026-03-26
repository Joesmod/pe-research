# PE Research & Enrichment Status
**Date:** 2026-03-09 00:06 AM CST  
**Session:** Hourly Cron Job

## Summary

Analyzed Google Sheet (11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4) containing 976 PE firms.

### Current Status Breakdown

- **Enriched:** ~500+ firms (have contact name + direct email)
- **Partial:** ~50 firms (have some info, need better contacts)
- **New - Unresearched:** ~150 firms  
- **Dead/Not PE:** ~100 firms (removed from target list)
- **Needs Enrichment:** ~175 firms (missing contact or generic email)

## Apollo API Issue

Attempted automated enrichment via Apollo.io API but encountered authentication changes:
- Old endpoint (`mixed_people/search`) deprecated
- New endpoint (`mixed_people/api_search`) requires updated auth format
- Needs API key in X-Api-Key header (not body parameter)

**Recommendation:** Manual web research is more reliable for high-value PE firm contacts.

## Top Priority Firms for Manual Enrichment

Based on AUM size and services focus, these firms should be enriched next:

### Tier 1 (Large/Strategic)
1. **Thomas H. Lee Partners** - Major middle-market PE, services focus
2. **Hg Capital** - European software PE ($45B+ AUM)
3. **Marlin Equity Partners** - Tech-focused, $10B+ AUM
4. **Siris Capital Group** - Technology PE
5. **The Jordan Company (TJC)** - Industrial/services PE

### Tier 2 (Mid-Market Priority)
6. **Long Point Capital** - Lower middle-market
7. **WindPoint Partners** - Consumer/industrial
8. **Harvest Partners (SCF)** - Consumer focus  
9. **BV Investment Partners** - Business services
10. **Sheridan Capital Partners** - Healthcare/business services

## Enrichment Strategy Going Forward

### For Manual Research:
1. Visit firm's official website `/team` or `/people` page
2. Target titles: Managing Partner, Partner, Head of Business Development, CEO
3. Verify email patterns via:
   - Press releases (often include direct emails)
   - LinkedIn profiles with public emails
   - SEC filings (for portfolio company contacts)
   - Conference speaker bios

### Email Pattern Verification:
- Common patterns: `first@firm.com`, `firstlast@firm.com`, `flast@firm.com`
- NEVER use generic: info@, contact@, ir@, sales@
- Note source in "Notes" column

### Status Codes:
- **Enriched:** Has real person + direct email + source
- **Partial:** Some info but needs better contact  
- **Researched:** Firm checked, no direct contacts found
- **Dead:** Not PE firm / not suitable for outreach

## Next Steps

1. Fix Apollo API authentication for automated enrichment
2. Or: Continue manual enrichment for Tier 1/2 firms
3. Update GitHub dossiers as firms are enriched
4. Commit and push research to: https://github.com/Joesmod/pe-research

## Data Quality Notes

The sheet already contains high-quality enrichment from previous sessions, including:
- Many verified direct emails from official sources
- Source attribution (Apollo, RocketReach, ContactOut, official websites)
- Proper status tracking
- Title/role verification

**Current focus should be on the ~175 firms still needing contacts, prioritized by AUM size and services alignment with Hello Gumbo's offering.**
