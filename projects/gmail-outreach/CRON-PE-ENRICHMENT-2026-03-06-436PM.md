# PE Research & Enrichment - March 6, 2026 4:36 PM

## Summary

- **Total leads reviewed**: 10 firms from previous enrichment target list
- **Enrichment target**: 10-15 leads this hour
- **Primary focus**: Finding verified decision-maker contacts with direct emails
- **Status**: Research in progress, findings documented below

## Key Findings

### 1. Thesis Capital Partners (Row 4)
**PREVIOUSLY ENRICHED** - See 4:06 PM report for Ian J.H. Reynolds contact details

---

### 2. SDC Capital Partners (Row 7)
- **Original contact in sheet**: Abdul R. Hussein - Co-Founder & Managing Partner ❌ INCORRECT
- **Verified leadership**:
  - **Todd Aaron** - Founder and Managing Partner ✅
  - **Doug Kaden** - Managing Partner ✅
- **Website**: https://sdccapitalpartners.com/
- **Team page**: https://sdccapitalpartners.com/team/
- **LinkedIn**: https://www.linkedin.com/company/sdc-capital-partners
- **Sector**: Digital infrastructure (data centers, fiber networks, cloud services)
- **AUM**: $8.8B
- **Status**: Verified team structure, no direct emails found on official sources
- **Source**: Official website team page
- **Notes**: Abdul R. Hussein does NOT appear on current team roster. Recommend updating to Todd Aaron or Doug Kaden.

**RECOMMENDATION**: Update Contact Name to "Todd Aaron", Title to "Founder and Managing Partner", leave Email blank pending Apollo API search

---

### 3. Rockbridge Growth Equity, LLC (Row 8)
- **Original contact in sheet**: Joshua Liebow - President & Founder ❌ INCORRECT
- **Verified leadership (co-founders)**:
  - **Kevin Prokop** - Managing Partner and Co-Founder ✅
  - **Brian Hermelin** - Managing Partner and Co-Founder ✅
- **Website**: https://www.rbequity.com/
- **Team page**: https://www.rbequity.com/team/
- **LinkedIn**: https://www.linkedin.com/company/rockbridge-growth-equity
- **Sector**: Mid-market growth equity, technology-enabled services
- **Location**: Detroit, MI
- **Founded**: 2007
- **Status**: Verified correct leadership, no direct emails found on official sources
- **Source**: Official website team pages (rbequity.com)
- **Notes**: Joshua Liebow is NOT affiliated with Rockbridge - he works at Manulife IM

**RECOMMENDATION**: Update Contact Name to "Kevin Prokop", Title to "Managing Partner & Co-Founder", leave Email blank pending Apollo API search

---

### 4. Casa Verde Capital (Row 12)
- **Original contact in sheet**: Karan Wadhera - Founder & CEO
- **Verified info**:
  - **Karan Wadhera** - Managing Partner ✅ (title correction needed)
  - **Yoni Meyer** - Partner
  - **Calvin Broadus (Snoop Dogg)** - Key team member, identity/brand
- **Website**: https://casaverdecapital.com/
- **Team page**: https://casaverdecapital.com/team/
- **LinkedIn**: https://www.linkedin.com/in/karan-wadhera/
- **Sector**: Cannabis/ancillary businesses venture capital
- **Location**: Los Angeles, CA
- **Status**: Verified contact name, title needs correction to "Managing Partner"
- **Source**: Official website team page
- **Notes**: Contact name confirmed, but title in sheet says "Founder & CEO" - should be "Managing Partner"

**RECOMMENDATION**: Update Title to "Managing Partner", leave Email blank pending Apollo API search

---

### 5. Knox Capital (Row 17)
- **Original contact**: Barry Siadat - Founder & Managing Partner
- **Status**: NOT RESEARCHED THIS SESSION (prioritizing data quality fixes above)

---

### 6. Palladium Equity Partners (Row 19)
- **Original contact**: Kenneth E. Aboussie, Jr. - Co-Founder & Managing Partner
- **Status**: NOT RESEARCHED THIS SESSION

---

### 7. Charlesbank Capital Partners (Row 20)
- **Original contact**: Dominic Ang - Managing Partner & Co-Founder
- **Status**: NOT RESEARCHED THIS SESSION

---

### 8. HGGC (Row 23)
- **Original contact**: Kevin Schwartz - Managing Director & Founder
- **Status**: NOT RESEARCHED THIS SESSION

---

### 9. Incline Equity Partners (Row 26)
- **Original contact**: Andrew Weinstein - Founder & CEO
- **Status**: NOT RESEARCHED THIS SESSION

---

### 10. Abry Partners (Row 31)
- **Original contact**: Jonathan Litinger - Managing Partner
- **Status**: NOT RESEARCHED THIS SESSION

---

## Data Quality Issues Found

### Critical: Email Field Contains Job Titles
Multiple rows have job titles stored in the Email column instead of actual email addresses. This is a data structure problem that needs immediate fixing.

### Critical: Incorrect Contact Names
- SDC Capital Partners: Abdul R. Hussein not found on team
- Rockbridge Growth Equity: Joshua Liebow not affiliated with firm

## Recommended Next Steps

1. **Immediate**: Update the 3 firms above with correct contact names/titles in Google Sheet
2. **Apollo API Search**: Use Apollo to find verified emails for:
   - Todd Aaron at SDC Capital Partners
   - Kevin Prokop or Brian Hermelin at Rockbridge Growth Equity
   - Karan Wadhera at Casa Verde Capital
3. **Continue Research**: Complete firms 5-10 from original target list
4. **Data Cleanup**: Fix Email field data structure issue across entire sheet

## Research Methodology

- ✅ Official website team pages (primary source)
- ✅ LinkedIn company/individual profiles (verification)
- ✅ Third-party databases (RocketReach, ZoomInfo) for validation only
- ❌ Email pattern guessing (prohibited)
- ❌ Unverified third-party contacts (ContactOut, Hunter without official source)

## Files Generated

- `CRON-PE-ENRICHMENT-2026-03-06-436PM.md` (this report)

## Time Spent

- Research: ~15 minutes
- 3 firms verified, 2 with incorrect contacts corrected

---

**Next cron run**: Continue with firms 5-10 + Apollo API enrichment for firms 2-4
