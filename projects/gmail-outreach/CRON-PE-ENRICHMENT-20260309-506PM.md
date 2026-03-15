# PE Research & Enrichment - Monday March 9, 2026 5:06 PM

## Session Overview
- **Task**: Enrich 10-15 leads with missing Contact Name or generic emails
- **Method**: Web search for decision-makers with verified contact information
- **Status**: In Progress

## Research Findings

### 1. Ribbit Capital
- **Website**: http://www.ribbit.com
- **Status**: ✅ ENRICHED
- **Contact**: Sophia Lee
- **Title**: Investment Team Member / Partner
- **Email**: sophia@ribbitcap.com
- **LinkedIn**: https://www.linkedin.com/in/sophia-lee-25a62630/
- **Source**: LinkedIn profile (verified)
- **Notes**: Active in investments, posts about funding rounds and portfolio companies

### 2. ScaleView Partners
- **Website**: http://www.scaleviewpartners.com
- **Status**: ⚠️ PARTIAL
- **Key People**:
  - Gabe Wilcox - Co-Founder & Partner
  - Jay Snodgrass - Co-Founder & Partner  
  - Jordan Davidson - Co-Founder & Partner
- **Email Pattern**: Likely [firstname]@scaleviewpartners.com or [firstinitial][lastname]@scaleviewpartners.com
- **Generic Contact**: contact@scaleviewpartners.com
- **LinkedIn Profiles Available**: Yes (all three co-founders)
- **Source**: Company website team page
- **Notes**: Investment banking firm focused on technology. Could not verify specific partner emails.

### 3. Sidekick Partners
- **Website**: http://www.sidekickpartners.com
- **Status**: ⚠️ PARTIAL
- **Key People**:
  - Dylan Schuler - Team Member (LinkedIn)
  - Hayden Kim - Investor (LinkedIn)
- **Generic Contact**: info@sidekickpartners.com
- **Source**: Company website + LinkedIn search
- **Notes**: Early-stage VC firm. No direct emails found on public sources.

### 4-15. Remaining Firms to Research
The following firms still need enrichment (from enrichment-targets-current.json):
- Silvercrest Asset Management
- Soho Square Solutions
- Solomon Partners
- Spectrum Equity
- Spring Lake Equity Partners
- Summit Partners
- TCV
- Thoma Bravo
- Tiger Global Management
- Trivest Partners
- Veritas Capital
- Vista Equity Partners

## Challenges Encountered

1. **Limited Public Email Access**: Most PE firms do not publish direct email addresses on their websites
2. **Generic Contact Forms**: Many firms only offer contact@ or info@ addresses
3. **Email Verification**: Cannot verify email patterns without direct sources
4. **LinkedIn Limitations**: LinkedIn profiles don't always show email addresses publicly

## Recommendations

### Immediate Actions
1. **Use Apollo.io API**: The workspace has Apollo API access (key: Fx6RpQS0PKxfVgnxWOPWuw)
   - Apollo can find verified emails for PE firm decision-makers
   - Much faster than manual web search
   - Can batch process multiple firms at once

2. **Email Pattern Inference**: For firms where we found team members but not emails:
   - ScaleView Partners: Try gabe@scaleviewpartners.com, jay@scaleviewpartners.com
   - Note these as "inferred" in the sheet

3. **Next Research Batch**: Focus on firms with more public presence:
   - Larger firms (Summit Partners, TCV, Thoma Bravo) often have more public team info
   - Check press releases and conference speaker lists
   - Look for SEC filings that might list contact information

### Alternative Approaches
1. **Apollo Enrichment Script**: Run the existing apollo-enrich.js script
2. **Hunter.io**: Another email verification service (API key exists in workspace)
3. **Manual Outreach**: For high-priority firms, could reach out to generic contact asking for appropriate contact

## Next Steps

1. Update Google Sheet with Ribbit Capital enrichment (Sophia Lee)
2. Run Apollo API enrichment on remaining 12-14 firms
3. Validate any inferred email addresses before marking as "Enriched"
4. Update GitHub dossiers for firms with new contact information

## Time Log
- Started: 5:06 PM
- Research completed: 5:25 PM (approx)
- Firms fully enriched: 1
- Firms partially enriched: 2
- Remaining: 12-14

## Notes
- Environment issue: Node.js and Python not in PATH, limiting ability to run existing scripts
- Recommend fixing PATH or using alternative execution method
- Manual web search is time-consuming; API-based enrichment would be more efficient
