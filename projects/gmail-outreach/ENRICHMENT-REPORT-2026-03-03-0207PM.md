# PE Enrichment Report - 2026-03-03 02:07 PM

## Summary
**Task:** Enrich 10-15 leads with empty Contact Name or generic emails  
**Time:** Hourly cron run (02:06 PM CST)  
**Status:** Partial completion - 2 firms researched, 300+ need enrichment

## Firms Researched

### 1. Health Enterprise Partners (HEP Fund)
- **Website:** https://hepfund.com
- **Location:** New York, NY (HQ)
- **Focus:** Healthcare services & healthcare IT
- **AUM:** Not disclosed
- **Team Verified:**
  - Dave Tamburri - Managing Partner
  - Ezra Mehlman - Managing Partner  
  - Jessie Gentil - Principal (already in sheet)
  - Scott Whyte - Partner, Value Creation
  - Tracy South - Operating Partner
  - Roland Lyon - Operating Partner
  - Lynn Weld - CFO
  - Bill Kopitke - Executive-in-Residence
- **Email Pattern:** Not found on site (need LinkedIn/Apollo)
- **Network:** 40+ hospital systems & health plans as LPs

### 2. Lead Capital Partners
- **Website:** https://leadcp.com
- **Location:** Nashville, TN  
- **Address:** 3817 Bedford Ave Suite 220, Nashville TN 37215
- **Phone:** 615.543.3133
- **Focus:** Lower middle market healthcare ($1-5M EBITDA)
- **Founded:** 2011
- **Team:** Requires further research (site JS-rendered)
- **Status:** Need Apollo enrichment

## Challenges Encountered

1. **JS-Rendered Sites:** Many PE sites use JavaScript for team pages
2. **No Published Emails:** Most firms don't publish emails on websites
3. **Scale:** 300+ firms in sheet need enrichment
4. **API Limits:** Apollo credits likely exhausted

## Recommendations

### Immediate Actions:
1. **Batch Apollo Enrichment:** Use remaining credits for high-priority targets
2. **Email Pattern Research:** Search press releases, BusinessWire for email formats
3. **LinkedIn Scraping:** Verified contacts via LinkedIn for email patterns

### Priority Targets (Next Run):
1. OpenGate Capital - $1B+ revenue, Industrials
2. Pilot Growth Equity - Tech/Media
3. Sopris Capital - $30.6M revenue
4. Sweetwater Private Equity - $2.7B AUM
5. Tecum Capital - Media PE, Pittsburgh
6. The Edgewater Funds - Business services
7. Lineage Capital - Needs sector research
8. Invision Capital - Needs full enrichment

### Process Improvements:
1. **Hourly Cron:** Too frequent for manual research - recommend 2x daily
2. **Apollo Integration:** Direct API calls vs manual research
3. **Dossier Templates:** Auto-generate from enrichment data
4. **GitHub Auto-Commit:** Push dossiers automatically

## Files Generated
- `enrichment-targets-2026-03-03-0206pm.json` - Priority target list
- `enrich-analysis-2026-03-03-0206pm.js` - Analysis script

## Next Cron Run
**Scheduled:** 03:06 PM CST (1 hour)  
**Focus:** Batch Apollo enrichment of top 15 targets  
**Goal:** 10-15 verified contacts with direct emails
