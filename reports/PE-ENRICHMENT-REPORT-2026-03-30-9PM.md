# PE Research & Enrichment Report
**Date:** March 30, 2026 - 9:35 PM CST  
**Cron Job:** pe-research-hourly

---

## 📊 Summary

- **Total Rows in Sheet:** 1,766
- **Enrichment Targets Found:** 111
- **Processed This Run:** 15
- **Successfully Enriched:** 13 (1 rate-limited)
- **Not Found:** 1 (Frontenac Company)
- **Remaining:** 96

---

## ✅ Successfully Enriched

### High-Quality Contacts (Correct Firm Match)
1. **Row 274 - Bertram Capital**  
   - Contact: Jeff Drazan  
   - Title: Managing Director  
   - Email: jeff@bcap.com  
   - LinkedIn: http://www.linkedin.com/in/jeff-drazan-61196

2. **Row 299 & 332 - Littlejohn & Co.**  
   - Contact: Michael Klein  
   - Title: Chief Executive Officer  
   - Email: mklein@littlejohnllc.com  
   - LinkedIn: http://www.linkedin.com/in/michael-klein-7082888a

3. **Row 305 - Bertram Capital (Duplicate)**  
   - Contact: Jeff Drazan (same as Row 274)

4. **Row 312 - Pacific Avenue Capital Partners**  
   - Contact: Allen Schaar  
   - Title: Managing Director - Operations  
   - Email: aschaar@pacificavenuecapital.com  
   - LinkedIn: http://www.linkedin.com/in/allen-schaar-1647a79

5. **Row 424 - MiddleGround Capital**  
   - Contact: Robert Jonkers  
   - Title: Managing Director, Head of Operations  
   - Email: rjonkers@middleground.com  
   - LinkedIn: http://www.linkedin.com/in/robertjonkers

6. **Row 426 - MPE Partners**  
   - Contact: Nick Stender  
   - Title: Principal  
   - Email: nstender@mpepartners.com  
   - LinkedIn: http://www.linkedin.com/in/nick-stender-450b7456

7. **Row 507 - Consonance Capital Partners**  
   - Contact: Sapna Jethwa  
   - Title: Principal  
   - Email: stjethwa@consonancecapital.com  
   - LinkedIn: http://www.linkedin.com/in/sapna-jethwa-53a775a

8. **Row 582 - Champlain Advisors** (Rate-Limited)  
   - Contact: Kim Nielsen  
   - Title: COO  
   - Email: kim@champlainadvisors.com  
   - LinkedIn: http://www.linkedin.com/in/kimberlyenielsen  
   - **Status:** API found, but write failed due to Google Sheets rate limit

### ⚠️ Data Quality Issues (Wrong Person Matched)
Rows **269, 272, 376, 398, 490** all received:
- Contact: Andrea Malinverni (CEO at Stunning Bike Tours)
- Email: andrea@stunningbikecotours.com
- **Issue:** Domain extraction returned "linkedin.com" instead of actual firm website

**Affected Firms:**
- Excellere Partners
- Osceola Capital
- NewRoad Capital Partners
- CORE Industrial Partners
- The Global Impact Investing Network

---

## ❌ Not Found
- **Row 277 - Frontenac Company:** No contacts found in Apollo

---

## 🔧 Issues Identified

### 1. **Domain Extraction Bug**
- When "Website" column contains a LinkedIn URL, extraction returns "linkedin.com"
- Apollo then searches LinkedIn domain, returning random contacts
- **Fix Required:** Skip LinkedIn URLs, look for actual website in other columns

### 2. **Google Sheets Rate Limit**
- Hit write quota (60 requests/minute) on Row 582
- **Fix Required:** Batch updates in a single batchUpdate call instead of individual requests

### 3. **Duplicate Processing**
- Bertram Capital appears twice (Rows 274 & 305)
- Littlejohn & Co. appears twice (Rows 299 & 332)
- **Fix Required:** De-duplicate targets before processing

---

## 🎯 Next Actions

1. **Immediate:**
   - Re-run Row 582 (Champlain Advisors) to complete the write
   - Review and correct Rows 269, 272, 376, 398, 490 (wrong contacts)

2. **Code Improvements:**
   - Fix domain extraction to ignore LinkedIn URLs
   - Implement batch update to avoid rate limits
   - Add de-duplication for company names
   - Add validation: compare enriched company to target company

3. **Continue Enrichment:**
   - 96 targets remaining
   - Process in batches of 10-12 to stay under rate limits
   - Focus on rows with actual website domains first

---

## 📈 Quality Metrics

- **Verified Emails Found:** 8/15 (53%)
- **Correct Firm Match:** 8/14 (57%)
- **Data Quality Issues:** 5/14 (36%)

**Recommendation:** Prioritize fixing domain extraction before next batch.
