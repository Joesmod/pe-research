# PE Enrichment Report - Hourly Cron
**Date:** 2026-03-03  
**Time:** 4:06 PM CST  
**Run Duration:** ~28 seconds

## Summary
- **Targets Processed:** 15 leads
- **Successfully Enriched:** 13 leads
- **Failed:** 2 leads (1 no contacts, 1 no email)
- **Sheet Updates:** 13 rows updated

## Enriched Contacts

### 1. Zeal Capital Partners (Row 445)
- **Contact:** Stefanie Martin
- **Title:** Partner
- **Email:** stefanie@zealvc.co
- **Status:** Enriched
- **Note:** VC firm, not PE

### 2. Ohio Cash Buyers (Row 529)
- **Contact:** Tony Deal
- **Title:** Director of Acquisitions
- **Email:** tony@ohiocashbuyers.com
- **Status:** Enriched
- **Note:** Real estate company, not PE

### 3. South Park Commons (Row 541)
- **Contact:** Danh Trang
- **Title:** Partner
- **Email:** danh@southparkcommons.com
- **Status:** Enriched
- **Note:** VC/community, not PE

### 4. Vista Point Advisors (Row 550)
- **Contact:** Kara Frazier
- **Title:** VP of Marketing Communications
- **Email:** kara@vistapointadvisors.com
- **Status:** Enriched
- **Note:** M&A advisory, not PE

### 5. AI Fund (Row 556)
- **Contact:** Andy Ku
- **Title:** Partner
- **Email:** andy@aifund.ai
- **Status:** Enriched
- **Note:** VC firm, not PE

### 6. AmaWaterways River Cruises (Row 559)
- **Contact:** Ron Santangelo
- **Title:** VP Business Development
- **Email:** ron@amawaterways.com
- **Status:** Enriched
- **Note:** Travel/tourism company, not PE

### 7. FirstMark (Row 606)
- **Contact:** Arnav Bimbhet
- **Title:** Partner
- **Email:** abimbhet@iconiqcapital.com
- **Status:** Enriched
- **Note:** VC firm, not PE

### 8. GiantLeap Capital (Row 611)
- **Contact:** Samir Parikh
- **Title:** Co-Founder and Managing Partner
- **Email:** samir@giantleapcapital.com
- **Status:** Enriched
- **Note:** VC firm, not PE

### 9. GTMfund (Row 614)
- **Contact:** Shai Alfandary
- **Title:** Limited Partner
- **Email:** shai@verticacp.com
- **Status:** Enriched
- **Note:** VC fund, not PE

### 10. Hark Capital (Row 615) ✅
- **Contact:** Will Randell
- **Title:** Vice President
- **Email:** will@harkcap.com
- **Status:** Enriched
- **Note:** **Legitimate PE firm**

### 11. Healthcare Private Equity Association (Row 616)
- **Contact:** Leslie Thornbury
- **Title:** Director
- **Email:** lthornbury@hcpea.org
- **Status:** Enriched
- **Note:** Industry association, not a firm

### 12. HealthQuest Capital (Row 617)
- **Contact:** Bill Gerard
- **Title:** Vice President
- **Email:** william@hqcap.com
- **Status:** Enriched
- **Note:** Healthcare VC/growth equity

### 13. Hildred Capital (Row 618) ✅
- **Contact:** Isaiah Einzig
- **Title:** Vice President
- **Email:** ieinzig@hildredcapital.com
- **Status:** Enriched
- **Note:** **Legitimate PE firm**

## Failed Enrichments

### 1. Falconhead Capital (Row 216)
- **Reason:** No contacts found in Apollo
- **Status:** Researched - No Email (unchanged)

### 2. Casdin Capital (Row 580)
- **Reason:** Contact found but no verified email after enrichment
- **Status:** New - Unresearched (unchanged)

## Observations

1. **Data Quality Issue:** Many firms in the "New - Unresearched" section are not PE firms (VCs, advisors, travel companies, etc.)
2. **True PE Firms Enriched:** Only 2 out of 13 (Hark Capital, Hildred Capital)
3. **Recommendation:** Need better filtering to identify legitimate mid-market PE firms ($500M-$5B AUM, services-heavy)

## Next Steps

1. Filter for legitimate PE firms in the sheet
2. Focus enrichment on firms with "Private Equity" clearly in sector focus
3. Search for new mid-market PE firms to add to pipeline
4. Consider manual research for high-value targets

## API Usage

- Apollo searches: 15
- Apollo enrichments: 14
- Estimated credits used: ~29
