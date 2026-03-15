# PE Research & Enrichment - Hourly Cron Run Summary

**Run Time:** Sunday, March 15th, 2026 — 2:07 AM CST  
**Duration:** ~15 minutes  
**Method:** Manual web research (Apollo API unavailable due to auth issues)

---

## 📊 RESULTS

### ✅ Successfully Enriched: 2 firms

| Firm | Contact | Title | Email | Source |
|------|---------|-------|-------|--------|
| **424 Capital** | Kyle Stanbro | Co-Founder & Managing Partner | kstanbro@424capital.com | Official website bio |
| **ShoreView Industries** | Garrett Davis | VP, Business Development | garrett@shoreview.com | Official website + PDF |

### ⚠️ Researched but No Published Emails: 6 firms

| Firm | Key Finding | Notes |
|------|-------------|-------|
| **Audax Private Equity** | Young Lee - Partner & Co-President | Domain: @audaxprivateequity.com confirmed. No individual emails published. |
| **Rockbridge Growth Equity** | Kevin Prokop - Co-Founder | Team page exists, no published emails |
| **JLL Partners** | Multiple MDs identified | Email format known, no published addresses |
| **Alvarez & Marsal Capital** | Adam Fuchs - Managing Director | Partial info found via ContactOut |
| **Blue Star Innovation Partners** | Dan Wechsler - CEO | Only privacy@ email found |
| **Aeris Partners** | Rahul Swani - Managing Director | Note: Investment bank, NOT PE firm |

### 🚫 Not Yet Researched: 7 firms

- Thesis Capital Partners
- Regal Healthcare Capital Partners (2 entries)
- SDC Capital Partners
- Casa Verde Capital
- Cornell Capital

---

## 🔧 TECHNICAL ISSUES

### Apollo API Authentication Failure
- **Endpoint Error:** `/v1/mixed_people/search` deprecated → switched to `/v1/mixed_people/api_search`
- **Auth Error:** 401 security exception ("unable to authenticate user [leadgenie]")
- **Impact:** Forced manual web research instead of bulk API lookup
- **Action Required:** Verify API key subscription status or contact Apollo support

---

## 📝 ACTIONS TAKEN

1. ✅ **Google Sheet Updated:** Rows 3 & 14 enriched with verified contacts
2. ✅ **GitHub Dossiers Created:** 
   - `pe-research/PE-firms/424-capital/README.md`
   - `pe-research/PE-firms/shoreview-industries/README.md`
3. ✅ **Git Committed & Pushed:** Commit `8c4d4f4` to main branch
4. ✅ **Research documented:** Detailed notes captured for all 8 researched firms

---

## 🎯 NEXT STEPS

### Immediate (Next Hourly Run)
1. **Fix Apollo API** - Investigate auth issue for bulk enrichment efficiency
2. **Continue Manual Research** - Complete remaining 7 firms from target list
3. **Expand Search Methods:**
   - Press releases with contact info
   - Conference speaker bios
   - SEC filings (for larger firms)
   - LinkedIn Sales Navigator (if available)

### Process Improvements
1. **Best Time for Research:** Business hours (9 AM - 5 PM) yield better results
   - More likely to find press releases with recent contacts
   - Conference/webinar registrations more accessible
2. **Focus on Smaller Firms:** Mid-market PE firms (vs. mega-funds) more likely to publish direct contacts
3. **Email Pattern Strategy:** 
   - Document confirmed email patterns even without published addresses
   - Note for future manual outreach when pattern is confirmed

---

## 📈 EFFICIENCY METRICS

- **Firms Processed:** 8/15 (53%)
- **Enrichment Rate:** 2/8 (25% success rate)
- **Time per Firm:** ~2 minutes average
- **Quality Level:** ✅ 100% verified, published sources only (no guessing)

---

## 💡 INSIGHTS

### What Works
- **Official website bios** - Best source for published emails (2/2 successes)
- **PDF materials** - One-pagers and marketing materials often include BD contacts
- **Press releases** - Deal announcements sometimes include contact emails

### What Doesn't Work
- **LinkedIn** - Profile pages don't show emails publicly
- **Third-party databases** (RocketReach, ZoomInfo) - Partial/obfuscated emails, not publishable per task constraints
- **Email pattern guessing** - Explicitly forbidden by task requirements ✅

### Firm Characteristics That Help
- **Business development focus** - Firms with active BD teams more likely to publish contact info
- **Smaller/mid-market firms** - More accessible than mega-funds
- **Active dealmakers** - Firms seeking deal flow publish outreach contacts

---

## 🔍 DATA QUALITY NOTES

**Adherence to Task Constraints:**
- ✅ NO email pattern guessing
- ✅ ONLY published, verified sources used
- ✅ Source documented in Notes column
- ✅ Generic emails (info@, ir@) avoided in favor of direct contacts

**Source Verification:**
- 424 Capital: Official bio page (https://424capital.com/kyle-stanbro/)
- ShoreView: Official website + PDF one-pager (https://www.shoreview.com/...)

---

## 📅 CRON SCHEDULE

**Current:** Hourly  
**Recommendation:** 
- Keep hourly for automated checks
- Manual deep research 2-3x daily during business hours
- Use overnight runs for data consolidation/git commits

---

**Report Generated:** 2026-03-15 02:22 AM CST  
**Next Run:** 2026-03-15 03:07 AM CST
