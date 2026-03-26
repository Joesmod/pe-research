# PE Research & Enrichment - Hourly Cron - March 4, 2026, 8:06 PM

## Summary

**Target:** Enrich 10-15 leads with empty Contact Name or generic emails  
**Actual:** Identified 191 leads needing enrichment, researched 5 firms  
**Status:** ⚠️ PARTIAL - API limitations, mixed results

---

## Findings

### Total Leads Needing Enrichment: **191**

Criteria: Empty contact name OR generic email (info@, sales@, ir@, contact@)

### Issues Encountered

1. **Apollo API Endpoint Deprecated**  
   - Initial endpoint `/v1/mixed_people/search` deprecated
   - Updated to `/api/v1/mixed_people/api_search`  
   - **Result:** 0/15 firms returned contacts from Apollo

2. **Small PE Firms Not in Apollo Database**  
   - Most mid-market PE firms in our sheet have minimal Apollo coverage  
   - Firms like Keltic FP, Bindley Capital, Ancor Capital returned empty

3. **Website Access Challenges**  
   - Many firm websites have JavaScript-heavy team pages  
   - Cookie walls and access restrictions  
   - Several sites appear down or outdated

---

## Research Completed

### 1. **Arctaris Impact Investors** (Row 666)
**Status:** ✅ Decision-makers identified (email pattern inferred, NOT VERIFIED)

- **Jonathan Tower** - Managing Partner  
  LinkedIn: https://www.linkedin.com/in/jonathan-tower/  
  Email pattern: j******@arctaris.com (likely jtower@arctaris.com)

- **Andrew Gibbs, CFA** - Managing Director  
  Email pattern: a******@arctaris.com (likely agibbs@arctaris.com)

- **Uche Osuji** - Managing Director  
- **Anita Graham** - Managing Director  

⚠️ **NOT UPDATED** - email patterns not verified from official sources

---

### 2. **3G Capital** (Row 696)
**Status:** ⚠️ Leadership identified, NO direct emails

- **Alex Behring** - Co-Founder and Co-Managing Partner  
- **Daniel Schwartz** - Co-Managing Partner  
- **Jorge Lemann** - Chairman, CEO  
- **Bernardo Piquet** - CFO and Partner  

Source: https://www.3g-capital.com/  
⚠️ High-profile firm, unlikely to have publicly accessible direct emails

---

### 3. **Keltic Financial Partners** (Row 117)
**Status:** ⚠️ Partial information

- **Steve Fischer** - Partner (per RocketReach)  
- Firm based in Tarrytown, NY  
- Website: kelticfp.com (appears down)  
- No verified email found

---

### 4. **Ancor Capital Partners** (Row 724)
**Status:** ⚠️ Generic email only

- Generic contact: info@ancorcapital.com  
- Team page incomplete (placeholder text)  
- Based in Dallas/Southlake, TX  
- Over 50 acquisitions (per their site)  

---

### 5. **Bindley Capital Partners** (Row 258)
**Status:** ❌ No contacts found

- Website: bindleycapital.com  
- No Apollo results  
- No publicly available team info  

---

## Recommendations

### Immediate Actions

1. **Manual LinkedIn Research** (High Priority)  
   Focus on firms with strong LinkedIn presence:  
   - Search "site:linkedin.com [firm name] Managing Director"  
   - Check company LinkedIn pages for team lists  
   - Look for recent hires/promotions with contact info

2. **Hunter.io / RocketReach** (If Available)  
   - Use email verification tools for pattern-based emails  
   - Verify emails before adding to sheet  

3. **SEC Filings Search** (For Larger Firms)  
   - Search EDGAR for fund filings  
   - Look for contact info in Form ADV, 13F filings  
   - Often lists key personnel with roles

4. **Press Release Research**  
   - Search "[firm name] announces" OR "hires" OR "promotes"  
   - Business wire, PR Newswire, PitchBook  
   - Often includes direct contact info for PR

5. **Conference/Event Bios**  
   - Search "[firm name] speaker" OR "panelist"  
   - Industry conferences often list email in bios  
   - PE Hub, ACG events, Wharton PE conferences

---

## Next Steps for Next Cron Run

### Focus Areas

**Priority 1: Firms with accessible websites**  
Filter targets by:  
- Active, responsive websites  
- "Team" or "People" page exists  
- Mid-size firms (10-50 employees)  

**Priority 2: Alternative research methods**  
- Crunchbase premium (if available)  
- PitchBook  
- ZoomInfo  
- LinkedIn Sales Navigator  

**Priority 3: Add new firms instead**  
Given enrichment challenges, may be more efficient to:  
- Add 5-10 new mid-market PE firms with verified contacts  
- Focus on firms with public team pages  
- Prioritize firms in services-heavy sectors

---

## Files Generated

- `enrichment-targets-8pm.json` - 191 leads needing enrichment  
- `enrichment-results-8pm.json` - 0 successfully enriched, 15 failed  
- `cron-pe-enrich-8pm.js` - Target identification script  
- `apollo-enrich-8pm.js` - Apollo enrichment script (updated for new API)  

---

## Technical Notes

**Apollo API Update:**  
Changed endpoint from:  
- OLD: `https://api.apollo.io/v1/mixed_people/search`  
- NEW: `https://api.apollo.io/api/v1/mixed_people/api_search`

API is working correctly but returning empty results for smaller PE firms.

---

## Time Spent
~25 minutes (research + scripting + documentation)

---

## Recommendation for Alex

Given the challenges with Apollo coverage and public email availability for mid-market PE firms, consider:

1. **LinkedIn Sales Navigator** subscription - much better coverage for PE firms  
2. **ZoomInfo or RocketReach** - better email verification  
3. **Focus enrichment on firms with >$1B AUM** - better Apollo/Hunter coverage  
4. **Manual research budget** - hire a VA for 10 hours to manually verify emails

Current approach (Apollo API + web scraping) works well for larger firms but struggles with smaller PE shops.

---

**Next cron:** 9:06 PM (1 hour)
