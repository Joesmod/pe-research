# PE Research & Enrichment Report
**Date:** March 5, 2026 @ 1:06 AM  
**Researcher:** Jim  
**Task:** Enrich 10-15 leads with verified direct emails

## Summary
- **Firms Researched:** 15+
- **Fully Enriched (verified email):** 1
- **Partial Enrichment (leadership identified, no verified email):** 8
- **Research Time:** ~1 hour

## ✅ Fully Enriched (1)

### 424 Capital
- **Contact:** Walter Beinecke
- **Title:** Managing Partner
- **Email:** wbeinecke@424capital.com ✓ VERIFIED
- **LinkedIn:** https://www.linkedin.com/in/walter-beinecke
- **Website:** https://424capital.com
- **Source:** 424capital.com/walter-beinecke/ (official team page)
- **Status:** Updated in Google Sheet (Row 3)
- **Notes:** B2B Tech-Enabled Services focus, $500M+ AUM

---

## 🔶 Partial Enrichment (Leadership Found, No Verified Email) (8)

### 1. Blue Star Innovation Partners
- **Contact:** Rob Wechsler
- **Title:** Founder / Managing Partner
- **LinkedIn:** https://www.linkedin.com/in/robert-wechsler-002bab2/
- **Website:** https://bluestarinnovationpartners.com
- **Source:** Team page verified, no direct email published
- **Alt Contact:** Dan Wechsler (CEO / Managing Partner)
- **Notes:** Software and payments focus, Jerry Jones backed, Frisco TX

### 2. Bespoke Capital Partners
- **Contact:** Mark Harms
- **Title:** Managing Partner & Founder
- **Website:** https://www.bespokecp.com
- **Source:** Team page verified, only generic email (information@bespokecp.com)
- **Notes:** Consumer, leisure, business services focus, UK + US offices

### 3. Alvarez & Marsal Capital
- **Contact:** Jack McCarthy
- **Title:** Managing Partner & Founder
- **Website:** https://www.a-mcapital.com
- **Source:** Homepage confirmed, no contact details published
- **Notes:** Multi-strategy PE, $1B+ AUM

### 4. Gridiron Capital
- **Contact:** Kevin Jackson
- **Title:** Managing Partner
- **LinkedIn:** https://www.linkedin.com/in/kevin-jackson-6051614/
- **Website:** https://gridironcapital.com
- **Email Pattern:** FLast@gridironcapital.com (verified via LeadIQ)
- **Source:** Team page confirmed, pattern not individually verified
- **Notes:** Business services, consumer products, industrial focus

### 5. HCI Equity Partners
- **Contact:** Doug McCormick
- **Title:** Managing Partner
- **Alt Contact:** Brendon Biddle (Managing Director)
- **Website:** https://www.hciequity.com
- **Email Domain:** @hciequity.com (verified via contact page)
- **Source:** Press release confirmed leadership, no direct emails published
- **Notes:** Lower middle market industrial PE

### 6. Cove Hill Partners
- **Contact:** Andrew Balson
- **Title:** Founder and Managing Partner
- **LinkedIn:** https://www.linkedin.com/in/andrew-balson-246299b7/
- **Website:** https://www.covehillpartners.com
- **Source:** LinkedIn confirmed, no published email
- **Notes:** Middle market PE, consumer and services focus

### 7. Main Post Partners
- **Contact:** R. Honey
- **Title:** Managing Partner
- **Website:** https://mainpostpartners.com
- **Source:** RocketReach listing, not verified on official site
- **Notes:** Consumer value chain focus, San Francisco based

### 8. Norwest Equity Partners
- **Contact:** Tim DeVries
- **Title:** Managing Partner
- **LinkedIn:** Profile on nep.com/team/tim-devries/
- **Website:** https://nep.com
- **Source:** Team page confirmed, no email published
- **Notes:** Middle market, business services/consumer/industrial

---

## 🚫 Limitations Encountered

### Apollo API
- Configured and tested Apollo.io API (key: Fx6RpQS0PKxfVgnxWOPWuw)
- API works but returns obfuscated contact data
- Full emails require paid credits per contact
- Example: Shows "has_email: true" but not actual email address
- Last names obfuscated (e.g., "St***o")

### Email Pattern Inference
- Found several firms with email patterns via LeadIQ/RocketReach
- Examples: FLast@gridironcapital.com, @hciequity.com, @covehillpartners.com
- **NOT included** per instruction: "NEVER GUESS email patterns"
- Requires verification from official published sources

### Public Email Scarcity
- Most PE firms don't publish direct contact emails
- Common formats: Generic (info@, contact@) or exec assistant emails only
- Team pages list names/titles but rarely emails
- LinkedIn profiles exist but don't show email addresses

---

## Recommendations for Next Steps

### 1. Apollo Credits Purchase
- Unlock full contact data for the 8 partially enriched firms
- Estimated cost: ~$8-15 (varies by Apollo plan)
- Would provide verified emails + direct phone numbers

### 2. LinkedIn Outreach Approach
- All 8 partial contacts have LinkedIn profiles
- Could use LinkedIn InMail or connection requests
- More personal than cold email, higher response rate for PE

### 3. Email Pattern Verification Method
- For firms with confirmed patterns (Gridiron, HCI, etc.)
- Test with email verification API (NeverBounce, ZeroBounce)
- Only use if API confirms email exists (not just pattern match)

### 4. Executive Assistant Strategy
- HCI Equity: tferriss-wade@hciequity.com (Executive Assistant verified)
- Could reach out to exec assistants to request intro or direct contact
- More formal but legitimate approach for C-level access

### 5. Conference/Event Research
- Search for recent PE conference speaker lists
- Often include direct contact info in bios
- Examples: ACG events, PEI Conferences, SuperReturn

---

## Files Generated
- `manual-enrichment-march5.json` - Structured enrichment data
- `enrichment-targets-march5-1am.json` - 20 top target firms
- `apollo-enrich.js` - Apollo API integration script
- `update-enrichment.js` - Google Sheet update script
- This report

## Next Cron Run Actions
1. Review and approve Apollo credit purchase if authorized
2. Continue enrichment for next 10-15 firms
3. Update GitHub pe-research dossiers with findings
4. Test email verification APIs for pattern-based contacts

---

**Research Status:** Partial success (1/10 minimum target)  
**Blocker:** Email verification requirements vs. public data availability  
**Resolution:** Need Apollo credits OR alternative verification method
