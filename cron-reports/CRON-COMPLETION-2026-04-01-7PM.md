# PE Research & Enrichment - Hourly Cron Report
**Date:** Wednesday, April 1, 2026 — 7:06 PM CST
**Task:** Enrich existing leads with verified contacts

---

## Summary

✅ **6 firms enriched** with verified contact information from official sources
📊 **Google Sheet updated** with contact names, titles, websites, LinkedIn profiles, and research notes
🔄 **GitHub dossiers updated** with comprehensive firm profiles
🚫 **No emails sent** (research-only task)

---

## Firms Enriched

### 1. Bow River Capital
- **Contact:** Blair E. Richardson
- **Title:** Founder, CEO & Chairman
- **Website:** https://www.bowrivercapital.com
- **LinkedIn:** https://www.linkedin.com/in/blair-richardson-a4755613/
- **AUM:** $6B+
- **Location:** Denver, CO
- **Status:** Contact verified, email pattern identified (needs verification)

### 2. Shore Capital Partners
- **Contact:** Justin Ishbia
- **Title:** Founder & Managing Partner
- **Website:** https://www.shorecp.com
- **LinkedIn:** https://www.linkedin.com/in/justin-ishbia-aa72943/
- **AUM:** $17B+
- **Location:** Chicago, IL
- **Status:** Contact verified, email pattern identified (needs verification)
- **Note:** High-profile investor, Phoenix Suns part-owner

### 3. Petrichor Healthcare Capital
- **Contact:** Patrick Lally
- **Title:** Partner
- **Website:** https://www.petrichorcap.com
- **LinkedIn:** https://www.linkedin.com/in/patrick-lally-05b9a541/
- **Location:** New York, NY
- **Background:** 15+ years healthcare investing, ex-OrbiMed
- **Status:** Contact verified, email needs verification

### 4. Vesey Street Capital Partners
- **Contact:** Adam Feinstein
- **Title:** Managing Partner
- **Website:** https://www.vscpllc.com
- **Focus:** Healthcare services
- **Team:** 14 people, 6 partners, 100+ years combined experience
- **Status:** Contact verified, LinkedIn and email need verification
- **Note:** Also identified Michael Doyle (Managing Partner)

### 5. Edison Partners
- **Contact:** Chris Sugden
- **Title:** Managing Partner
- **Website:** https://www.edisonpartners.com
- **Phone:** 609-896-1900
- **AUM:** $2.2B
- **Location:** Princeton, NJ
- **Status:** Contact verified, LinkedIn and email need verification
- **Note:** Chairman of investment committee, joined 2002

### 6. Revelstoke Capital Partners
- **Contact:** Simon Bachleda
- **Title:** Founder & Managing Partner
- **Website:** https://revelstokecapital.com
- **AUM:** $5.6B
- **Location:** Denver, CO
- **Founded:** 2013
- **Deal Activity:** 188 acquisitions (27 platforms, 161 add-ons)
- **Status:** Contact verified, LinkedIn and email need verification
- **Note:** Also identified Russell Cassella (Managing Partner)

---

## Methodology

### Research Sources
1. **Official firm websites** (primary source for contact verification)
2. **LinkedIn** (profile verification and background)
3. **Crunchbase** (firmographics, funding data)
4. **Bloomberg/ZoomInfo** (executive profiles)
5. **Press releases** (announcements, deals, promotions)
6. **Forbes/Wikipedia** (high-profile executives)

### Search Strategy
- Targeted searches for C-level, partners, managing directors
- Cross-referenced multiple sources for verification
- Prioritized official sources over third-party databases
- Identified email patterns from lead databases (RocketReach, LeadIQ) but flagged as unverified

### Email Verification Challenges
- **Apollo API returned no results** (potential credit/config issue)
- **Third-party email patterns identified** but not from official sources:
  - Bow River: [last]@bowrivercapital.com
  - Shore Capital: FLast@shorecp.com
- **No direct emails found** on official websites (standard PE practice)
- **Flagged all email addresses** for manual verification

---

## Google Sheet Updates

**Rows Updated:** 1806, 1818, 1819, 1851, 1852, 1853

**Columns Updated:**
- Contact Name ✅
- Title ✅
- Website ✅
- LinkedIn URL ✅ (where available)
- Status → "Research Complete - Email Verification Needed"
- Notes → Source attribution and next steps

**Email Column:** Left blank (requires manual verification)

---

## GitHub Repository Updates

**Repository:** https://github.com/Joesmod/pe-research

### New/Updated Dossiers
1. `PE-firms/Bow-River-Capital.md` (updated)
2. `PE-firms/Shore-Capital-Partners.md` (updated)
3. `PE-firms/Petrichor-Healthcare-Capital.md` (updated)
4. `PE-firms/Vesey-Street-Capital-Partners.md` (updated)
5. `PE-firms/Edison-Partners.md` (updated)
6. `PE-firms/Revelstoke-Capital-Partners.md` (new)

### Support Files
- `enrich-leads.js` (Apollo API search script)
- `linkedin-search.js` (contact reference list)

**Commit Message:** "Enriched 6 PE firm leads with verified contacts from official sources"
**Status:** ✅ Pushed to main branch (resolved merge conflicts)

---

## Next Steps

### Immediate (Manual)
1. **Email Verification:** Use ContactOut, RocketReach, or manual investigation to verify email addresses
2. **LinkedIn Profile Collection:** Complete LinkedIn URLs for contacts without them
3. **Secondary Contacts:** Identify backup contacts (COOs, CTOs, Directors) for each firm

### Secondary (If Time Permits)
4. **Apollo API Troubleshooting:** Check credits, configuration, or alternative prospecting tools
5. **Add New Firms:** Research 3-5 additional mid-market PE firms ($500M-$5B AUM, services-heavy)

### Process Improvements
6. **Email Pattern Database:** Build a reference of confirmed email patterns by firm
7. **LinkedIn Automation:** Consider LinkedIn Sales Navigator for verified contact data
8. **CRM Integration:** Auto-sync enriched data to "Outreach Log" sheet

---

## Metrics

- **Time Spent:** ~40 minutes
- **Firms Researched:** 6
- **Contacts Identified:** 8 (6 primary + 2 secondary)
- **Sources Consulted:** 20+ (websites, LinkedIn, databases)
- **Dossier Words:** ~12,000
- **GitHub Commits:** 2
- **Sheet Rows Updated:** 6

---

## Key Learnings

1. **PE firms rarely publish direct emails** - industry standard for privacy
2. **Third-party email databases** have patterns but lack verification
3. **LinkedIn profiles** are valuable for background but don't provide direct emails
4. **Official bios and press releases** are best sources for titles and roles
5. **Manual verification** is required for any email outreach compliance

---

## Quality Assurance

✅ All contact names verified from official sources  
✅ All titles cross-referenced with multiple sources  
✅ All websites confirmed as official domains  
✅ LinkedIn profiles verified where available  
⚠️ Email addresses flagged for manual verification  
✅ GitHub repository updated with comprehensive research  
✅ Google Sheet updated with source attribution  

---

**Prepared by:** Jim (AI Sales Researcher)  
**Next Cron Run:** 2026-04-01, 8:00 PM CST  
**Status:** COMPLETE ✅
