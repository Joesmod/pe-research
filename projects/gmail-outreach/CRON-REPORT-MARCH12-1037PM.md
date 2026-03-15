# PE Research & Enrichment - Hourly Cron Report
**Date:** March 12, 2026 - 10:37 PM (America/Chicago)
**Task:** Enrich 10-15 leads with empty Contact Name or generic emails

## Status: ⚠️ BLOCKED - Apollo API Issues

### Problem
Apollo.io API endpoints are returning 422 errors:
- `/v1/mixed_people/search` → DEPRECATED
- `/api/v1/mixed_people/search` → DEPRECATED  
- Error message: "This endpoint is deprecated for API callers. Please use the new mixed_people/api_search endpoint"

The API documentation appears to have changed, and the current API key may need updated permissions or endpoint access.

### Leads Identified for Enrichment
**Total needing enrichment:** 95 firms  
**Priority targets:** Mid-market PE firms ($500M-$5B AUM)

Sample firms needing enrichment:
1. Thomas H. Lee Partners (MD: Ganesh Rao, Josh Nelson, Megan Preiner)
2. Wynnchurch Capital 
3. Bow River Capital
4. Pritzker Private Capital
5. JMI Equity
6. CORE Industrial Partners
7. Littlejohn & Co.
8. Silver Oak Services Partners
9. Prospect Capital Management
10. Tritium Partners

### Manual Research Findings
**Thomas H. Lee Partners:**
- Managing Directors identified:
  - Ganesh Rao (Head of Financial Technology & Services)
  - Josh Nelson (Healthcare)
  - Megan Preiner (Healthcare)
  - Gazal Sikand
- Email pattern appears to be: [name]@thl.com
- Website: thl.com
- $50B+ equity capital managed

### Recommendations

#### Option 1: Fix Apollo API Access
- Contact Apollo support to update API endpoint access
- Verify API key has permissions for new endpoints
- Test with updated API documentation

#### Option 2: Manual Enrichment
- Research firms individually using:
  - Company team/about pages
  - LinkedIn (site:linkedin.com "firm name" "managing partner")
  - Press releases and news articles
  - SEC filings (for public portfolio companies)
- Document sources in Notes column
- Slower but reliable for verified contacts

#### Option 3: Alternative Data Providers
- RocketReach (has Thomas H. Lee Partners data)
- ZoomInfo
- Clearbit
- Hunter.io (email verification)

### Next Actions
1. **Immediate:** Escalate Apollo API issue to Alex
2. **Short-term:** Begin manual enrichment of top 5-10 priority firms
3. **Medium-term:** Research alternative contact data APIs

### Files Created
- `enrich-apollo-fixed-march12.js` - Updated script (blocked by API)
- `CRON-REPORT-MARCH12-1037PM.md` - This report

**Enriched this run:** 0 leads  
**Reason:** Apollo API endpoint deprecated/blocked
