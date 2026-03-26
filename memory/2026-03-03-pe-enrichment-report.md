# PE Research & Enrichment Report - March 3, 2026

**Run:** Hourly Cron (2:36 PM CST)  
**Duration:** ~30 minutes  
**Tool:** Apollo API + web research

## Summary
✅ **4 PE firms enriched** with verified decision-maker contacts  
✅ **Google Sheet updated** with contact details  
✅ **GitHub dossiers created/updated** and pushed  
✅ **All emails verified** via Apollo API

## Enriched Firms

### 1. Norwest Equity Partners (NEP)
- **Contact:** Adam Eveloff
- **Title:** Partner
- **Email:** age@nep.com ✅
- **LinkedIn:** https://www.linkedin.com/in/adam-garcia-eveloff-a28b5511
- **Location:** Minneapolis, MN
- **Background:** Previously Partner at Castanea Partners; Goldman Sachs analyst
- **Fit:** Strong - 60+ years in PE, SaaS/tech-enabled services focus
- **Sheet Row:** 189

### 2. Lineage Capital
- **Contact:** Mark Sullivan
- **Title:** Partner
- **Email:** mark@lineagecap.com ✅
- **LinkedIn:** https://www.linkedin.com/in/mark-sullivan-9748874
- **Location:** Boston, MA
- **Unique Model:** Owner-managers keep control while getting liquidity
- **Fit:** Good - founder-friendly approach, culture preservation
- **Sheet Row:** 474

### 3. Sweetwater Private Equity
- **Contact:** Gregg Parise
- **Title:** Managing Partner
- **Email:** gregg@sweetwaterpe.com ✅
- **LinkedIn:** https://www.linkedin.com/in/gregg-parise-aba87a6
- **Location:** Charleston County, SC
- **Background:** Former CEO (Events.com, Vroozi), investment banking, hedge fund manager
- **Fit:** Strong - tech/healthcare focus, $1.2B AUM, secondary market specialist
- **Sheet Row:** 486

### 4. Terminus Capital Partners
- **Contact:** Alex Western
- **Title:** Managing Director | Software Private Equity
- **Email:** alex_western@terminuscp.com ✅
- **LinkedIn:** https://www.linkedin.com/in/alexwestern
- **Location:** Atlanta, GA
- **Background:** McKinsey, Audax Group, Trilogy, GMT Capital
- **Fit:** **EXCELLENT** - B2B SaaS ONLY, $10-50M revenue target, fast decision-making
- **Sheet Row:** 488

## Additional Firms Researched (Not Enriched)

### Spectrum Search Partners
- Identified: Jay Lane (President & Managing Partner)
- Email: jay@spectrumsearchpartners.com
- **Note:** Executive search/recruiting firm, not PE investor - excluded from enrichment

## GitHub Commits
**Repo:** https://github.com/Joesmod/pe-research  
**Commit:** 4c0dfed - "Enrich 4 PE firms with verified Apollo contacts (Mar 3, 2026)"  
**Files:**
- Created: norwest-equity-partners.md
- Created: lineage-capital.md
- Created: sweetwater-private-equity.md
- Updated: terminus-capital-partners.md

## Apollo API Usage
- **Searches:** 5 firms
- **Enrichments:** 5 contacts  
- **Success Rate:** 100% (all contacts had verified emails)
- **Credits Used:** ~10 (estimated)

## Next Steps
1. **Prioritize outreach:**
   - **Tier 1:** Terminus Capital Partners (perfect fit for B2B SaaS)
   - **Tier 2:** Norwest Equity Partners, Sweetwater PE (strong tech focus)
   - **Tier 3:** Lineage Capital (good fit, unique model)

2. **Continue enrichment:** Target 10-15 more firms in next run, focusing on:
   - Services-heavy sectors
   - Mid-market PE ($500M-$5B AUM)
   - Tech/SaaS focus
   - Apollo score 17-18

3. **Craft personalized outreach:** Use dossier insights for tailored messaging

## Quality Notes
- ✅ All emails verified via Apollo (not guessed)
- ✅ All contacts are decision-makers (Partner/Managing Director level)
- ✅ All dossiers include background research + value prop insights
- ✅ Sheet Status column updated to "Enriched"
- ✅ Source attribution included in Notes

## Files Created
- `apollo-search.js` - Apollo API search wrapper
- `apollo-enrich.js` - Apollo API enrichment wrapper
- `update-sheet.js` - Google Sheets batch update script
