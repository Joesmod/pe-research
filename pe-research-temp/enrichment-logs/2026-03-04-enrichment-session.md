# PE Lead Enrichment Report
**Date:** March 4, 2026 12:36 AM CST  
**Session Type:** Hourly Cron Research & Enrichment  
**Researcher:** Jim (AI Sales Researcher)

## Executive Summary

Completed enrichment analysis of 932 PE firm records in the Google Sheet. Found that **first 200 rows are 99% enriched** with verified contacts and emails. Rows 600+ contain 243 firms needing enrichment, but many lack published contact information.

## Key Findings

### Data Quality Assessment
- **Rows 1-200:** 98% complete (only 2 firms need enrichment)
- **Rows 200-400:** 99% complete (only 4 firms need enrichment)  
- **Rows 600-932:** 243 firms need enrichment (20 have contacts, 223 need full research)

### Enrichment Challenges Encountered
1. **Apollo API Issues:** 422 validation errors across multiple endpoint attempts
   - Mixed_people/search endpoint deprecated
   - Need to revisit API documentation for correct request format
   - API key valid but parameter format incompatible

2. **Published Email Scarcity:** 
   - Top-tier PE firms (Apax, Oak HC/FT, Thrive Capital, etc.) do not publish individual emails
   - Data aggregators (ZoomInfo, RocketReach) show partial emails but require paid subscriptions
   - Firm websites list team members but use contact forms instead of direct emails

3. **Contact Research Results:**
   - Searched: Satori Capital (Chad Cook), American Industrial Partners (Kim Marvin)
   - Found: LinkedIn profiles, titles confirmed, phone numbers (partial)
   - NOT Found: Published email addresses on official sources

## Firms Researched (No Published Emails Found)

| Firm | Contact | Title | LinkedIn | Notes |
|------|---------|-------|----------|-------|
| Satori Capital | Chad Cook | Director, Business Development | ✓ | Perfect BD contact, no published email |
| American Industrial Partners | Kim Marvin | General Partner | ✓ | Confirmed on website, no email |
| Oak HC/FT | Annie Lamont | Co-Founder & Managing Partner | ✓ | Already in sheet, no email |
| Apax Partners | Mark Beith | Partner, Apax Digital | ✓ | Already in sheet, no email |
| Thrive Capital | Joshua Kushner | Founder & Managing Partner | ✓ | High-profile, no published email |
| Lead Edge Capital | Mitchell Green | Founder & Managing Partner | ✓ | No published email |
| Peak Rock Capital | Anthony DiSimone | CEO | ✓ | No published email |

## Recommendations for Future Hourly Runs

### Short-term (Next 3 Runs)
1. **Skip rows 1-400** - already 98% enriched
2. **Focus on rows 600-700** - firms with partial data
3. **Target BD/IR roles specifically** - more likely to have published contacts
4. **Set realistic goal: 2-3 verified enrichments per hour** (not 10-15)

### Medium-term Strategy
1. **Fix Apollo API integration** - this would unlock bulk enrichment
2. **Target mid-market firms** ($250M-$1B AUM) - more accessible than mega-funds
3. **Use LinkedIn Sales Navigator** - better for PE contacts than web scraping
4. **Build "warm intro" list** - firms where we have connections

### Alternative Outreach Channels
Since individual emails are scarce, consider:
- **LinkedIn InMail** - most PE professionals respond
- **Firm contact forms** - specify "Business Development inquiry"
- **Conference attendance** - SuperReturn, ACG events for face-to-face
- **Referral network** - ask existing contacts for intros

## Data Quality Issues Found

### Rows with Email in Wrong Column
Several early rows have email addresses in the "Title" column instead of "Email" column:
- Row 4: Jon Santemma - jsantemma@regalhcp.com in Title field
- Row 5: Terry Wang - twang@regalhcp.com in Title field
- Row 6: Doug Kaden - dkaden@sdccapitalpartners.com in Title field
- (Rows 4-12 have this pattern)

**Recommendation:** One-time data cleanup script to move emails from Title → Email column.

## Service Providers vs PE Firms

Many rows 650-750 appear to be service providers, not PE firms:
- Wall Street Oasis (community/job board)
- Wall Street Prep (training)
- M SEARCH (executive search)
- HSP Henkel Search Partners (recruiting)
- Spectrum Search Partners (recruiting)
- Burtch Works (recruiting)

**Recommendation:** Filter/tag service providers separately from target PE firms.

## Next Actions

### Immediate (This Hour)
1. ✅ Document enrichment attempt
2. ✅ Create this summary report
3. ⬜ Update 2-3 rows with verified LinkedIn URLs (no guessing emails)
4. ⬜ Git commit and push to pe-research repo

### Next Hourly Run
1. Start with rows 620-630 (Jensen Partners, Lead Edge Capital, Lightspeed)
2. Search for press releases and conference speaker bios (more likely to have emails)
3. Check SEC filings for Form ADV disclosures (some list contact info)
4. Try alternative search: "[name] [firm] site:pitchbook.com email"

### This Week
1. Troubleshoot Apollo API (test with curl, check docs)
2. Consider RocketReach or ZoomInfo trial for verified emails
3. Build "Priority Outreach" list of 50 mid-market firms most likely to engage

## Resource Links
- Sheet: https://docs.google.com/spreadsheets/d/11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4
- Apollo API Docs: https://apolloio.github.io/apollo-api-docs/
- GitHub Repo: https://github.com/Joesmod/pe-research

---
**Conclusion:** High-quality enrichment requires time and paid tools. For hourly cron, focus on 2-3 high-confidence updates per run rather than 10-15 partial/guessed records. Quality > quantity.
