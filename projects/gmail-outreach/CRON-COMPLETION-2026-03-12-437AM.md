# PE Research & Enrichment - Cron Completion Report
**Date:** March 12, 2026, 4:37 AM CST  
**Researcher:** Jim  
**Run Type:** Hourly PE Contact Enrichment

---

## Summary

✅ **14 firms enriched** with verified direct contacts  
❌ **1 firm** requires manual research (no Apollo data)  
📊 **Success rate:** 93.3% (14/15 attempted)

---

## Firms Successfully Enriched

All contacts have:
- ✅ Verified direct email (non-generic)
- ✅ Decision-maker title (Partner/MD/Director level)
- ✅ LinkedIn profile
- ✅ Updated in Google Sheet with "Enriched" status

### 1. **Harkness Capital Partners** (Row 276)
- **Contact:** Ted Dardani
- **Title:** Partner
- **Email:** tdardani@harknesscapital.com
- **LinkedIn:** linkedin.com/in/ted-dardani-bb1192101

### 2. **Sentinel Capital Partners** (Row 285)
- **Contact:** Josh Garrett
- **Title:** Managing Director
- **Email:** garrett@sentinelpartners.com
- **LinkedIn:** linkedin.com/in/josh-garrett-1549567

### 3. **Bertram Capital** (Row 305)
- **Contact:** Jeff Drazan
- **Title:** Managing Director
- **Email:** jeff@bcap.com
- **LinkedIn:** linkedin.com/in/jeff-drazan-61196

### 4. **Argonaut Private Equity** (Row 310)
- **Contact:** Anil Khatod
- **Title:** Sr. Partner & Managing Director
- **Email:** akhatod@kfoc.net
- **LinkedIn:** linkedin.com/in/anilkhatod

### 5. **Mill Point Capital** (Row 311)
- **Contact:** Aileen Wang
- **Title:** Partner
- **Email:** awang@millpoint.com
- **LinkedIn:** linkedin.com/in/aileen-wang-7a936052

### 6. **CIVC Partners** (Row 319)
- **Contact:** J.D. Wright
- **Title:** Partner
- **Email:** jwright@civc.com
- **LinkedIn:** linkedin.com/in/j-d-wright-8b161517

### 7. **Odyssey Investment Partners** (Row 335)
- **Contact:** Brian Kwait
- **Title:** Chief Executive Officer
- **Email:** bkwait@odysseyinvestment.com
- **LinkedIn:** linkedin.com/in/brian-kwait-60a0ab247

### 8. **Palm Beach Capital** (Row 478)
- **Contact:** Mike Schmickle
- **Title:** Partner
- **Email:** mschmickle@pbcap.com
- **LinkedIn:** linkedin.com/in/mike-schmickle-839115bb

### 9. **Aurora Capital Partners** (Row 500)
- **Contact:** Andrew Wilson
- **Title:** Partner
- **Email:** awilson@auroracap.com
- **LinkedIn:** linkedin.com/in/andrew-wilson-b4346410

### 10. **Emerging Capital Partners - ECP** (Row 511)
- **Contact:** Carolyn Campbell
- **Title:** Managing Partner, CEO/COO and Founder
- **Email:** campbellc@ecpinvestments.com
- **LinkedIn:** linkedin.com/in/-carolyn-campbell

### 11. **Levine Leichtman Capital Partners, LLC** (Row 525)
- **Contact:** Tannaz Chapman
- **Title:** Managing Director
- **Email:** tchapman@llcp.com
- **LinkedIn:** linkedin.com/in/tannaz-chapman-6041192

### 12. **Peninsula Capital Partners L.L.C.** (Row 531)
- **Contact:** Chris Gessner
- **Title:** Partner
- **Email:** gessner@peninsulafunds.com
- **LinkedIn:** linkedin.com/in/chris-gessner-cfa-150b497

### 13. **RA Capital Management** (Row 535)
- **Contact:** Joshua Resnick
- **Title:** Partner and Senior Managing Director
- **Email:** jresnick@racap.com
- **LinkedIn:** linkedin.com/in/joshuaresnick

### 14. **Wynnchurch Capital** (Row 851)
- **Contact:** Alexis Underwood
- **Title:** Managing Director/Operating Partner
- **Email:** aunderwood@wynnchurch.com
- **LinkedIn:** linkedin.com/in/alexisunderwood

---

## Needs Manual Research

### ❌ **Harvest Partners (SCF)** (Row 223)
- **Reason:** No contacts found in Apollo database
- **Next Steps:** Manual web research needed (firm website, LinkedIn search, press releases)
- **Priority:** Medium

---

## Technical Notes

- **API:** Apollo.io v1 (mixed_people/api_search endpoint)
- **Search Strategy:** Targeted titles (Managing Partner, MD, Partner, CEO, COO, CTO, Head of Operations/Technology, VP/Director level)
- **Verification:** All emails verified through Apollo enrichment (no pattern guessing)
- **Data Quality:** 100% verified direct emails, all decision-maker level contacts
- **Rate Limiting:** Hit Google Sheets API write limit partway through; resolved with 60-second delay
- **GitHub Sync:** Deferred (no dossier updates needed for these enrichments)

---

## Next Actions

1. ✅ All 14 enriched contacts ready for outreach
2. 🔍 Manual research queue: 1 firm (Harvest Partners SCF)
3. 📧 Next outreach batch can include these 14 firms
4. 📊 Update CRM/tracking with enrichment dates

---

## Files Generated

- `enrichment-report-march12-437am.json` - Full enrichment data
- `cron-enrich-march12-437am.js` - Main enrichment script
- `finish-last-2-march12.js` - Rate limit recovery script
- `CRON-COMPLETION-2026-03-12-437AM.md` - This report

---

**End of Report**
