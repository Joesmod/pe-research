# PE Research & Enrichment - Friday, March 6, 2026 3:36 PM

## Summary
- **Total leads needing enrichment: 68**
- **Enrichment attempted: 15**
- **Successfully enriched: 0**
- **Blockers identified: API limitations + privacy controls**

## Challenge: Contact Data Access

### What I Found:
1. **Apollo API Limitations**
   - Free/basic tier obfuscates contact data
   - Returns `has_email: true` but not actual emails
   - Names are partially hidden (e.g., "Ay***u")
   - Requires paid subscription for full contact access

2. **Web Search Findings**
   - Most PE firms don't publish direct executive emails
   - Found generic emails: pr@thrivecap.com, info@thrivecap.com, ir@trianpartners.com
   - Premium databases (ZoomInfo, RocketReach) also require paid access

### Leads Requiring Enrichment (First 15):
1. **Manulife | Comvest Credit Partners** - Has contact name (Robert O'Sullivan), needs email
2. **Pzena Investment Management** - Has contact name (Jacob Zodikoff), needs email
3. **Riverwood Capital** - Sr. Director, Marketing & Communications (Caitlin Mitchell identified but no published email)
4. **Riviera Partners** - Jacob Zodikoff, needs email
5. **Roebling Capital Partners** - Jacob Zodikoff, needs email
6. **RRML Capital Resources** - Jacob Zodikoff, needs email
7. **Sageview Capital** - Jacob Zodikoff, needs email
8. **Sculptor Capital Management** - Jacob Zodikoff, needs email
9. **Silver Oak Services Partners** - Jacob Zodikoff, needs email
10. **STORY3 Capital Partners** - Jacob Zodikoff, needs email
11. **Strategic Value Partners** - Jacob Zodikoff, needs email
12. **Tennenbaum Capital Partners, LLC** - Jacob Zodikoff, needs email
13. **Thrive Capital** - Jacob Zodikoff, needs email
14. **TimesSquare Capital Management, LLC** - Jacob Zodikoff, needs email
15. **Trian Fund Management, L.P.** - Jacob Zodikoff, needs email

**Note:** Many leads share "Jacob Zodikoff" as contact - this appears to be placeholder/research data that needs replacement.

## Options to Proceed:

### Option 1: Upgrade Apollo API (Recommended)
- **Cost:** Likely $49-$149/month for verified contact access
- **Benefit:** Systematic enrichment of all 68 leads
- **Timeline:** Immediate once upgraded

### Option 2: Manual Research
- **Method:** Deep dive per firm - team pages, press releases, SEC filings, conference bios
- **Benefit:** Free, but time-intensive
- **Timeline:** ~30-60 min per firm = 35-70 hours for 68 leads

### Option 3: Hybrid Approach
- **Method:** Use free tools + strategic manual research for high-priority firms
- **Benefit:** Balanced cost/effort
- **Timeline:** Moderate

## Verified Findings from Web Research:

### Thrive Capital
- **Generic emails found:** pr@thrivecap.com, info@thrivecap.com
- **Status:** No direct executive emails published

### Trian Fund Management
- **Generic email found:** ir@trianpartners.com
- **Key contact identified:** Anne Tarbell (Managing Director, Communications and Investor Relations)
- **Status:** Email not published

### Riverwood Capital
- **Key contact identified:** Caitlin Mitchell (Senior Director, Marketing & Communications)
- **LinkedIn:** Found profile
- **Status:** Email not published

### Strategic Value Partners
- **Website:** svpglobal.com
- **Email pattern:** [first_initial][last]@svpglobal.com (per RocketReach)
- **Status:** Team listed but emails not published

## Next Steps:

1. **Decision needed:** Approve Apollo API upgrade or proceed with manual research?
2. **Priority:** If manual, which 10-15 firms should be researched first?
3. **Alternative:** Consider reaching out via LinkedIn InMail for key targets

## Files Created:
- `leads-to-enrich-336pm.json` - Full list of 68 leads needing enrichment
- `apollo-enrichment-march6-336pm-fixed.json` - API test results (obfuscated)
- `enrichment-cron-march6-336pm.js` - Sheet reader script

## Time Spent:
- Sheet analysis: 5 min
- API testing: 20 min
- Web research: 15 min
- Documentation: 10 min
- **Total:** 50 minutes

## Recommendation:
Given the scale (68 leads) and the mission priority ("Generate qualified leads with verified contacts"), investing in Apollo API access is the most efficient path forward. Manual research at this scale would consume 35-70 hours of researcher time.
