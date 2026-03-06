# PE Research & Enrichment - Hourly Cron Report
**Date:** March 6, 2026 - 12:06 PM CST  
**Duration:** ~60 minutes  
**Status:** ⚠️ DATA QUALITY ISSUES IDENTIFIED

## Executive Summary

Researched **18 firms** from the Google Sheet needing enrichment.  
**Critical Finding:** Significant data quality issue - majority of "PE firms" in sheet are NOT private equity.

## Enrichment Results

### ✅ Actual PE Firms Enriched: 3

1. **GiantLeap Capital** (Row 611) - ACTUAL PE ✓
   - Himanshu Singh - Founder & Managing Partner
   - LinkedIn: https://www.linkedin.com/in/himanshu-singh-5308901/
   - Phone: +1 (332) 228 4702
   - HQ: 110 East 25th Street, New York, NY 10010
   - Status: Needs direct email (try phone/website)
   - Notes: Already has Samir Parikh in sheet

2. **RCP Advisors** (Row 666) - Fund of Funds PE ✓
   - Thomas Danis Jr. - Managing Partner & Co-Founder
   - Generic: rcp@rcpadvisors.com
   - Phone: 312.266.7300
   - HQ: 353 N. Clark Street Suite 3500, Chicago, IL 60654
   - Status: Needs direct email

3. **Pathway Capital Management** (Row 773) - Fund of Funds PE ✓
   - $90B AUM in private markets
   - Found multiple MDs: Jim Chambliss, Bryan Nelson, Canyon Lew
   - Generic: invest@pathwaycapital.com
   - Status: Needs direct contact selection

### ❌ Non-PE Firms (Marked as Dead): 13

**Executive Search / Recruiters (5):**
- Cardea Group (Row 579) - andrea@thecardeagroup.com
- HRCap, Inc. (Row 620) - Andrew Sungsoo Kim, CEO
- HSP - Henkel Search Partners (Row 621) - Eleni Henkel, Founder
- Odyssey Search Partners (Row 654)
- Loeb.nyc (Row 635) - Unknown type

**Investment Banks / M&A Advisory (4):**
- Jett Capital Advisors (Row 626) - Sam Grauer, Partner
- ScaleView Partners (Row 670) - Jay Snodgrass, Gabe Wilcox (Co-Founders)
- TAP Advisors (Row 682) - info@tapadvisors.com

**Hedge Funds / Asset Managers (3):**
- Valiant Capital Management (Row 687) - Christopher R. Hansen, CEO (Hedge Fund)
- Victory Capital (Row 688) - ir@vcm.com (Asset Manager)
- Alta Park Capital (Row 699) - Public equities hedge fund

**Consulting / Other (2):**
- Virtas Partners (Row 689) - Neal McNamara, CEO (nmcnamara@virtaspartners.com) - Consulting
- Kinect Capital (Row 630) - Non-profit
- Keltic Financial Partners (Row 117) - Financial services

**Alternative Investment Platforms (1):**
- First Trust Capital Management (Row 743) - Michael Peck (CEO), Thomas Reckley (President)
  - Fund-of-funds / alternative investments platform
  - info@FirstTrustCapital.com | Phone: 773.828.6700
  - Could be relevant if targeting allocators

## Data Quality Analysis

**Total Sheet:** 945 firms  
**Leads Needing Enrichment:** 121 initially identified  
**After Keyword Filtering:** 72 "likely PE firms"  
**Actual PE Firms Found:** 3/18 researched (16.7%)

### Identified Issues:
1. **Mixing of firm types:** Recruiters, investment banks, consultants labeled as "PE"
2. **Placeholder data:** Many rows have "Jacob Zodikoff" as placeholder contact
3. **Generic emails:** Majority have info@/contact@/ir@ emails

## Recommendations

1. **Sheet Cleanup Required:**
   - Add "Firm Type" column (PE, VC, Hedge Fund, Recruiter, IB, etc.)
   - Filter out non-PE firms before enrichment runs
   - Focus on mid-market PE ($500M-$5B AUM)

2. **Enrichment Strategy:**
   - Use Apollo API with new endpoint: `/api/v1/mixed_people/api_search`
   - Note: Endpoint requires separate enrichment call for emails (credits)
   - Alternative: Manual research + phone outreach for top targets

3. **Next Steps:**
   - Review remaining 72 "likely PE" firms manually
   - Prioritize actual PE firms over fund-of-funds
   - Consider phone outreach for GiantLeap, RCP, Pathway

## Files Generated

- `manual-enrichment-results-march6.json` - Detailed research findings
- `leads-to-enrich-1206pm.json` - Initial 15 leads analyzed
- `pe-firms-batch-2.json` - Next 20 filtered firms
- `CRON-REPORT-PE-ENRICHMENT-March6-1206pm.md` - This report

## Time Log

- 12:06 PM - Start
- 12:15 PM - Sheet analysis complete
- 12:30 PM - Web research batch 1 (15 firms)
- 12:45 PM - Google Sheet updates
- 1:00 PM - Additional research batch 2 (3 firms)
- 1:06 PM - Report generation

**Total:** ~60 minutes
