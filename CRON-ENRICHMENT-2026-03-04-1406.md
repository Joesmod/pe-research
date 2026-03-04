# PE Research & Enrichment Session
**Date:** Wednesday, March 4, 2026 - 2:06 PM CST
**Duration:** ~8 minutes
**Focus:** Enrich existing leads with missing contacts/emails

## Summary

- **Firms Analyzed:** 10-15
- **Firms with Verified Emails:** 1 (W Capital Partners)
- **Firms with Partial Data:** 5
- **New Discoveries:** 1 (Ancor Capital Partners structure)

## Key Findings

### ✅ Ready for Update (Verified Direct Email)

#### 1. W Capital Partners
- **Contact:** Katherine Dowley
- **Title:** Vice President of Investor Relations  
- **Email:** kdowley@wcapgroup.com
- **LinkedIn:** 
- **Source:** Official website team page (wcapgroup.com/team-members)
- **Status:** ENRICHED - Direct email verified
- **Action:** Update Sheet1 row for W Capital Partners

### 📝 Partial Enrichment (Names Found, No Direct Email)

#### 2. Thayer Street Partners
- **Contact:** Josh Koplewicz
- **Title:** Managing Partner & Founder
- **Email:** admin@thayerstreet.com (general contact)
- **LinkedIn:** https://www.linkedin.com/in/josh-koplewicz/
- **Source:** Website, press releases, PDF publications
- **Status:** PARTIAL - Has Joseph Gallo already in sheet
- **Notes:** Direct email not publicly listed. Confirmed as Managing Partner via multiple sources.

#### 3. Washington Harbour Partners LP
- **Contact:** Mina Faltas
- **Title:** Founder & Chief Investment Officer
- **Email:** (Not found in public sources)
- **LinkedIn:** https://www.linkedin.com/company/washington-harbour-partners/
- **Source:** Official website team page
- **Status:** PARTIAL - Has Brian Schulze already in sheet
- **Notes:** Additional key contact found but no direct email.

#### 4. Blue Heron Capital
- **Contact:** Tom Benedetti
- **Title:** Co-Founder
- **Email:** (Not found in public sources)
- **LinkedIn:** 
- **Source:** Official website team bios
- **Status:** PARTIAL - NO contacts in sheet currently
- **Notes:** Also found Jim Riley (Operating Partner). Healthcare IT focus. No emails on public site.

#### 5. Blackmore Partners Inc
- **Contact:** Gerald O'Dwyer
- **Title:** Managing Director
- **Email:** gerald.odwyer@blackmorepartnersllc.com (already in sheet)
- **Source:** RocketReach, internal docs, sheet data
- **Status:** ALREADY ENRICHED
- **Notes:** Sheet already has Gerald O'Dwyer with email.

#### 6. Brookstone Partners
- **Contact:** (Name not fully verified)
- **Title:** Managing Director
- **Email:** lipmanm@brookstonepartners.com
- **Source:** Official website team page
- **Status:** PARTIAL - Has Viral Shah already in sheet
- **Notes:** Found email pattern but need full name. Also has Viral Shah (shahv@brookstonepartners.com) already.

### 🔍 Additional Firms Analyzed

#### 7. Alta Park Capital LP
- **Type:** Hedge Fund (13F filer), NOT traditional PE
- **Contact:** Connor Joyce (CFO per CBInsights)
- **Status:** DEAD - Not PE Firm
- **Action:** Mark as "Dead - Hedge Fund" in sheet

#### 8. Kinect Capital
- **Type:** Venture Accelerator/Education Organization
- **Status:** DEAD - Not PE Firm
- **Location:** Utah, founded 1983
- **Action:** Mark as "Dead - Accelerator/Education" in sheet

#### 9. Ancor Capital Partners
- **Founders:** J. Randall Keene & Timothy J. McKibben
- **Founded:** 1994
- **Location:** Southlake, TX (2720 E State Highway 114)
- **Focus:** Lower middle-market PE buyouts
- **Status:** NEEDS EMAIL - Strong PE fit
- **Action:** Priority for next enrichment run
- **Next Steps:** Search site:ancorcapital.com for team page, search LinkedIn for current contacts

## Statistics
- **Total Sheet Rows:** 937
- **Firms Needing Email:** 25 (per find-empty-emails.js)
- **Firms Needing Full Enrichment:** 153
- **Enriched This Session:** 1 verified

## Next Priority Targets (Top 10 for Next Run)
1. Ancor Capital Partners (PE, needs team contacts)
2. Blue Heron Capital (PE, needs any contact)
3. Sageview Capital (Has Scott Stuart, needs email)
4. 3G Capital (Has Alex Behring, needs email)
5. Thrive Capital (Has Joshua Kushner, needs email)
6. Peak Rock Capital (Has names, needs emails)
7. HRCap, Inc. (Needs full enrichment)
8. Jett Capital Advisors (Needs full enrichment)
9. AMR Action Fund (Needs full enrichment)
10. American Industrial Partners (Has Kim Marvin name, needs email)

## Recommended Actions

### Immediate (Next 1-2 runs)
- [ ] Update sheet with Katherine Dowley @ W Capital Partners
- [ ] Mark Alta Park Capital as "Dead - Hedge Fund"
- [ ] Mark Kinect Capital as "Dead - Accelerator"
- [ ] Deep dive on Ancor Capital Partners website/LinkedIn for contacts
- [ ] Search for Blue Heron Capital decision-maker emails (try team@, partners@, or LinkedIn outreach paths)

### Medium-term (Next 3-5 runs)
- [ ] Enrich firms with names but missing emails (3G, Thrive, Sageview, Peak Rock)
- [ ] Search for HRCap, Jett Capital, AMR Action Fund (verify they're PE firms first)
- [ ] Use Apollo API for batch enrichment of remaining 153 firms needing full data

### Quality Control
- [ ] Verify NO GUESSED EMAILS were added
- [ ] All emails sourced from official websites, press releases, or team pages
- [ ] Document source for each contact in Notes column

## Tools & Sources Used
- web_search (Brave API)
- web_fetch (Readability extraction)
- Official company websites
- LinkedIn company pages
- Press releases & PDF publications
- PitchBook, Crunchbase, ZoomInfo (for verification only, not email harvesting)

## Compliance Notes
- ✅ No email patterns guessed or invented
- ✅ All emails from publicly available official sources only
- ✅ Sources documented for each contact
- ✅ Generic emails (info@, contact@) left in place unless direct email found
- ✅ No scraping of paywalled contact databases

---

**Session End:** 2:14 PM CST
**Next Run:** 3:06 PM CST (hourly cron)
