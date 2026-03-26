# PE Research & Enrichment - Hourly Cron
**Date:** Tuesday, March 17, 2026 — 11:37 AM (CST)  
**Task:** Enrich existing leads with empty/generic emails

## Summary

- **Total CRM leads:** 1,430
- **Leads needing enrichment:** 6
- **Apollo API attempts:** 6
- **Successfully enriched:** 0
- **Reason:** Apollo had no data for these specific firms

## Firms Attempted (Apollo API - No Results)

1. **Audax Private Equity** (`audaxprivateequity.com`)
   - Current contact: Young Lee (Partner and Co-President)
   - Status: Needs Email
   - Apollo result: No decision-makers found
   - Manual research: Email pattern appears to be `firstinitiallastname@audaxprivateequity.com` (based on mcarter@audaxprivateequity.com)
   - **Recommendation:** Cannot verify Young Lee's email without guessing. Mark as "Needs Manual Research"

2. **Alvarez & Marsal Capital** (`a-mcapital.com`)
   - Current contact: Jim Mahoney (with suspicious email "dave@a-mcapital.com")
   - Status: Needs Email
   - Apollo result: No decision-makers found
   - Manual research: Found Jack McCarthy is Managing Partner and Founder (not Jim Mahoney)
   - **Recommendation:** Update contact to Jack McCarthy, but email not publicly available

3. **Blue Star Innovation Partners** (`bluestarinnovationpartners.com`)
   - Current contact: Blair Richardson
   - Email: rob@bluestarinnovationpartners.com (wrong person?)
   - Apollo result: No decision-makers found
   
4. **JLL Partners** (`jllpartners.com`)
   - Current contact: Bassem Mansour
   - Email: c.killackey@jllpartners.com (wrong person?)
   - Apollo result: No decision-makers found
   
5. **Gryphon Investors** (`gryphon-inv.com`)
   - Current contact: Alex Beregovsky
   - Email: smckinnon@gryphoninvestors.com (wrong person?)
   - Apollo result: No decision-makers found
   
6. **Linsalata Capital Partners** (`linkedin.com` - invalid domain)
   - Apollo result: No decision-makers found (domain is linkedin.com, not firm website)
   - **Issue:** Need to find actual company website

## Analysis

The 6 leads that need enrichment are **challenging cases** where:
- Apollo database has no coverage
- Contact info exists but emails don't match contact names (data quality issues)
- Domains are incorrect or generic (e.g., linkedin.com)

Most leads in the CRM are already enriched (1,424 out of 1,430 have contacts/emails or are marked Dead).

## Recommendations

### Immediate Actions:
1. **Fix data quality issues** for leads #3-5 (email doesn't match contact name)
2. **Find correct domain** for Linsalata Capital Partners
3. **Manual research** for Audax & A&M Capital using:
   - Company team pages
   - LinkedIn profiles
   - Press releases
   - Industry databases (PitchBook, Crunchbase)

### Secondary Priority:
Since the existing leads are mostly enriched, focus on **adding 3-5 NEW mid-market PE firms** ($500M-$5B AUM, services-heavy) to expand the pipeline.

## Next Steps

1. Mark these 6 leads as "Needs Manual Research" in CRM
2. Create GitHub dossiers for manual research candidates
3. Next cron run: Focus on adding new firms rather than enriching this stubborn batch

## New PE Firms Identified (Secondary Task)

Added 3 new mid-market PE firms for future outreach:

1. **Silversmith Capital Partners** (Boston, MA)
   - AUM: $3.3B
   - Focus: Technology, Healthcare IT, SaaS
   - Founded: 2015
   - Contact: Jim Quagliaroli (Co-Founder, Managing Partner)
   - Status: Researched, needs email enrichment

2. **One Equity Partners** (New York, NY)
   - AUM: $10B+ (estimated)
   - Focus: Industrial, Healthcare, Technology (middle market)
   - Founded: 2001 (former JP Morgan spin-out)
   - Status: Needs enrichment

3. **Trivest Partners** (Miami, FL / Boston, MA)
   - AUM: $3B+
   - Focus: Business Services, Healthcare, Software
   - Founded: 1981 (40+ years experience)
   - Status: Needs enrichment

**Saved to:** `NEW-PE-FIRMS-MARCH17.json`

## Technical Notes

- Apollo API endpoint: `/v1/mixed_people/api_search` (new endpoint working correctly)
- Rate limit: 1.2 seconds between requests (observed)
- Email pattern inference: Disabled per instructions (no guessing)
- Manual web research conducted for firms without Apollo coverage

---

**Status:** Research complete, no CRM updates (no verified emails found), 3 new firms identified  
**Log:** `enrichment-log-2026-03-17T16-41-28.json`  
**New Firms:** `NEW-PE-FIRMS-MARCH17.json`
