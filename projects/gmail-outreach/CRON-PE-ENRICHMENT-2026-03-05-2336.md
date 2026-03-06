# PE Enrichment Cron Run - March 5, 2026 @ 11:36 PM

## Summary

**Total leads needing enrichment:** 193 (from previous run)
**Firms researched:** 5 PE firms + 5 non-PE firms analyzed
**Successfully enriched (NEW):** 0 leads with verified, publicly published contacts
**Previously enriched (confirmed):** 1 lead (American Industrial Partners - Lawrence Steyn)
**Firms identified as non-PE:** 2 (Apercen Partners LLC, plus search firms from list)
**Leads with inferred emails (not verified):** 2 (Arctaris, Atlantic Street Capital)
**Status:** Research-only run (per instructions: DO NOT send emails)
**Challenges:** Unable to execute node scripts due to PATH issues; manual web research conducted; most PE firms do not publish direct emails

---

## Research Findings

### ✅ Verified Contacts Found (Previously Enriched)

#### 1. American Industrial Partners (Row 700)
- **Contacts Found:**
  - **Lawrence Steyn** - Partner, Business Development
    - Email: lsteyn@americanindustrial.com (verified via ZoomInfo reference)
    - LinkedIn: https://www.linkedin.com/in/lawrencesteyn/
    - Phone: 212.916.8145
    - Source: Official AIP website + ZoomInfo confirmation
  - **Daryl Yap** - Partner, Business Development
    - Profile: https://americanindustrial.com/team/daryl-yap/
    - Email pattern likely: dyap@americanindustrial.com (NOT VERIFIED)
  - **Jamie Tam** - Partner, Business Development
    - Profile: https://americanindustrial.com/team/jamie-tam/
    - Email pattern likely: jtam@americanindustrial.com (NOT VERIFIED)
- **Website:** https://americanindustrial.com
- **Status:** Already enriched in previous run (Lawrence Steyn confirmed)

---

### 🔍 Research Conducted - Limited Public Email Access

#### 2. Arctaris Impact Investors (Row 706)
- **Website:** https://www.arctaris.com
- **Focus:** Impact investing, Opportunity Zones
- **Location:** Boston, MA
- **Key Contacts Identified:**
  - **Jonathan Tower** - Founder & Managing Partner
    - LinkedIn: https://www.linkedin.com/in/jonathan-tower/
    - Email pattern likely: jtower@arctaris.com (seen on RocketReach as j******@arctaris.com)
    - **NOT PUBLICLY PUBLISHED** - only found via paid tools
  - **Anita Graham** - Managing Director
    - LinkedIn: https://www.linkedin.com/in/anita-graham-33923922b/
  - **Andrew Gibbs, CFA** - Managing Director
    - LinkedIn: https://www.linkedin.com/in/andrew-gibbs-cfa-59169926/
  - **Patrick Mullen** - (Role unclear)
    - LinkedIn: https://www.linkedin.com/in/patrick-mullen-b86b2915/
- **Notes:** Website has cookie wall blocking content. Jason Sanders (former BD Partner) left firm. No publicly published direct emails found.
- **Recommendation:** Skip for now - requires paid tool access or LinkedIn InMail for contact

#### 3. Ancor Capital Partners (Row 702)
- **Website:** https://ancorcapital.com
- **Focus:** Operations-focused PE, healthcare, manufacturing
- **Location:** Southlake, TX (main) + Dallas, TX
- **General Contact:** info@ancorcapital.com (generic)
- **Key Team Members Identified:**
  - **Mitchell Green** - Principal & Chief Financial Officer
  - **Ken Berger** - Joined 2023, focuses on evaluating investments
  - **Caden Jackson** - Analyst (joined 2022)
  - **Mitch Brody** - Joined 2023, portfolio management
- **Operating Partners:** Jehan Saulnier, Sid Echols, Brian Highley, Doug Brenner
- **Notes:** No direct emails published on team pages. Generic info@ only.
- **Recommendation:** Mark as low-priority - no accessible BD contacts

---

#### 4. Atlantic Street Capital Advisors, Inc. (Row 711)
- **Website:** https://www.atlanticstreetcapital.com
- **Focus:** Lower middle market PE, partnering with entrepreneurs
- **Location:** New York
- **Phone:** (332) 217-0667
- **Key Contact Identified:**
  - **Harrison Graham** - Vice President, Business Development
    - LinkedIn: https://www.linkedin.com/in/harrison-graham-8aa86070/
    - Email pattern likely: hgraham@atlanticstreetcapital.com (seen on Growjo as h*******@)
    - **NOT PUBLICLY PUBLISHED** - only found via data services
    - Background: Former EY-Parthenon consultant, leads BD function
- **Notes:** No email published on website or profile page (404). Email only visible on paid tools.
- **Recommendation:** Potential target if paid tool access available, or LinkedIn InMail

#### 5. Apercen Partners LLC (Row 704)
- **Website:** https://www.apercen.com
- **Notes:** **NOT A PE FIRM** - This is a tax consulting firm for high-net-worth individuals
- **Recommendation:** Remove from PE target list

---

### ❌ Firms Skipped During Research (Non-PE or Dead Websites)

Based on target list analysis, the following should be filtered out:

#### Search Firms / Recruiters (Not PE)
- **HRCap, Inc.** (Row 620)
- **HSP - Henkel Search Partners** (Row 621)
- **Jensen Partners** (Row 625)
- **Odyssey Search Partners** (Row 654)

#### Not PE Firms
- **Wall Street Oasis** (Row 690) - Education/forum site
- **Wall Street Prep** (Row 691) - Training/education
- **Wefunder** (Row 692) - Crowdfunding platform

#### Dead/Inactive Websites (From Previous Run)
- **Keltic Financial Partners** (Row 117) - Site down
- **Bindley Capital Partners** (Row 258) - Site issues

#### Mega-Funds (Unlikely to Respond to Cold Outreach)
- **3G Capital** (Row 696) - Major fund, no public contacts
- **BDT & MSD Partners** (Row 714) - Very high-profile, no team contacts published

---

## 📊 Enrichment Status Analysis

### Key Challenges:
1. **Apollo API Issues:** Previous runs reported 422 errors - still not functional
2. **Node/Script Execution:** Unable to run node scripts due to PATH configuration issues in cron environment
3. **Cookie Walls:** Several PE firm websites (Arctaris) block scraping with cookie consent walls
4. **Limited Public Emails:** Most mid-to-large PE firms do not publish direct contact emails
5. **Placeholder Data:** Many rows still have "Jacob Zodikoff" as default contact name

### Recommendations for Future Runs:

#### Immediate Actions:
1. **Fix Node PATH Issue:** Cron environment needs proper node PATH configuration to run enrichment scripts
2. **Focus on Mid-Market PE:** Target firms $500M-$2B AUM with active BD teams
3. **Service-Heavy Firms:** Prioritize PE firms investing in business services, healthcare services, industrial services
4. **Alternative Sources:**
   - SEC filings for contact officers
   - Conference speaker bios (ACG, M&A Advisor)
   - Podcast appearances with email mentions
   - Press releases announcing new hires (BD, investor relations)
   - LinkedIn Sales Navigator (if budget allows)

#### Strategic Cleaning:
1. **Mark Non-PE Firms as "Skip":** Wall Street Oasis, WSP, Wefunder, search firms
2. **Update Dead Firms:** Mark inactive firms with Status="Dead"
3. **Remove "Jacob Zodikoff" Placeholders:** Flag rows needing real contact research
4. **Prioritize Active Firms:** Focus on firms with recent press releases, portfolio activity

---

## 🎯 High-Priority Targets for Next Run

Based on research, these firm types should be prioritized:

### Best Prospects (Mid-Market, Services-Heavy):
- Healthcare PE firms with dedicated BD teams
- Industrial PE with operational improvement focus
- Business services PE with growth-stage portfolio
- Firms with recent portfolio add-ons (signal of active deal flow)

### Red Flags (Skip):
- Firms with only "info@" or "ir@" generic emails and no team page
- Mega-funds (&gt;$10B AUM) - unlikely to respond
- VC firms in a PE database
- Family offices without dedicated investment teams
- Inactive firms (no portfolio updates since 2022)

---

## Technical Issues Log

### Node Script Execution Failure:
```
Error: 'node' is not recognized as internal or external command
PATH issue in cron environment
Attempted solutions:
- Direct node.exe path: C:\Users\aljen\AppData\Roaming\nvm\v24.13.0\node.exe (not found)
- cmd /c node: Failed
- PowerShell node: Failed
- pty=true: Failed
```

**Resolution Needed:** Configure cron environment with proper NVM/node PATH, or use alternative execution method (WSL, batch wrapper, etc.)

---

## Files Generated

- `CRON-PE-ENRICHMENT-2026-03-05-2336.md` - This report

**Note:** Unable to generate enrichment-log JSON or update sheet directly due to node PATH issues.

---

## Time Summary

**Start:** 11:36 PM CST
**End:** 11:46 PM CST
**Duration:** 10 minutes
**Outcome:** Manual research completed for 5 PE firms; 1 previously enriched contact confirmed; 2 contacts identified (no public emails); 1 non-PE firm identified; technical issues documented

**Next Steps:** 
1. Fix node PATH in cron environment to enable script execution
2. Consider paid enrichment tool budget (ZoomInfo, RocketReach, Apollo)
3. Focus next manual run on 10-15 service-heavy mid-market PE firms

---

## Conclusion

While I was unable to execute automated enrichment scripts due to environment configuration issues, manual research confirms that:

1. **American Industrial Partners (Lawrence Steyn)** remains a verified, enriched contact
2. **Arctaris Impact Investors** has identifiable decision-makers but no publicly published emails
3. **Ancor Capital Partners** has only generic contact info
4. **Many firms in the target list are non-PE** and should be filtered out
5. **Future enrichment strategy** should focus on mid-market, service-heavy PE firms with accessible BD teams

**Action Required:** System administrator needs to configure node PATH in cron environment to enable automated enrichment scripts.
