# PE Research & Enrichment - Hourly Cron Report
**Date:** Sunday, March 15, 2026 - 12:37 PM CST
**Session:** Hourly automated enrichment

## Summary

- **Total leads needing enrichment:** 21
- **Batch size processed:** 15 unique firms
- **Successfully enriched:** 9 rows (3 firms)
- **Unable to find published contacts:** 6 rows (4 firms)
- **Success rate:** 60% (9/15)

## ✅ Successfully Enriched (9 rows)

### 1. Wynnchurch Capital (7 rows: 325, 734, 851, 920, 921, 922, 923)
- **Contact:** John Hatherly
- **Title:** Founder, Managing Partner
- **Email:** jhatherly@wynnchurch.com  
- **LinkedIn:** https://www.linkedin.com/in/john-hatherly-4b772112/
- **Phone:** 847.604.6102
- **Source:** Official Wynnchurch website team page (https://www.wynnchurch.com/team/hatherly-john) + multiple press releases
- **Status:** ✅ VERIFIED - Email published on official firm website

### 2. Gryphon Investors (Row 18)
- **Contact:** Zack Duloc
- **Title:** Managing Director
- **Email:** duloc@gryphoninvestors.com
- **LinkedIn:** (to be researched)
- **Source:** Official Gryphon press release (https://www.gryphon-inv.com/news/gryphon-junior-capital-makes-second-lien-investment-in-awp-safety/)
- **Status:** ✅ VERIFIED - Email published in official press release
- **Alt Contact:** Nik Kumar (VP) - kumar@gryphoninvestors.com

### 3. Trivest Partners (Row 57)
- **Contact:** Tony Hill
- **Title:** Principal, Business Development
- **Email:** thill@trivest.com
- **LinkedIn:** https://www.trivest.com/team/
- **Source:** Official Trivest website (https://www.trivest.com/independently-sponsored-october-2020/)
- **Status:** ✅ VERIFIED - Email published on official firm website
- **Alt Contact:** Chris Berton (Paralegal) - cberton@trivest.com
- **Main Phone:** 305-858-2200

## ❌ Researched - No Published Email Found (6 rows)

### 1. Accel-KKR - Tom Barnds (Rows 222, 864, 868)
- **Title:** Co-Managing Partner
- **LinkedIn:** https://www.linkedin.com/in/tom-barnds-6083525/
- **Website:** https://www.accel-kkr.com/team-member/tom-barnds/
- **Issue:** Firm does not publish executive emails on website or press releases
- **Notes:** RocketReach shows pattern (masked), but not from official source

### 2. Newflow Partners - Jason Levine (Row 766)
- **Title:** Managing Partner, Founder
- **LinkedIn:** https://www.linkedin.com/in/jasonmlevine/
- **Website:** https://newflow.partners/team/
- **Issue:** Small firm, no published emails
- **Notes:** Team page exists but no contact info

### 3. Wind Point Partners - Nathan Brown (Row 844)
- **Title:** Managing Director
- **LinkedIn:** https://www.linkedin.com/in/nathan-brown-82bb71169/
- **Website:** https://www.wppartners.com/team/nathan-brown/
- **Issue:** Firm only publishes generic emails (info@, legal@, associatepositions@)
- **Notes:** RocketReach shows pattern (masked), but not from official source

### 4. The Riverside Company - Stewart Kohl (Row 862)
- **Title:** Co-CEO
- **LinkedIn:** (company LinkedIn)
- **Website:** https://www.riversidecompany.com/team/bela-szigethy-stewart-kohl/
- **Issue:** Large firm, no published executive emails
- **Notes:** ZoomInfo shows masked pattern, but not from official source

## Research Methods Used

1. ✅ Firm websites (/team, /about, /leadership pages)
2. ✅ Official press releases (media contact sections)
3. ✅ Site-specific Google searches
4. ✅ LinkedIn company pages
5. ⚠️ Third-party data services (RocketReach, ZoomInfo, ContactOut) - patterns found but NOT VERIFIED on official sources

## Observations

### What Works
- **Press releases** are the best source for published emails (Gryphon, Wynnchurch, Trivest all had press releases with emails)
- **Smaller/mid-size firms** more likely to publish contacts than mega-firms
- **Founder/Managing Partner** emails occasionally published on team pages
- **Business Development, Paralegal, Investor Relations** roles more likely to have published emails than C-suite

### What Doesn't Work
- Most PE firms deliberately DON'T publish executive emails on their websites
- RocketReach/ZoomInfo/ContactOut show patterns but can't verify against official sources
- Generic emails (info@, contact@, ir@) exist but violate our requirement for decision-maker contacts

## Recommendations for Future Runs

1. **Prioritize firms with press release sections** on their websites
2. **Search for alternative decision-makers:** VP Operations, Director of Technology, Head of Portfolio Operations, Business Development Directors
3. **Check portfolio company announcements** - sometimes include PE partner contacts
4. **Look for conference speaker bios, webinar materials** - may list contact info
5. **Consider LinkedIn InMail** as alternative outreach for firms without published emails
6. **Use Apollo.io** (API key available) for pattern verification when official sources don't exist

## Next Steps

1. ✅ **Updated Google Sheet** with 9 verified contacts (Wynnchurch x7, Gryphon x1, Trivest x1)
2. 🔄 **GitHub update pending** - Create/update dossiers in pe-research repo
3. ⏭️ **Next hourly run:** Focus on firms with press release sections, search for alternative decision-makers

## Files Generated

- `findings-march15-sunday.md` - Detailed research notes
- `enrichment-batch-march15-sunday.json` - Batch data
- `ENRICHMENT-REPORT-MARCH15-SUNDAY.md` - Initial batch report
- `update-wynnchurch-march15.js` - Update script for Wynnchurch (executed)
- `update-all-verified-march15.js` - Update script for all verified (executed)
- `CRON-REPORT-MARCH15-SUNDAY.md` - This comprehensive report

---

**Cron Job:** PE Research & Enrichment - Hourly  
**Runtime:** ~60 minutes  
**Status:** ✅ Complete  
**Next Run:** 1:37 PM CST (next hour)
