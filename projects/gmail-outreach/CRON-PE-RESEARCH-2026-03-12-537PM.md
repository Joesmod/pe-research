# PE Research & Enrichment - Hourly Run
**Date:** 2026-03-12  
**Time:** 5:37 PM CST  
**Task:** Enrich 10-15 leads with empty/generic contacts

## Summary

**Total leads analyzed:** 1,062  
**Leads needing enrichment:** 16  
**Unique firms:** ~5 (Sverica, WindPoint, Mercury Fund, others)

## Research Findings

### Challenge: No Public Direct Emails
Most PE firms do NOT publish direct email addresses on their official websites. They use:
- Contact forms only
- Generic emails (info@, ir@, contact@)
- No individual email formats published

### Firms Researched

#### 1. **Sverica Capital Management** (6 rows with Jordan Richards)
- **Current:** info@sverica.com (generic)
- **Contact:** Jordan Richards, Managing Partner
- **Website:** https://sverica.com
- **Team page:** https://sverica.com/team/ (24 people listed)
- **Finding:** NO direct emails published on official site. Only contact form at sverica.com/contact
- **Third-party hints:** RocketReach shows j******@sverica.com pattern, but not verified from official source
- **Status:** ❌ Cannot enrich - no official source for direct email

#### 2. **WindPoint Partners** (3 rows with Nathan Brown)
- **Current:** Empty
- **Contact:** Nathan Brown, Managing Director
- **Website:** wppartners.com
- **Finding:** Team confirmed at wppartners.com/our-team/, but NO public emails
- **Notes already state:** "Email pattern @wppartners.com but no public direct email available"
- **Status:** ❌ Cannot enrich - no official source

#### 3. **Mercury Fund** (1 row with Blair Garrou)
- **Current:** blair@mercuryfund.com (already has direct email)
- **Contact:** Blair Garrou, Managing Partner
- **Website:** mercuryfund.com
- **Finding:** ContactOut lists blair@mercuryfund.com and blair@dfjmercury.com
- **Status:** ⚠️ Already has email (marked as "generic" but it's actually direct)

#### 4. **Other contacts with missing data:**
- Row 324: Paul Carbery - no company listed
- Row 630: Danielle [undefined] - incomplete data
- Rows 801, 808, 909, 910: Jacob Zodikoff - no email, need company name
- Row 1061: Kevin Gearheart - no email, need company name

## Policy Constraints

Per task instructions:
✅ **ALLOWED:** Use emails found on official published sources (team pages, press releases, SEC filings, published PDFs)
❌ **NOT ALLOWED:** Guess email patterns, use unverified third-party databases

## Outcome

**Enriched:** 0 leads  
**Reason:** No PE firms in this batch publish direct emails on their official websites

## Recommendations

1. **Mercury Fund (Row 763)**: Change status from "Generic email" to "Enriched" - blair@mercuryfund.com is a direct email, not generic
2. **Sverica & WindPoint**: These firms use contact forms only. Options:
   - Mark as "No Public Contact" (already done for WindPoint)
   - Use Apollo.io API to enrich (verified business contact database)
   - Skip and focus on firms with published contacts
3. **Incomplete rows (630, 801, 808, 909, 910, 1061)**: Need company names before research can begin

## Next Steps

**Option A:** Use Apollo.io API for enrichment (has verified PE contacts)  
**Option B:** Search for firms with smaller, transparent team pages that list emails  
**Option C:** Add 3-5 new firms to the pipeline with better public contact visibility

Time spent: ~20 minutes research across 5 firms  
Result: Zero enrichable leads due to lack of official public contact data
