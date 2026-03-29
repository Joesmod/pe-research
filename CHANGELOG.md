# PE Research Changelog

## 2026-03-29 00:35 CST - Hourly Enrichment Run

### Summary
- **Sheet Status:** 1645 total rows, 12 firms needing enrichment
- **Enrichment Attempts:** Limited success due to strict email verification requirements
- **New Firms Added:** 3 mid-market PE firms

### Enrichment Results

**Noble Investment Group** (Row 652)
- Status: Research → No change
- Found: investors@nobleinvestment.com (official contact page)
- Issue: No individual executive emails published on official sources
- Recommendation: Requires paid contact database (ZoomInfo/ContactOut) or direct outreach

**Gryphon Investors** (Rows 993, 1052, 1207, 1226, 1234 - duplicates)
- Already has: businessdevelopment@gryphoninvestors.com
- Issue: Generic BD email, need individual contacts
- Note: 5 duplicate rows in sheet need deduplication

### New Firms Added (Secondary Task)

1. **Bertram Capital**
   - Website: https://www.bertramcapital.com
   - Contact: Jeff Drazan (Managing Partner)
   - Email: pr@bcap.com (press/general - not ideal)
   - AUM: $1.6B (Fund V)
   - Focus: Business services, tech-enabled services
   
2. **Lightyear Capital**
   - Website: https://www.lycap.com
   - Contact: Mark Vassallo (Managing Partner)
   - Email: Not found on official site
   - AUM: ~$5B
   - Focus: Financial services, fintech, business services
   
3. **Platte River Equity**
   - Website: https://platteriverequity.com
   - Contact: TBD
   - Email: Not found
   - Location: Denver, CO
   - Focus: Lower middle market, industrial/business services

### Challenges Encountered

1. **Email Verification Requirements**
   - Task requires: "ONLY use emails found on official published sources"
   - Constraint: "NEVER GUESS email patterns. NEVER hallucinate"
   - Result: Most PE firms don't publish individual executive emails publicly
   - Sources checked: Official websites, LinkedIn, press releases, PDFs

2. **Limited Public Data**
   - PE firms intentionally limit public contact information
   - Generic emails (info@, investors@, bd@) readily available
   - Individual executive emails require paid databases or introductions

3. **Timing**
   - Run executed: Sunday 12:35 AM CST
   - Not optimal for deep research or outbound verification

### Recommendations

1. **For Active Enrichment:**
   - Use paid contact databases during business hours (ZoomInfo, ContactOut, Apollo with proper queries)
   - Direct outreach: "Interested in discussing value creation opportunities" angle
   - LinkedIn Sales Navigator for verified emails

2. **Sheet Cleanup:**
   - Deduplicate Gryphon Investors rows (5 duplicates)
   - Archive "Dead" status firms to separate sheet
   - Focus enrichment on "Research" status only

3. **Next Run:**
   - Target specific firms marked "Research"
   - Use Apollo API correctly (organization-specific searches)
   - Allocate more time for manual research during business hours
