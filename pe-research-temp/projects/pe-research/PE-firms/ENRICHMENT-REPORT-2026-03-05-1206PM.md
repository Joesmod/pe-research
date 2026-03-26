# PE Research & Enrichment Report
**Date:** March 5, 2026 - 12:06 PM CST
**Cron Job:** Hourly PE enrichment
**Status:** COMPLETED with limitations

## Summary
- **Leads analyzed:** 940 total in sheet
- **Leads needing enrichment:** 197 (empty contact or generic email)
- **Attempted enrichment:** 15 priority firms
- **Successfully enriched:** 0
- **Reason:** No publicly available verified emails found

## Issue Analysis

### Apollo API Results
- Attempted broad searches for 15 mid-market PE firms
- **Result:** Zero contacts returned for all firms
- **Likely reasons:**
  1. These firms may not be in Apollo's database
  2. PE firms often have private/unlisted contact information
  3. Domain matching issues

### Manual Web Research
Attempted manual research for top firms:

#### 1. **Thoma Bravo** (Row 154)
- **Size:** $181B AUM - one of the largest software PE firms
- **Leadership found:**
  - Orlando Bravo - Founder & Managing Partner
  - Seth Boro - Managing Partner
  - Jennifer James - MD, COO, Head of Investor Relations
- **Email status:** NOT FOUND in public sources
- **Sources checked:** 
  - Official website (no emails listed)
  - Press releases (no direct contacts)
  - RocketReach/ZoomInfo show masked emails (behind paywall)
- **Notes:** Firm does not publish individual email addresses publicly

#### 2. **Genstar Capital** (Row 51)
- **Size:** $19B AUM - mid-market leader
- **Leadership found:**
  - Ryan Clark - President & Managing Director
  - Rob Rutledge, Tony Salewski, Eli Weiss - Managing Partners
- **Current contact:** Ryan Clark - ir@gencap.com (generic IR email)
- **Email status:** NOT FOUND - no personal emails on website or press releases
- **Notes:** Appears to route all inquiries through generic IR email

#### 3. **Arsenal Capital Partners** (Rows 880, 889, 892 - duplicates)
- **Searched:** Team pages, press releases
- **Result:** No publicly listed contact emails

#### 4. **Warren Equity Partners** (Row 874)
- **Result:** No contacts found via Apollo

#### 5. **Peak Rock Capital** (Row 887)
- **Result:** No contacts found via Apollo

## Key Findings

### Why PE Firms Are Hard to Enrich
1. **Privacy by design** - PE firms don't publish direct contact info
2. **Gatekeeping** - Route inquiries through generic emails (info@, ir@, contact@)
3. **Not in B2B databases** - Apollo, Hunter, etc. focus on operational companies, not investment firms
4. **Compliance/regulatory** - May limit public contact info intentionally

### Data Quality Issues in Sheet
- Multiple rows with "Jacob Zodikoff" as placeholder name (appears 12+ times)
- Several duplicate entries for same firms (Arsenal Capital has 3 entries)
- Many rows missing Gumbo Score

## Recommendations

### Short Term (Today)
1. **Use paid enrichment services:**
   - RocketReach (shows masked emails, $100-200/month for access)
   - ZoomInfo ($15k+/year - enterprise tool)
   - Lusha, Seamless.AI, ContactOut
   
2. **LinkedIn direct outreach:**
   - Many of these executives are on LinkedIn
   - Can send InMail or connection requests
   - May be more effective than cold email for PE

3. **Conference/event contact:**
   - PE professionals at SuperReturn, IPEM, etc.
   - Speaker lists often have emails

### Medium Term
1. **Target lower-middle-market PE ($100M-500M AUM):**
   - More accessible, less gatekeeping
   - Often have direct emails on websites
   - Better fit for Gumbo's services anyway

2. **Focus on Operating Partners / Portfolio Operations:**
   - More operational, less investment-focused
   - More likely to engage with service providers
   - Titles: "Head of Portfolio Operations", "Operating Partner", "VP Value Creation"

3. **Clean duplicate data:**
   - Remove/merge Arsenal Capital duplicates
   - Replace "Jacob Zodikoff" placeholders with actual research or mark as "Needs Research"

### What NOT to Do
- **DO NOT guess email patterns** - leads to bounce rates, spam complaints
- **DO NOT use unverified emails** - damages sender reputation
- **DO NOT mass email to info@/ir@** - low engagement, often forwarded/ignored

## Next Steps
1. **Decision needed:** Should we:
   - A) Invest in RocketReach/ZoomInfo subscription (~$200-500/month for small team)
   - B) Shift focus to smaller, more accessible PE firms
   - C) Try LinkedIn outreach instead of email for large firms
   - D) Hire a researcher to manually find verified contacts

2. **Data cleanup:** Remove duplicates, fix placeholder names

3. **New firm additions:** If adding new firms, prioritize:
   - $500M-$2B AUM (mid-market sweet spot)
   - Firms with public team pages
   - Operating partners listed with photos/bios

## Files Generated
- `current-pe-data.json` - Full sheet export (940 leads)
- `enrichment-results-march5-1206pm.json` - Empty (no results)
- `enrichment-midmarket-march5-1206pm.json` - Empty (no results)

## Conclusion
**Unable to enrich leads this hour due to lack of publicly available verified contact information.**

Large PE firms ($5B+ AUM) maintain strict privacy. To successfully reach these targets, we need either:
1. Paid enrichment tools
2. Different outreach channel (LinkedIn)
3. Shift to smaller, more accessible firms

**Recommend discussing strategy with Alex before next enrichment attempt.**

---
*Jim - 12:06 PM CST, March 5, 2026*
