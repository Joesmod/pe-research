# PE Research & Enrichment Report
**Date:** 2026-03-29 08:35 AM (Sunday)
**Task:** Hourly PE Lead Enrichment Cron

## Summary
- **Found:** 199 firms needing enrichment (missing contact names, generic emails, or empty fields)
- **Enriched:** 2 firms with verified decision-makers
- **Method:** Manual web research + team page verification
- **Updated:** Google Sheet "Outreach Log" with contact info, titles, LinkedIn, notes

## Firms Enriched

### 1. BV Investment Partners (BVLP)
- **Row:** 21
- **Contact:** Vikrant Raina
- **Title:** Partner & Chief Executive Officer
- **Email:** vraina@bvlp.com (pattern inferred from clientservice@bvlp.com)
- **LinkedIn:** https://www.linkedin.com/in/vikrantraina
- **Status:** Enriched - Pattern Inferred
- **Source:** bvlp.com/team (official team page, confirmed title/role)
- **Notes:** Founded 1983, Boston-based, ~$5B invested in tech-enabled business services, software, IT services. Email pattern [first_initial][last]@bvlp.com inferred but NOT verified from official source.

### 2. Siris Capital Group
- **Row:** 22
- **Contact:** Frank Baker
- **Title:** Co-Founder & Managing Partner
- **Email:** baker@siris.com
- **LinkedIn:** https://www.linkedin.com/in/frankbaker-siris
- **Status:** Enriched
- **Source:** siris.com/team + RocketReach verification (94.9% confidence)
- **Notes:** Founded 2011, NYC-based, $8B+ AUM, focus on technology, telecom, data. Email pattern [last]@siris.com verified.

## Challenges Encountered

1. **Cloudflare blocking:** Cortec Group team page blocked web fetch (403)
2. **Limited email verification:** Many firms don't publish direct emails on official pages
3. **Time-intensive per firm:** Manual research takes 3-5 min/firm for quality enrichment
4. **Generic contacts:** Many rows have emails but no contact names (requires reverse lookup)

## Firms Still Needing Enrichment (Next Priority)

High-value targets with partial info:
- **Row 31:** Tonkabay - Kyle Largent (has name, needs email)
- **Row 39:** HIG Capital - Michael Knigin (has name, needs email)
- **Row 40:** Searchlight Capital - Keval Patel (has name, needs email)
- **Row 44:** Resurgenstech - Seth Boro (has name, needs email)
- **Row 48:** MGP Fund - Claire Bissot (has name, needs email)

Firms with emails but no contact names (reverse lookup needed):
- **Row 18:** cortecgroup - jmoberg@cortecgroup.com
- **Row 27:** stellus - vgarcia@stelluscapital.com
- **Row 37:** bluewolf - cthomas@bluewolfcapital.com
- **Row 43:** thl - jcarlisle@thl.com
- **Row 46:** kainos - dreader@kainoscapital.com

## Recommendations

1. **Use Apollo.io API** for bulk enrichment when possible (faster than manual research)
2. **Focus on firms with partial data** first (easier to complete)
3. **Batch email pattern searches** on LinkedIn to find contact names for existing emails
4. **Prioritize mid-market PE** firms ($500M-$5B AUM, services-focused) for new additions
5. **Document email patterns** once verified to speed future enrichment

## Next Steps

1. Continue enriching high-priority firms (Tonkabay, HIG, Searchlight, etc.)
2. Reverse-lookup existing emails to get contact names
3. Add 3-5 new mid-market PE firms to sheet
4. Update GitHub pe-research repo with dossiers for enriched firms
5. Commit and push changes

## Files Updated
- `projects/gmail-outreach/find-needs.js` (identification script)
- `projects/gmail-outreach/update-enrichment.js` (sheet update script)
- Google Sheet: "Outreach Log" rows 21, 22

## Time Spent
~45 minutes (8:35-9:20 AM estimated)

---
**Status:** Partial completion. 2/10-15 target enrichments completed due to time constraints and manual research required. Will continue in next hourly cycle.
