# PE Research & Enrichment Report
## Monday, March 30, 2026 - 11:05 AM (Cron Run)

### Overview
Scanned Google Sheet for leads needing enrichment (empty contact names or generic/missing emails).

**Total rows analyzed:** 1,724  
**Leads needing enrichment:** 96  
**Priority range (rows 1-500):** 35 leads  
**Attempted enrichment:** 4 firms

---

### Key Finding: Data Structure Issue
Many rows have **LinkedIn URLs or website pages in the Email column** instead of actual email addresses. This is a data quality issue that needs addressing.

**Examples:**
- Row 25 (Huron Capital): Email field contains `https://www.linkedin.com/in/jim-mahoney`
- Row 52 (Summit Partners): Email field contains `https://www.linkedin.com/company/summit-partners`
- Row 101 (Littlejohn & Co): Email field contains `https://littlejohnllc.com/contact/`

---

### Enrichment Attempts

#### 1. M SEARCH (Row 637)
**Status:** Could not identify as legitimate PE firm  
**Findings:** Search results show executive search firms, not a PE firm called "M SEARCH"  
**Recommendation:** Mark as "Not PE" or verify correct firm name

#### 2. Meridian Capital (Row 645)
**Status:** Multiple entities found  
**Findings:**
- **Meridian Capital Group** - real estate finance firm (not PE)
- **Capitol Meridian Partners** - actual PE firm (founded 2021, Carlyle Group veterans, Washington DC)
- **Meridian Capital** (investment bank) - Randy Moe (Managing Director), Aaron Franzheim (Director)

**Contacts identified:**
- Randy Moe - Managing Director (LinkedIn: https://www.linkedin.com/in/randy-moe-meridian-capital/)
- Aaron Franzheim - Director (mentioned in company LinkedIn)
- Chuck Wilke - Managing Partner (Seattle-based)

**Next step:** Clarify which "Meridian Capital" entity is correct, then use Apollo API to get verified emails

#### 3. Pulley (Row 665)
**Status:** NOT a PE firm  
**Findings:** Cap table management software company (like Carta)  
**CEO:** Yin Wu  
**Recommendation:** Mark as "Not PE" (service provider to PE firms)

#### 4. Rogo (Row 669)
**Status:** NOT a PE firm  
**Findings:** AI/LLM company serving investment banks and PE firms  
**Founders:** Gabriel Stengel, Tumas Rackaitis, John Willett  
**Series:** Series C (2026)  
**Recommendation:** Mark as "Not PE" (service provider to PE firms)

---

### High-Priority Firms Needing Enrichment (Top 20 from rows 1-500)

These firms have partial data but need **actual verified email addresses:**

1. **Huron Capital** (Row 25) - Jim Mahoney, Managing Partner
   - LinkedIn: https://www.linkedin.com/in/jim-mahoney
   - No public email found
   - PR contact: jmarino@prosek.com (Prosek Partners)

2. **Summit Partners** (Row 52) - Managing Director & CEO
   - Needs actual contact name + email

3. **Lightyear Capital** (Row 78) - Managing Partner
   - Needs actual contact name + email

4. **Excellere Partners** (Rows 97, 213, 269 - **DUPLICATE**)
   - Managing Partner
   - Team page: https://excellere.com/team/
   - Notes mention Brad Cornell
   - **Action:** Consolidate duplicates, get verified email

5. **Littlejohn & Co** (Rows 101, 299 - **DUPLICATE**)
   - Managing Director, Capital Formation
   - Contact page: https://littlejohnllc.com/contact/
   - **Action:** Consolidate duplicates, get verified email

6. **Frontenac Company** (Rows 106, 277 - **DUPLICATE**)
   - Managing Partner: Ronald Kuehl
   - Team page: https://frontenac.com/team-member/ronald-kuehl/
   - **Action:** Consolidate duplicates, get verified email

7. **Trive Capital** (Row 109) - Managing Partner & Founder
   - Website: https://www.trivecapital.com/

8. **Veritas Capital** (Row 136) - CEO & Managing Partner

9. **Bertram Capital** (Rows 137, 274, 305 - **DUPLICATE x3**)
   - **Action:** Major cleanup needed

10. **Flexpoint Ford** (Row 191) - CEO

11. **Boathouse Capital** (Row 211) - Managing Partner

12. **Golden Gate Capital** (Row 228) - Managing Director

13. **Tenex Capital Management** (Row 249) - CEO & Managing Director

14. **Osceola Capital** (Row 272) - Michael Babb, Founder & Managing Partner
    - Notes mention email pattern: m******@osceola.com, kschwab@osceola.com, bmoe@osceola.com
    - **Action:** Verify these patterns via Apollo

---

### Data Quality Issues Identified

1. **Duplicate rows:** Excellere (3x), Littlejohn (2x), Frontenac (2x), Bertram (3x)
2. **Wrong column data:** URLs in Email column, research notes in Status column
3. **Missing structure:** Contact names stored as job titles only

---

### Recommendations

1. **Use Apollo API** for bulk enrichment of the 35 high-priority firms (rows 1-500)
2. **Clean duplicates** before enrichment to avoid wasted API calls
3. **Standardize data entry:** Separate columns for:
   - Contact Name (person)
   - Title (role)
   - Email (verified email only)
   - LinkedIn (profile URL)
   - Company LinkedIn (company page URL)
   - Website
   - Notes/Source

4. **Mark non-PE firms:** Pulley, Rogo, M SEARCH (if not verified)

---

### Next Steps for Next Cron Run

1. Run Apollo API enrichment for top 15 firms from rows 1-500
2. Consolidate duplicate entries
3. Update sheet with verified emails only
4. Mark non-PE firms as "Not PE"
5. Add 3-5 new mid-market PE firms ($500M-$5B AUM, services-heavy)

---

### Time Spent
- Sheet analysis: ~5 min
- Web research (4 firms): ~15 min
- Report writing: ~5 min
**Total:** ~25 min

**Status:** Research complete. Ready for Apollo API enrichment in next run.
