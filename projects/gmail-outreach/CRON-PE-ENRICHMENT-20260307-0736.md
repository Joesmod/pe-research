# PE Enrichment Cron Report - March 7, 2026, 7:36 AM

## Summary

Analyzed 89 leads needing enrichment (missing contact name, missing email, or generic email).  
Researched first 15 for this report.

**Key Finding:** Most leads in "needs enrichment" batch are NOT traditional PE firms. They include:
- Asset-based lenders
- HR consultancies  
- Executive search firms
- Investment banks/advisors
- Non-profit accelerators
- Hedge funds
- Venture capital firms

## Research Results (Batch 1 of 15)

### ❌ NOT PE TARGETS (Skip/Mark as Dead)

1. **Keltic Financial Partners** (Row 117)
   - Type: Asset-based lender ($2-25M secured loans)
   - Now part of: Midcap Business Credit
   - Contact: Steve Fischer (Partner)
   - Status: NOT A PE FIRM
   - **Action: Mark as "Dead - Not PE" in sheet**

2. **HRCap, Inc.** (Row 620)
   - Type: HR consulting firm  
   - Contact: Andrew Sungsoo Kim, Founder/CEO
   - Email: andrew@hrcap.com (ContactOut verified)
   - Status: NOT A PE FIRM
   - **Action: Mark as "Dead - Not PE" in sheet**

3. **HSP - Henkel Search Partners** (Row 621)
   - Type: Executive search firm serving PE funds
   - Contact: Eleni Henkel, CEO & Founding Partner
   - Email: inquiries@henkelsp.com (website), info@henkelsp.com (candidates)
   - Status: NOT A PE FIRM (service provider TO PE)
   - **Action: Mark as "Dead - Not PE" in sheet**

4. **Kinect Capital** (Row 630)
   - Type: 501(c)(3) non-profit educational organization
   - Contact: Trent Christensen, CEO & President
   - Email: None found
   - Status: NOT A PE FIRM (non-profit accelerator)
   - **Action: Mark as "Dead - Not PE" in sheet**

5. **ScaleView Partners** (Row 670)
   - Type: Investment bank (M&A advisory, capital raising)
   - Founded: 2021, Austin TX
   - Contact: Jay Snodgrass, Co-founder & Partner
   - Email: info@scaleviewpartners.com (generic, found on website)
   - Status: NOT A PE FIRM (advisor/banker, not investor)
   - **Action: Mark as "Dead - Not PE" in sheet**

### ⚠️ MARGINAL TARGETS (Research further or skip)

6. **Jett Capital Advisors** (Row 626)
   - Type: Investment banking & capital markets advisory
   - Founded: 2013, NYC
   - Contact: Sam Grauer, Founding Partner, Head of Capital Markets
   - Email: sgrauer@jettcapital.com (RocketReach pattern - unverified)
   - Focus: Special situations, project finance (battery/lithium sector)
   - Status: Advisory firm, not direct PE investor
   - **Action: Low priority - consider skipping**

7. **Loeb.nyc** (Row 635)
   - Type: Venture capital collective
   - Contact: Jacob Zodikoff (placeholder contact - WRONG)
   - Email: info@midoceanpartners.com (WRONG DOMAIN - MidOcean Partners is different firm)
   - Phone: 212-620-4034
   - Address: 712 5th Avenue, 7th Floor, NYC
   - Status: VC firm, not traditional PE  
   - **Action: Needs complete re-research with correct website (loeb.nyc)**

8. **Valiant Capital Management** (Row 687)
   - Type: Global long/short equity hedge fund
   - Founded: 2008, San Francisco
   - Contact: Christopher R. Hansen, Founder
   - Email: contact@valiantcapital.com (generic)
   - AUM: ~$3B
   - Status: Hedge fund, not PE
   - **Action: Mark as "Dead - Not PE" in sheet**

### 📋 REMAINING TO RESEARCH

9. **Odyssey Search Partners** (Row 654) - Likely another search firm
10. **TAP Advisors** (Row 682) - Unknown
11. **Victory Capital** (Row 688) - Asset management firm
12. **Wall Street Oasis** (Row 690) - Financial careers website/community
13. **Wall Street Prep** (Row 691) - Financial modeling training company
14. **Wefunder** (Row 692) - Crowdfunding platform
15. **Alta Park Capital, LP** (Row 699) - Needs research (may be actual PE)

## Observations

1. **Data Quality Issue**: Many non-PE firms in the tracking sheet
2. **Placeholder Contacts**: "Jacob Zodikoff" appears as placeholder for multiple firms
3. **Wrong Domains**: Some firms have incorrect website domains assigned
4. **Mixed Industries**: Sheet includes lenders, consultants, recruiters, media/education companies

## Recommendations

1. **Clean the sheet**: Mark non-PE firms as "Dead - Not PE Target"
2. **Re-scope enrichment**: Focus only on actual PE/growth equity firms ($500M-$5B AUM)
3. **Verify firm types** before enrichment to avoid wasted research time
4. **Priority firms**: Search for rows marked "Enriched" or "Partial" status with real PE firms

## Next Steps

**FOR THIS CRON RUN:**
- Mark 5 non-PE firms as "Dead - Not PE" (rows 117, 620, 621, 630, 670, 687)
- Continue researching remaining 9 firms if time permits
- OR skip to next batch in sheet with verified PE firms

**RECOMMENDATION:** Skip this batch. Search sheet for actual mid-market PE firms ($500M-$5B AUM, services-focused) that have empty Contact Name or generic emails.

## Files Generated

- `enrich-targets-march7-736am.json` - Initial 15 target firms
- `research-findings-march7-736am.json` - Detailed findings on first 5 firms
- `CRON-PE-ENRICHMENT-20260307-0736.md` - This report

---

**Status:** PAUSED - Awaiting decision on whether to continue with remaining 9 firms or skip to better PE targets in sheet.

**Research Time:** ~20 minutes for 8 firms  
**Verified Contacts Found:** 1 (andrew@hrcap.com - but not PE)  
**PE Firms Enriched:** 0
