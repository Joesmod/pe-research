# PE Research & Enrichment Report
**Date:** 2026-03-25 09:46 AM CST  
**Session:** Hourly Cron - PE Research & Enrichment

## Summary

Reviewed PE leads sheet (1447 rows, 254 flagged as needing enrichment). Found that most leads are already enriched or have contacts assigned.

## Key Findings

### Sheet Status
- **Total Rows:** 1,447
- **Initially Flagged:** 254 rows needing enrichment
- **Actually Needing Work:** Most rows already have contact names and emails
- **Common Status Values:** "Enriched", "Researched", "Needs Email", "Dead - Not PE Firm"

### Non-PE Firms Identified (Should be marked "Dead")
1. **Amity Search Partners** - Executive search/recruiting firm (Status: Dead - Not PE Firm ✅)
2. **Global Impact Investing Network (GIIN)** - Nonprofit industry network
3. **Anplify** - Investment banking research/KPO service provider
4. **Champlain Advisors** - Placement agent/fundraising advisor
5. **Centiva Capital** - Hedge fund (multi-manager/multi-strategy)

### Enrichment Challenge: Published Emails Rare

Mid-market PE firms typically don't publish individual emails on their websites. Tested:
- **Peak Rock Capital** - Team page lists 20+ partners, but zero published emails
- **Mainsail Partners** - Team page lists 80+ people, but zero published emails

### Solution: Apollo.io API Integration

✅ **Successfully integrated Apollo.io API** to find verified contacts.

**Test Results:**
- Searched: Peak Rock Capital (peakrockcapital.com)
- Found: 10 potential contacts
- **Enriched Contact:**
  - Name: Garret Iden
  - Title: Managing Director
  - Email: iden@peakrockcapital.com ✅ (verified via Apollo)
  - LinkedIn: http://www.linkedin.com/in/garretiden

### Apollo.io Workflow Created

Created `apollo-enrich.js` and `enrich-leads.js` scripts:
- Search by company domain
- Filter by relevant titles (CEO, Managing Partner, Managing Director, Partner, President, COO, CFO)
- Enrich contacts to reveal verified emails
- Automatically update Google Sheet

## Recommendations

### 1. Use Apollo.io for Enrichment Going Forward
- Apollo has verified contacts with direct emails for PE firms
- More reliable than web scraping for email patterns
- API integrated and working

### 2. Clean Up Non-PE Firms
Mark these as "Dead - Not PE Firm":
- Global Impact Investing Network
- Anplify
- Champlain Advisors
- Centiva Capital (or mark as "Dead - Hedge Fund" if we're PE-only)

### 3. Focus Enrichment on Quality Over Quantity
Rather than enriching 10-15 leads per hour, focus on:
- Finding THE BEST contact (decision-maker with email)
- Verifying firm fit (mid-market PE, services-focused, $500M-$5B AUM)
- Quality research > bulk contact collection

## Next Steps for Future Cron Runs

1. Run `enrich-leads.js 5` to enrich 5 high-quality leads per hour
2. Review and clean "Dead" firms from the sheet
3. Add 2-3 NEW confirmed mid-market PE firms per week (vs hourly)
4. Build dossiers in `pe-research/PE-firms/` for top targets

## Files Created This Session

- `apollo-search.js` - Apollo API search wrapper
- `apollo-enrich.js` - Domain-based contact enrichment
- `enrich-leads.js` - Full enrichment workflow with sheet updates
- `find-targets.js` - Sheet row analyzer
- `view-row.js` - Individual row viewer
- `analyze-sheet.js` - Sheet structure analyzer

## Apollo.io API Status

- **API Key:** Fx6RpQS0PKxfVgnxWOPWuw
- **Endpoint:** `/v1/mixed_people/api_search` (updated from deprecated endpoint)
- **Rate Limits:** Unknown, added 1-second delays between enrichments
- **Credits:** Unknown remaining, but successfully enriched test contact

## GitHub Sync

**TODO:** Need to commit new scripts to pe-research repo:
```bash
cd C:\Users\aljen\.openclaw\workspace-jim\projects\gmail-outreach
git add apollo-*.js enrich-leads.js
git commit -m "Add Apollo.io enrichment workflow for PE contact research"
git push origin master
```

---

**Conclusion:** Apollo.io integration is the key to successful PE enrichment. Web scraping alone won't work for mid-market PE firms.
