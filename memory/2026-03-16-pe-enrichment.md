# PE Research & Enrichment - March 16, 2026 (8:07 PM)

## Session Summary

**Duration**: Hourly enrichment cron job  
**Target**: Enrich 10-15 leads with empty Contact Name or generic Email  
**Constraint**: ONLY use publicly published email sources (no RocketReach/ZoomInfo inference)

## Results

### Firms Actually Enriched: 2

1. **SDC Capital Partners** (Row 380)
   - Contact: Joshua Kurtz
   - Title: Chief Financial Officer and Chief Compliance Officer
   - Email: jkurtz@sdccapitalpartners.com
   - Source: ✅ Published on SDC Capital website Terms of Use page
   - LinkedIn: https://www.linkedin.com/in/joshua-kurtz-cpa
   - Notes: Also found Vladislava Rebeiz (Partner & General Counsel): vrebeiz@sdccapitalpartners.com

2. **Consonance Capital Partners** (Row 507)
   - Contact: Mitchell J. Blutt, MD
   - Title: Co-Founder & Managing Partner
   - Email: contactus@consonancecapital.com (generic)
   - Source: Published on company contact page
   - Phone: (212) 660-8060
   - Notes: Healthcare PE. Other leaders: Benjamin Edmands, Stephen McKenna, Nancy-Ann DeParle

### Generic Emails Found (Not Enriched):

- **Crossplane Capital**: info@crossplanecapital.com
- **Altus Capital Partners**: investor.relations@altuscapitalpartners.com

### Non-PE Firms Identified: 6

These firms should be marked as "Not PE" and removed from outreach list:

1. **Amity Search Partners** - Executive search/recruiting firm
2. **Anplify** - Financial services/research KPO  
3. **Fried, Williams & Grice Conner LLP** - Real estate law firm
4. **Centiva Capital** - Hedge fund (not PE)
5. **Champlain Advisors** - Placement agent/broker-dealer (helps PE firms raise funds)
6. **Drake Star** - M&A advisory/investment bank

## Challenges

1. **Publicly Published Emails Are Rare**: Very few PE firms publish direct partner emails on their websites. Most use generic contact@/info@/ir@ addresses.

2. **Data Aggregator Limitation**: Per instructions, cannot use RocketReach/ZoomInfo inferred emails - only publicly published sources. This severely limits enrichment capability.

3. **Apollo API Failed**: Apollo organization search failed to find most firms in database (15 attempted, 0 found).

4. **Service Provider Misclassification**: Significant portion of the "PE firms" in the sheet are actually service providers to PE (recruiters, advisors, law firms, hedge funds, placement agents).

## Recommendations

1. **Clean the Master List**: Remove non-PE firms (recruiters, advisors, law firms, hedge funds, placement agents)

2. **Relax Email Source Rules**: Consider allowing inferred emails from reputable data providers (RocketReach, ZoomInfo, Apollo) for PE contacts. Published emails are extremely rare in this industry.

3. **Alternative Enrichment Strategies**:
   - LinkedIn outreach (connection requests with personalized messages)
   - Conference speaker lists and bios
   - Press releases with media contacts
   - SEC filings and regulatory documents

4. **Focus on Mid-Market**: Firms with $500M-$5B AUM tend to have better online presence and more accessible contacts than mega-funds.

## Files Created

- `projects/pe-enrichment-2026-03-16.json` - Detailed research findings
- `projects/update-enrichments.js` - Script that updated the 2 enriched rows

## Next Steps

1. Review and approve relaxation of "publicly published only" rule
2. Clean master list to remove non-PE service providers
3. Consider using Apollo person search with firmographics for remaining firms
4. Focus next enrichment rounds on firms with better digital footprints
