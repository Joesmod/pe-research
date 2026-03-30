# PE Research & Enrichment Report
**Date:** Sunday, March 29, 2026 - 11:05 PM CST  
**Cron Job:** Hourly PE Research & Enrichment  
**Researcher:** Jim (Sales Research Agent)

## Summary

**Total Leads Analyzed:** 1,537 (from "Uncontacted Leads" sheet)  
**Leads Needing Enrichment:** 7  
**Successfully Enriched:** 0  
**Remaining:** 7  

## Methodology

### 1. Apollo API Attempt
- Attempted to use Apollo API (`mixed_people/api_search` endpoint)
- API Key: Configured and valid
- **Result:** No contacts returned for any of the 7 firms
- **Reason:** Apollo may not have coverage for these specific mid-market PE firms

### 2. Manual Web Research
Per task requirements:
- Searched official firm websites for team/contact pages
- Looked for press releases with verified contact information
- Followed strict rule: "ONLY use emails found on official published sources"
- **NEVER guessed email patterns or hallucinated**

## Firms Analyzed

### 1. Blackford Capital (Row 430)
- **Website:** blackfordcapital.com
- **Found:** Team page with names (Rick, Rishabh, Emily, Kristen Muir)
- **Direct Emails:** None published on official site
- **LinkedIn:** Active company page
- **Status:** Cannot enrich without verified email from official source

### 2. Hughes & Company (Row 1515)
- **Website:** hughes-co.com
- **Found:** Travis Hughes (Managing Partner & Founder)
- **Team Page:** hughes-co.com/team-4/
- **Direct Emails:** None published on official site
- **Focus:** Healthcare software PE
- **Status:** Cannot enrich without verified email from official source

### 3. Trivest Partners (Rows 1518, 1519)
- **Website:** trivest.com
- **Found:** Troy D. Templeton (Managing Partner), Jorge Gross Jr. (Managing Partner, Recognition Fund)
- **Direct Emails:** None published on official site
- **Generic Contact:** info@trivest.com (already in sheet)
- **Status:** Cannot enrich without verified email from official source

### 4. Abry Partners (Row 1536)
- **Found in Prior Research:** Nick Scola (Partner/Head of Buyout Funds)
- **Website Contact:** info@abry.com (generic)
- **Direct Emails:** None published on official site
- **Status:** Cannot enrich without verified email from official source

### 5. Huron Capital Partners (Row 1537)
- **Found in Prior Research:** Pete Mogk (Founding Partner)
- **Third-party Pattern Suggestions:** Found patterns on RocketReach/ZoomInfo (NOT official sources)
- **Direct Emails:** None published on official site
- **Status:** Cannot enrich without verified email from official source

### 6. Incline Equity Partners (Row 1538)
- **Found in Prior Research:** Pete McGuire (team member)
- **Email Pattern:** First.Last@inclineequity.com per LeadIQ (NOT official source)
- **Direct Emails:** None published on official site
- **Status:** Cannot enrich without verified email from official source

## Key Findings

### Pattern: Mid-Market PE Firms Do Not Publish Direct Emails
The consistent finding across all 7 firms is that **mid-market private equity firms deliberately do not publish direct email addresses on their official websites**. This is a security/privacy practice common in the industry.

**What IS Published:**
- Team member names and titles
- Generic contact emails (info@, ir@, deals@)
- Phone numbers (sometimes)
- LinkedIn profiles (company pages)

**What Is NOT Published:**
- Direct email addresses for individuals
- Personal contact information

## Recommendations

### Option 1: Use Third-Party Data (Violates Current Task Rules)
Tools like Apollo, RocketReach, ZoomInfo, and LeadIQ have **inferred** email patterns (e.g., first.last@company.com), but these are:
- NOT from official published sources
- Against current enrichment rules
- May be inaccurate

### Option 2: Inbound/Referral Strategy
- Leverage warm introductions from existing network
- Use LinkedIn for connection requests
- Attend industry conferences where these partners speak

### Option 3: Generic Contact + Qualification
- Use published generic emails (info@, ir@, deals@)
- Send qualifying messages asking for the appropriate contact
- Build relationship through official channels

### Option 4: Relax "Official Source" Requirement
If Apollo/third-party data is acceptable:
- Apollo API can provide inferred emails
- Typically 70-85% accuracy for verified business emails
- Much faster enrichment process

## Technical Notes

### Apollo API Issues Encountered
1. First attempt used deprecated endpoint (`mixed_people/search`)
2. Updated to `mixed_people/api_search`
3. Fixed API key location (header vs. body)
4. Final result: API calls successful but returned 0 contacts
5. **Root cause:** Apollo may not index these specific PE firms or requires different search parameters

### Sheet Status
- "Uncontacted Leads" sheet has 1,537 rows
- Only 7 leads currently flagged as needing enrichment
- This is a remarkably clean dataset (99.5% already enriched)
- Remaining 7 are the "hard cases" where standard methods don't work

## Time Investment

- Apollo API debugging: ~15 minutes
- Web research (7 firms): ~25 minutes
- Documentation: ~10 minutes
- **Total: ~50 minutes**

## Next Steps

**Recommended for Monday Morning:**
1. Discuss with Alex: Should we relax the "official source only" rule?
2. If yes → Use Apollo/third-party data for these 7 firms
3. If no → Mark these as "Manual Outreach Required" and use LinkedIn/warm intros
4. Consider: Are these 7 firms even worth the extra effort vs. finding new easier-to-contact firms?

**Alternative:** Add 3-5 new PE firms to the pipeline (task secondary objective) where contacts ARE publicly available.

---

**Report Generated:** 2026-03-29 23:55 CST  
**Next Enrichment Run:** 2026-03-30 00:05 AM (hourly cron)
