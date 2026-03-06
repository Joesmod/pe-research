# PE Research & Enrichment Cron - March 4, 2026 - 2:36 PM

## Status: ⚠️ BLOCKED - Apollo API Out of Credits

### Summary
**Priority objective**: Enrich 10-15 existing leads with empty/generic contacts
**Secondary objective**: Add 3-5 new mid-market PE firms

**Result**: Apollo API exhausted credits. All automated enrichment attempts failed with 422 errors.

### Analysis Performed

#### Sheet Status
- **Total rows**: 936 firms in spreadsheet
- **Leads needing enrichment**: 170 identified
- **Viable targets** (non-Dead status, generic emails): 22 firms

#### Firms Identified for Enrichment (Top 15)
1. Row 611 - **GiantLeap Capital** (Samir Parikh, samir@giantleapcapital.com - already direct)
2. Row 635 - **Loeb.nyc** (Dana Carey, info@midoceanpartners.com - GENERIC)
3. Row 656 - **Osceola Capital** (Scott Perper, info@pamlicocapital.com - GENERIC)
4. Row 666 - **RCP Advisors** (Micky Malka, info@ribbitcap.com - GENERIC)
5. Row 670 - **ScaleView Partners** (Gabe Wilcox, info@scaleviewpartners.com - GENERIC)
6. Row 682 - **TAP Advisors** (Karim F. Tabet, info@tapadvisors.com - GENERIC)
7. Row 683 - **TAU Investment Management** (Oliver Niedermaier, info@tau-investment.com - GENERIC)
8. Row 687 - **Valiant Capital Management** (Christopher R. Hansen, contact@valiantcapital.com - GENERIC)
9. Row 688 - **Victory Capital** (David C. Brown, ir@vcm.com - GENERIC)
10. Row 689 - **Virtas Partners** (Neal McNamara, contact@virtaspartners.com - GENERIC)
11. Row 693 - **Yellow Wood Partners, LLC** (Dana Schmaltz, info@yellowwoodpartners.com - GENERIC)
12. Row 696 - **3G Capital** (Alex Behring, NO EMAIL)
13. Row 700 - **American Industrial Partners** (Managing Partner, NO EMAIL)
14. Row 790 - **Sageview Capital** (Scott Stuart, NO EMAIL)
15. Row 794 - **Silver Oak Services Partners** (Gregory M. Barr, NO EMAIL)

### Apollo API Issue

**Error**: "You have insufficient credits! Upgrade your plan to increase your number of lead credits."

All 15 enrichment attempts failed with 422 status code.

**Impact**: Cannot proceed with automated enrichment until credits are replenished.

### Manual Research Attempted

Limited manual research conducted:

#### Loeb.nyc (Row 635)
- **Website**: https://www.loeb.nyc/
- **Key contacts identified**:
  - Michael Loeb - CEO/Founder
  - Rich Vogel - Co-Founder/Partner
- **Generic email found**: info@loeb.nyc (already in sheet as info@midoceanpartners.com - incorrect domain)
- **Status**: Could not find direct emails without paid tools

### New Firm Identified (Secondary Objective)

#### Bow River Capital
- **Website**: https://www.bowrivercapital.com/
- **AUM**: ~$2.5B
- **Focus**: Healthcare services, industrials, lower-middle-market software
- **Key contacts**:
  - Blair E. Richardson - CEO
  - Jane C. Ingalls - President, COO
  - Greg J. Hiatrides - Partner, Head of Private Equity
- **Email**: info@bowrivercapital.com
- **Location**: Denver, CO
- **Status**: Mid-market PE, services-focused, fits criteria

**NOT ADDED TO SHEET** - awaiting Apollo credit resolution to enrich properly with direct contacts.

### Recommendations

1. **Immediate**: Replenish Apollo API credits or switch to alternative provider
2. **Alternative enrichment sources**:
   - Hunter.io (check remaining credits)
   - RocketReach
   - Manual LinkedIn/website research
3. **High-value manual targets** (generic emails that likely have direct contacts):
   - Loeb.nyc (Row 635)
   - ScaleView Partners (Row 670)
   - Valiant Capital Management (Row 687)
   - Yellow Wood Partners (Row 693)

4. **New firms to add** once enrichment capability restored:
   - Bow River Capital (~$2.5B AUM, healthcare/services focus)
   - (Additional 2-4 firms pending research)

### Files Generated
- `enrich-cron-march4-2pm.js` - Sheet analysis script
- `enrichment-targets-march4-2pm.json` - 170 leads needing enrichment
- `apollo-enrich-fixed-2pm.js` - Apollo enrichment script (blocked by credits)
- `CRON-REPORT-MARCH4-236PM-BLOCKED.md` - This report

### Next Cron Actions

1. **Check Apollo credits status** before attempting enrichment
2. **If credits available**: Resume automated enrichment on the 22 viable targets
3. **If still blocked**: Implement Hunter.io fallback or manual research workflow
4. **Monitor**: Set up credit monitoring to prevent future blocks

### Time Spent
- Sheet analysis: ~5min
- Apollo enrichment attempts: ~20min
- Manual research: ~10min
- Documentation: ~5min
**Total**: ~40min

---

**Cron ID**: 8fbfb70e-b09d-4ab1-9906-ab0a33373945
**Timestamp**: 2026-03-04 14:36 CST
**Status**: Incomplete - External API limitation
