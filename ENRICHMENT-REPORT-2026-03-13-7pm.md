# PE Research Enrichment Report
**Date:** March 13, 2026 - 7:37 PM CST  
**Researcher:** Jim (AI Sales Researcher)  
**Method:** Apollo API + Web Research

---

## Summary

- **Total Leads Needing Enrichment:** 125 (in Google Sheet)
- **Firms Researched:** 8 unique firms
- **Successful Enrichments:** 7 firms with verified emails
- **Google Sheet Updates:** 7 rows updated
- **Dossiers Created/Updated:** 5 new dossiers
- **GitHub Commit:** 2e7b054

---

## Enriched Contacts

### 1. Bruin Capital
- **Contact:** Tony Crispino
- **Title:** COO
- **Email:** tcrispino@bruincptl.com ✅
- **LinkedIn:** [Profile](http://www.linkedin.com/in/tony-crispino-3b19341a)
- **Source:** Apollo API
- **Row:** 575

### 2. Butterfly Equity
- **Contact:** Adam Waglay
- **Title:** CEO, Managing Partner, Co-Founder
- **Email:** adam@butterflyequity.com ✅
- **LinkedIn:** [Profile](http://www.linkedin.com/in/adam-waglay-49862b5)
- **Source:** Apollo API
- **Row:** 577

### 3. Callais Capital
- **Contact:** Harold Callais
- **Title:** Managing Partner / Chief Investment Officer
- **Email:** harold.callais@callaiscapital.com ✅
- **LinkedIn:** [Profile](http://www.linkedin.com/in/hjc2)
- **Source:** Apollo API
- **Row:** 578

### 4. Character Capital
- **Contact:** John Zeratsky
- **Title:** Co-Founder & General Partner
- **Email:** jz@character.vc ✅
- **LinkedIn:** [Profile](http://www.linkedin.com/in/johnzeratsky)
- **Source:** Apollo API
- **Row:** 583

### 5. Accel-KKR
- **Contact:** Anthony Rotoli
- **Title:** President and Chief Executive Officer
- **Email:** anthony.rotoli@accel-kkr.com ✅
- **LinkedIn:** [Profile](http://www.linkedin.com/in/anthonyrotoli)
- **Source:** Apollo API
- **Row:** 1009
- **Note:** Replaced generic email (inquiries@accel-kkr.com)

### 6. Backstroke
- **Contact:** Brian Smith
- **Title:** Chief Technology Officer
- **Email:** brian@backstroke.com ✅
- **Source:** Apollo API
- **Row:** 909
- **Status:** Dead - Not PE/VC (enriched but not priority)

### 7. Satso
- **Contact:** Evan Pena
- **Title:** Chief Technology Officer
- **Email:** evan.pena@satsol.net ✅
- **Source:** Apollo API
- **Row:** 910
- **Status:** Dead - Not PE/VC (enriched but not priority)

---

## Not Enriched (No Verified Email Found)

### Bow River Capital
- **Contact:** Jane Ingalls (President, COO)
- **Status:** Multiple duplicate rows in sheet
- **Issue:** Apollo returned contact but email not available via enrichment API
- **Next Steps:** Manual research or alternative data source needed

---

## Key Metrics

| Metric | Count |
|--------|-------|
| API Searches | 8 |
| API Enrichments | 8 |
| Verified Emails Found | 7 |
| Success Rate | 87.5% |
| Sheet Rows Updated | 7 |
| GitHub Dossiers Created | 5 |

---

## Tools Used

1. **Apollo API** (Primary enrichment source)
   - People Search endpoint: `/api/v1/mixed_people/api_search`
   - People Match endpoint: `/api/v1/people/match`
   - API Key: Fx6Rp... (configured in TOOLS.md)

2. **Google Sheets API** (CRM updates)
   - Service Account: gmail-outreach/service-account.json
   - Sheet ID: 11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4

3. **GitHub** (Dossier repository)
   - Repo: https://github.com/Joesmod/pe-research
   - Branch: master
   - Commit: 2e7b054

---

## Files Created

- `apollo-enriched-contacts-march13-737pm.json` - Apollo enrichment results
- `enrichment-targets-march13-737pm.json` - Target firms list
- `apollo-enrich-v2-march13-737pm.js` - Enrichment script (batch 1)
- `apollo-enrich-batch2-march13-737pm.js` - Enrichment script (batch 2)
- `update-sheet-enriched-march13-737pm.js` - Sheet update script
- PE-firms/{firm-name}/dossier.md - 5 dossiers

---

## Next Steps

1. **Continue enrichment:** 118 firms still need enrichment
2. **Bow River Capital:** Investigate alternative sources for Jane Ingalls email
3. **Quality check:** Verify enriched emails are deliverable
4. **Outreach prep:** Prepare personalized email templates for enriched leads
5. **Secondary goal:** Add 3-5 new mid-market PE firms ($500M-$5B AUM, services-heavy)

---

## Notes

- All email sources verified via Apollo API (professional contacts)
- No email patterns guessed or hallucinated
- All dossiers include source attribution and last update date
- Status field in sheet updated to "Enriched" for all verified contacts
- Notes column includes "Apollo API enrichment 2026-03-13"

---

**Report Generated:** 2026-03-13 19:37 CST  
**Researcher:** Jim 🫡
