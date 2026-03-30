# PE Research & Enrichment Results
**Date:** Monday, March 30, 2026 — 5:05 AM (America/Chicago)  
**Task:** Hourly PE lead enrichment cron job

## Summary

**Total Sheet Rows:** 1,719  
**Rows Needing Enrichment:** 22 (firms with missing contacts or generic/missing emails)  
**Rows Successfully Enriched:** 0  
**Rows Researched:** 11 (all firms with websites)

## Challenge: Apollo API Limitation

The Apollo API (`Fx6RpQS0PKxfVgnxWOPWuw`) has severe data access limitations:

### Issue Details
1. **Deprecated Endpoint:** Initial 422 errors due to using `/v1/mixed_people/search` instead of `/v1/mixed_people/api_search`
2. **Data Access:** After fixing endpoint, API returns results but **without usable data**:
   - Names: `undefined`
   - Emails: Not provided
   - LinkedIn URLs: Not provided
   - Only titles returned (e.g., "CEO and Partner")

### Test Results
```
Testing Apollo with jllpartners.com:
✓ API call successful (200 OK)
✗ Data incomplete:
  - Person 1: Name=undefined, Email=(no email), LinkedIn=(no linkedin)
  - Person 2: Name=undefined, Email=(no email), LinkedIn=(no linkedin)
  ...
```

**Conclusion:** Apollo API key appears to be on a limited/free tier that doesn't include contact data access.

---

## Firms Researched (Manual Web Scraping)

### 1. JLL Partners (Row 1713, 1718)
- **Website:** https://www.jllpartners.com
- **Team Page:** https://www.jllpartners.com/team/
- **Key Contacts Found:**
  - Dan Agroskin - Managing Partner
  - Kevin Hammond - Managing Partner
  - Frank Rodriguez - Managing Partner
  - Raj Bhavsar - Chief Technology Officer
  - Jeff Hunter - Chief AI Officer
  - Gerard van Spaendonck - Head of Value Creation
- **Email Availability:** ❌ No direct emails published on website
- **RocketReach Result:** Shows masked email pattern `d******@jllpartners.com` (not a public source)

### 2. American Securities (Row 1711, 1716)
- **Website:** https://www.american-securities.com
- **Team Page:** https://www.american-securities.com/en/team
- **Key Contacts Found:**
  - Michael Fisch - Partner
  - James Carmichael - Partner
  - Ben Dickson - Partner
  - Matthew Fishman - Partner
  - David Horing - Partner
  - Mark Lovett - Partner
  - Baron Concors - IT and Digital (Partner)
- **Email Availability:** ❌ No direct emails published on website

### 3-11. Other Firms
- **New Mountain Capital** (Row 1072) - Website exists, no public emails
- **Five Arrows Principal Investments** (Rows 1710, 1715) - Website exists, no public emails
- **Brighton Park Capital** (Rows 1712, 1717) - Website exists, no public emails
- **Norwest Equity Partners** (Rows 1714, 1719) - Website exists, no public emails

---

## Findings: PE Firm Contact Data Reality

**Industry Standard:** Private Equity firms intentionally do NOT publish direct email addresses publicly for decision-makers because:
1. Regulatory/compliance (avoiding unsolicited deal flow)
2. Privacy/security concerns
3. Inbound contact control (force use of general inquiries@/info@ forms)

**Available Sources:**
- ✅ **Public:** Team pages with names + titles
- ❌ **Public:** Direct emails
- ✅ **Paid Databases:** RocketReach, ContactOut, ZoomInfo, Apollo (premium tier)
- ✅ **LinkedIn:** Titles/names (no emails without Sales Navigator or InMail)

---

## Rows Still Needing Enrichment

### Without Websites (harder to research):
- Row 637: M SEARCH
- Row 645: Meridian Capital
- Row 646: Midwest Right of Way Services, Inc.
- Row 665: Pulley
- Row 669: Rogo
- Row 844: Wind Point Partners
- Row 929: SV Capital
- Row 1698-1699: Align Capital Partners (2 rows)
- Row 1700-1701: HCI Equity Partners (2 rows)

### With Websites (manual research possible):
- Row 1072: New Mountain Capital - https://www.newmountaincapital.com
- Row 1710, 1715: Five Arrows Principal Investments - https://www.fivearrows.com
- Row 1711, 1716: American Securities - https://www.american-securities.com
- Row 1712, 1717: Brighton Park Capital - https://www.brightonparkcapital.com
- Row 1713, 1718: JLL Partners - https://www.jllpartners.com
- Row 1714, 1719: Norwest Equity Partners - https://www.norwestep.com

---

## Recommendations

### Option 1: Upgrade Apollo API (Recommended)
- Current key appears to be free/limited tier
- Upgrade to paid tier for full contact data access
- Cost: ~$99-149/month for basic contact access

### Option 2: Use Alternative Paid Tools
- RocketReach: ~$53/month (170 lookups)
- ContactOut: ~$29/month (starter tier)
- ZoomInfo: Enterprise pricing (most expensive, most complete)

### Option 3: Manual LinkedIn Outreach
- Use LinkedIn Sales Navigator or InMail
- Identify decision-makers from public team pages
- Send connection requests or direct messages
- Time-intensive but free (or ~$80/month for Sales Navigator)

### Option 4: Accept Limitation
- Focus on the 1,697 already-enriched leads
- Deprioritize these 22 hard-to-reach firms
- Revisit quarterly as contact databases update

---

## Next Steps

**Immediate:**
1. ✅ Document findings (this report)
2. ⏸️ Pause hourly enrichment cron (no actionable results without paid tools)
3. 🔄 Await decision on Apollo upgrade or alternative data source

**Future:**
- If Apollo upgraded: Resume hourly enrichment
- If manual research: Allocate human time for LinkedIn/press release searches
- If deprioritized: Remove these 22 rows from enrichment queue

---

## Technical Notes

**Scripts Created:**
- `enrich-with-apollo-2026-03-30-435am.js` (deprecated endpoint)
- `enrich-pe-hourly-2026-03-30-5am.js` (updated endpoint, still limited data)
- `enrich-final-2026-03-30-5am.js` (final attempt with api_search endpoint)
- `test-apollo-simple-2026-03-30-5am.js` (API diagnostics)
- `scan-needing-enrichment-2026-03-30-5am.js` (identified 118 misaligned + 22 truly empty)
- `find-truly-empty-2026-03-30-5am.js` (filtered to 22 genuinely needing enrichment)

**Sheet Structure Issue Noted:**
- ~96 rows have data shifted left by one column (contact in B instead of C, email in D instead of E)
- These rows are actually enriched, just misaligned
- Not a priority if data is usable despite misalignment

**Service Account:** `projects/gmail-outreach/service-account.json` ✅ Working
