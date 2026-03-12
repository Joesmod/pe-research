# PE Research & Enrichment - Hourly Cron Report
## Wednesday, March 11th, 2026 — 10:07 PM (America/Chicago)

### ✅ Phase 1: Data Corrections (3 rows fixed)

Fixed misaligned data in the sheet where contact info was shifted left by one column:

1. **Row 285: Sentinel Capital Partners**
   - Corrected: Contact Name, Title, Email now in proper columns
   - Email: knise@sentinelpartners.com (Patrick Knise, Managing Director)

2. **Row 305: Bertram Capital**
   - Corrected: Contact Name, Title, Email now in proper columns
   - Email: jeff@bcap.com (Jeff Drazan, Managing Director)

3. **Row 276: Harkness Capital Partners**
   - Corrected: Contact name moved from NotebookLM column to Contact Name column
   - Email: ihandsman@harknesscapital.com (Ian Handsman, Partner)

### 🔍 Phase 2: Enrichment Attempts (3 firms researched)

After fixing data issues, identified 3 firms still needing enrichment. Attempted enrichment via Apollo API and manual web research:

#### 1. Hg Capital (Row 176)
- **Current Status:** Contact name obfuscated ("Connor Da***g"), no email
- **Apollo API:** No results returned
- **Web Research:** 
  - Official website (hgcapital.com) only lists generic emails (info@, press@)
  - Found references to partners via LinkedIn/team pages but no direct individual emails
  - RocketReach shows patterns but requires paid subscription
- **Recommendation:** ❌ Leave blank - no verified public email found
- **Notes Added:** "Manual research 2026-03-12: No public individual emails. Official site only provides info@hgcapital.com"

#### 2. The Jordan Company (TJC) (Row 234)
- **Current Status:** Generic "General Inquiry" contact, Email = "N/A"
- **Apollo API:** No results returned
- **Web Research:**
  - Official website (tjclp.com) only lists phone numbers, no emails
  - ZoomInfo/RocketReach show obfuscated patterns: i***@thejordancompany.com (Ian Arons, Partner)
  - Email pattern appears to be: [first initial][lastname]@tjclp.com
  - BUT: Pattern not verified on official source
- **Recommendation:** ❌ Leave blank per instructions (no official source)
- **Notes Added:** "Manual research 2026-03-12: ZoomInfo shows Ian Arons (Partner, Co-Chair Investment Committee) with email pattern i***@thejordancompany.com. Not verified on official site. Phone: (212) 572-0800"

#### 3. 360 Equipment Finance (Row 493)
- **Current Status:** Kip Amstutz (Founder), no email, Status already says "Researched - No Public Contact"
- **Apollo API:** No results returned
- **Web Research:**
  - Company website: 360equipmentfinance.com
  - ZoomInfo/RocketReach show: k***@360equipmentfinance.com (Kip Amstutz, President/CEO)
  - Pattern likely: [first initial][lastname]@domain
  - LinkedIn profile found: https://www.linkedin.com/in/kip-amstutz-64603431/
  - BUT: Email not published on official company website
- **Recommendation:** ❌ Leave blank per instructions (pattern only, not verified)
- **Notes Added:** "Manual research 2026-03-12: RocketReach shows k***@360equipmentfinance.com for Kip Amstutz (President/CEO). Pattern inferred but not verified on company website. LinkedIn: https://www.linkedin.com/in/kip-amstutz-64603431/"

### 📊 Summary

- **Total leads needing enrichment:** 6 initially identified
- **Data corrections (misalignments fixed):** 3 ✅
- **Enrichment attempts:** 3
- **Successfully enriched with verified emails:** 0
- **Inferred patterns found (not used per instructions):** 2

### 🎯 Outcome

**Current state:** All identifiable data quality issues have been corrected. The remaining 3 firms genuinely lack publicly available individual contact emails:

1. **Hg Capital** - Large PE firm, website policy restricts individual emails
2. **The Jordan Company (TJC)** - Phone-only contact policy
3. **360 Equipment Finance** - Small firm, limited public contact info

**Recommendation:** These 3 firms may require:
- LinkedIn outreach instead of email
- Phone-based prospecting
- Paid data service subscription (ZoomInfo/RocketReach) if email patterns acceptable
- Networking/warm introductions

### 📁 Files Generated

- `comprehensive-fix-results-march11-10pm.json` - Data corrections log
- `more-enrichable-march11-10pm.json` - Enrichment candidates analysis
- `CRON-ENRICHMENT-MARCH11-10PM.md` - This report

---

**Next Steps:**
- Consider policy on using inferred email patterns from paid data services
- Explore LinkedIn outreach for firms without public emails
- Add 3-5 new mid-market PE firms if current list is exhausted

✅ **Cron job completed successfully. No emails sent. Research and logging only.**
