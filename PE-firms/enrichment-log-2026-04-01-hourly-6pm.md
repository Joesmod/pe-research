# PE Research & Enrichment Log
**Date:** 2026-04-01 6:36 PM CST
**Session:** Hourly Cron Job

## Summary
Attempted enrichment of 7 leads from Google Sheet. Significant challenge: **most PE firms do not publish direct email addresses** on their websites. Found contact names and LinkedIn profiles, but verified emails are scarce.

## Leads Processed (Enrichment Attempts)

### 1. Champlain Advisors
- **Status:** No direct contact found
- **Generic Email:** info@champlainadvisors.com (from website)
- **Phone:** 212-686-7949
- **Notes:** No individual partners or email addresses published on website

### 2. District Partners (row 592)
- **Contact:** Josh Fisher
- **Title:** Managing Partner
- **LinkedIn:** https://www.linkedin.com/in/josh-fisher-district/
- **Email:** NOT VERIFIED (found on ContactOut but not official source)
- **Notes:** Executive search firm, not PE. Also Kevin Gerrity (Managing Partner). Phone: (571) 299-7591
- **Status Updated:** Needs verification

### 3. M SEARCH (row 637)
- **Contact:** Tina Engineer-McRae
- **Title:** Founder & President
- **LinkedIn:** https://www.linkedin.com/in/tengineermcrae/
- **Email:** None published (only contact form)
- **Notes:** Executive search firm, not PE. No direct email on msearchadvisory.com
- **Status Updated:** Needs verification

### 4. Midwest Right of Way Services, Inc.
- **Status:** No direct contact found
- **Phone:** (402) 955-2900
- **Website:** midwestrow.com
- **Notes:** Land acquisition/relocation services (not PE)

### 5. Pulley (row 665)
- **Contact:** Yin Wu
- **Title:** CEO & Founder
- **LinkedIn:** https://www.linkedin.com/in/ywu01
- **Email:** None published
- **Notes:** Cap table SaaS (not PE). YC-backed company
- **Status Updated:** Needs verification

### 6. Rogo (row 669)
- **Contact:** Gabriel Stengel
- **Title:** CEO & Co-Founder
- **LinkedIn:** https://www.linkedin.com/in/gabestengel/
- **Email:** None published (sales@rogodata.com is generic)
- **Notes:** AI platform for finance (not PE)
- **Status Updated:** Needs verification

### 7. Ampersand Capital Partners (row 1846)
- **Contact:** Herbert Hooper
- **Title:** Managing Partner
- **Email:** None published (info@ampersandcapital.com is generic)
- **Phone:** 781-239-0700
- **Notes:** Healthcare/Life Sciences PE. Boston HQ
- **Status Updated:** Needs verification

## New Firms Added (3)

### 1. Vesey Street Capital Partners
- **Contact:** Adam Feinstein
- **Title:** Managing Partner & Founder
- **LinkedIn:** https://www.linkedin.com/in/adam-feinstein-30037612/
- **Email:** None published (tiffany@vscpllc.com is generic contact)
- **Focus:** Healthcare services PE
- **AUM:** $500M+ (estimated)
- **Location:** NYC
- **Website:** vscpllc.com
- **Notes:** 30+ years healthcare services experience

### 2. Edison Partners
- **Contact:** Chris Sugden
- **Title:** Managing Partner
- **LinkedIn:** https://www.linkedin.com/in/christopherssugden
- **Email:** None published
- **Focus:** Growth equity/PE - healthcare, fintech, tech services
- **AUM:** $1.7B
- **Location:** Princeton, NJ
- **Website:** edisonpartners.com
- **Notes:** Lower middle market, 40+ years history

### 3. Revelstoke Capital Partners
- **Contact:** Simon Bachleda
- **Title:** Founder & Managing Partner
- **Also:** Russell Cassella (Managing Partner)
- **Email:** None published
- **Focus:** Healthcare services & technology PE
- **Location:** Denver, CO
- **Website:** revelstokecapital.com
- **Notes:** Strong portfolio transformation group

## Research Methods Used
1. Web search for firm websites and team pages
2. LinkedIn searches for individual executives
3. Attempted Apollo.io API (encountered deprecated endpoints)
4. Web fetch of official company contact/team pages
5. Google searches for press releases and conference materials

## Key Findings
- **Critical Challenge:** Modern PE firms rarely publish direct email addresses
- Most use generic emails (info@, contact@) or contact forms only
- LinkedIn profiles are available but without email addresses
- Contact databases (ZoomInfo, RocketReach, ContactOut) show emails behind paywalls
- Several "leads" in sheet are not PE firms (District Partners, M SEARCH, Pulley, Rogo)

## Recommendations
1. **Focus on LinkedIn outreach** instead of email for these firms
2. **Remove non-PE firms** from sheet (executive search, SaaS companies)
3. **Generic emails** may work for initial contact (info@firmname.com)
4. **Phone outreach** may be more effective for firms without published emails
5. **Consider paid Apollo.io tier** for verified email access (current API has issues)

## Sheet Updates
- **Updated:** 5 existing rows with names, titles, LinkedIn, status
- **Added:** 3 new PE firms (Vesey Street, Edison, Revelstoke)
- **Status:** Set to "Needs verification" (no direct emails found)

## Next Steps
1. Test Apollo.io API with corrected endpoint format
2. Focus on firms with published contact information
3. Consider LinkedIn InMail strategy
4. Review sheet to remove non-PE entries
