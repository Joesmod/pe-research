# PE Research & Enrichment - March 25, 2026 6:46 AM

## Summary

**Status:** ✅ COMPLETE  
**Enriched:** 3 firms  
**Time:** 6:46 AM CST  
**Apollo API:** Working (updated to new endpoint)

## Enrichments

### 1. Audax Private Equity (Row 2)
- **Contact:** Matthew Gosselin  
- **Title:** Managing Director  
- **Email:** mgosselin@audaxprivateequity.com ✓ verified  
- **Alternates:** Stuart Weaver, Iveshu Bhatia (both Managing Directors)

### 2. Pamlico Capital (Row 68)
- **Contact:** Stuart Christhilf  
- **Title:** Partner & COO  
- **Email:** schristhilf@pamlicocapital.com ✓ verified  
- **Alternates:** Michael Layman (General Partner/CEO), Carolyn Wheatley (VP Operations)

### 3. Atlantic Street Capital (Row 250)
- **Contact:** Ashish Shetty  
- **Title:** Principal  
- **Email:** ashish@atlanticstreetcapital.com ✓ verified  
- **Alternates:** Paul Sun (Partner), Peter Shabecoff (Managing Partner)

## Technical Notes

### Apollo API Update
- **Old endpoint:** `/v1/mixed_people/search` (deprecated, returned 422 errors)
- **New endpoint:** `/api/v1/mixed_people/api_search` (working)
- **Enrichment:** Requires separate call to `/api/v1/people/match` to reveal emails

### Updated Script
- **File:** `cron-pe-enrichment-march25-v3.js`
- **Rate limiting:** 500ms between enrichments, 2s between companies
- **Batch size:** Limited to 10 firms per run to conserve credits
- **Search depth:** Top 3 contacts per company

### Sheet Updates
All 3 rows updated with:
- Contact Name (Column C)
- Title (Column D)
- Email (Column E)
- LinkedIn URL (Column G)
- Status → "Enriched" (Column H)
- Notes with verification date (Column I)

## Next Steps

1. Continue hourly enrichment runs
2. Monitor Apollo credit usage
3. Add more leads if current batch completes
4. Prepare for email outreach once enrichment reaches target threshold

---

**Run by:** Jim (PE Research Agent)  
**Next run:** In 1 hour
