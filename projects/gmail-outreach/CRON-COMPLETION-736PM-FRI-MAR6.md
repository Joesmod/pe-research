# PE Research & Enrichment - Hourly Cron Complete

**Cron Job:** PE Research & Enrichment - Hourly  
**Run Time:** Friday, March 6, 2026 - 7:36 PM to 8:10 PM (America/Chicago)  
**Duration:** ~34 minutes  
**Status:** ✅ COMPLETE

---

## Summary

**Sheet Analysis:**
- Total PE firms in sheet: **945**
- Firms needing enrichment: **103** (11% of total)
  - Missing contact name OR
  - Generic/missing email (info@, sales@, ir@, contact@)

**Enrichment Work:**
- Firms researched: **15** (top priority batch)
- Firms successfully enriched: **1** with verified email
- Firms partially researched: **3** (contact info found, email needs verification)

---

## ✅ Successfully Enriched (1 firm)

### Mercury Fund
- **Contact:** Blair Garrou
- **Title:** Co-Founder, Managing Partner
- **Email:** ✅ **blair@mercuryfund.com** (verified via ContactOut)
- **LinkedIn:** https://www.linkedin.com/in/bgarrou/
- **Additional Info:** Also Adjunct Professor at Rice University (Jones Graduate School of Business)
- **Sheet Status:** ✅ Updated (Row 763)
- **GitHub:** ✅ Dossier updated and pushed

---

## 🔍 Partial Research (3 firms)

### 1. First Trust Capital Management L.P.
- **Contact:** Michael Peck, CFA
- **Title:** CEO, Co-Chief Investment Officer
- **Email:** ⚠️ Inferred pattern only (mpeck@firsttrustcapital.com) - NOT VERIFIED
- **LinkedIn:** https://www.linkedin.com/in/michael-peck-cfa-646b1a4/
- **Source:** firsttrustcapital.com/our-team/ + ContactOut pattern
- **Next Action:** Need email verification before updating sheet

### 2. King Street Capital Management
- **Contact:** Brian J. Higgins
- **Title:** Founder, Managing Partner
- **Email:** ⚠️ Inferred pattern only (bhiggins@kingstreet.com) - NOT VERIFIED
- **LinkedIn:** https://www.linkedin.com/in/brian-higgins-king-street/
- **AUM:** $30B
- **Source:** kingstreet.com/Team/Brian-Higgins + RocketReach pattern (97.4% confidence)
- **Next Action:** Need email verification before updating sheet

### 3. Lowercarbon Capital
- **Contact:** Chris Sacca
- **Title:** Co-Founder, Managing Partner
- **Email:** ⚠️ Obfuscated on RocketReach - NOT VERIFIED
- **LinkedIn:** https://www.linkedin.com/in/chrissacca/
- **Focus:** Climate tech / decarbonization
- **Source:** lowercarbon.com/team/chris-sacca
- **Next Action:** Try alternative search methods or LinkedIn direct outreach

---

## 🤖 Apollo API Status

**Endpoint tested:** `/v1/mixed_people/api_search`  
**Result:** ❌ Returns obfuscated data

**Issue:** API returns:
- `first_name` + `last_name_obfuscated` (e.g., "Blair Ga***u")
- `has_email: true` but no actual email address
- Requires paid tier or additional enrichment call

**Firms searched via Apollo:** 15  
**Contacts found:** 15 (100%)  
**Emails returned:** 0 (0% - all obfuscated)

**Recommendation:** Need to:
1. Use proper enrichment endpoint with person IDs
2. Check Apollo API credit balance / tier level
3. Or continue with manual web research for verified emails

---

## 📊 Remaining Work

**Still need enrichment:** 102 firms

**Breakdown:**
- **Partial - LinkedIn Only:** ~60 firms (have contact + LinkedIn, need email)
- **Missing contact:** ~25 firms (have company info only)
- **Generic email only:** ~17 firms (e.g., contact@firm.com)

**Time estimate:**
- Manual research: 10-15 min per firm = 17-25 hours total
- Apollo (if working): 2-3 min per firm = 3-5 hours total

**Priority firms** (high-value targets):
- Mid-market PE ($500M-$5B AUM)
- Services-heavy portfolio
- Active in technology/digital transformation

---

## 📁 Files Generated

**Research & Analysis:**
- `leads-needing-enrichment-cron.json` - 103 firms needing work
- `apollo-enrichment-cron-736pm.json` - Apollo API results
- `apollo-test-response.js` - API structure test
- `fix-and-analyze.js` - Sheet analysis script
- `CRON-PE-ENRICHMENT-736PM-FRI-MAR6.md` - Detailed research notes

**Updates:**
- `update-mercury-fund-736pm.js` - Sheet update script (executed)
- `pe-research/PE-firms/mercury-fund.md` - Updated dossier (committed & pushed)

---

## ✅ Completed Actions

1. ✅ Read Google Sheet (945 rows)
2. ✅ Identified 103 firms needing enrichment
3. ✅ Researched 15 priority firms
4. ✅ Verified 1 email (Blair Garrou @ Mercury Fund)
5. ✅ Updated Google Sheet (Mercury Fund row 763)
6. ✅ Updated GitHub dossier (mercury-fund.md)
7. ✅ Committed and pushed to GitHub
8. ✅ Generated comprehensive documentation

---

## 🎯 Recommendations for Next Run

### Immediate (Next Cron - 8:36 PM)
1. Test Apollo enrichment endpoint with person IDs from obfuscated results
2. Research 5-10 more high-priority firms manually
3. Focus on firms with published team pages

### Short-term (Weekend)
1. Dedicated 2-3 hour enrichment session
2. Use Hunter.io or similar for email verification
3. Process "Partial - LinkedIn Only" firms (already have contact names)
4. Target 25-30 firms per session

### Medium-term (Next Week)
1. Consider LinkedIn Sales Navigator for hard-to-find contacts
2. Search SEC filings for executive contact info
3. Check conference speaker rosters
4. Industry publication author bios

---

## 🔧 Technical Notes

**Apollo API Endpoint Change:**
- Old: `/v1/mixed_people/search` (deprecated)
- New: `/v1/mixed_people/api_search` (returns obfuscated data)
- Need: Person enrichment endpoint or paid tier

**Email Pattern Confidence:**
- First Trust: {first_initial}{last}@firsttrustcapital.com
- King Street: {first_initial}{last}@kingstreet.com (97.4%)
- Mercury Fund: {first}@mercuryfund.com (90.8% - VERIFIED)

---

**Next Cron Run:** 8:36 PM (1 hour)  
**Current Sheet Status:** 1 firm enriched, 102 remaining  
**GitHub:** Up to date (commit ac488a6)

---

_Generated by Jim (PE Research Agent)_  
_Friday, March 6, 2026 - 8:10 PM CST_