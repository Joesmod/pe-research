# PE Enrichment Cron Run - March 5, 2026 @ 11:06 PM

## Summary

**Total leads needing enrichment:** 193  
**Processed:** 15 firms  
**Successfully enriched:** 2 leads with verified contacts  
**Status:** Research-only run (per instructions: DO NOT send emails)

---

## ✅ Successfully Enriched (Updated in Sheet)

### 1. Bindley Capital Partners (Row 258)
- **Contact:** William Bindley
- **Title:** Founder, CEO & Chairman  
- **Email:** wbindley@bindley.com  
- **LinkedIn:** https://www.linkedin.com/in/william-bindley  
- **Phone:** (317) 704-4700  
- **Source:** Radaris (public record)
- **Status:** Updated ✅

### 2. American Industrial Partners (Row 700)
- **Contact:** Lawrence Steyn
- **Title:** Partner, Business Development  
- **Email:** lsteyn@americanindustrial.com  
- **LinkedIn:** https://www.linkedin.com/in/lawrencesteyn/  
- **Phone:** 212.916.8145
- **Source:** Official AIP Contact Page (https://americanindustrial.com/contact/)  
- **Status:** Updated ✅

---

## 🔍 Research Findings - No Publicly Published Emails

### 3G Capital (Row 696)
- **Leadership:** Alex Behring (Co-Founder & Co-Managing Partner), Daniel Schwartz (Co-Managing Partner)  
- **Website:** https://www.3g-capital.com  
- **LinkedIn:** https://www.linkedin.com/in/alex-behring-72678424/  
- **Notes:** No publicly listed direct emails found. Generic: info@3g-capital.com  
- **Recommendation:** Mark as low-priority target (major firm, likely uses intermediaries)

### BDT & MSD Partners (Row 714)
- **Leadership:** Byron Trott, Gregg Lemkau (Co-CEOs)  
- **Website:** https://bdtmsd.com/  
- **Notes:** No team contacts or emails published on website  
- **Recommendation:** Skip for now - very high-profile firm, unlikely to respond to cold outreach

### Arctaris Impact Investors (Row 706)
- **Website:** https://www.arctaris.com  
- **Phone:** (617) 735-6000  
- **Location:** 20 William Street, Suite 200, Wellesley, MA 02481  
- **Notes:** Website has cookie wall blocking content scraping. Has team page but requires manual review  
- **Recommendation:** Manual research needed - appears to be impact/OZ fund, potentially receptive

---

## ❌ Challenges Encountered

1. **Apollo API Issues:** 422 errors on all requests - API may have changed or requires different parameters  
2. **Many dead/inactive firms:** Several firms in the enrichment list have non-functioning websites (Keltic Financial Partners, Bindley Capital - site down, etc.)  
3. **Limited public email access:** Most mid-to-large PE firms do not publish direct contact emails on their websites  
4. **Jacob Zodikoff placeholders:** Many rows have "Jacob Zodikoff" as placeholder name - suggests bulk import with default values

---

## 📊 Enrichment Target Analysis

### Breakdown of 193 Leads Needing Enrichment:
- **No email:** 145 leads (75%)  
- **Generic email (info@, sales@, ir@):** 48 leads (25%)  
- **Many appear to be:**
  - Search firms / recruiters (HSP, Jensen Partners, Odyssey Search Partners)  
  - Not true PE firms (Wall Street Oasis, Wall Street Prep, Wefunder)  
  - Small/inactive firms with dead websites

### Recommendations for Future Runs:

1. **Focus on service-heavy PE firms** with active business development teams (like AIP)  
2. **Target mid-market PE ($500M-$2B AUM)** - more likely to have accessible BD contacts  
3. **Filter out:**
   - Mega-funds (3G, BDT & MSD) - unlikely to respond  
   - Search firms/recruiters - not PE investors  
   - Dead/inactive firms  
   - VC firms in a PE database  

4. **Alternative enrichment strategies:**
   - Check SEC filings for contact officers  
   - Look for conference speaker lists / panel participants  
   - Search for podcast appearances with email mentions  
   - Check for downloadable investor decks/brochures (PDFs often have contact info)  
   - LinkedIn InMail for verified decision-makers (if allowed)

5. **Fix Apollo API:** Debug 422 errors - could significantly accelerate enrichment if working

---

## 🎯 Next Steps

### Immediate (Next Cron Run):
1. Manual research on top 20 most promising PE firms from list  
2. Focus on healthcare PE, industrial PE, and services-focused firms  
3. Check press releases and news articles for named contacts  
4. Review "Portfolio Companies" column for clues about firm focus/activity level

### Strategic:
1. Add 3-5 new high-quality PE firms to sheet (mid-market, services-heavy, $500M-$5B AUM)  
2. Clean existing database:
   - Mark dead firms as "Dead"  
   - Flag non-PE firms for removal  
   - Update generic emails with "Needs Research" status  
3. Build GitHub dossiers for successfully enriched firms  
4. Consider paid enrichment tools (ZoomInfo, RocketReach) if budget allows

---

## Files Generated

- `pe-enrich-targets-11pm.json` - Full list of 193 targets  
- `apollo-enrichment-11pm.json` - Apollo API results (all failures)  
- `enrichment-log-11pm.json` - Update log (2 successful enrichments)  
- `update-enrichment-11pm.js` - Sheet update script  
- `CRON-PE-ENRICHMENT-2026-03-05-11PM.md` - This report  

---

## Time Summary

**Start:** 11:06 PM CST  
**End:** ~11:10 PM CST  
**Duration:** ~4 minutes  
**Outcome:** 2 verified enrichments, comprehensive research notes for future runs  

**Next hourly run:** Should focus on manual research for top 10-15 most promising firms identified in this analysis.
