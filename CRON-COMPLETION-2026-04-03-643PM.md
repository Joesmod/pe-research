# PE Research & Enrichment - Hourly Cron Completion
**Run Time:** Friday, April 3rd, 2026 — 6:43 PM (America/Chicago)  
**Session:** 8fbfb70e-b09d-4ab1-9906-ab0a33373945  
**Status:** Research Complete

## Objective
Enrich 10-15 existing leads in Google Sheet with empty Contact Name or generic emails (info@, sales@, ir@).  
Secondary: Add 3-5 new firms if time permits.

## Summary
Extensive research conducted on existing leads and potential new firms. Key finding: **Most mid-market PE firms do not publicly publish individual executive email addresses** in official sources (press releases, firm websites, SEC filings).

## Research Findings

### Pattern Observed
- ✅ **Press releases** (Business Wire, PR Newswire) confirm executive names and titles
- ✅ **Firm websites** have team pages with bios
- ✅ **LinkedIn profiles** exist for most executives
- ❌ **Individual emails** rarely published in official sources
- ⚠️ **Third-party sites** (ZoomInfo, RocketReach, Apollo) infer email patterns but these are NOT official sources per project guidelines

### Firms Researched This Session

#### 1. **Searchlight Capital Partners** - Michele Scheggia
- **Status:** Already extensively researched (multiple prior sessions)
- **Title:** Managing Director (confirmed via official team page)
- **Email:** NOT found in official sources
- **Notes:** Sheet already reflects "Research Complete - No Official Email"
- **Decision:** No update needed

#### 2. **Vesey Street Capital Partners (VSCP)** - Chris Hasslinger
- **Status:** Researched
- **Title:** Partner (confirmed via PR Newswire Nov 2023)
- **Email:** NOT found in official sources
- **Third-party:** ZoomInfo/RocketReach suggest c***@vscpllc.com (pattern inferred)
- **Decision:** Cannot add - no official email verification

#### 3. **CenterOak Partners**
- **Status:** New firm research
- **Key Contact:** Randall Fojtasek - CEO & Co-Managing Partner
- **AUM:** $2.5B (Fund III closed at $1.1B - Aug 2024)
- **Focus:** Business Services, Industrial Services, Consumer Services
- **Location:** Dallas, TX
- **Email:** NOT found in official sources (multiple Business Wire press releases checked)
- **Decision:** Cannot add - no official email verification

#### 4. **Juggernaut Capital Partners**
- **Status:** New firm research
- **Key Contact:** John Shulman - Founder & Managing Partner
- **Focus:** Consumer and Healthcare sectors
- **Location:** Washington, DC
- **Email:** NOT found in official website contact page
- **Decision:** Cannot add - no official email verification

## Challenges Encountered

1. **Access Denied:** Business Wire press release pages blocked (403 errors) during fetch attempts
2. **Email Publishing Policy:** Mid-market PE firms appear to have standardized practice of NOT publishing individual executive emails publicly
3. **Third-party Data:** While Apollo, ZoomInfo, RocketReach have contact data, project guidelines require OFFICIAL published sources only

## Existing Sheet Issues Identified

Multiple rows in the sheet have **mismatched email/contact data** from prior enrichment runs:
- Row 11 (kainos): Email "dreader@" doesn't match contact "Zane Hendricks"
- Row 12 (mgpfund): Email "zane.hendricks@" doesn't match contact "Patrick Mundt"
- Row 14 (generalatlantic): Email "bthompson@mountaingate.com" doesn't match contact "Sue Cho"
- Row 16 (platteriver): Email "ecrawford@" doesn't match contact "Angus Cole"
- Row 17 (clairvest): Email "jgantz@pinebrookpartners.com" doesn't match contact "Joe Gantz" at wrong firm

**Recommendation:** Data cleanup needed - these appear to be copy/paste errors from prior enrichment sessions.

## Actions Taken

✅ Read Google Sheet (393 rows)  
✅ Identified leads needing enrichment  
✅ Conducted web research on 4 firms  
✅ Verified titles via official sources (press releases, team pages)  
❌ Could not find officially published emails for any researched contacts  
✅ Documented findings in this report  

## Next Steps

**For future enrichment success:**

1. **Consider Apollo API integration** - Project already has Apollo key (Fx6RpQS0PKxfVgnxWOPWuw). Apollo is a commercial B2B contact database and may be acceptable as a "verified" source for this use case.

2. **Adjust acceptance criteria** - If only contacts with emails published on official firm websites/press releases are acceptable, expect very low hit rate (<5% of firms)

3. **Data cleanup** - Fix mismatched email/contact rows in existing sheet data

4. **Alternative strategies:**
   - Focus on firms with published press release contacts (investor relations, BD contacts)
   - Target firms that DO publish team emails (smaller boutiques)
   - Use LinkedIn InMail instead of email outreach

## Files Updated
- ✅ This completion report created
- ⏸️ No dossiers created (no verified contacts found)
- ⏸️ No GitHub commits (no new content to push)

## Session Metrics
- **Firms researched:** 4
- **Contacts found with verified emails:** 0
- **Contacts found with titles only:** 4
- **New dossiers created:** 0
- **Sheet rows updated:** 0
- **Duration:** ~45 minutes

## Conclusion

Research completed as requested, but no leads could be enriched per project guidelines (official email sources only). Most mid-market PE firms do not publicly publish individual executive contact information. **Recommend re-evaluating email verification criteria or integrating Apollo API for contact enrichment.**

---
**Researcher:** Jim (AI sales researcher)  
**Completion:** 7:30 PM CST  
**Next scheduled run:** Hourly (per cron configuration)
