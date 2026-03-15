# PE Research & Enrichment - Cron Run
**Date:** Friday, March 6, 2026 - 7:36 PM (America/Chicago)  
**Duration:** ~1 hour  
**Sheet:** [PE Outreach CRM](https://docs.google.com/spreadsheets/d/11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4)

---

## Executive Summary

**Sheet Status:**
- Total rows: 945 PE firms
- **Needs enrichment: 103 firms** (missing contact name or have generic email)
- Focus: Firms with "Partial" or "Partial - LinkedIn Only" status

**Enrichment Attempted:** 15 firms (top priority batch)

**Challenge Encountered:**
Apollo API (`/v1/mixed_people/api_search`) returns obfuscated contact data:
- Names: `first_name` + `last_name_obfuscated` (e.g., "Blair Ga***u")
- Emails: Flag `has_email: true` but actual email not provided
- Requires separate enrichment API call or paid tier to get unobfuscated data

**Manual Research Completed:** 4 firms with web research

---

## Findings from Manual Research

### 1. **First Trust Capital Management L.P.**
- **Contact:** Michael Peck, CFA
- **Title:** CEO, Co-Chief Investment Officer  
- **Email:** ❌ Not verified (pattern inferred: mpeck@firsttrustcapital.com via ContactOut)
- **LinkedIn:** https://www.linkedin.com/in/michael-peck-cfa-646b1a4/
- **Notes:** Team page at firsttrustcapital.com/our-team/. Email pattern {first_initial}{last}@firsttrustcapital.com per ContactOut but not officially published.
- **Status:** Partial - needs email verification

### 2. **King Street Capital Management**
- **Contact:** Brian J. Higgins
- **Title:** Founder, Managing Partner
- **Email:** ❌ Not verified (pattern inferred: bhiggins@kingstreet.com via RocketReach)
- **LinkedIn:** https://www.linkedin.com/in/brian-higgins-king-street/
- **Notes:** $30B AUM. Email pattern {first_initial}{last}@kingstreet.com per RocketReach (97.4% confidence) but not officially published.
- **Status:** Partial - needs email verification

### 3. **Mercury Fund**
- **Contact:** Blair Garrou
- **Title:** Co-Founder, Managing Partner
- **Email:** ✅ blair@mercuryfund.com (found on ContactOut)
- **LinkedIn:** https://www.linkedin.com/in/bgarrou/
- **Notes:** Houston-based early-stage VC. Also Adjunct Professor at Rice University. Source: mercuryfund.com/team + ContactOut verification.
- **Status:** ✅ **ENRICHED** - ready to update sheet

### 4. **Lowercarbon Capital**
- **Contact:** Chris Sacca
- **Title:** Co-Founder, Managing Partner
- **Email:** ❌ Not verified (RocketReach shows c******@lowercarboncapital.com but obfuscated)
- **LinkedIn:** https://www.linkedin.com/in/chrissacca/
- **Notes:** Climate tech focused. Well-known VC from Shark Tank. No published email on official site.
- **Status:** Partial - needs email verification

---

## Apollo API Enrichment Attempts

**Firms searched:** 15  
**API endpoint:** `/v1/mixed_people/api_search`

**Results:**
- ✅ Found contacts: 15/15
- ❌ Full emails returned: 0/15 (all obfuscated)
- ⚠️  Status: `has_email: true` but actual email not in response

**Example response:**
```json
{
  "id": "66fae0a80034d50001342f86",
  "first_name": "Blair",
  "last_name_obfuscated": "Ga***u",
  "title": "Managing Partner",
  "has_email": true,
  "organization": {
    "name": "Mercury Fund"
  }
}
```

**Firms in batch:**
1. First Trust Capital Management L.P.
2. King Street Capital Management
3. Kudu Investment Management, LLC
4. Left Lane Capital
5. Lowercarbon Capital
6. Manulife | Comvest Credit Partners
7. Mercury Fund
8. Merit Capital Partners
9. Millennium Bridge Capital
10. Newflow Partners
11. Notable Capital
12. Prospect Capital Management
13. Pzena Investment Management
14. Rainier Partners
15. Red Cove Capital

---

## Recommendations

### Immediate Actions

1. **Mercury Fund**: Update sheet with Blair Garrou's email (blair@mercuryfund.com)

2. **Apollo API**: Need to use proper enrichment endpoint to get unobfuscated emails. Two options:
   - Use `/v1/people/bulk_match` with person IDs from search
   - Check if API key has proper tier/credits for full enrichment

3. **Manual Research Priority**: Focus on firms with published team pages:
   - Many PE firms don't publish individual emails
   - Look for press releases, SEC filings, conference bios
   - LinkedIn direct outreach may be necessary for some

### Longer-Term Strategy

**For the remaining 102 firms:**

1. **Tier 1 (High Priority):** Firms with "Partial - LinkedIn Only" status
   - Have contact name + LinkedIn
   - Just need email
   - Try email pattern inference + verification services

2. **Tier 2 (Medium Priority):** Firms with generic emails only
   - Have company info
   - Need both contact name and email
   - Search firm websites, press releases, team pages

3. **Tier 3 (Manual Research Required):** Firms with minimal data
   - May need LinkedIn Sales Navigator
   - Conference speaker bios
   - Industry publications

**Time Estimate:** 
- Manual research: ~10-15 minutes per firm
- Apollo bulk enrichment (if working): ~2-3 minutes per firm
- Recommend: 2-3 hour dedicated enrichment session to process remaining 102

---

## Files Generated

- `leads-needing-enrichment-cron.json` - Full list of 103 firms
- `apollo-enrichment-cron-736pm.json` - Apollo API results (obfuscated)
- `apollo-test-response.js` - API response structure test
- `fix-and-analyze.js` - Sheet analysis script

---

## Next Cron Run Actions

1. Test Apollo enrichment endpoint with person IDs
2. Continue manual research for high-value firms ($1B+ AUM)
3. Update sheet with verified contacts
4. Consider using Hunter.io or similar for email verification
5. Track enrichment success rate and adjust strategy

---

**Prepared by:** Jim (PE Research Agent)  
**Next review:** Next hourly cron (8:36 PM)