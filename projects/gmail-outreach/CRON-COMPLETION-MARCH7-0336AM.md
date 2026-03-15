# PE Research & Enrichment - Hourly Cron Completion
**Run Time:** Saturday, March 7th, 2026 — 3:36 AM - 4:36 AM (America/Chicago)
**Duration:** ~60 minutes
**Status:** ⚠️ BLOCKED - Tooling Limitations

## 🚧 Technical Issues

**Problem:** Node.js and Python not available in PowerShell environment
- Attempted to run enrichment scripts but `node` and `python` commands not recognized
- Cannot execute Google Sheets API calls directly
- Cannot run Apollo API enrichment scripts

**Impact:** Unable to:
- Read current Google Sheet status
- Execute batch enrichment via Apollo API
- Automatically update sheet with findings
- Git commit/push to pe-research repository

## 🔍 Manual Research Conducted

Despite tooling limitations, I conducted manual web research on priority targets:

### 1. Roebling Capital Partners ✅
- **Status:** Mid-market PE firm (VERIFIED)
- **Website:** https://roeblingcp.com
- **Location:** Cincinnati, OH area (Northern Kentucky)
- **Team Identified:**
  - **Keith Carlson** - CEO & Managing Partner (LinkedIn: /in/keithcarlson83/)
  - **Wes Goebel** - Managing Director
  - **David Graham** - Vice President
  - **Reeve Hoover** - Vice President
  - **Karl Gouverneur** - Chief Technology Officer
  - **Mike Dektas** - Chief Financial Officer
- **Contact:** inquiries@roeblingcp.com (generic)
- **Email Finding:** No individual partner emails published on official site
- **LinkedIn:** Company page active, individual profiles found
- **Assessment:** GOOD TARGET - Real PE firm, services-focused (they list "RVA Approach" - value creation)

### 2. Pzena Investment Management ⚠️
- **Status:** Asset manager / investment firm (NOT traditional PE)
- **Website:** https://www.pzena.com
- **Team Identified:** Richard Pzena (Founder & CIO)
- **Contact:** info@pzena.com, compliance@pzena.com (generic)
- **Assessment:** MARGINAL TARGET - More asset management than PE

### 3. Riviera Partners ❌
- **Status:** Executive search / recruiting firm (NOT PE)
- **Website:** https://www.rivierapartners.com
- **Assessment:** DEAD LEAD - Should be marked as "Not PE Firm"

## 📊 Enrichment Analysis

From the last 2:06 AM run report, we know:
- **60 firms** still need enrichment (as of last run)
- **~800+** already fully enriched
- **~80** marked dead
- **946 total** firms in CRM

### Key Learnings from This Run

1. **Email Discovery Challenge Persists:**
   - Most mid-market PE firms do NOT publish partner emails publicly
   - Generic emails (info@, inquiries@) are standard
   - Third-party databases (ZoomInfo, RocketReach, SignalHire) show obfuscated emails but these are NOT from official published sources

2. **Many "Partners" Companies Are Not PE:**
   - "Riviera Partners" = Recruiting firm
   - "Dynamics Search Partners" = Recruiting firm (from previous analysis)
   - "Capital Allocators" = Podcast/media
   - Need to filter more aggressively for actual PE firms

3. **Best PE Enrichment Sources:**
   - Official firm "Team" or "People" pages (names, titles, LinkedIn)
   - Press releases mentioning specific partners
   - SEC filings (for larger funds)
   - LinkedIn profiles (verify current roles)

## 🎯 Recommended Actions

### Immediate (Next Cron Run)

1. **Fix Runtime Environment:**
   - Ensure Node.js is in PATH for cron execution
   - Test with: `node --version` before running enrichment scripts
   - Alternative: Use Python with google-api-python-client if Node unavailable

2. **Use Existing Scripts:**
   - `web-enrich-cron.js` - Manual research mode (last working script)
   - `batch-enrich.js` - Sheet read/write functions verified working
   - `find-pe-enrichment-march7.py` - Created but untested (requires Python)

### Short-Term Improvements

1. **Sheet Cleanup:**
   - Mark "Riviera Partners" and similar recruiting firms as "Dead - Not PE Firm"
   - Filter out asset managers (unless services-focused)
   - Prioritize firms with "services-heavy" or "operational value creation" mentioned

2. **Targeted Research:**
   - Focus on firms with $500M-$5B AUM (mid-market sweet spot)
   - Look for firms mentioning "portfolio operations", "value creation", "portfolio services"
   - Skip mega-funds (unlikely to publish partner emails)

3. **Alternative Email Finding:**
   - Try Hunter.io API (mentioned in previous recommendation)
   - Check conference speaker bios (PE conferences often publish speaker emails)
   - Look for podcast appearances (hosts often thank guests with contact info)
   - Search for press release quotes with attribution

### Long-Term Strategy

1. **Apollo API Credits:**
   - Consider purchasing Apollo enrichment credits
   - Free tier only provides obfuscated data
   - Paid tier gives verified direct emails

2. **LinkedIn Sales Navigator:**
   - If available, much better contact data
   - Can find verified work emails
   - Better filtering for PE vs recruiting firms

3. **Automate Sheet Filtering:**
   - Create script to flag likely non-PE firms based on keywords
   - Auto-research company descriptions before adding to enrichment queue
   - Reduce wasted research time on dead leads

## 📋 Priority Targets for Next Run (Verified PE Firms)

Based on previous reports and my research, these firms should be prioritized:

1. **Roebling Capital Partners** ⭐ (Cincinnati, OH - services-focused)
2. **Strategic Value Partners** (svpglobal.com - restructuring/turnaround PE)
3. **Tennenbaum Capital Partners** (tennenbaumcapital.com - credit-focused PE)
4. **Sculptor Capital Management** (sculptor.com - multi-strategy, $33B AUM)
5. **Trian Fund Management** (trianpartners.com - activist PE, high-profile)
6. **STORY3 Capital Partners** (story3capital.com - mid-market PE)

**Research Approach for These:**
- Check team pages for bios
- Search "[Partner Name] [Firm] email" on Google
- Look for conference bios/speaker pages
- Check recent press releases
- Verify on LinkedIn

## ⚠️ Current Sheet Status

**Unable to verify current sheet status due to tooling issue.**

Last known status (from 2:06 AM run):
- 60 firms needing enrichment
- 4 firms partially enriched in last run (no emails found)

## 🔧 Files Created This Run

1. `enrich-cron-march7-336am.js` - Sheet reader (untested, Node unavailable)
2. `find-pe-enrichment-march7.py` - PE firm filter (untested, Python unavailable)
3. `CRON-COMPLETION-MARCH7-0336AM.md` - This report

## 📤 GitHub Status

**No commits this run** - Unable to update dossiers without completing enrichment

## 🎯 Success Criteria for Next Run

- ✅ Node.js/Python available in execution environment
- ✅ Successfully read Google Sheet (verify 60 firms needing enrichment)
- ✅ Enrich 10-15 firms with verified contact data
- ✅ Update Google Sheet with findings
- ✅ Create/update GitHub dossiers
- ✅ Git commit and push to pe-research repo

## 💡 Lessons Learned

1. **Always verify runtime environment** before complex automated tasks
2. **Manual research valuable** even when tooling fails - identified Roebling Capital as strong target
3. **Need better PE vs non-PE filtering** - too many recruiting firms in dataset
4. **Email finding remains biggest challenge** - official sources rarely publish direct emails
5. **Partial enrichment (name + title + LinkedIn) still valuable** for outreach preparation

---

**Next scheduled run:** Saturday, March 7th, 2026 — 4:36 AM
**Estimated time:** 15-20 minutes (if tooling fixed)
**Target:** 10-15 PE firms with verified contacts
**Priority:** Fix Node.js/Python availability first

## 🔍 Recommended Immediate Action

**For Human/Technical Owner:**
1. Verify Node.js installed and in PATH for cron user
2. Test: `node --version` and `python --version` in cron environment
3. If missing, install or add to PATH
4. Re-run this cron manually to verify tooling works
5. Then resume hourly automated runs
