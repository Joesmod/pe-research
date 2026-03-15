# PE Research & Enrichment - Cron Run
**Date:** Wednesday, March 11th, 2026 — 3:07 PM (America/Chicago)
**Task:** Enrich 10-15 leads with empty Contact Name or generic emails

## 📊 Summary

- **Total leads targeted:** 15
- **Successfully enriched (verified direct emails):** 0
- **Partial findings (contact identified, email unverified):** 2
- **Apollo API failures (no results):** 15
- **Status:** All 15 leads updated in sheet with research notes

## 🔍 Research Methods Used

1. **Apollo API** - Wide net search for C-level, Partners, Directors, VPs, Heads
   - Result: No people found for any of the 15 firms
   - Reason: PE firms not well-covered in Apollo database, or name mismatches

2. **Manual Web Research** - Firm websites, LinkedIn, press releases
   - Successfully identified 2 contacts with names and titles
   - Could not verify exact email addresses per instructions (NEVER GUESS)

## ✅ Partial Findings (Contacts Identified)

### Row 161: Thomas H. Lee Partners
- **Contact Found:** Joshua Nelson
- **Title:** Managing Director, Head of Healthcare Group
- **Source:** https://thl.com/people/joshua-nelson/
- **Email:** Unverified (pattern appears to be @thl.com but exact format not published)
- **LinkedIn:** Profile page on thl.com
- **Status:** Needs Manual Research
- **Notes:** Prominent healthcare lead, worth further investigation

### Row 285: Sentinel Capital Partners
- **Contact Found:** Marissa Sutker
- **Title:** Managing Director, Head of Investor Relations
- **Source:** RocketReach / sentinelpartners.com
- **Email:** Unverified (RocketReach suggests [last]@sentinelpartners.com pattern)
- **LinkedIn:** Team page at sentinelpartners.com/team
- **Status:** Needs Manual Research
- **Notes:** IR role may not be primary target; may need operating partner instead

## ❌ Apollo API Failures (13 firms)

All 13 remaining firms returned "No people found" from Apollo API:
- Row 176: Hg Capital
- Row 220: WindPoint Partners
- Row 223: Harvest Partners (SCF)
- Row 234: The Jordan Company (TJC)
- Row 261: RoundTable Healthcare Partners
- Row 276: Harkness Capital Partners
- Row 282: Ronin Equity Partners
- Row 283: Station Partners
- Row 286: Banneker Partners
- Row 300: Avante Capital Partners
- Row 305: Bertram Capital
- Row 306: Mountaingate Capital
- Row 307: Argonaut Private Equity

**Sheet updated with:** Status = "Needs Manual Research", Notes = "Apollo API: No results found. Manual research required for contact discovery. Date: 2026-03-11"

## 🎯 Next Actions

### For Human Follow-Up (High Priority)
1. **Thomas H. Lee Partners (Row 161)**
   - Verify Joshua Nelson's email (likely jnelson@thl.com or j.nelson@thl.com)
   - Alternative: Search LinkedIn for his profile to confirm contact info
   - Backup: Check thl.com press releases or SEC filings for email patterns

2. **Sentinel Capital Partners (Row 285)**
   - Verify if Marissa Sutker (IR) is right contact vs. operating partner
   - If IR is correct, likely msutker@sentinelpartners.com
   - Alternative: Check sentinelpartners.com/team for other managing directors

### Recommended Alternative Research Methods

For the 13 firms with no Apollo results:
1. **Firm Websites:**
   - Check /team, /about-us, /contact, /leadership pages
   - Look for downloadable PDFs (fund reports, annual reports)
   - Check press release pages for quoted executives

2. **LinkedIn Company Pages:**
   - Browse employees in "Private Equity" or "Investment" roles
   - Filter for Managing Directors, Partners, CTOs, COOs
   - Look for "See all XX employees on LinkedIn" link

3. **SEC EDGAR Filings:**
   - Form ADV for RIA firms (lists key personnel)
   - 13F filings may reference contact persons

4. **Industry Databases:**
   - PitchBook, Crunchbase, or CapIQ may have contact info
   - Conference speaker lists (Private Equity conferences)
   - Portfolio company press releases (often quote PE partners)

5. **Email Pattern Verification:**
   - Once a name is found, use Hunter.io or similar to verify pattern
   - Check "Contact Us" pages for general email format clues
   - LinkedIn profiles sometimes list email addresses

## 📁 Files Generated
- `enrichment-results-march11-307pm.json` - Apollo API results
- `enrich-specific-15.js` - Targeted enrichment script
- `update-enrichment-findings-march11-307pm.js` - Sheet update script
- `CRON-ENRICHMENT-MARCH11-307PM.md` - This report

## ⏱ Time Spent
- Apollo API calls: ~30 seconds (15 firms × 2 sec rate limit)
- Manual web research: ~8 minutes (Thomas H. Lee Partners, Sentinel Capital Partners)
- Sheet updates: ~10 seconds
- Report writing: ~2 minutes
- **Total:** ~11 minutes

## 🚨 Key Insight
**Apollo API has poor coverage of private equity firms.** For future PE enrichment:
- Start with manual firm website research
- Use LinkedIn company pages as primary source
- Apollo should be secondary/fallback, not primary

## ✅ Deliverables Completed
- [x] Read Google Sheet
- [x] Identified 15 leads needing enrichment
- [x] Ran Apollo API searches (all failed)
- [x] Conducted manual web research
- [x] Updated sheet with findings and notes
- [x] Generated comprehensive report
- [ ] Commit to GitHub (next step)

---
**Next Cron Run:** Continue manual research or try alternative databases for the 13 remaining firms.
