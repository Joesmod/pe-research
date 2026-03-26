# PE Research & Enrichment - 2026-03-25 (5:16 PM Cron Run)

## Summary
Hourly enrichment run focusing on finding verified direct emails for PE firms in the Google Sheet.

## Completed
✅ **1 Lead Enriched**: Drake Star Partners
- Contact: James Holzer (Managing Partner)
- Email: Jim.Holzer@drakestar.com
- Source: Official Drake Star HCM Report PDF (publicly available)
- Updated in sheet + GitHub dossier created

## Researched (No Verified Public Emails Found)
These firms have identified decision-makers but no publicly available direct emails from official sources:

1. **Charlesbank Capital Partners** - Michael Choe (CEO), Kevin Whelan (CFO), Joshua Klevens (COO)
2. **Gryphon Investors** - R. David Andrews (Founder & Co-CEO)
3. **HGGC** - Rich Lawson (CEO)
4. **Champlain Advisors** - Kevin Monroe (Managing Director)
5. **Erez Capital** - Michael Benezra (Managing Partner)
6. **Centiva Capital** - Karim Abbadi (Co-Founder, Deputy CIO)
7. **Fried, Williams & Grice Conner** - Steven Williams (Partner)
8. **GIIN** - Lindsay Gardner (Manager, Communications)
9. **Anplify** - Himanshu Anand (Founder & CEO)
10. **F6S** - Sean Kane (Co-Founder & CEO)

## Challenges
- Most PE firms don't publish direct emails on team pages
- Apollo API searches not filtering by company (returning generic results)
- Contact databases (ZoomInfo, RocketReach, ContactOut) show partial/obfuscated emails but not verified public sources
- Need to follow strict "no guessing email patterns" rule

## Next Steps
1. **Consider Apollo credit spend**: Use API enrichment credits to get verified emails for specific contacts
2. **Alternative sources**: Look for press releases, SEC filings, conference speaker lists, downloadable PDFs with bios
3. **LinkedIn outreach**: For contacts without emails, note LinkedIn URLs for InMail approach
4. **Focus on mid-size PE firms**: Larger firms (Charlesbank, HGGC) tend to have stricter contact privacy

## Metrics
- Total leads needing enrichment: 249
- Leads enriched this run: 1
- Leads researched (partial): 10
- Time spent: ~1 hour
- Success rate: 1/11 (9%) for verified emails from public sources

## Tools Used
- Web search (Brave API)
- Web fetch for team pages
- Google Sheets API (enrich.js script)
- GitHub for dossier commits

## Recommendation
The "verified email from official published source only" standard is correct for quality, but severely limits throughput. Consider:
- Using Apollo credits strategically for high-priority targets
- Building LinkedIn outreach track alongside email outreach
- Focusing research time on firms known to publish contact info (investment banks, boutique M&A advisors)
