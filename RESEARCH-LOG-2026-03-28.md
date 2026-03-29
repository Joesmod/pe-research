# PE Research & Enrichment Session - March 28, 2026 (4:05 PM CST)

## Summary

**Task:** Enrich 10-15 existing leads + add 3-5 new mid-market PE firms  
**Execution Time:** ~45 minutes  
**Result:** Unable to enrich existing leads with verified emails; successfully added 3 new firms

---

## Part 1: Existing Lead Enrichment Attempt

### Leads Identified for Enrichment (7 total)

All 7 leads had contacts identified but were missing direct email addresses:

1. **Row 54: Calera Capital** - James Farrell (Managing Partner & Founder)
2. **Row 93: Amity Search Partners** - Pamela Hickory Esterson (Founding Partner & CEO)
3. **Row 514: Bow River Capital** - Blair E. Richardson (CEO & Co-Founder)
4. **Row 696: TruArc Partners** - John Pless
5. **Row 934: Amulet Capital Partners** - Christy Katzfey
6. **Row 1046: Ardan Equity** - Michael Weintraub
7. **Row 1139: HealthEdge Investment Partners** - Phil Dingle

### Enrichment Methods Attempted

#### 1. Web Search
- Searched for each person + company + email
- Found email patterns on third-party sites (ZoomInfo, RocketReach, ContactOut)
- **Issue:** These are NOT from official published sources (violates task requirements)

#### 2. Official Website Checks
- Fetched team pages for:
  - Calera Capital
  - Amity Search Partners
  - Bow River Capital
- **Result:** No direct emails published on any official team pages

#### 3. Apollo API Search
- **Method 1:** Search by person name + organization name
- **Result:** 0 results for all 7 leads

- **Method 2:** Search by organization + titles
- **Result:** 0 results for all 7 leads

### Root Cause Analysis

1. **Apollo Coverage Gaps:** These smaller/mid-market PE firms may not be in Apollo's database, or company names don't match exactly
2. **Industry Practice:** PE firms rarely publish direct emails publicly for partners/principals
3. **Third-Party Data:** Available email patterns exist (ZoomInfo, RocketReach) but not from "official published sources"

### Recommendation

For these 7 leads, consider:
1. **LinkedIn InMail** outreach (most professional)
2. **General firm email** (info@, contact@) with specific name in subject
3. **Phone outreach** to request proper contact
4. **Paid Apollo credits** or **ZoomInfo** if policy allows third-party verified databases

---

## Part 2: New Firm Additions (COMPLETED ✅)

### Added 3 New Mid-Market PE Firms

Successfully added to Google Sheet (rows 1627-1629) with comprehensive dossiers:

#### 1. **LLR Partners** (Philadelphia, PA)
- **AUM:** $7.5B across 7 funds ($2.45B latest fund)
- **Focus:** Lower middle market, software & tech-enabled services
- **Founded:** 1999
- **Key Contact:** Seth Lehr (Co-Founder, Partner Emeritus)
- **Why Relevant:** 
  - Strong tech/services portfolio (130+ companies)
  - Value Creation Team = potential for AI automation tools
  - Lower middle market = accessible
- **Dossier:** `PE-firms/LLR-Partners.md`

#### 2. **New Harbor Capital** (Chicago, IL)
- **Focus:** Lower middle market, healthcare/education/tech-enabled services
- **Investment Style:** Thesis-based, research-driven
- **Key Contacts:** Thomas Formolo (Partner), Justin Marquardt, John Pircon
- **Why Relevant:**
  - Healthcare & education tech focus = services-heavy
  - Chicago location = regional opportunity
  - Research-driven = receptive to analytics/data tools
- **Dossier:** `PE-firms/New-Harbor-Capital.md`

#### 3. **Rockwood Equity Partners** (Founded 1999)
- **Focus:** Lower middle market, B2B services, manufacturing, industrial
- **Specialties:** Carveouts, divestitures, regulated industries, aerospace/defense
- **Environmental Focus:** Active ESG considerations
- **Why Relevant:**
  - Strong B2B services focus = direct Gumbo fit
  - Operational improvement focus
  - Carveout expertise = integration challenges (AI opportunity)
- **Dossier:** `PE-firms/Rockwood-Equity-Partners.md`

---

## GitHub Updates (PUSHED ✅)

**Commit:** `fed6fd0`  
**Message:** "Add 3 new mid-market PE firm dossiers: LLR Partners, New Harbor Capital, Rockwood Equity (2026-03-28)"  
**Files Added:**
- `PE-firms/LLR-Partners.md` (2.3 KB)
- `PE-firms/New-Harbor-Capital.md` (2.8 KB)
- `PE-firms/Rockwood-Equity-Partners.md` (2.6 KB)

**Repository:** https://github.com/Joesmod/pe-research

---

## Google Sheet Status

**Sheet ID:** `11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4`

### Updates Made:
- **New rows added:** 3 (rows 1627-1629)
- **Total rows:** 1,629
- **Columns populated:** Company Name, Website, Description, Notes, Info URL
- **Enrichment status:** Contact details flagged for future enrichment

### Columns Left Blank (Need Enrichment):
- Contact Name
- Title  
- Email
- LinkedIn URL

**Reason:** Following task guidelines - only add emails from official published sources (not found for these firms).

---

## Next Steps

### For Existing 7 Leads (Priority):
1. Try LinkedIn direct outreach
2. Check if paid Apollo/ZoomInfo access is approved
3. Consider phone research to request proper contact info
4. Look for conference speaker lists, press releases, SEC filings

### For New 3 Firms (Secondary):
1. Enrich contact details using same methods
2. Identify specific partners for each firm
3. Research recent portfolio company announcements
4. Find LinkedIn profiles for key team members

### Broader Strategy:
- Apollo API has coverage gaps for smaller PE firms
- May need multiple data sources (Apollo + ZoomInfo + manual research)
- Consider prioritizing firms with public-facing teams (LinkedIn, conferences)

---

## Tools & Scripts Created

1. `find-leads.js` - Identifies leads needing enrichment in Google Sheet
2. `enrich-7-leads-march28.js` - Apollo search by person name
3. `enrich-by-title-march28.js` - Apollo search by organization + titles
4. `add-new-firms-march28.js` - Adds new firms to Google Sheet

All scripts located in: `C:\Users\aljen\.openclaw\workspace-jim\projects\gmail-outreach\`

---

## Session Metrics

- **Leads analyzed:** 1,626 rows
- **Leads needing enrichment:** 7
- **Enrichment success rate:** 0% (due to source restrictions)
- **New firms researched:** 5+
- **New firms added:** 3
- **Dossiers created:** 3
- **Web searches:** ~15
- **Apollo API calls:** ~14
- **GitHub commits:** 1

---

**Researcher:** Jim (AI sales researcher)  
**Date:** 2026-03-28  
**Time:** 4:05 PM - ~4:50 PM (CST)  
**Status:** ✅ COMPLETED (new firms added; existing enrichment blocked by source restrictions)
