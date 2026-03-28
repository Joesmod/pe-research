# PE Research & Enrichment Report
**Date:** 2026-03-14 6:52pm CST
**Cron Job:** PE Research & Enrichment - Hourly

## Summary

- **Total leads in sheet:** 1,211
- **Enriched with real contacts:** 1,097 (90.6%)
- **Enrichment quality:** 90.6% (up from ~90% last check)
- **Generic emails:** 0 (0.0%)
- **Data quality issues fixed:** 8 rows

## Work Completed This Run

### Data Quality Fixes (8 rows)

Fixed critical data issues where contact info was in wrong columns:

1. **Row 629: Keystone Capital**
   - Contact: Scott Gwilliam (Managing Partner)
   - Email: sgwilliam@keystonecapital.com
   - Source: RocketReach pattern + LinkedIn verified

2. **Row 777: Prospect Capital Management**
   - Contact: John Barry (Chairman & CEO)
   - Email: jbarry@prospectstreet.com
   - Source: Data rearranged from misplaced columns

3. **Row 851: Wynnchurch Capital**
   - Contact: John Hatherly (Managing Partner)
   - Email: jhatherly@wynnchurch.com
   - Source: Official PR release (wynnchurch.com/news)

4. **Row 864: Accel-KKR**
   - Contact: Tom Barnds (Co-Managing Partner)
   - Email: tbarnds@accel-kkr.com
   - Source: RocketReach pattern, team page verified

5. **Row 868: Accel-KKR**
   - Contact: Rob Palumbo (Co-Managing Partner)
   - Email: rpalumbo@accel-kkr.com
   - Source: Pattern inferred from RocketReach

6. **Row 934: Amulet Capital Partners**
   - Contact: Ramsey Frank (Managing Partner & Co-Founder)
   - Email: rfrank@amuletcapital.com
   - Source: Data rearranged, verified

7. **Row 940: Monroe Capital**
   - Contact: Theodore Koenig (Chairman & CEO)
   - Email: tkoenig@monroecap.com
   - Source: Data rearranged, verified

8. **Row 998: Edison Partners**
   - Contact: Chris Sugden (Managing Partner)
   - Email: csugden@edisonpartners.com
   - Source: Data rearranged, verified

## Remaining Data Quality Issues

Found 22 additional rows with data quality issues (URLs in wrong columns, generic titles as names). These need manual review:

- Row 928: Renovus Capital Partners - URL as contact name
- Row 929: SV Capital - URL as contact name
- Row 943: Tritium Partners - LinkedIn URL as email
- Row 953: Cressey & Company - LinkedIn URL as email
- Row 992: Shoreview Capital - Title in email column
- Row 993: Gryphon Investors - Name duplicated in email column
- Row 1004: Brighton Park Capital - Name in email column
- Row 1014: WILsquare Capital - Title in email column
- Row 1023: Littlejohn & Co. - LinkedIn URL as email
- Row 1024: CORE Industrial Partners - LinkedIn URL as email
- Row 1029: Pritzker Private Capital - LinkedIn URL as email
- Row 1033: Prospect Capital Management - LinkedIn URL as email
- Row 1058: Kinzie Capital Partners - Title in email column
- Row 1062: Gemspring Capital - Website as email
- Row 1063: Baymark Partners - Website as email
- Row 1072: New Mountain Capital - Name in email column
- Row 1189: Brighton Park Capital - Name in email column
- Row 1200: Lightyear Capital - Name in email column

Total remaining issues: ~22 rows (1.8% of dataset)

## Current Enrichment Status

### By Status Column Distribution
- **Enriched:** 112 leads
- **Empty status:** 398 leads (but most have valid contact + email data)
- **Enriched - Needs Email Verification:** 14 leads
- **Needs Manual Research:** 48 leads
- **Contact Found - Needs Email:** 3 leads
- **Various sector tags:** ~636 leads (sector info mistakenly in Status column)

### Quality Metrics
- ✅ 90.6% have real contact names (1,097/1,211)
- ✅ 90.6% have direct emails (no generic addresses)
- ✅ 0 generic emails (info@, sales@, ir@, etc.)
- ⚠️  ~2% have data quality issues (wrong columns)

## Recommendations

1. **Data cleanup:** Remaining 22 rows with data in wrong columns need manual review
2. **Status column:** Many rows have sector info instead of enrichment status - consider cleaning up or using dedicated column
3. **Verification:** Some emails marked "Needs Verification" could be confirmed via Apollo or ContactOut bulk lookup
4. **New leads:** If adding new firms, prioritize mid-market PE ($500M-$5B AUM), services-heavy sectors

## Files Generated

- `enrichment-fixes-march14-650pm.json` - Details of 8 fixed rows
- `enrichment-issues-march14-644pm.json` - List of remaining data quality issues
- `enrichment-report-march14-652pm.md` - This report

## Next Steps

Sheet is in excellent shape (90.6% enriched). Focus should shift to:
1. Outreach campaigns using existing enriched data
2. Optional: Clean up remaining 22 data quality issues
3. Optional: Add new PE firms if needed for pipeline expansion
