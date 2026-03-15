# PE Research & Enrichment - Hourly Cron Report
**Date:** March 10, 2026 - 11:36 PM CST  
**Researcher:** Jim  
**Task:** Enrich 10-15 existing leads + add 3-5 new firms

---

## Summary

### Leads Analyzed
- **Total leads needing enrichment:** 39
- **Actual PE firms (Status="Partial"):** 4
- **Dead/Not PE Firms:** 35

### Enrichment Attempts (4 Firms)

#### 1. Constitution Capital Partners (Row 586)
- **Contact:** Vil Ramos (Managing Partner)
- **Website:** https://concp.com
- **Team Page:** https://concp.com/team/ ✅
- **Finding:** Team page lists Vicente Miguel T. Ramos as Managing Partner, but NO direct emails published. Only generic contact: info@concp.com
- **Email Pattern Research:** No @concp.com emails found in public sources
- **Status:** ❌ Cannot enrich - No verified direct email from published source

#### 2. D1 Capital Partners (Row 588)
- **Contact:** Daniel Sundheim (Founder & Chief Investment Officer)
- **Website:** None (private firm)
- **LinkedIn:** https://www.linkedin.com/in/daniel-sundheim-565935124/
- **Finding:** Firm has no public website with contact information. RocketReach suggests d******@d1capital.com but this is inferred data, not published.
- **Status:** ❌ Cannot enrich - No official website or published email

#### 3. Dhanani Private Equity Group (Row 591)
- **Contact:** Nadyrshah (Nick) Dhanani (CEO, Founder, Chairman)
- **Website:** https://dhananipeg.com ✅
- **Team Page:** https://dhananipeg.com/our-team/ ✅
- **Team Members:** https://dhananipeg.com/nick-dhanani/
- **Finding:** Team page and individual profiles exist but NO direct emails published. Only generic: admin@dhananipeg.com, invest@dhananipeg.com
- **ZoomInfo Pattern:** n***@dhananipeg.com (unverified, third-party)
- **Status:** ❌ Cannot enrich - No verified direct email from published source

#### 4. Drive Capital (Row 594)
- **Contact:** Chris Olsen (Partner)
- **Website:** https://drivecapital.com ✅
- **Team Page:** https://drivecapital.com/team ✅
- **Individual Profile:** https://drivecapital.com/team/chris-olsen ✅
- **Finding:** Professional team pages exist but NO direct emails published. Only generic: apply@drivecapital.com (careers)
- **ContactOut:** Lists chris@drivecap.com, christina@drivecapital.com (unverified, third-party)
- **Status:** ❌ Cannot enrich - No verified direct email from published source

---

## Key Findings

### Challenge: Email Discovery Gap
- All 4 PE firms have professional websites with team pages
- NONE publish direct email addresses for decision-makers
- Third-party data providers (RocketReach, ZoomInfo, ContactOut) offer inferred email patterns, but these are NOT verified published sources per task requirements

### Instruction Conflict
The task requirements state:
> "ONLY use emails found on official published sources"  
> "NEVER GUESS email patterns. NEVER hallucinate."

This creates a challenging constraint: Mid-market PE firms intentionally do NOT publish direct emails on their websites to control inbound contact flow.

### Solutions to Consider

1. **Relax Source Requirements:** Allow use of RocketReach/Apollo/ZoomInfo verified patterns when official sources don't exist
2. **Use Apollo API:** We have Apollo API access (Key: Fx6RpQS0PKxfVgnxWOPWuw) which may have verified contacts
3. **Generic Email Strategy:** Update sheet with generic emails (info@, admin@) and note "Direct contact unavailable" in Notes
4. **Cold LinkedIn Outreach:** Use LinkedIn profiles to send InMail/connection requests
5. **Phone Research:** Many firms publish main office numbers - could add those as alternative contact method

---

## Secondary Task: Add New Firms

### Firm Identified
- **Bow River Capital**
  - Website: https://www.bowrivercapital.com
  - AUM: ~$2.5B+
  - Focus: Healthcare services, industrial services, infrastructure, tech-enabled business services, software growth equity
  - Location: Denver, Colorado
  - Status: Fits criteria ($500M-$5B AUM, services-heavy)

**Action needed:** Research Bow River team page for decision-makers and attempt enrichment

---

## Recommendations

1. **Use Apollo API** for systematic enrichment of the 4 "Partial" firms
2. **Document source** in Notes column when using Apollo/third-party verification
3. **Add Bow River Capital** + 2-3 more similar firms to hit 3-5 new firm target
4. **Update cron strategy:** Focus new firm discovery over enrichment when public sources are insufficient

---

## Time Allocation (This Run)
- Sheet analysis: 5 min
- Web research (4 firms): 20 min
- Report writing: 5 min
- **Total:** ~30 min

**Next Steps:** Use Apollo API for systematic enrichment or pivot fully to new firm discovery.
