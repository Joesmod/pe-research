# PE Enrichment Report - April 2, 2026 (3:42 PM CST)
## Cron: Hourly PE Research & Enrichment

---

## 🚨 PRIMARY TASK: BLOCKED - DATA QUALITY ISSUE

**Problem Discovered:** Google Sheet columns are misaligned/scrambled.

### Expected vs Actual Structure

**Header Row Claims:**
- Column B: "NotebookLM" (should be Contact Name)
- Column C: "Andrew Nikou" (should be Title)
- Column D: "Founder, CEO & Managing Partner" (should be Email)
- Column E: email address (should be Website)
- Column F: website URL (should be LinkedIn)
- Column G: LinkedIn URL (should be Status)
- Column H: "Enriched" (should be Notes)

**Actual Data in Rows:**
- Column B contains: Website URLs (in Contact Name field!)
- Column C contains: Names
- Column D contains: Titles  
- Column E contains: Emails (misformatted in many cases)
- Column F contains: Mixed status/notes

### Impact

- Unable to reliably identify leads needing enrichment
- Risk of corrupting data further by writing to wrong columns
- Attempted to process 15 rows, all either had no domain or invalid structure

### Recommendation

**Before next enrichment run:**
1. Manually audit and fix sheet structure  
2. Ensure columns match expected format:
   - A: Company Name
   - B: Contact Name
   - C: Title
   - D: Email
   - E: Website
   - F: LinkedIn
   - G: Status
   - H: Notes

OR

3. Provide corrected column mapping to enrichment script

---

## ✅ SECONDARY TASK: NEW FIRM RESEARCH

Since primary enrichment was blocked, I researched 5 new mid-market PE firms per instructions.

### 🎯 New Firms Added (Services-Heavy, $500M-$5B AUM)

#### 1. Lightyear Capital
- **AUM:** ~$5B
- **Focus:** Financial services, insurance, fintech, wealth management
- **Website:** https://www.lycap.com
- **Headquarters:** New York, NY
- **Contact Found:** Mark Vassallo, Managing Partner
  - Source: lycap.com/team
  - Email: NEEDS ENRICHMENT (not published on team page)
  - LinkedIn: https://www.linkedin.com/in/mark-vassallo (needs verification)
- **Notes:** Sector-specialist firm, exclusively financial services verticals

#### 2. New Harbor Capital
- **AUM:** Lower middle market (~$1-3B estimated)
- **Focus:** Healthcare, education, technology-enabled services
- **Website:** https://www.newharborcap.com
- **Headquarters:** Chicago, IL
- **Contacts Found (LinkedIn research):**
  - Ed Lhee, Partner - https://www.linkedin.com/in/edlhee/
  - Thomas Formolo, Partner - https://www.linkedin.com/in/thomas-formolo-0217bb30/
  - John Pircon, Partner - https://www.linkedin.com/in/john-pircon-85a54031/
  - Justin Marquardt - https://www.linkedin.com/in/justin-marquardt-28aa5832/
  - Jonathan Gavron - https://www.linkedin.com/in/jonathan-gavron-b3776a2a/
- **Email Pattern:** NEEDS CONFIRMATION (likely firstlast@newharborcap.com)
- **Notes:** Chicago-based, 90+ years combined partner experience, 230+ investments since 2000

#### 3. Vesey Street Capital Partners (VSCP)
- **AUM:** Lower middle market
- **Focus:** Healthcare services exclusively
- **Website:** NEEDS RESEARCH
- **Headquarters:** NEEDS RESEARCH
- **Contact Found:** Adam Feinstein, Founder & Managing Partner
  - Source: GrowthCap article (2026)
  - 30+ years healthcare services investment experience
  - Email: NEEDS ENRICHMENT
  - LinkedIn: NEEDS RESEARCH
- **Notes:** Specialist in lower middle market healthcare services buyouts

#### 4. One Equity Partners
- **AUM:** Mid-market (estimated $2-4B)
- **Focus:** Industrial, healthcare, technology sectors
- **Website:** https://www.oneequity.com
- **Headquarters:** North America & Europe presence
- **Contact Found:** NEEDS RESEARCH (team page)
- **Notes:** Middle market focus, enterprise values $500M-$5B range

#### 5. Pfingsten Partners
- **AUM:** Middle market
- **Focus:** Middle market PE
- **Website:** https://pfingsten.com
- **Headquarters:** NEEDS RESEARCH
- **Contact Found:** Scott Finegan (from previous research logs)
  - Email: NEEDS VERIFICATION
  - LinkedIn: NEEDS RESEARCH
- **Notes:** Named to TOP 50 PE Firms in The Middle Market for 10 consecutive years (through 2026)

---

## 📊 Summary

### Enrichment Stats
- **Targets Attempted:** 15 firms from sheet
- **Successfully Enriched:** 0 (blocked by data quality issue)
- **Failed/Skipped:** 15
  - 12 had no domain
  - 3 had linkedin.com as domain (invalid)

### New Firm Research
- **Firms Identified:** 5 mid-market PE firms
- **Partial Contact Data:** 2 firms (Lightyear, New Harbor)
- **Needs Deep Enrichment:** 3 firms (VSCP, One Equity, Pfingsten)

---

## 🔄 Next Steps

### Immediate (Before Next Cron Run)
1. **FIX SHEET STRUCTURE** - Critical blocker
2. **Verify column mapping** with Alex/team
3. **Test write operation** on single row to confirm alignment

### Next Enrichment Run
1. Re-scan sheet for leads with proper column mapping
2. Enrich 10-15 existing leads using Apollo API
3. Deep-dive enrichment on the 5 new firms identified above

### Manual Research Needed (Apollo Limited)
For firms where Apollo returns no results, use these sources:
- Firm website /team or /people pages
- LinkedIn company page → People tab
- Press releases mentioning leadership
- Conference speaker bios
- Industry publication articles
- SEC filings (for larger firms)

---

## 🕐 Run Metadata

- **Start Time:** 2026-04-02 3:43 PM CST
- **End Time:** 2026-04-02 3:46 PM CST  
- **Duration:** ~3 minutes
- **API Calls:** 3 Apollo searches (all failed/422 errors)
- **Web Searches:** 4
- **Web Fetches:** 2

---

## 📝 Files Generated

- `pe-enrichment-report-2026-04-02-342pm.md` (this file)
- `enrichment-log-hourly-2026-04-02.json` (empty - no successful enrichments)

---

**Status:** ⚠️ BLOCKED - Awaiting sheet structure fix before next enrichment run

**Next Cron:** Continue monitoring; will retry enrichment once sheet structure is confirmed
