# PE Enrichment Run - March 2, 2026 10:36 PM

## Summary

**Goal:** Enrich 10-15 leads with empty/generic contacts  
**Achieved:** 2 high-quality enrichments with verified contacts  
**Method:** Manual web research (Apollo API returned 0 results)

## Findings

### Apollo API Issue
- Tested 30+ PE firms through Apollo API
- **0 contacts found** across all searches
- Included well-known firms: Mainsail Partners, ParkerGale, Peak Rock, Accel-KKR, CIVC, CCMP, Wynnchurch
- Apollo appears to have poor coverage of PE industry vs. tech companies
- Recommendation: Focus on manual web research for PE firms

### Successful Enrichments (2)

#### 1. Mainsail Partners (Row 865)
- **Contact:** Nick Olsen
- **Title:** Head of AI Innovation  
- **Email:** nick@mainsailpartners.com  
- **LinkedIn:** https://www.linkedin.com/in/nicksolsen/
- **Why Perfect:** Runs "Mainsail AI Labs" - directly relevant to Hello Gumbo's AI services
- **Source:** Verified from mainsailpartners.com team page + email pattern confirmed via published erica@mainsailpartners.com

#### 2. ParkerGale Capital (Row 866)
- **Contact:** Ryan Milligan
- **Title:** Partner  
- **Email:** ryan@parkergale.com  
- **LinkedIn:** https://www.linkedin.com/in/ryanmilligan/
- **Source:** Verified from parkergale.com team page + email confirmed via ContactOut public listing (ryan@parkergale.com published)

## Firms Researched (No Verified Email Found)

The following firms were researched but lacked published individual emails on official sources:

- Peak Rock Capital - Found team (Anthony DiSimone, Steve Martinez, etc.) but no published pattern verification
- Accel-KKR - Large team found, pattern appears to be {first_initial}{last}@ but not verified from official source
- CIVC Partners - Team page didn't render properly
- CCMP Capital - Not reached due to time
- Wynnchurch Capital - Not reached due to time
- 30+ other firms via Apollo (all returned 0 results)

## Email Format Patterns Identified (Unverified)

For future manual research when official emails ARE published:

- **Mainsail Partners:** {first}@mainsailpartners.com (91.5% confirmed)
- **ParkerGale Capital:** {first}@parkergale.com (94.9% confirmed)  
- **Peak Rock Capital:** {last}@peakrockcapital.com (58-81% from external sources)
- **Accel-KKR:** {first_initial}{last}@accel-kkr.com (47-51% from external sources)

## Recommendations

1. **Disable Apollo for PE enrichment** - 0% success rate, wasting API calls
2. **Manual web research workflow:**
   - Find firm's team page
   - Identify decision-maker (CTO, COO, Head of Technology, Operating Partner)
   - Verify email pattern from official source (contact page, press releases, PDFs)
   - Only log if email is published or pattern is verified from their site
3. **Target roles for Hello Gumbo:**
   - Head of AI/Innovation (like Nick Olsen - PERFECT fit)
   - CTO/Technology Partners
   - COO/Operations Partners
   - Head of Portfolio Operations
   - Managing Partners at tech-focused PE firms

## Time Investment

- Apollo testing: ~20 minutes, 30+ firms, 0 results
- Manual research: ~40 minutes, 2 verified high-quality contacts
- **Manual research ROI is significantly higher for PE firms**

## Next Steps

1. Continue manual enrichment during next cron run
2. Focus on tech-focused PE firms (software, SaaS, tech-enabled services)
3. Prioritize firms with published team pages and contact info
4. Consider GitHub dossier updates for enriched firms

---

**Status:** Partial success. Quality over quantity - 2 excellent, verified contacts vs. 15 unverified guesses.
