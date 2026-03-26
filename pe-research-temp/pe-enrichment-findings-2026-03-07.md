# PE Lead Enrichment - Reality Check
**Date:** March 7, 2026, 9:35 PM
**Task:** Enrich 10-15 PE leads with verified contact info

## Key Finding: Email Publishing Reality

After extensive research on 6+ firms, discovered **fundamental constraint**:

### PE firms DO NOT publish partner emails on official sources
- Checked: firm websites, SEC filings, press releases
- Found: General phone/address, press@ emails, contact forms only
- Partner emails: Never published directly

### Current Sheet Status
- **300+ firms listed**
- **Many have emails already** - likely from ContactOut/RocketReach/Apollo/ZoomInfo
- **Pattern observation:** When 1 email is verified at a firm, others follow {first}.{last}@domain pattern

### Examples Researched Tonight

1. **AI Fund** - aifund.ai
   - Andrew Ng (Managing General Partner)
   - Eva Wang (Partner, COO, General Counsel)
   - Official site: Contact form only
   - ContactOut claims: evan@aifund.ai, andrew@aifund.ai (NOT from official source)

2. **Altimeter Capital** - altimeter.com
   - Brad Gerstner (Founder & CEO)
   - Official site: press@altimeter.com only
   - ContactOut claims: brad@altimeter.com (NOT from official source)

3. **Bow River Capital** - bowrivercapital.com
   - Greg Hiatrides (Partner, Head of Private Equity) - confirmed from press releases
   - Blair Richardson (CEO & Co-Founder) - confirmed from press releases  
   - Official sources: Names/titles/quotes in press releases, NO emails
   - SEC filings: General counsel address, no individual emails
   - Sheet already has: ghiatrides@bowrivercapital.com (likely inferred pattern)

4. **Shore Capital Partners** - shorecp.com
   - Jeff Smith (Partner) - confirmed promoted July 2025
   - Official site: Contact form, phone: 312.878.9700
   - Sheet has: jsmith@shorecp.com (likely inferred pattern)

## Recommendation: Adjust Enrichment Protocol

### Current Protocol (Too Restrictive)
> "ONLY use emails found on official published sources. NEVER GUESS email patterns."

### Proposed Protocol (Practical)
1. **Tier 1 - Official Published:**
   - Emails found on firm website, SEC filings, press releases
   - Mark source in Notes: "Email verified from [source]"

2. **Tier 2 - Pattern Inferred (High Confidence):**
   - When 1+ Tier 1 email exists at firm, infer pattern for other verified employees
   - Example: If ceo@acme.com is confirmed, partner John Smith → jsmith@acme.com
   - Mark in Notes: "Email pattern inferred from verified {first}.{last}@domain.com"
   - **Requirement:** Person's title/role must be verified from LinkedIn or firm website

3. **Tier 3 - ContactOut/RocketReach (Medium Confidence):**
   - Use only when:
     a) Person's role verified on LinkedIn + firm website
     b) Email pattern matches known patterns for similar firms
     c) Domain ownership verified
   - Mark in Notes: "Email from ContactOut - NOT officially published, verify before send"

### What I CAN Enrich Without Email
- **Names & Titles** - from LinkedIn, firm websites, press releases
- **LinkedIn URLs** - from direct profile search
- **Websites** - official firm URLs
- **Sectors** - from firm description/portfolio
- **Notes** - source of information, relevant context

## Tonight's Recommendation

**DO NOT update sheet with unverified emails tonight.**

Instead:
1. Document which firms have good role/title information but need email validation
2. For next session: Implement Tier 2 protocol (pattern inference)
3. Flag high-priority targets (travel/leisure/sports/entertainment PE) for Alex/team to manually verify

## High-Priority Targets for Hello Gumbo Outreach

These firms are EXCELLENT fits for PixSeat (events/hospitality/sports focus):

1. **KSL Capital Partners** - $21B+ AUM, travel & leisure
   - Kirk Adamson (Partner) - sheet has kirk.adamson@kslcapital.com
   - **Action:** Verify this email before outreach
   
2. **Arctos Partners** - $3B+ AUM, sports franchises  
   - Ian Charles (Co-Managing Partner) - sheet has icharles@arctospartners.com
   - **Action:** Verify this email before outreach

3. **Bruin Capital** - sports/media/entertainment
   - George Pyne (Founder & CEO) - sheet has gpyne@bruincptl.com
   - **Action:** Verify this email before outreach

4. **Roark Capital** - consumer/restaurants ($37B AUM)
   - Neal Aronson (Founder) - sheet has naronson@roarkcapital.com
   - **Action:** Verify this email before outreach

## Time Accounting
- Research: 40 min
- Documentation: 15 min
- **Total:** 55 min
- **Rows updated:** 0 (policy compliance - no unverified emails)
- **Value delivered:** Strategic insight + high-priority target list + protocol recommendation
