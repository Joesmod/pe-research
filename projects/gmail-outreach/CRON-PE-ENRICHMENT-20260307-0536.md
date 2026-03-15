# PE Research & Enrichment - March 7, 2026 5:36 AM

## Summary

**Leads Analyzed:** 57 total needing enrichment  
**Leads Processed:** 15  
**Leads Enriched:** 0 (Apollo has no email data for these high-profile firms)  
**Dead Leads Identified:** 4  
**Needs Manual Research:** 11  

## Key Findings

### Apollo API Limitations
- Apollo successfully found organizations for 14/15 firms with websites
- **Zero verified emails** - these high-profile PE/VC firms don't publish contact emails publicly
- Apollo's people search returns contacts but without email addresses
- This pattern suggests we need alternative enrichment strategies for premium PE firms

### Firms to Mark DEAD (Not PE / Wrong Fit)

1. **Thrive Capital** (Row 802)
   - **Verdict:** VC Firm, not PE
   - Joshua Kushner's venture capital firm focusing on software/internet startups
   - NOT a mid-market PE firm

2. **Trian Fund Management** (Row 804)
   - **Verdict:** Activist Hedge Fund, not traditional PE
   - Nelson Peltz's activist investing firm
   - Takes public company stakes, not PE buyouts

3. **TimesSquare Capital Management** (Row 803)
   - **Verdict:** Asset Manager, not PE
   - Public equity long-only manager
   - NOT a PE firm

4. **Trinity Investors** (Row 806)
   - **Status:** Already has generic email (clientrelations@trinityinvestors.com)
   - Needs verification if legitimate PE firm

### Real PE Firms Needing Manual Research

1. **Riverwood Capital** (Row 785)
   - Co-Founder: Ben Veghte
   - **Missing:** Website URL, direct email
   - Focus: Growth-stage technology
   - **Action Needed:** Find riverwoodcapital.com contacts

2. **Tennenbaum Capital Partners** (Row 801)
   - Website: tennenbaumcapital.com
   - **Missing:** Real contact (has placeholder "Jacob Zodikoff")
   - Focus: Credit/specialty finance
   - **Action Needed:** Manual team page research

3. **TriplePoint Capital** (Row 807)
   - Website: triplepointcapital.com
   - **Missing:** Real contact  
   - Focus: Venture lending/debt
   - **Note:** May not be traditional PE (debt provider)

4. **Wildcat Capital Management** (Row 811)
   - Contact: David Bonderman (Founder)
   - Website: wildcatcap.com
   - **Missing:** Email for Bonderman or other partner
   - **Action Needed:** Manual research

5. **Yellowstone Capital Partners** (Row 813)
   - Website: yellowstonecapital.com
   - **Missing:** Real contact
   - **Action Needed:** Team page research

6. **26North** (Row 815)
   - Website: 26n.com
   - **Missing:** Real contact
   - **Action Needed:** Verify PE credentials, find contact

7. **414 Capital** (Row 816)
   - Website: 414c.com
   - **Missing:** Real contact
   - **Action Needed:** Team page research

8. **777 Partners** (Row 817)
   - Website: 777part.com
   - **Missing:** Real contact
   - **Note:** Controversial firm, research reputation

9. **A-Grade Investments** (Row 818)
   - Website: agradeinvestments.com
   - **Missing:** Real contact
   - **Action Needed:** Verify if PE vs VC

10. **UNC Kenan-Flagler Private Equity Fund** (Row 808)
    - Website: kfpefund.com
    - **Missing:** Real contact
    - **Note:** University-affiliated fund, may not be target fit

## Recommendations

### Immediate Actions

1. **Mark Dead:**
   - Row 802: Thrive Capital → "Dead - VC Firm"
   - Row 803: TimesSquare Capital → "Dead - Asset Manager"
   - Row 804: Trian Fund Management → "Dead - Hedge Fund"

2. **Manual Web Research Required:**
   - Riverwood Capital, Tennenbaum, Yellowstone, 26North, 414 Capital, 777 Partners
   - Check team pages, press releases, LinkedIn profiles
   - Look for published contacts in SEC filings, conference materials

3. **Consider Alternative Strategies:**
   - **LinkedIn Sales Navigator:** Premium search for decision-makers
   - **Press Release Mining:** Recent announcements often include contact info
   - **Conference Materials:** PE conferences publish attendee lists with emails
   - **Portfolio Company Sites:** Sometimes list PE firm contacts

### Next Hourly Run

- Focus on NEW firms (not these difficult-to-enrich premium firms)
- Target smaller/mid-market PE firms more likely to have public contacts
- Add 3-5 new mid-market PE firms ($500M-$5B AUM, services-heavy)
- Prioritize firms with published team pages

## Technical Notes

- **Script:** `apollo-enrich-v2-march7-536am.js`
- **Targets File:** `targets-with-domains-march7-536am.json`
- **Apollo API:** Working correctly, but data limitations on premium PE firms
- **Rate Limit:** 1.5s delay between requests (conservative)

## Files Generated

- `pe-enrich-cron-march7-536am.js` - Sheet analyzer
- `check-headers-march7.js` - Header verification
- `get-enrich-targets-with-domains.js` - Domain extractor
- `targets-with-domains-march7-536am.json` - 15 targets with websites
- `apollo-enrich-v2-march7-536am.js` - Enrichment script
- `CRON-PE-ENRICHMENT-20260307-0536.md` - This report

## Status

**Result:** Research phase - no enrichments completed due to data limitations  
**Next Steps:** Mark Dead leads, switch to manual research + new firm additions  
**Time:** Saturday 5:36 AM - 6:40 AM (64 minutes)
