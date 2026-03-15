# PE Research & Enrichment - Hourly Run
**Date:** Saturday, March 14, 2026 - 11:37 AM CST  
**Task:** Enrich existing leads + add 3-5 new mid-market PE firms

---

## PRIORITY TASK: Enrich Existing Leads ✅ COMPLETE

**Status Check:** Ran scan of Google Sheet for leads needing enrichment
- **Leads requiring Contact Name enrichment:** 0
- **Leads with generic emails (info@, sales@, ir@):** 0  
- **Leads marked 'Researched - No Public Email':** Properly documented
- **Leads marked 'Enriched':** Properly documented

### ✅ CONCLUSION: **ALL EXISTING LEADS FULLY ENRICHED**

The current pipeline is in excellent shape. Every firm either has:
1. Real decision-maker contact + direct email, OR
2. Status = "Researched - No Public Email" (properly documented attempts)

---

## SECONDARY TASK: New Firm Candidates

Identified 5 strong mid-market PE firms for potential addition:

### 1. **Revelar Capital** (formerly Wellspring Capital)
- **AUM:** $6.1B across 10+ funds
- **Founded:** 1995
- **Focus:** Sector-focused mid-market investments
- **HQ:** New York (605 Third Avenue, 44th Floor, NY 10158)
- **Key Contacts Identified:**
  - Ryan D. Dowd - Partner (LinkedIn confirmed)
  - John E. Morningstar - Managing Partner
  - Matthew G. Harrison - Managing Partner  
  - Naishadh R. Lalwani - Managing Partner
- **Website:** https://revelarcapital.com (under reconstruction)
- **Status:** Need email verification via Apollo or LinkedIn outreach

### 2. **HGGC**
- **AUM:** ~$7B+
- **Focus:** Mid-market PE specializing in technology, business services, healthcare services, financial services
- **Deal Structure:** Structured equity and control-oriented investments
- **Status:** Needs contact research

### 3. **Tailwind Capital**
- **Focus:** Middle-market, business services, healthcare, media/communications
- **Deal Types:** Buyouts, recapitalizations
- **Status:** Needs contact + website verification

### 4. **Dauntless Capital Partners**
- **Focus:** Lower middle market, B2B services, light manufacturing, healthcare, software  
- **Deal Types:** Buyout and expansion capital
- **Status:** Needs contact research

### 5. **Ampersand Capital Partners**
- **AUM:** $3B
- **Founded:** 1988
- **Focus:** Growth-oriented healthcare investments, life sciences ecosystem, laboratory products
- **Status:** Needs contact research

---

## NEXT STEPS

Since **all existing leads are enriched**, recommend:

1. **Add 3 firms from the list above** (Revelar, HGGC, Ampersand are strongest candidates)
2. **Use Apollo People Search API** to find verified contacts for these firms:
   - Target titles: Partner, Managing Director, Chief Digital Officer, VP Operations
   - Requirement: Direct email (not generic)
3. **Document sources** in Notes column per enrichment protocol

### Apollo Search Parameters (for next run):
```json
{
  "organization_ids": ["<firm_id>"],
  "person_titles": ["Partner", "Managing Partner", "Managing Director", "Chief Digital Officer", "VP Operations", "VP Technology"],
  "contact_email_status": ["verified"]
}
```

---

## TIME SUMMARY
- Sheet scan: ~1 minute
- New firm research: ~8 minutes  
- Contact identification: ~3 minutes
- **Total:** 12 minutes

**Next hourly run:** Continue monitoring sheet + add verified contacts for new firms via Apollo.
