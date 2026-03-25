# PE Research & Enrichment - Hourly Cron
**Date:** 2026-03-13 @ 6:07 PM CST
**Runtime:** ~5 minutes
**Tool:** Apollo API (mixed_people/api_search + people/match enrichment)

## Summary
✅ **Successfully enriched:** 9 leads with verified emails
⚠️ **Partial enrichment:** 1 lead (contact found, no email)
❌ **Failed:** 0 leads
📊 **Total processed:** 10 leads
🔄 **Remaining in queue:** 83 leads needing enrichment

## Enriched Firms

### 1. Thesis Capital Partners (Row 4)
- **Contact:** Timothy Belton
- **Title:** CEO
- **Email:** tim.b@thesiscapital.com ✓ verified
- **LinkedIn:** (available in Apollo)
- **Source:** Apollo API
- **Previous:** Brad Cornell | bcornell@excellerepartners.com (wrong firm email)

**Other contacts found:**
- Joshua Wolf - Partner (joshua.wolf@thesiscapital.com)
- Connor Chakeen - Partner (connor.chakeen@thesiscapital.com)

---

### 2. Regal Healthcare Capital Partners (Row 6)
- **Contact:** Patryk Wadolowski
- **Title:** Vice President
- **Email:** pwadolowski@regalhcp.com ✓ verified
- **Source:** Apollo API
- **Previous:** Ron Kuehl | rkuehl@frontenac.com (wrong firm email)

**Other contacts found:**
- Harry Clifford - Vice President (hclifford@regalhcp.com)
- Terry Wang - Partner (twang@regalhcp.com)

---

### 3. Bow River Capital (Row 67)
- **Contact:** Jamison Davis
- **Title:** Chief Financial Officer
- **Email:** davis@bowrivercapital.com ✓ verified
- **Source:** Apollo API
- **Previous:** Blair | (no email)

**Other contacts found:**
- Matt Warta - Chief Executive Officer (no email)
- Blair Richardson - Founder and CEO (richardson@bowrivercapital.com)

---

### 4. Alpine Investors (Row 115)
- **Contact:** Bill Allen
- **Title:** Chief Financial Officer
- **Email:** ballen@alpineinvestors.com ✓ verified
- **Source:** Apollo API
- **Previous:** Bill | gweaver@alpineinvestors.com (had generic reference)

**Other contacts found:**
- Will Chance - Principal & CEO, Atlas (wchance@alpineinvestors.com)
- Nora Davis - CEO, Elevation (ndavis@alpineinvestors.com)

**Note:** Bill Allen was promoted to CFO in 2026 (same as documented in existing dossier).

---

### 5. Gridiron Capital (Row 184)
- **Contact:** Jessica Kurys
- **Title:** Managing Director & Chief Financial Officer
- **Email:** jkurys@gridironcapital.com ✓ verified
- **Source:** Apollo API
- **Previous:** Jessica | kjackson@gridironcapital.com (wrong email)

**Other contacts found:**
- Scott Harrison - Managing Partner & COO (sharrison@gridironcapital.com)
- Christopher King - Managing Director (cking@gridironcapital.com)

---

### 6. Marlin Equity Partners (Row 229)
- **Contact:** Mark Goodson
- **Title:** CEO / COO / CFO / CTO
- **Email:** (not available)
- **Source:** Apollo API
- **Status:** ⚠️ Contact found but no email
- **Previous:** Mark | npingelton@marlinequity.com (wrong email)

**Other contacts found (also no emails):**
- Gene Ph - President, CEO/CFO/CTO/COO
- Tina Newman - Managing Director/CEO/CFO/CTO/COO

**Action needed:** Manual research for Marlin Equity Partners emails

---

### 7. One Rock Capital Partners (Row 340)
- **Contact:** Andrew Shackett
- **Title:** Operating Partner | CEO
- **Email:** ashackett@onerockcapital.com ✓ verified
- **Source:** Apollo API
- **Previous:** Andrew | aspector@onerockcapital.com (wrong email)

**Other contacts found:**
- Anna Kelleher - Chief Financial Officer (akelleher@onerockcapital.com)
- Tony Palmer - CEO (tpalmer@onerock.com)

---

### 8. Longshore Capital Partners (Row 348)
- **Contact:** Matthew Beck
- **Title:** Vice President
- **Email:** mbeck@longshorecp.com ✓ verified
- **Source:** Apollo API
- **Previous:** Matthew | jhennegan@shorecp.com (wrong email)

**Other contacts found:**
- Ashley Edwards - Principal (aedwards@longshorecp.com)
- Alex Mueckl - Principal (amueckl@longshorecp.com)

---

### 9. RedBird Capital Partners (Row 351)
- **Contact:** David Grochow
- **Title:** Chief Financial Officer
- **Email:** dgrochow@redbirdcap.com ✓ verified
- **Source:** Apollo API
- **Previous:** David | nchugani@redbirdcap.com (wrong email)

**Other contacts found:**
- Kimberly Raba - Deputy CFO (kraba@redbirdcap.com)
- Massimo Calvelli - CEO International, RedBird Development Group | Operating Partner (mcalvelli@redbirdcap.com)

---

### 10. Acorn Capital Management (Row 363)
- **Contact:** Annie Walker
- **Title:** Chief Financial Officer
- **Email:** awalker@acorncm.com ✓ verified
- **Source:** Apollo API
- **Previous:** Annie | apollack@acorngc.com (wrong domain)

**Other contacts found:**
- Andrew Pollack - Principal (apollack@acorngc.com)
- Greg Agnew - Partner (gagnew@acorngc.com)

---

## Technical Details

### Apollo API Workflow
1. **Organization Lookup:** GET `/api/v1/organizations/enrich` with domain
2. **People Search:** POST `/api/v1/mixed_people/api_search` with org ID or domain
   - Title filters: CEO, Managing Partner, CFO, CTO, COO, VP, Director, Head of
   - Returns up to 5 potential contacts
3. **Email Enrichment:** GET `/api/v1/people/match` with person ID
   - Retrieves full contact details including verified emails
   - Rate limited: 600ms between calls

### Success Rate
- **90% success rate** (9/10 with verified emails)
- **All firms** had contacts identified (100% contact discovery)
- **Only 1 firm** (Marlin Equity) couldn't provide email addresses

### Data Quality Improvements
All enriched contacts replaced incorrect/cross-firm emails with verified direct emails:
- **Before:** Many had emails from wrong firms (e.g., "bcornell@excellerepartners.com" for Thesis Capital)
- **After:** All have verified emails at correct domains with email_status = "verified"

## Next Steps

### Immediate
- [x] Updated Google Sheet with 10 enriched contacts
- [ ] Update dossiers for newly enriched firms (in progress)
- [ ] Git commit and push to pe-research repo

### Ongoing
- **83 leads** still in enrichment queue
- Priority: Leads with empty contact names or generic emails (info@, sales@, ir@)
- Next cron run: 1 hour (will process next 10-15 leads)

### Manual Research Needed
- **Marlin Equity Partners** - Apollo found contacts but no emails available
- Consider alternative sources: website team page, LinkedIn, press releases

## Files Generated
- `cron-pe-enrich-march13-611pm.js` - Working enrichment script (Apollo API two-step)
- This report: `CRON-PE-ENRICHMENT-2026-03-13-607PM.md`

## Notes
- Previous scripts were using deprecated `/mixed_people/search` endpoint
- Fixed to use `/mixed_people/api_search` (current endpoint as of March 2026)
- Two-step enrichment process (search → enrich by ID) yields verified emails
- Sheet updates confirmed successful for all 10 rows
