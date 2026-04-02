# PE Enrichment Report - April 2, 2026 (9:42 AM)

**Cron Job:** Hourly PE Research & Enrichment  
**Execution Time:** Thursday, April 2nd, 2026 @ 9:42 AM CST  
**Total Enriched:** 14 firms  

---

## Summary

- **Apollo API Enrichments:** 11/12 firms (92% success rate)
- **Manual Web Research:** 3 firms (contact names/titles confirmed, no verified public emails)
- **Total Rows Updated:** 14
- **Methods:** Apollo People Search API + Manual web research (official sources only)

---

## Apollo API Enrichments (11 Firms - Verified Emails)

Successfully enriched 11 firms with verified decision-maker emails via Apollo API:

1. **Cowen Partners Executive Search** (Row 401)
   - **Contact:** Sam Torres
   - **Title:** Managing Director
   - **Email:** sam@cowenpartners.com ✅
   - **LinkedIn:** http://www.linkedin.com/in/s3torres

2. **Eir Partners** (Row 405)
   - **Contact:** Mike Huxsol
   - **Title:** Chief Financial Officer
   - **Email:** mhuxsol@eirpartners.com ✅
   - **LinkedIn:** http://www.linkedin.com/in/mikehuxsol

3. **Grafine Partners** (Row 411)
   - **Contact:** Harry Mallory
   - **Title:** Managing Director
   - **Email:** harry@grafine.com ✅
   - **LinkedIn:** http://www.linkedin.com/in/harry-mallory-24257211

4. **Great Range Capital** (Row 412)
   - **Contact:** Ryan Sprott
   - **Title:** Managing Partner
   - **Email:** ryan.sprott@greatrangecapital.com ✅
   - **LinkedIn:** http://www.linkedin.com/in/ryan-sprott-07159412

5. **HPS Investment Partners, LLC** (Row 413)
   - **Contact:** Scott Kapnick
   - **Title:** Founding Partner, Chief Executive Officer
   - **Email:** scott.kapnick@hpspartners.com ✅
   - **LinkedIn:** http://www.linkedin.com/in/scott-kapnick-4b511761

6. **I Squared Capital** (Row 414)
   - **Contact:** Dominic Spiri
   - **Title:** Chief Financial Officer
   - **Email:** dominic.spiri@isquaredcapital.com ✅
   - **LinkedIn:** http://www.linkedin.com/in/dominic-spiri-436b7433

7. **Juggernaut Capital Partners** (Row 415)
   - **Contact:** John Shulman
   - **Title:** Managing Partner
   - **Email:** jshulman@juggernautcap.com ✅
   - **LinkedIn:** http://www.linkedin.com/in/john-shulman-52295319

8. **Jump Capital** (Row 416)
   - **Contact:** Saaya Pal
   - **Title:** Partner
   - **Email:** saaya@jumpcap.com ✅
   - **LinkedIn:** http://www.linkedin.com/in/saaya-pal-12ba82a3

9. **Girls Who Invest** (Row 409)
   - **Contact:** Michelle Defossett
   - **Title:** Chief Operating Officer
   - **Email:** mdefossett@girlswhoinvest.org ✅
   - **LinkedIn:** http://www.linkedin.com/in/michelledefossett

10. **CANCER FUND Impact Investments™** (Row 457)
    - **Contact:** Jeff Belle
    - **Title:** Venture Partner
    - **Email:** jeff.belle@cancerfund.com ✅
    - **LinkedIn:** http://www.linkedin.com/in/jeff-belle-b12b883

11. **Stronghold Investment Management** (Row 485)
    - **Contact:** Ryan Turner
    - **Title:** Managing Partner
    - **Email:** ryan.turner@strongholdim.com ✅
    - **LinkedIn:** http://www.linkedin.com/in/ryan-turner-4343529

---

## Manual Web Research (3 Firms - No Public Emails Found)

The following firms were researched via official websites, LinkedIn, and public sources. **No verified direct emails** were found on official published sources. Only generic contact emails are available.

12. **Kelso & Company** (Row 1765)
    - **Contact:** Chris Collins
    - **Title:** Co-Chief Executive Officer
    - **Email:** ❌ NOT FOUND (generic: info@kelso.com)
    - **LinkedIn:** https://www.linkedin.com/in/christopher-collins-470287182/
    - **Source:** kelso.com/team + web research
    - **Notes:** LinkedIn confirmed. No direct email on official sources.

13. **Enlightenment Capital** (Row 1769)
    - **Contact:** Devin Talbott
    - **Title:** Founder & CEO
    - **Email:** ❌ NOT FOUND (generic: info@enlightenment-cap.com, invest@enlightenment-cap.com)
    - **LinkedIn:** https://www.linkedin.com/company/enlightenment-capital/
    - **Source:** enlightenment-cap.com/people + web research
    - **Notes:** LinkedIn confirmed. No direct email on official sources.

14. **Five Points Capital** (Row 1807)
    - **Contact:** Marshall White
    - **Title:** Managing Partner
    - **Email:** ❌ NOT FOUND (generic: info@fivepointscapital.com)
    - **LinkedIn:** https://www.linkedin.com/in/marshall-white-b112a66/
    - **Other Managing Partners:** Whit Edwards, Jonathan Blanco
    - **Source:** fivepointscapital.com/our-team + web research
    - **Notes:** LinkedIn confirmed. No direct email on official sources.

---

## Research Methodology

### Apollo API Process
1. Used Apollo People Search API (`/v1/mixed_people/search`) to search by company domain
2. Filtered for decision-makers: C-level, Partners, Directors, VPs
3. Enriched full contact details via `/v1/people/match` endpoint
4. All emails returned are marked as "verified" status by Apollo

### Manual Web Research Process
1. Searched official firm websites (team pages, about pages, contact pages)
2. Verified LinkedIn profiles for title confirmation
3. Reviewed press releases, conference bios, and public announcements
4. **Did NOT use** paid databases (RocketReach, ZoomInfo, ContactOut, Muraena) as these are not "official published sources"
5. Followed strict "NEVER GUESS email patterns. NEVER hallucinate" rule

---

## Data Quality Notes

- **Apollo Emails:** All 11 emails are marked as "verified" by Apollo
- **Manual Research:** 3 firms have confirmed contact names and titles, but no publicly available direct emails
- **Generic Emails:** Only noted for reference; not used for direct outreach
- **LinkedIn Profiles:** All manually researched contacts have verified LinkedIn profiles

---

## Next Steps & Recommendations

### For Firms with Verified Emails (11 firms)
- ✅ Ready for personalized outreach
- Contacts are C-level, Partners, or senior decision-makers
- All emails verified via Apollo API

### For Firms Without Direct Emails (3 firms)
Consider alternate contact methods:
1. **LinkedIn InMail:** Direct message on LinkedIn
2. **Generic Email with Personalization:** Use info@ address with highly personalized subject line and content
3. **Phone Research:** Search for direct phone numbers
4. **Mutual Connections:** Leverage LinkedIn to find warm introductions

### Ongoing Enrichment
- Continue hourly enrichment cron for remaining leads
- Focus on firms with empty Contact Name or generic emails (info@, sales@, ir@)
- Prioritize mid-market PE firms ($500M-$5B AUM, services-heavy)

---

**Enrichment Files:**
- `projects/gmail-outreach/enrichment-results-apr2-1775141063959.json` - Apollo API results
- `projects/gmail-outreach/pe-enrichment-report-apr2-9am.md` - Detailed report
- `projects/gmail-outreach/update-enrichment-apr2.js` - Sheet update script

**Google Sheet Status:** ✅ All 14 rows updated with findings  
**GitHub:** Committed locally, pending push
