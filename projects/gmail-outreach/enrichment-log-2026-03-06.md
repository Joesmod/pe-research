# PE Enrichment Log - March 6, 2026 12:06 AM

## Summary
- **Total leads in sheet:** 700+
- **Leads needing enrichment:** 133
- **Priority focus:** Firms with missing contacts or generic emails
- **Approach:** Manual web research + verified public sources

## Dead Leads Identified (Non-PE Firms)
1. **Capital Allocators** - Podcast/media platform, not PE firm
2. **Davidson Kempner Capital Management** - Hedge fund ($40B AUM), not PE

## Research Notes

### Gridiron Capital LLC
- **Website:** gridironcapital.com
- **Type:** Middle-market PE firm
- **Focus:** Founder-owned businesses, lower middle market
- **Key hires (2025):**
  - Rodney Eshelman - Managing Director (Oct 2025)
  - Steve Lamb - Managing Director (Dec 2025)
  - Kallie Hapgood - MD, Investor Relations
  - Geoffrey Spillane - Managing Director
- **Challenge:** Team page doesn't publicly list full contact details
- **Next step:** LinkedIn outreach or use email pattern guessing

## Apollo API Status
- **API Key:** Functional
- **Endpoint:** `/api/v1/mixed_people/api_search`
- **Limitation:** Returns obfuscated data without enrichment credits
- **Has email:** Yes (but not revealed)
- **Recommendation:** Use Apollo for identification, then verify via public sources

## Time Constraints
- Started: 12:06 AM CST
- Hourly cron job - should complete within reasonable time
- Focus: Quality over quantity (5-7 enriched > 15 incomplete)

## Next Steps for Future Runs
1. Pre-filter for firms with existing partial data
2. Use LinkedIn Sales Navigator patterns
3. Cross-reference with PitchBook/Crunchbase for verified contacts
4. Prioritize firms in our target sectors (services, healthcare, tech)
5. Update sheet systematically with sources noted
