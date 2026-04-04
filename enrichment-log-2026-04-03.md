# PE Lead Enrichment Log - 2026-04-03 22:13 CST

## Research Summary

Researched 53 leads from Google Sheet needing enrichment. **Primary finding: Most mid-market PE firms do not publish individual contact emails on official sources.**

## Firms Researched

### Trivest Partners (Coral Gables, FL)
- **Status**: Email pattern verified by LeadIQ/ContactOut but NOT published on official site
- **Email Pattern**: FLast@trivest.com (per LeadIQ)
- **Key Contacts Found**:
  - Forest Wester - Managing Partner, Mid-Market
  - Dave Gershman - Managing Partner, General Counsel
  - Jamie Elias - Managing Partner, TGIF
  - Russ Wilson - Managing Partner, Discovery
- **Source**: https://www.trivest.com/team/
- **Note**: Firm general email only: info@trivest.com
- **Recommendation**: Pattern exists but cannot verify without using 3rd party data aggregators (ContactOut/RocketReach)

### Svoboda Capital Partners
- **Status**: No emails published on official website
- **Key Contacts Found**:
  - Andrew B. Albert
  - Thomas G. Brooker - Managing Director & Operating Partner
  - David B. Rubin
  - John A. Svoboda
- **Source**: https://svoco.com/our-team/
- **Note**: ContactOut claims tbrooker@svoco.com but not verified from official source
- **Recommendation**: Cannot enrich without 3rd party verification

### Silver Oak Services Partners (Evanston, IL)
- **Status**: No emails published on official website
- **Key Contacts Found**:
  - Daniel M. Gill - Managing Partner
  - Gregory M. Barr - Managing Partner
  - Wade D. Glisson - Managing Partner
  - Danielle Lalli Glines - Partner
  - Andrew S. Gustafson - Partner
  - Daniel B. Wellman - Partner
- **Source**: https://www.silveroaksp.com/team
- **Note**: Team page shows titles but no individual contact info
- **Recommendation**: Cannot enrich without 3rd party verification

### Pritzker Private Capital
- **Status**: No emails published (noted in sheet already)
- **Key Contact**: Tony Pritzker - Chairman & CEO
- **Note**: High-profile family office, very locked down

### Resilience Capital Partners
- **Status**: Minimal public info
- **Note**: Co-Founders mentioned but no verified contacts

### Monomoy Capital Partners (Greenwich, CT / NYC)
- **Status**: Large team (80+ people) but no individual emails published
- **Source**: https://www.mcpfunds.com/people/
- **Note**: General email: info@mcpfunds.com

## Apollo API Issues
- Attempted to use Apollo.io API (key: Fx6RpQS0PKxfVgnxWOPWuw)
- All requests returned 422 errors
- Likely issue with request format/parameters
- **Recommendation**: Debug Apollo API integration or switch to manual research

## Key Findings

1. **Industry Standard**: Most PE firms deliberately do NOT publish individual emails
2. **Common Pattern**: Firms publish general emails (info@, ir@, contact@) only
3. **Data Aggregators**: ContactOut, RocketReach, ZoomInfo have email data but these are NOT official sources
4. **Verification Gap**: Cannot meet "official published sources only" requirement for most firms

## Next Steps

### Option A: Relax "Official Source" Requirement
- Allow verified 3rd party data (ContactOut/RocketReach) if pattern is confirmed
- Document source clearly in Notes column
- Update ~10-15 leads with pattern-based emails

### Option B: Focus on Findable Contacts
- Search for PE firms that DO publish emails (rare)
- Focus on firms with PDFs, SEC filings, press releases containing emails
- Add net-new firms instead of enriching existing hard-to-verify leads

### Option C: Use Generic Firm Emails
- Update leads with confirmed general emails (info@, contact@)
- Note these are firm-level, not individual contacts
- Lower quality but technically "published"

## Recommendation
Combination of B + note existing research in sheet. Update Notes column for researched firms with "Researched 2026-04-03: No individual emails published on official sources. Pattern exists (3rd party) but not verified."
