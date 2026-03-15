# PE Enrichment Run - Saturday, March 7th, 2026 12:36 PM

## Summary
Hourly cron enrichment focused on leads with empty/generic emails from the Google Sheet tracker.

**Status:** PARTIAL COMPLETION - Node.js execution environment unavailable  
**Approach:** Manual web research + documented findings for manual sheet update

---

## Enrichment Findings

### 1. 777 Partners (Row 817)
**Website:** http://www.777part.com (DOWN - domain not resolving)  
**Contact Found:** Steven W. Pasko  
**Title:** Founder & Managing Partner  
**Email:** spasko@777part.com  
**LinkedIn:** https://linkedin.com/in/ste***o-3053***  
**Source:** ContactOut + RocketReach (published sources)  
**Notes:**  
- Miami-based PE firm  
- Website currently inaccessible  
- **⚠️ CAUTION:** Firm has significant bankruptcy/fraud controversies per recent news  
- **RECOMMENDATION:** Skip this lead - reputational risk

---

### 2. A-Grade Investments (Row 818)
**Website:** http://www.agradeinvestments.com  
**Founders:** Ashton Kutcher, Guy Oseary, Ron Burkle  
**Focus:** Early-stage VC (technology startups)  
**Source:** Wikipedia, LinkedIn, Crunchbase  
**Notes:**  
- Celebrity-backed venture fund (founded 2010)  
- NOT mid-market PE - early-stage VC  
- **RECOMMENDATION:** Skip - not target profile (need mid-market services-focused PE, not celebrity VC)

---

### 3. ACRE (Row 821)
**Website:** https://www.acremgt.com  
**Contact Found:** Blake Olafson  
**Title:** Partner / Founder  
**Email:** [firstnamelastname]@acremgt.com (pattern inferred, not verified)  
**Alternative Contact:** Leslie Menkes (Founder & Managing Partner)  
**General Contact:** IR@acremgt.com  
**Focus:** Real estate private equity (multifamily)  
**AUM:** $2.1B+  
**Offices:** NYC, Atlanta, Miami, Singapore  
**Source:** acremgt.com/contact-us, Crunchbase  
**Notes:**  
- Real estate-focused PE, NOT services/tech-enabled  
- Blake Olafson confirmed as Partner, based in Singapore  
- **RECOMMENDATION:** Low priority - real estate focus doesn't match Gumbo's ideal client profile

---

## Firms Requiring Further Research
The following leads from needs-enrichment.json still require deep research:

**High Priority (Services-Heavy PE):**
- [ ] Aduro Advisors (row 822)
- [ ] AEC Advisors LLC (row 823)
- [ ] AgFunder (row 825) - AgTech focus
- [ ] Accelerize 360 (row 819) - needs validation

**Research Blockers:**
- Node.js environment not accessible in current shell
- Google Sheets API scripts require `node` command
- Python environment also unavailable

---

## Recommended Next Steps

### Immediate (Next Cron Run):
1. **Fix execution environment** - ensure Node.js is in PATH for gmail-outreach scripts
2. **Run read-sheet.js** to pull current sheet state as JSON
3. **Execute apollo-enrich-cron.js** or similar enrichment script
4. **Update sheet programmatically** via Google Sheets API

### Manual Update Path (if scripts remain blocked):
1. Open Google Sheet manually: `11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4`
2. Update Row 817 (777 Partners):
   - Status: `Dead Lead - Reputational Risk`
   - Notes: `Founder Steven Pasko identified (spasko@777part.com per ContactOut) but firm has bankruptcy/fraud issues - SKIP`
3. Update Row 818 (A-Grade Investments):
   - Status: `Wrong Profile`
   - Notes: `Celebrity-backed early-stage VC (Kutcher/Oseary/Burkle) - not mid-market PE`
4. Update Row 821 (ACRE):
   - Contact Name: `Blake Olafson`
   - Title: `Partner`
   - Email: `[Needs verification - pattern: fname@acremgt.com]`
   - Notes: `Real estate PE focus ($2.1B AUM) - low priority for Gumbo (not services)`

---

## Technical Notes

**Environment Issues:**
```powershell
# Node.js not in PATH:
PS> node --version
# node : The term 'node' is not recognized...

# Python not accessible:
PS> python --version
# Python was not found; run without arguments to install...
```

**Workaround Applied:**
- Manual web_search + web_fetch for research
- Markdown documentation for findings
- Requires manual sheet update OR script execution in functioning Node environment

---

## Completion Metrics

**Firms Researched:** 3  
**Verified Contacts Found:** 1 (ACRE - partial)  
**Qualified Leads:** 0 (none match ideal profile)  
**Dead Leads Identified:** 1 (777 Partners)  
**Wrong Profile:** 1 (A-Grade Investments)  

**Remaining Work:** 10-12 firms from needs-enrichment.json still need research

---

## Files Updated
- `CRON-PE-ENRICHMENT-20260307-1236PM.md` (this report)

## Files Referenced
- `needs-enrichment.json` (644 leads requiring contacts)
- `service-account.json` (Google Sheets auth)
- `read-sheet.js` (requires Node.js)

---

**Next Run:** 2026-03-07 13:36 (1 hour)  
**Action Required:** Fix Node.js PATH or execute enrichment manually
