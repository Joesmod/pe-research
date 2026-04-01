# PE Enrichment Log - April 1, 2026

**Time:** 4:00 PM - 4:45 PM CST  
**Cron Job:** PE Research & Enrichment - Hourly  
**Researcher:** Jim (AI)  

## Summary

- **Leads Scanned:** 1,841 total rows in Google Sheet
- **Needing Enrichment:** 185 leads (missing contact names or emails)
- **Valid Targets Identified:** 4 firms with company names but missing verified emails
- **Successfully Enriched:** 4/4 (100%)
- **Method:** Apollo.io People Match API
- **Credits Used:** 4 Apollo enrichment credits

## Enriched Contacts

### 1. Ridgemont Equity Partners (Row 1838)
- **Contact:** Jack Purcell
- **Title:** Managing Partner
- **Email:** jpurcell@ridgemontep.com ✅ VERIFIED
- **Source:** Apollo.io (verified status)
- **LinkedIn:** https://www.linkedin.com/in/jack-purcell
- **Location:** Charlotte, NC

### 2. Gauge Capital (Row 1839)
- **Contact:** Drew Johnson
- **Title:** Co-Founder & Managing Partner/CEO
- **Email:** djohnson@gaugecapital.com ✅ VERIFIED
- **Source:** Apollo.io (verified status)
- **LinkedIn:** http://www.linkedin.com/in/drew-johnson-793335262
- **Location:** Southlake, TX (Dallas)

### 3. Primus Capital (Row 1840)
- **Contact:** Phillip C. Molner
- **Title:** Managing Partner
- **Email:** pmolner@primuscapital.com ✅ VERIFIED
- **Source:** Apollo.io (verified status)
- **LinkedIn:** https://www.linkedin.com/in/phillip-molner
- **Location:** Cleveland, OH
- **Focus:** Healthcare IT, software, business services

### 4. Blue Wolf Capital Partners (Row 1841)
- **Contact:** Adam Blumenthal
- **Title:** Founder & Co-Managing Partner, Chairman
- **Email:** adam@bluewolfcapital.com ✅ VERIFIED
- **Source:** Apollo.io (verified status)
- **LinkedIn:** http://www.linkedin.com/in/adam-blumenthal-a944b28
- **Location:** New York City
- **Background:** Former NYC Deputy Comptroller, Harvard/Yale

## Actions Taken

1. ✅ Identified 4 valid leads needing email enrichment
2. ✅ Searched Apollo.io for each contact
3. ✅ Retrieved verified email addresses (all 4 verified)
4. ✅ Updated Google Sheet (rows 1838-1841) with:
   - Contact names
   - Titles
   - Verified emails
   - LinkedIn URLs
   - Status: "Enriched"
   - Source notes
5. ✅ Created/updated dossier files in pe-research/PE-firms/
6. ✅ Committed to GitHub

## Email Verification Status

All 4 emails returned with "verified" status from Apollo API:
- ✅ jpurcell@ridgemontep.com
- ✅ djohnson@gaugecapital.com
- ✅ pmolner@primuscapital.com
- ✅ adam@bluewolfcapital.com

## Notes

- No hallucinated or guessed email patterns used
- All emails sourced from Apollo.io verified database
- Pattern analysis shows standard PE conventions:
  - First initial + last name (Jack Purcell → jpurcell)
  - First initial + last name (Drew Johnson → djohnson)
  - First initial + last name (Phillip Molner → pmolner)
  - First name only (Adam Blumenthal → adam)

## Next Steps

- Continue hourly enrichment scans
- Prioritize remaining 181 leads needing enrichment
- Focus on mid-market PE firms ($500M-$5B AUM)
- Services-heavy portfolio companies preferred

---
**Git Commit:** `git commit -m "Enrichment: 4 PE contacts verified via Apollo (Apr 1 4pm cron)"`
