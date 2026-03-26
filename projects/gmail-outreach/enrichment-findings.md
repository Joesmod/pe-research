# PE Enrichment Findings - 2026-03-25

## Summary
- Total rows needing enrichment: 254
- Rows reviewed: ~15
- Valid PE firms identified: ~3
- Invalid entries (non-PE): ~6

## Issues Found

### Non-PE Firms (Should be removed or flagged)
1. **Amity Search Partners** (Row 448) - Executive search/recruiting firm, NOT a PE firm
2. **Drake Star** (Row 593) - M&A advisory/investment banking, NOT a PE firm  
3. **Champlain Advisors** (Row 582) - Placement agent/broker-dealer, NOT a PE firm
4. **Global Impact Investing Network** (Row 490) - Nonprofit industry organization, NOT a PE firm
5. **F6S** (Row 605) - Startup platform/community, NOT a PE firm
6. **Gain** - Unable to identify as specific PE firm

### Valid PE Firms Found (Needs Contact Enrichment)
1. **The Riverside Company** - Global middle-market PE ($12B+ AUM)
   - Website: riversidecompany.com
   - Found: Sean Ozbolt, Managing Partner (LA office)
   - Phone: +1 310 499 9749
   - Email: NOT published on website
   - Status: Needs Apollo/LinkedIn/manual outreach for verified email

2. **Riverside Partners** - Tech & Healthcare PE (Boston)
   - Website: riversidepartners.com
   - Team page lists multiple Managing Directors
   - Emails: NOT published on website
   - Status: Needs direct outreach or LinkedIn

3. **Summit Partners** - Growth equity (~$35B AUM)
   - Website: summitpartners.com
   - Email format identified: First@summitpartners.com
   - Multiple Managing Directors listed
   - Status: Can construct emails based on pattern but need to verify

4. **Erez Capital** - Early-stage VC (Boston)
   - Contact: Michael Benezra, Managing Partner
   - Contact: Arpit Garg, General Partner
   - Website: erezcapital.io (minimal content)
   - Emails: NOT published
   - Status: Smaller/early-stage, may not match $500M-$5B criteria

## Challenges

1. **API Limitations**: Apollo API returns results but email data is restricted (paywall/tier limits)
2. **No Published Emails**: Most PE firms do NOT publish email addresses on their websites
3. **Data Quality**: Many rows in sheet are not PE firms at all
4. **Scale**: 254 rows needing enrichment - requires systematic data validation first

## Recommendations

1. **Clean the data first**: Remove/flag non-PE entries
2. **Focus on mid-market PE**: Target firms that match $500M-$5B AUM criteria
3. **Use multiple sources**: 
   - LinkedIn Sales Navigator for verified contacts
   - Conference/event speaker lists
   - Press releases with contact info
   - SEC filings (for firms with public portfolio companies)
4. **Consider paid tools**: ContactOut, RocketReach, ZoomInfo for verified emails
5. **Manual outreach**: For high-value targets, consider LinkedIn connection requests

## Next Steps

- Clean invalid entries from sheet
- Add new verified mid-market PE firms with public contact data
- Document email patterns found (e.g., Summit Partners)
- Set up systematic enrichment process for valid firms
