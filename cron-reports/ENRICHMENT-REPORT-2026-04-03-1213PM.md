# PE Enrichment Report - April 3, 2026 12PM

## Executive Summary

**Enrichment Target:** 15 leads from 73 total needing enrichment  
**Successfully Enriched:** 0  
**Root Cause:** Apollo API unable to provide verified direct emails for PE firm contacts  

## Key Findings

### Apollo API Limitations for PE Firms

Apollo consistently finds contacts (6-25 per firm) but **ZERO** have verified direct email addresses. This pattern held across all 15 firms attempted:

- Svoboda Capital Partners: 6-25 contacts found, 0 emails
- Trivest Partners: 25 contacts found, 0 emails  
- Pritzker Private Capital: 23 contacts found, 0 emails
- CORE Industrial Partners: 17 contacts found, 0 emails
- Coalesce Capital: 25 contacts found, 0 emails
- Align Capital Partners: 18 contacts found, 0 emails
- Silver Oak Services Partners: 11 contacts found, 0 emails

### Why PE Firms Are Difficult to Enrich

1. **Security by design:** PE firms intentionally don't publish individual emails
2. **Generic contact forms:** Most use info@, ir@, or contact forms only
3. **Apollo gap:** Apollo's database reflects publicly available data - PE contacts aren't public
4. **LinkedIn-only presence:** Many contacts only have LinkedIn profiles, no email

### Data Quality Issues in Current Sheet

Found systemic issues with the "Website" column (Column B vs Column F):
- Many entries had person names instead of URLs (e.g., "Tom Brooker", "John May")
- Phone numbers in website field (e.g., "(305) 858-2200")
- LinkedIn profiles mixed with company websites

**Fix applied:** Updated scanner to use Column F (actual website URL) instead of Column B

## Attempted Approaches

### 1. Apollo API Search ✗
- **Method:** Search by name + title, then by firm + seniority
- **Result:** Found contacts but no verified emails
- **Status:** Not viable for PE enrichment

### 2. New Firm Research (Bow River Capital) ✗
- **Method:** Scraped team page, searched Apollo for specific individuals
- **Result:** Found names/titles but Apollo had no verified emails
- **Status:** Same limitation as existing firms

### 3. Domain-Based Search ✗
- **Method:** Used extracted domains (svoco.com, trivest.com, etc.)
- **Result:** No improvement in email availability
- **Status:** Domain doesn't help if emails aren't published

## Recommendations

### Short-term (Immediate)

1. **Switch enrichment tools:**
   - Try Hunter.io (email finder based on domain patterns)
   - Try SignalHire or ContactOut (LinkedIn email extraction)
   - Try RocketReach (claimed 94.6% accuracy for Bow River pattern: last@bowrivercapital.com)

2. **Manual research for high-value targets:**
   - Check SEC filings for contact info
   - Review press releases and news articles
   - Look for conference speaker bios
   - Check company blog author pages

3. **Focus on tier-2 firms:**
   - Smaller PE firms ($100M-$500M AUM) more likely to publish contacts
   - Tech-focused PE firms tend to be more transparent
   - Newer firms (founded post-2015) often have better web presence

### Medium-term (Process Improvement)

1. **Diversify data sources:**
   - Don't rely solely on Apollo
   - Build multi-source enrichment pipeline
   - Set up LinkedIn Sales Navigator extraction

2. **Quality over quantity:**
   - Better to have 20 high-quality enriched leads than 200 with generic emails
   - Flag firms as "Hard to enrich" after 2-3 failed attempts

3. **Alternative outreach strategies:**
   - Use LinkedIn InMail for firms without direct emails
   - Target portfolio company execs who report to PE partners
   - Engage via Twitter/X for PE partners with public presence

### Long-term (Strategic)

1. **Partnership with data providers:**
   - Get premium ContactOut/RocketReach/ZoomInfo access
   - Explore PE-specific contact databases
   - Consider hiring VA for manual research

2. **Build internal database:**
   - Save successful patterns (email formats per firm)
   - Track which sources work best for which firm types
   - Create "enrichment playbook" for PE contacts

## Next Steps

Given Apollo limitations, recommend:

1. **Pause Apollo-only enrichment** until we have alternative tools
2. **Manually enrich 5-10 high-priority firms** using multi-source approach
3. **Test Hunter.io / RocketReach** on sample of 10 firms
4. **Update enrichment targets** to exclude "impossible" firms (mark as "Dead - No contact info available")

## Files Generated

- `enrichment-targets-apr3.json` - 73 leads needing enrichment (corrected website URLs)
- `enrichment-results-apr3-12pm.json` - Empty (0 successful enrichments)
- `hourly-enrich-apr3-12pm.js` - Updated enrichment script (fixed Apollo API endpoint)

## Time Spent

- Scanning: 5 minutes
- Enrichment attempts: 30 minutes (15 firms @ 2 min each)
- Research & troubleshooting: 25 minutes
- **Total:** ~60 minutes

---

**Conclusion:** Apollo is not sufficient for PE firm enrichment. Need multi-tool approach or manual research for this vertical.
