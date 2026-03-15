# PE Enrichment Findings - March 10, 2026 @ 11:36 PM

## Executive Summary
- **Leads needing enrichment:** 39 total (only 4 are actual PE firms with "Partial" status)
- **Firms researched:** 4 (Constitution Capital, D1 Capital, Dhanani PE Group, Drive Capital)
- **Direct emails found from published sources:** 0
- **Apollo API enrichment:** Limited by API tier (no email access without enrichment credits)
- **Recommendation:** Use manual Apollo web search OR relax source requirements to include third-party verified data

---

## Key Constraint: The "Published Source" Problem

### The Reality
Mid-market PE firms intentionally do NOT publish direct email addresses on their websites. This is by design — they control inbound flow through:
- Generic inbound emails (info@, admin@, invest@)
- Contact forms
- Main office phone numbers
- LinkedIn InMail

### What We Found

| Firm | Website | Team Page | Direct Emails Published |
|------|---------|-----------|------------------------|
| Constitution Capital Partners | ✅ concp.com | ✅ Yes | ❌ No (info@concp.com only) |
| D1 Capital Partners | ❌ No public site | ❌ No | ❌ No |
| Dhanani Private Equity Group | ✅ dhananipeg.com | ✅ Yes | ❌ No (admin@, invest@ only) |
| Drive Capital | ✅ drivecapital.com | ✅ Yes | ❌ No (apply@drivecapital.com only) |

### Third-Party Data Available (Not "Published")
- **RocketReach:** Email patterns for all 4 firms (e.g., v******@gmail.com for Vil Ramos)
- **ZoomInfo:** Partial email patterns (e.g., n***@dhananipeg.com)
- **ContactOut:** Multiple email suggestions for Drive Capital
- **Apollo API:** Can identify contacts but requires enrichment credits for actual emails

---

## Apollo API Findings

### What Works
✅ `/api/v1/mixed_people/api_search` endpoint returns contact metadata:
- First names (last names obfuscated)
- Titles
- Flags: `has_email`, `has_direct_phone`, `has_city`, `has_state`
- Company affiliation

### What Doesn't Work (Free Tier)
❌ Actual email addresses
❌ Full names
❌ Phone numbers  
❌ LinkedIn URLs

**Example Output:**
```
Constitution Capital Partners: 10 contacts found
- Managing Director (first_name: "Timothy", last_name_obfuscated: true, has_email: true)
- Managing Director (first_name: "Fraser", last_name_obfuscated: true, has_email: true)
- Partner (first_name: "Peter", last_name_obfuscated: true, has_email: true)
```

### Solution Required
To get actual emails from Apollo, need to:
1. Use Apollo web interface (not API) to manually enrich
2. Purchase Apollo credits for API enrichment
3. Use existing Apollo account (if available) via web scraping/automation

---

## Recommendations for Next Enrichment Run

### Option A: Manual Apollo Web Enrichment (Recommended)
1. Log into Apollo.io web interface
2. Search for each firm by domain
3. Export contacts with verified emails
4. Update Google Sheet manually or via script
5. **Pros:** Verified emails, can select best contacts
6. **Cons:** Manual work, not fully automated

### Option B: Relax "Published Source" Requirement
1. Use RocketReach/ZoomInfo/ContactOut data
2. Document source in Notes column: "Email pattern from RocketReach (not verified)"
3. Mark status as "Enriched - Unverified"
4. **Pros:** Automated, scalable
5. **Cons:** Lower confidence, may have deliverability issues

### Option C: Generic Email + LinkedIn Strategy
1. Update sheet with generic firm emails (info@, invest@)
2. Add LinkedIn profile URLs
3. Mark for "LinkedIn outreach" vs email outreach
4. **Pros:** All data from published sources
5. **Cons:** Lower conversion rates (generic emails, InMail limits)

### Option D: Phone + Address Outreach
1. Add main office phone numbers (publicly available)
2. Add mailing addresses
3. Mark for "Phone/Mail outreach"
4. **Pros:** Published data, differentiated approach
5. **Cons:** Slower, higher effort

---

## New Firms to Add (Secondary Task)

### Firm Identified: Bow River Capital
- **Website:** https://www.bowrivercapital.com
- **AUM:** ~$2.5B+
- **Location:** Denver, Colorado
- **Focus:** Healthcare services, industrial services, infrastructure, tech-enabled business services, software growth equity
- **Fits Criteria:** ✅ $500M-$5B AUM, ✅ Services-heavy
- **Next Step:** Research team page for decision-makers

### Additional Firms to Research (Next Run)
1. **Lee Equity Partners** - Mid-market, mentioned in GrowthCap 2025 top firms
2. **JMI Equity** - Software-focused, ~$8B AUM (slightly above range but strong services focus)
3. **Gauge Capital** - Portfolio ops, tech-enabled services
4. **Additional:** Search PrivateEquityList.com for services-focused mid-market firms

---

## Files Created This Run
1. `/projects/gmail-outreach/enrichment-targets-march10-1136pm.json` - All 39 leads needing enrichment
2. `/projects/gmail-outreach/enrichment-cron-report-march10-1136pm.md` - Initial analysis
3. `/projects/gmail-outreach/apollo-enrich-march10.js` - Apollo API enrichment script
4. `/projects/gmail-outreach/ENRICHMENT-FINDINGS-MARCH10-1136PM.md` - This file

---

## Next Actions

**Immediate (Next Cron Run):**
1. Use Apollo web interface to manually enrich 4 "Partial" firms
2. Add Bow River Capital + 2-3 more new firms
3. Update Google Sheet with findings
4. Commit to GitHub: pe-research/PE-firms/ dossiers

**Strategic (Discuss with Alex):**
1. Determine acceptable source standards (published only vs. verified third-party OK?)
2. Purchase Apollo credits if systematic enrichment needed
3. Consider LinkedIn automation for firms without direct emails
4. Evaluate cold calling strategy for high-priority targets

---

**Report Generated:** March 10, 2026 @ 11:50 PM CST  
**Researcher:** Jim (AI Sales Research Agent)  
**Next Cron:** March 10, 2026 @ 12:36 AM CST (1 hour)
