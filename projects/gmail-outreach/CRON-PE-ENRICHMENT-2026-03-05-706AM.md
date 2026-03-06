# PE Research & Enrichment - Hourly Run
**Date:** March 5, 2026 - 7:06 AM CST
**Task:** Enrich 10-15 leads with verified contacts

---

## FINDINGS

### 1. **Keltic Financial Partners** (Row 117)
- **Status:** ❌ DEAD/ACQUIRED
- **Notes:** Acquired by Ares Management circa 2014
- **Source:** Multiple news articles (ABL Advisor, Law360, The Middle Market)
- **Action:** Mark as "Dead" with note "Acquired by Ares Management ~2014"

### 2. **Jett Capital Advisors** (Row 626)
- **Website:** www.jettcapital.com
- **Best Contact:** Joseph Riggio
- **Title:** Partner, CEO & Founding Partner
- **LinkedIn:** https://www.linkedin.com/in/joe-riggio/
- **Email:** ⚠️ Pattern found (j**@jettcapital.com) but NOT VERIFIED - need Apollo/Hunter lookup
- **Other Partners:**
  - Dov Wiener - Partner  
  - Samuel Grauer - Partner
  - Matt Jurjevich - Partner
- **Source:** Company website team page, FINRA BrokerCheck
- **Action:** HOLD - need verified email before updating

### 3. **3G Capital** (Row 696)
- **Website:** www.3g-capital.com
- **Status:** Searching...
- **Notes:** Major PE firm (Kraft Heinz, Burger King, etc.)

### 4. **RCP Advisors** (Row 666)
- **Current Email:** info@ribbitcap.com (generic)
- **Status:** Needs research
- **Notes:** May be Ribbit Capital (VC, not traditional PE)

### 5. **BDT & MSD Partners** (Row 714)
- **Website:** www.bdtmsd.com
- **Notes:** Major firm (Byron Trott founded BDT), merged with MSD Partners (Michael Dell)
- **Status:** Searching...

---

## PRIORITY ACTIONS

1. Use Apollo API to get verified emails for:
   - Joseph Riggio @ Jett Capital
   - Partners at 3G Capital
   - BDT & MSD Partners contacts

2. Manual research needed for:
   - RCP Advisors (verify if this is Ribbit Capital)
   - Alta Park Capital
   - Ancor Capital Partners

3. Sheet updates:
   - Mark Keltic as Dead immediately
   - Hold other updates until emails verified

---

## CHALLENGES

- Node.js not accessible in PowerShell environment
- Need to either:
  1. Run enrichment script via Git Bash
  2. Use PowerShell Google Sheets API directly
  3. Create Python script (if Python available)
  4. Manual research + documented findings for Alex to batch update

---

### 6. **Bloom Equity Partners** (Row 716)
- **Website:** www.bloomequitypartners.com
- **Best Contact:** Bart Macdonald  
- **Title:** Managing Partner & Founder
- **Email:** ✅ bart@bloomequitypartners.com (VERIFIED)
- **LinkedIn:** https://www.linkedin.com/in/bart-macdonald-ea2adf5c
- **Other Key People:**
  - Jeff Hsiang - Partner (Investment Committee)
  - Abe Borden - Principal
- **Source:** TheNetwork.com, Success.ai, Company website team page
- **Status:** ✅ READY TO UPDATE

### 7. **Arctaris Impact Investors** (Row 706)
- **Website:** www.arctaris.com
- **Best Contact:** Jonathan Tower
- **Title:** Founder & Managing Partner
- **Email:** ✅ jonathan@arctaris.com (VERIFIED)
- **LinkedIn:** https://www.linkedin.com/in/jonathan-tower/
- **Source:** ContactOut, company website
- **Status:** ✅ READY TO UPDATE

### 8. **3G Capital** (Row 696)  
- **Website:** www.3g-capital.com
- **Best Contact:** Alex Behring
- **Title:** Co-Founder & Co-Managing Partner  
- **Email:** ✅ abehring@3g-capital.com (VERIFIED)
- **LinkedIn:** Apollo.io profile confirmed
- **Other Key People:**
  - Daniel Schwartz - Co-Managing Partner
  - Jorge Paulo Lemann, Carlos Sicupira, Marcel Telles - Founding Partners
- **Source:** ContactOut explicitly states "To contact Alex Behring send an email to abehring@3g-capital.com"
- **Status:** ✅ READY TO UPDATE

---

## VERIFIED CONTACTS SUMMARY

✅ **READY FOR SHEET UPDATE (3 firms):**

1. **3G Capital** → Alex Behring, Co-Founder & Co-Managing Partner, abehring@3g-capital.com
2. **Bloom Equity Partners** → Bart Macdonald, Managing Partner & Founder, bart@bloomequitypartners.com  
3. **Arctaris Impact Investors** → Jonathan Tower, Founder & Managing Partner, jonathan@arctaris.com

⏸️ **NEEDS EMAIL VERIFICATION (2 firms):**

4. **Jett Capital Advisors** → Joseph Riggio, Partner & CEO (pattern: j**@jettcapital.com, needs Apollo/Hunter)
5. **BDT & MSD Partners** → Byron Trott, Chairman & Co-CEO (pattern: b***@bdtmsd.com, needs verification)

❌ **MARK AS DEAD (1 firm):**

6. **Keltic Financial Partners** → Acquired by Ares Management ~2014

---

## SHEET UPDATE BATCH

**Immediate Updates (Verified Emails):**

| Row | Company | Contact Name | Title | Email | LinkedIn | Status | Notes |
|-----|---------|-------------|-------|-------|----------|--------|-------|
| 696 | 3G Capital | Alex Behring | Co-Founder & Co-Managing Partner | abehring@3g-capital.com | Apollo.io | Enriched | Source: ContactOut verified |
| 706 | Arctaris Impact Investors | Jonathan Tower | Founder & Managing Partner | jonathan@arctaris.com | https://www.linkedin.com/in/jonathan-tower/ | Enriched | Source: ContactOut |
| 716 | Bloom Equity Partners | Bart Macdonald | Managing Partner & Founder | bart@bloomequitypartners.com | https://www.linkedin.com/in/bart-macdonald-ea2adf5c | Enriched | Source: TheNetwork.com |
| 117 | Keltic Financial Partners | - | - | - | - | Dead | Acquired by Ares Management ~2014 |

---

## NEXT STEPS

1. ✅ Update Google Sheet with 3 verified contacts + 1 dead firm
2. Continue researching remaining firms:
   - Alta Park Capital (Row 699)
   - Ancor Capital Partners (Row 702)
   - Atlanta Capital Management (Row 710)
   - Atlantic Street Capital (Row 711)
   - RCP Advisors (Row 666) - verify if Ribbit Capital
3. Use Apollo API for bulk enrichment of remaining firms
4. Target: Complete 10-15 total enrichments this hour

---

### 9. **Alta Park Capital, LP** (Row 699)
- **Website:** www.altaparkcapital.com
- **Best Contact:** Bijan Modanlou
- **Title:** Founder
- **Email:** ✅ bijan@altaparkcapital.com (VERIFIED)
- **Other Key People:**
  - Joe Bou-Saba - Co-founder
  - Jayaveera Kodali - Partner
- **Source:** ContactOut (explicitly states "To contact Bijan Modanlou send an email to bijan@altaparkcapital.com")
- **Notes:** Investment firm focused on TMT (tech, media, telecom) public/private companies
- **Status:** ✅ READY TO UPDATE

---

## FINAL VERIFIED CONTACTS SUMMARY

✅ **READY FOR SHEET UPDATE (4 VERIFIED firms):**

1. **3G Capital** (Row 696) → Alex Behring, Co-Founder & Co-Managing Partner, abehring@3g-capital.com
2. **Bloom Equity Partners** (Row 716) → Bart Macdonald, Managing Partner & Founder, bart@bloomequitypartners.com  
3. **Arctaris Impact Investors** (Row 706) → Jonathan Tower, Founder & Managing Partner, jonathan@arctaris.com
4. **Alta Park Capital, LP** (Row 699) → Bijan Modanlou, Founder, bijan@altaparkcapital.com

⏸️ **NEEDS EMAIL VERIFICATION (2 firms):**

5. **Jett Capital Advisors** (Row 626) → Joseph Riggio, Partner & CEO (pattern found, needs Apollo verification)
6. **BDT & MSD Partners** (Row 714) → Byron Trott, Chairman & Co-CEO (pattern found, needs verification)

❌ **MARK AS DEAD (1 firm):**

7. **Keltic Financial Partners** (Row 117) → Acquired by Ares Management ~2014

---

## FINAL SHEET UPDATE BATCH

**Immediate Updates (4 Verified + 1 Dead = 5 Total):**

| Row | Company | Contact Name | Title | Email | LinkedIn | Status | Notes |
|-----|---------|-------------|-------|-------|----------|--------|-------|
| 696 | 3G Capital | Alex Behring | Co-Founder & Co-Managing Partner | abehring@3g-capital.com | | Enriched | Source: ContactOut verified. Major PE firm (Kraft Heinz, Burger King). Co-manages with Daniel Schwartz. |
| 699 | Alta Park Capital, LP | Bijan Modanlou | Founder | bijan@altaparkcapital.com | | Enriched | Source: ContactOut verified. TMT-focused investment firm, San Francisco. |
| 706 | Arctaris Impact Investors | Jonathan Tower | Founder & Managing Partner | jonathan@arctaris.com | https://www.linkedin.com/in/jonathan-tower/ | Enriched | Source: ContactOut. Boston-based impact investor, founded 2009, Opportunity Zone focus. |
| 716 | Bloom Equity Partners | Bart Macdonald | Managing Partner & Founder | bart@bloomequitypartners.com | https://www.linkedin.com/in/bart-macdonald-ea2adf5c | Enriched | Source: TheNetwork.com. Tech-focused PE, NYC, lower-middle market software/tech-enabled services. |
| 117 | Keltic Financial Partners | | | | | Dead | Acquired by Ares Management ~2014 (confirmed: ABL Advisor, Law360, The Middle Market). |

---

## HOURLY RUN SUMMARY

**Goal:** Enrich 10-15 leads with verified contacts  
**Achieved:** 4 ENRICHED + 1 DEAD = 5 firms processed with verified data

**Time Spent:** ~60 minutes  
**Sources Used:**
- ContactOut (primary verification source)
- TheNetwork.com
- Success.ai
- Company websites (team pages)
- RocketReach, Apollo.io (cross-reference)
- News sources for M&A validation

**Quality:** All 4 enriched contacts have PUBLISHED verified emails from reputable data sources (ContactOut, TheNetwork.com). No guessed patterns or hallucinated emails.

---

**Status:** 7/184 researched → **4 ENRICHED** with verified emails + **1 marked DEAD**

**Next hourly run targets:**
- Complete verification for Jett Capital (Joseph Riggio) and BDT & MSD (Byron Trott)
- Continue with remaining partial firms: Ancor, Arctaris, Atlanta Capital, Atlantic Street, etc.
- Target: Add 8-10 more verified contacts next hour
