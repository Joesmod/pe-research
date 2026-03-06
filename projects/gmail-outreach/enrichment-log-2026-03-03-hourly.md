# PE Enrichment Log - 2026-03-03 11:06 PM (Hourly Cron)

## Summary
- **Attempted:** 15 firms
- **Successfully enriched:** 0
- **No verified contacts found:** 15
- **Reason:** Apollo API returned no results; manual web research found no publicly published direct emails

## Firms Researched (First 15 from unprocessed queue)

### 1. Thomas H. Lee Partners
- **Status:** DUPLICATE (already in sheet)
- **Research:** Apollo search yielded no results
- **Note:** Major PE firm, should have contacts available through other means

### 2. Alpha Partners
- **Website:** alphapartners.com
- **Research:** Found team page, but appears to be a VC/advisory network, not traditional PE
- **Apollo:** No results
- **Manual search:** No direct published emails found on official site

### 3. Arax Investment Partners
- **Website:** araxpartners.com
- **Type:** Wealth management platform (backed by RedBird Capital)
- **Key person:** Haig Ariyan (CEO)
- **Apollo:** No results
- **Manual search:** Found ContactOut listing with old email (MassMutual Trust), not current Arax email
- **Note:** NOT a PE firm - wealth advisory M&A platform

### 4. Cardea Group
- **Website:** thecardeagroup.com
- **Apollo:** No results
- **Note:** Likely advisory/search firm based on name

### 5. GTMfund
- **Website:** gtmfund.com
- **Apollo:** No results
- **Note:** Likely VC fund

### 6. Hark Capital
- **Website:** harkcap.com
- **Apollo:** No results

### 7. Healthcare Private Equity Association (HCPEA)
- **Website:** hcpea.org
- **Apollo:** No results
- **Note:** This is an ASSOCIATION, not a PE firm - should be removed from target list

### 8. HealthQuest Capital
- **Website:** healthquestcapital.com
- **Type:** LEGITIMATE healthcare growth equity/PE firm
- **Key person:** Garheng Kong (Founder & Managing Partner)
- **Apollo:** No results
- **Manual search:** Found "garheng@healthquestcapital.com" on ContactOut (database source, not official published source)
- **LinkedIn:** linkedin.com/in/garhengkong
- **Note:** Legitimate PE firm, but email only found in paid databases, not official press releases/website

### 9. Hildred Capital
- **Website:** hildred.com
- **Apollo:** No results

### 10. HOF Capital
- **Website:** hofcapital.com
- **Type:** VC firm, $1B AUM
- **Key people:** Hisham Elhaddad (Managing Partner), multiple partners listed
- **Apollo:** No results
- **Manual search:** Team page lists partners but no emails published
- **Note:** Legitimate VC firm, not mid-market PE

### 11. HRCap, Inc.
- **Website:** hrcap.com
- **Apollo:** No results
- **Note:** Likely HR/recruiting firm based on name

### 12. HSP - Henkel Search Partners
- **Website:** henkelsp.com
- **Apollo:** No results
- **Note:** This is a SEARCH/RECRUITING firm, not a PE firm - should be removed

### 13. Hunter Point Capital LP
- **Website:** hunterpointcapital.com
- **Type:** GP Stakes / secondary PE (provides capital to PE firms, not direct investing)
- **Key person:** Avshalom Kalichstein (CEO) per ContactOut
- **Apollo:** No results
- **Note:** Niche PE segment, legitimate but different from traditional PE

### 14. IEQ Capital
- **Website:** ieqcapital.com
- **Type:** Wealth advisory firm, $47B RAUM
- **Key people:** Rob Skinner, Alan Zafran, Eric Harrison (co-founders/managing partners)
- **Apollo:** No results
- **Note:** NOT a PE firm - wealth management/RIA backed by Stone Point Capital PE

### 15. Invictus Growth Partners
- **Website:** invictusgrowth.com
- **Type:** LEGITIMATE B2B software growth equity
- **Key people:** John DeLoche, William Nettles (co-founders)
- **Apollo:** No results
- **Manual search:** Found "john@invictusgrowth.com" on ContactOut (database source)
- **Note:** Legitimate growth equity firm

## Key Findings

1. **Apollo API Coverage Issue:** None of the 15 firms returned results from Apollo API, despite several being legitimate PE/VC firms

2. **Target List Quality Issues:** Approximately 30-40% of firms in the "New - Unresearched" queue are NOT private equity firms:
   - Wealth advisory/RIA firms (IEQ Capital, Arax)
   - Investment banks/M&A advisory (Jett Capital, Kaizen Equity)
   - Search/recruiting firms (HSP Henkel, M SEARCH)
   - Industry associations (HCPEA)
   - Marketing/services companies

3. **Email Source Problem:** The only emails found were in paid databases (ContactOut, RocketReach), not "official published sources" as required by enrichment guidelines

4. **Legitimate PE Firms Found:**
   - HealthQuest Capital (healthcare growth equity)
   - Invictus Growth Partners (B2B software growth)
   - Hunter Point Capital (GP stakes/secondary)
   - HOF Capital (VC, but not traditional PE)

## Recommendations

1. **Refine Target List:** Filter out non-PE firms before enrichment attempts
2. **Alternative Data Sources:** Consider LinkedIn Sales Navigator, PitchBook, or CB Insights for verified contacts
3. **Press Release Mining:** Set up systematic searches for firm announcements that include contact info
4. **Manual Outreach:** For top-priority firms, consider reaching out via general email (info@, contact@) to request appropriate contact
5. **Focus on Larger/More Established Firms:** Bigger PE firms tend to have better public information

## Next Steps

- Continue with next 15 firms in queue during next hourly run
- Consider manual deep-dive research for highest-priority legitimate PE firms
- Update target list to remove non-PE entities

---
**Cron Run Complete:** 2026-03-03 11:06 PM CST
**Time Spent:** ~25 minutes
**Results:** 0 enrichments (no verified official emails found)
