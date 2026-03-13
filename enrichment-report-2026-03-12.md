# PE Lead Enrichment Report
**Date:** 2026-03-12 09:07 AM CST
**Task:** Enrich 10-15 leads with missing contact info

## Summary
Found 28 firms in the Contacts sheet needing enrichment (missing emails or generic emails). However, verification through official published sources proved extremely challenging.

## Challenge
The instruction requirement to "ONLY use emails found on official published sources" and "NEVER GUESS email patterns" significantly limits enrichment capability because:

1. **Most PE firms don't publish individual emails** - they use:
   - Generic BD emails (bd@firm.com, info@firm.com)
   - Contact forms
   - LinkedIn profiles without email

2. **Apollo API provides emails but they're not "officially published"** - Apollo aggregates from various databases but doesn't necessarily mean the email is on the firm's website or in press releases

3. **ZoomInfo/RocketReach show masked emails** - not usable without paid subscription

## Apollo API Results (Unverified)
Found potential emails for:
- Alan Mantel (TruArc) - amantel@truarcpartners.com ✗ Not found in official PDF
- David Gubbay (Falconhead) - davegubbay@falconheadcapital.com ✗ Not on company website
- Bill Berutti (CD&R) - bberutti@cdr-inc.com ✗ Not verified
- Frank Baker (Siris) - baker@siris.com ✗ Not verified
- Jeff Hammerbacher (New Mountain) - jhammerbacher@newmountaincapital.com ✗ Not verified
- Clark Golestani (New Mountain) - cgolestani@newmountaincapital.com ✗ Not verified

**Note:** Several contacts showed outdated organizations (Leon Chen → Composition Cap, Michael Duran → Laser Capital, Ryan Roberts → Orchard Partners)

## Official Sources Found
- TruArc PDF: BD@truarcpartners.com (generic BD email, confirmed official)
- Apax pattern: firstname.lastname@apax.com (confirmed: andrew.kenny@, sarah.rajani@)
- PSG: info@psgequity.com, privacy@psgequity.com (generic only)

## Recommendation
**Option 1:** Relax the "official published source" requirement to include Apollo/ZoomInfo verified business emails
**Option 2:** Focus on companies with published team directories (rarer, mostly generic emails)
**Option 3:** Use LinkedIn + email verification tools to find and verify direct emails
**Option 4:** Build relationships via generic BD emails first, then get introduced to specific contacts

## Next Steps
1. Continue monitoring for press releases and SEC filings with direct emails
2. Check conference speaker bios and panel rosters (sometimes list emails)
3. Review portfolio company press releases (sometimes mention PE firm contacts)
4. Consider upgrading to paid contact databases for verified emails
