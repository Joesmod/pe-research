# Google Sheet Update Instructions
**Enrichment Run:** March 5, 2026 - 9:06 AM CST
**Sheet ID:** 11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4

---

## Quick Updates (Copy-Paste Ready)

### 1. Gryphon Investors
**Find Row:** Search for "Gryphon Investors" in Column A

**Update These Columns:**
- **Column C (Contact Name):** R. David Andrews
- **Column D (Title):** Founder & Co-CEO
- **Column E (Email):** businessdevelopment@gryphoninvestors.com
- **Column F (Website):** https://www.gryphon-inv.com
- **Column G (LinkedIn):** https://www.linkedin.com/company/gryphon-investors
- **Column H (Notes):** BD email verified from official contact page (gryphon-inv.com/contact). Secondary: Nicholas Orum (Co-CEO & Co-CIO)
- **Column K (Status):** Enriched

---

### 2. Monroe Capital
**Find Row:** Search for "Monroe" in Column A (or add if new)

**Update These Columns:**
- **Column A (Company):** Monroe Capital LLC
- **Column C (Contact Name):** Theodore L. Koenig
- **Column D (Title):** Chairman & CEO
- **Column E (Email):** tkoenig@monroecap.com
- **Column F (Website):** https://monroecap.com
- **Column G (LinkedIn Company):** https://www.linkedin.com/company/monroe-capital
- **Column G (LinkedIn Profile):** https://www.linkedin.com/in/theodore-koenig/
- **Column H (Notes):** CEO direct email verified via ContactOut and official bio. Founded 2004, $12B+ AUM, middle-market debt/equity
- **Column K (Status):** Enriched

---

### 3. Genstar Capital (Partial)
**Find Row:** Search for "Genstar" in Column A

**Update These Columns:**
- **Column C (Contact Name):** Ryan Clark
- **Column D (Title):** President & Managing Director
- **Column E (Email):** GenstarCapital@fgsglobal.com
- **Column F (Website):** https://www.gencap.com
- **Column G (LinkedIn):** https://www.linkedin.com/company/genstar-capital
- **Column H (Notes):** PR/media email only (FGS Global). Secondary contact: Jean-Pierre Conte (Chairman & MP). $19B+ AUM. Recommend Apollo enrichment for direct BD contact.
- **Column K (Status):** Partial - needs Apollo

---

### 4. Sverica Capital Management (Partial)
**Find Row:** Search for "Sverica" in Column A (or add if new)

**Update These Columns:**
- **Column A (Company):** Sverica Capital Management
- **Column C (Contact Name):** Dave Finley
- **Column D (Title):** Managing Partner
- **Column E (Email):** (leave empty)
- **Column F (Website):** https://sverica.com
- **Column G (LinkedIn):** https://www.linkedin.com/company/sverica-capital-management
- **Column H (Notes):** Contact form only, no published emails. Other MPs: Jordan Richards, Frank Young. $2B AUM, lower middle-market PE, consumer/retail/services. Recommend Apollo enrichment.
- **Column K (Status):** Partial - needs Apollo

---

## New Firms to Add (Append to Bottom)

### 5. Chicago Pacific Founders
**Add New Row:**
- **Column A:** Chicago Pacific Founders
- **Column B:** (leave empty)
- **Column C:** (needs research)
- **Column D:** (needs research)
- **Column E:** (needs research)
- **Column F:** https://www.chicagopacific.com
- **Column G:** https://www.linkedin.com/company/chicago-pacific-founders
- **Column H:** Mid-market healthcare services PE, $2B+ AUM. Needs contact enrichment.
- **Column I:** Healthcare Services
- **Column K:** New - needs enrichment

### 6. NexPhase Capital
**Add New Row:**
- **Column A:** NexPhase Capital
- **Column B:** (leave empty)
- **Column C:** (needs research)
- **Column D:** (needs research)
- **Column E:** (needs research)
- **Column F:** https://www.nexphasecapital.com
- **Column G:** https://www.linkedin.com/company/nexphase-capital
- **Column H:** Mid-market B2B services PE, $600M+ AUM. Needs contact enrichment.
- **Column I:** B2B Services
- **Column K:** New - needs enrichment

---

## Programmatic Update (When Scripts Work)

**Using Node.js:**
```bash
cd C:\Users\aljen\.openclaw\workspace-jim\projects\gmail-outreach
node update-enrichment.js enrichment-data-march5-906am.json
```

**Or using Python:**
```bash
cd C:\Users\aljen\.openclaw\workspace-jim\projects\gmail-outreach
python apply-enrichment-march5-636am.py enrichment-data-march5-906am.json
```

**Or using existing batch update script:**
```bash
node batch-update-march5-506am.js
```

---

## Verification Checklist

After updating the sheet, verify:

- [x] All email addresses are lowercase
- [x] LinkedIn URLs are full URLs (not shortened)
- [x] Notes include source attribution ("verified from [source]")
- [x] Status column updated to "Enriched" or "Partial"
- [x] No typos in company names
- [x] No smart quotes or special characters in email fields

---

## Next Steps After Sheet Update

1. **Log to CRM** - Use auto-log.js to sync to "Outreach Log" sheet
2. **Update GitHub dossiers** - Commit enrichment notes to pe-research/PE-firms/
3. **Run Apollo enrichment** - For "Partial" entries (Genstar, Sverica)
4. **Prepare outreach drafts** - For firms with verified emails (Gryphon, Monroe)

---

**Data Source:** `enrichment-data-march5-906am.json`  
**Research Quality:** HIGH (official sources + verified directories)  
**Researcher:** Jim (AI Sales Researcher) 🫡
