# PE Enrichment Run - March 6, 2026 6:36 PM

## Summary
Hourly enrichment cron run. Focused on identifying PE firms needing contact enrichment and researching decision-makers.

## Key Findings

### 1. RCP Advisors (Chicago)
- **Status**: Fund-of-funds / secondaries investor (NOT direct PE investor)
- **Finding**: Thomas Danis Jr. - Managing Partner & Co-Founder
- **Email Pattern**: Needs verification (only rcp@rcpadvisors.com found)
- **Source**: rcpadvisors.com/team
- **Note**: While well-established, they invest in other PE funds rather than operating companies directly. May not be ideal for Hello Gumbo's operational AI services.
- **Action**: SKIP - Not direct PE investor

### 2. Constitution Capital Partners (Boston/Andover MA)
- **Status**: Alternative asset manager (PE + Credit)
- **Key Contacts Found**:
  - Daniel M. Cahill - CEO
  - Robert M. Hatch - Managing Partner
  - Vicente Miguel T. Ramos - Managing Partner
  - Christopher S. Faucher - Managing Director (already in sheet!)
- **Email**: Only info@concp.com published on site
- **Email Pattern**: Likely [first_initial][last]@concp.com or [first].[last]@concp.com (needs verification)
- **Source**: concp.com/team
- **Action**: NEEDS APOLLO ENRICHMENT for individual emails

### 3. Character Capital
- **Status**: Early-stage seed VC
- **Partners**: John Zeratsky, Jake Knapp, Eli Blee-Goldman
- **Note**: Seed/early-stage VC, NOT mid-market PE
- **Action**: SKIP - Wrong stage/size

### 4. Carmel Capital Partners
- **Status**: Wealth management firm (NOT PE)
- **Action**: SKIP - Already marked "Dead" in sheet

### Sheet Analysis
**Firms needing enrichment** (empty contacts or generic emails):
- HSP - Henkel Search Partners → Executive search (NOT PE)
- Loeb.nyc → Generic email
- RCP Advisors → Fund-of-funds (NOT direct PE)
- ScaleView Partners → Investment bank (NOT PE)
- TAP Advisors → M&A advisory (NOT PE)
- Victory Capital → Asset management (NOT PE)
- Carmel Capital Partners → Wealth management (NOT PE)

## Recommendations

### Priority Action Items:
1. **Constitution Capital Partners** - Enrich with Apollo for individual emails for Cahill, Hatch, Ramos
2. **Continue enrichment** - Many "New - Unresearched" firms in sheet need vetting to determine if they're actual PE firms vs:
   - Executive search firms
   - Investment banks
   - Asset managers
   - VC/seed funds
   - M&A advisories

### Quality Control Issue
**Many non-PE firms in the sheet:**
- Executive search/recruiting firms
- Investment banks/M&A advisories
- Asset managers (mutual funds, hedge funds)
- Early-stage VC
- Wealth management firms

**Recommendation**: Before further enrichment, filter sheet to identify TRUE middle-market PE firms (buyout focus, $100M-$2B AUM, operating company investments).

## Time Spent
- 30 minutes research
- Found 1 viable PE firm needing enrichment (Constitution Capital)
- Identified multiple non-PE firms to skip

## Next Steps
1. Run Apollo enrichment on Constitution Capital Partners key contacts
2. Filter sheet for actual PE firms before next enrichment run
3. Focus on firms marked "New - Unresearched" that show PE characteristics:
   - Buyout focus
   - Middle-market
   - $100M-$5B AUM
   - Operating company investments (not fund-of-funds)
