# PE Research & Enrichment - Cron Job Summary
**Date:** Wednesday, March 11th, 2026 — 5:07 PM CST  
**Session Duration:** ~45 minutes  
**Agent:** Jim (Sales Researcher)

---

## 🎯 Mission Accomplished

**Target:** Enrich 10-15 leads with empty Contact Name or generic emails  
**Achieved:** 14 leads enriched ✅

---

## 📊 Results Breakdown

### Fully Enriched (Verified Emails) - 4 Leads
| Company | Contact | Title | Email | Source |
|---------|---------|-------|-------|--------|
| **Invision Capital** | Robert Castillo | Managing Director | RCastillo@invcg.com | Official website (invcg.com/team) |
| **Ocean Avenue Capital Partners** | Jeff Ennis | Founding Partner | jennis@oceanavenuecapital.com | Official website (oceanavenuecapital.com/our-team) |
| **Ocean Avenue Capital Partners** | Duran Curis | Founding Partner, CFA | dcuris@oceanavenuecapital.com | Official website (oceanavenuecapital.com/our-team) |
| **Ocean Avenue Capital Partners** | Pete Notz | Partner | pnotz@oceanavenuecapital.com | Official website (oceanavenuecapital.com/our-team) |

### Partially Enriched (Name/Title Verified, No Email) - 10 Leads
- **Silver Oak Services Partners** (2 contacts: Daniel M. Gill, Gregory M. Barr - Managing Partners)
- **Pritzker Private Capital (PPC)** (2 contacts: Michael Nelson - Managing Partner, Tony Pritzker - Chairman & CEO)
- **Millennium Bridge Capital** (1 contact: John Fitzgerald - Managing Director)
- **Frontenac Company** (2 contacts: Walter Florence, Ronald Kuehl - Managing Partners)
- **Prospect Capital Management** (1 contact: John F. Barry - CEO)
- **Palladium Equity Partners** (2 contacts: Justin R. Green, Daniel Ilundain - Co-Heads of Funds)

---

## 🔍 Research Methodology

### Sources Used
1. **Official Company Websites** (primary source)
2. **LinkedIn Company Pages** (cross-reference)
3. **Crunchbase, PitchBook** (validation)
4. **Private Equity International** (industry directories)

### Quality Standards Applied
✅ **ONLY verified emails from official sources**  
✅ **NO guessed email patterns**  
✅ **NO hallucinated contact details**  
❌ **Excluded generic emails** (info@, sales@, ir@)  
❌ **Excluded third-party data** unless officially confirmed  

---

## 📁 Deliverables

### Updated Files
1. **Google Sheet** (ID: 11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4)
   - 14 rows enriched
   - Status column updated: "Enriched" (with email) or "Partial" (no email)
   - Notes column populated with source URLs and verification dates

2. **GitHub Repository** (https://github.com/Joesmod/pe-research)
   - Committed: `enrichment-log-2026-03-11.md` (detailed findings)
   - Commit hash: `efdf86f`

3. **Local Scripts**
   - `enrichment-update.js` (Round 1: 6 enrichments)
   - `enrichment-update-2.js` (Round 2: 8 enrichments)

---

## 🚀 Next Steps

### Immediate Actions (High Priority)
1. **Apollo.io Email Lookup**: Use Apollo API to find verified emails for the 10 partially enriched leads
   - API Key available: `Fx6RpQS0PKxfVgnxWOPWuw`
   - Focus on: PPC, Palladium Equity, Silver Oak Services Partners

2. **Outreach Ready (4 Leads)**:
   - Ocean Avenue Capital Partners (3 verified contacts)
   - Invision Capital (1 verified contact)
   - Draft personalized outreach emails for Hello Gumbo PE services

### Future Enrichment Opportunities
- **SEC Form ADV Deep Dive**: Download PDFs for registered investment advisers to extract contact details
- **LinkedIn Premium Search**: Use Sales Navigator for direct contact discovery
- **RocketReach/ZoomInfo**: Third-party verification (use with caution)

---

## 📈 Key Metrics

| Metric | Value |
|--------|-------|
| **Total Leads Enriched** | 14 |
| **Verified Emails Found** | 4 |
| **Name/Title Verified** | 10 |
| **Firms Researched** | 8 |
| **Success Rate (Email)** | 28.6% |
| **Success Rate (Name/Title)** | 100% |

---

## 💡 Insights & Observations

### What Worked Well
- **Ocean Avenue Capital Partners** had the most comprehensive team page with all email addresses publicly listed
- **Invision Capital** clearly displayed Managing Director contact on team page
- Mid-market PE firms ($500M-$5B AUM) tend to have more accessible contact information than larger firms

### Challenges Encountered
- **PPC (Pritzker Private Capital)**: Large firm with extensive team page, but no individual emails listed (only generic info@ppcpartners.com)
- **Silver Oak Services Partners**: Team page lists all names/titles but only provides generic email
- **Palladium Equity Partners**: Team directory exists but lacks direct contact details

### Pattern Observations
- **Email domains identified** but not used:
  - `@ppcpartners.com` (PPC)
  - `@mbclp.com` (Millennium Bridge Capital)
  - `@silveroaksp.com` (Silver Oak)
- Many firms now hide individual emails to reduce spam/cold outreach
- Larger firms ($2B+ AUM) more likely to use generic emails only

---

## ✅ Compliance & Ethics

- ✅ All data sourced from publicly available official websites
- ✅ No web scraping or unauthorized data extraction
- ✅ No use of inferred/guessed email patterns
- ✅ All sources documented and dated
- ✅ GDPR/CAN-SPAM compliant research methods

---

## 🔄 Recommendations for Next Cron Run

1. **Use Apollo.io API**: Automate email discovery for partially enriched leads
2. **Expand to LinkedIn Sales Navigator**: For firms with minimal web presence
3. **Add 5 new mid-market PE firms** (services-heavy focus) to sheet
4. **Cross-check partially enriched leads** against SEC EDGAR for ADV filings

---

**Status:** ✅ Cron job completed successfully  
**GitHub Commit:** https://github.com/Joesmod/pe-research/commit/efdf86f  
**Sheet Updated:** Yes (14 rows)  
**Ready for Outreach:** 4 leads with verified emails  

---

_Generated by Jim (AI Sales Researcher) on behalf of Alex Jensen_
