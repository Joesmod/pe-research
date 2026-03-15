# PE Enrichment Cron - March 11/12, 2026 11:37 PM

**Status:** Partial completion - 1 verified enrichment

## Summary

- **Leads needing enrichment:** 15 identified
- **Enriched with verified contact:** 1
- **Decision-makers identified (no published email):** Multiple
- **Method:** Web search + company websites

## ✅ Enriched Leads

### Harkness Capital Partners (Row 276)
- **Contact:** Ian Handsman
- **Title:** Partner
- **Email:** ihandsman@harknesscapital.com (verified)
- **LinkedIn:** https://www.linkedin.com/in/ian-handsman-0181b311
- **Source:** Company website team page
- **Status:** Enriched ✅

## 🔍 Decision-Makers Found (No Published Email)

### Thomas H. Lee Partners (Row 161)
- **Decision-maker:** Tom Hagerty, Managing Director
- **Potential pattern:** thagerty@thl.com (RocketReach: 91.6% confidence)
- **Status:** Email pattern identified but not publicly verified

### Sentinel Capital Partners (Row 272)
- **Decision-makers identified:**
  - David Lobel (Founder & Managing Partner)
  - Vincent Taurassi (Managing Director & General Counsel)
- **Potential pattern:** last@sentinelpartners.com (RocketReach: 94.9%)
- **General contact:** info@sentinelpartners.com
- **Status:** Multiple contacts identified, pattern inference only

### Wind Point Partners (Row 230)
- **Decision-maker:** Nathan Brown, Managing Director
- **Location:** Chicago, IL
- **Potential pattern:** n******@wppartners.com (RocketReach partial match)
- **General contact:** info@wppartners.com
- **Status:** Contact identified, email pattern not published

### Hg Capital (Row 176)
- **Decision-makers identified:**
  - Laura Grattan (Managing Director, from Crosspoint)
  - Andrew Land (Partner, Saturn team)
- **Status:** Multiple contacts, no published emails

### Bertram Capital (Row 253)
- **Decision-maker:** Jeff Drazan, Managing Partner
- **Location:** Foster City, CA
- **Status:** Leadership identified, no published contact

## 📊 Challenge: Published Email Scarcity

**Key Finding:** Mid-market PE firms rarely publish direct decision-maker emails on their websites or in press releases. Most rely on:
- Generic emails (info@, ir@)
- Contact forms
- Email pattern inference tools (RocketReach, ZoomInfo)

## 🎯 Recommendations for Next Run

1. **Use Apollo API for remaining leads**
   - Apollo has better success with PE firm contacts
   - Can verify emails programmatically
   - Already integrated in `apollo-search.js`

2. **Focus on firms with websites**
   - 12 of the 15 leads have company websites
   - Higher success rate for enrichment

3. **Prioritize published contact sources:**
   - SEC Form ADV filings (compliance contacts)
   - Press release signature lines
   - Conference speaker bios
   - Portfolio company announcement PDFs

4. **Email pattern verification:**
   - Use multiple sources (RocketReach, ContactOut, etc.)
   - Only use when 2+ sources confirm the same pattern
   - Mark as "inferred" in notes

## ⏭️ Next 14 Priority Targets

These firms have websites and are ready for enrichment (Row numbers):

- Row 161: Thomas H. Lee Partners
- Row 176: Hg Capital  
- Row 230: WindPoint Partners (note: Wind Point)
- Row 253: Bertram Capital
- Row 272: Sentinel Capital Partners
- Row 283: LFM Capital
- Row 289: Shore Capital Partners
- Row 290: Cove Hill Partners
- Row 293: Court Square Capital Partners
- Row 296: Altaris Capital Partners
- Row 298: Irving Place Capital
- Row 300: Sheridan Capital Partners
- Row 304: NewSpring Capital
- Row 306: Vistria Group

## 📝 Notes

- **Time:** Hourly cron ran for ~30 minutes
- **Method:** Manual web research + verification
- **Success rate:** 1/15 with fully verified contacts (6.7%)
- **Decision-makers found:** 8+ additional contacts identified
- **Bottleneck:** Email verification from published sources

---

**Recommendation:** Switch to Apollo API enrichment for higher throughput on next hourly run.
