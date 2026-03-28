# PE Enrichment Log - March 28, 2026

## Cron Run: 07:05 AM CST

### Summary
- **Enrichment Method:** Manual web research + press release verification
- **Firms Researched:** 12
- **Verified Contacts Found:** 1
- **Sheet Updates:** 1

### Verified Contact Added

#### Vesey Street Capital Partners (Row 38)
- **Name:** Adam Feinstein
- **Title:** Founder & Managing Partner
- **Email:** afeinstein@vscpllc.com
- **LinkedIn:** https://www.linkedin.com/in/adam-feinstein
- **Verification:** PRNewswire press release, January 7, 2019
- **Source URL:** https://www.prnewswire.com/news-releases/vesey-street-capital-partners-announces-recapitalization-of-elite-body-sculpture-300773363.html
- **Firm Details:** NYC-based healthcare services PE, ~$450M deployed capital
- **Status:** ✅ Enriched

### Research Completed (Awaiting Email Verification)

1. **Sentinel Capital Partners**
   - Leaders: David S. Lobel (Managing Partner), John F. McCormack (Senior Partner)
   - Status: Generic email only (info@sentinelpartners.com)

2. **Svoboda Capital Partners** 
   - Leaders: John A. Svoboda, Andrew B. Albert, Thomas G. Brooker
   - Status: Names confirmed, no direct emails on website

3. **Pamlico Capital**
   - Leaders: Watts Hamrick, Eric Eubank (Managing Partners)
   - Status: Names in press releases, no direct emails found

4. **Graham Partners**
   - Leader: Steven Graham (CEO & Senior Managing Partner)
   - Status: Extensive team page, no published emails

5. **RFE Investment Partners**
   - Leaders: Bill Bronander, Ron Ahuja (Principals)
   - Status: Team page loaded, no emails published

### Technical Notes

**Apollo API Issue:**
- Endpoint `/v1/mixed_people/search` deprecated
- New endpoint `/api/v1/mixed_people/api_search` returns incomplete data
- **Action Required:** Update all Apollo integration scripts

**Best Practices Identified:**
- PRNewswire/BusinessWire are reliable sources for verified emails
- Press releases often include contact emails for announcements
- Team pages list names but rarely include direct emails
- RocketReach/ContactOut may be needed for systematic verification

### Methodology
1. Identified 20+ firms needing enrichment from Google Sheet
2. Web search for team/leadership pages
3. Scraped team pages for decision-maker names and titles
4. Searched press releases for verified contact information
5. Updated sheet only with verified emails from official sources

### Next Hourly Run Targets
- Thoma Bravo
- Gridiron Capital  
- Norwest Equity Partners
- Tenex Capital Management
- Valeas Capital Partners
- Clayton Dubilier & Rice

---
**Total Time:** ~25 minutes  
**Next Run:** 08:05 AM CST (scheduled hourly)
