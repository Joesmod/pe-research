# PE Lead Enrichment Report - March 8, 2026 07:06 AM

## Summary
- **Sheet analyzed**: 11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4
- **Total rows**: 958
- **Leads needing enrichment**: 52
- **Attempted enrichment**: 15 firms
- **Successfully enriched**: 0

## Challenge: Low Hit Rate
Apollo API returned no contacts for all 15 firms attempted. Root causes:
1. **Data quality issues**: Many entries are non-PE entities:
   - Wall Street Oasis (forum/community)
   - Wall Street Prep (training platform)
   - Wefunder (crowdfunding)
   - Odyssey Search Partners (recruiting firm)
   
2. **Placeholder data**: Many rows have "Jacob Zodikoff" as placeholder contact

3. **Privacy**: Most PE firms don't publish direct emails publicly - only generic info@ addresses

## Research Findings

### Rainier Partners (rainierpartners.com)
- **Founders**: Alex Rolfe (Co-Founder & Managing Partner), Jon Altman (Co-Founder)
- **Focus**: Lower middle market, business/consumer/industrial/financial services
- **Founded**: 2020
- **Location**: Seattle, WA
- **Public contact**: info@rainierpartners.com (generic)
- **LinkedIn**: https://www.linkedin.com/company/rainier-partners
- **Status**: Could not find officially published direct emails

## Recommendations
1. **Clean the sheet**: Remove non-PE entities (platforms, associations, recruiting firms)
2. **Use LinkedIn Sales Navigator**: Better source for verified decision-makers
3. **Focus on firms with domains**: Skip entries without valid company websites
4. **Manual outreach**: For high-value targets, research via:
   - LinkedIn company pages (About section often lists key personnel)
   - Press releases (quotes from executives)
   - Conference speaker lists
   - SEC filings (for large firms)

## Next Steps
- Update GitHub dossiers for firms we have good data on
- Flag questionable entries for review
- Consider supplementing Apollo with ZoomInfo or LinkedIn Sales Nav
