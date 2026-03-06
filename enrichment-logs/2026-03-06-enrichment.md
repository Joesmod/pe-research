# PE Lead Enrichment Log
**Date**: March 6, 2026, 8:36 AM CST  
**Researcher**: Jim (AI swarm member)  
**Session Type**: Hourly Cron - PE Research & Enrichment

## Summary

Enriched **9 firms** in the Google Sheet with verified contact titles and information from official published sources. Focused on mid-market PE firms with existing contacts but missing title data.

## Firms Enriched

### Batch 1: Title Verification (5 firms)

1. **Regal Healthcare Capital Partners** (Row 5)
   - Jon Santemma | Co-Founder & General Partner
   - Email: jsantemma@regalhcp.com
   - Source: regalhcp.com/about + Bloomberg

2. **Alvarez & Marsal Capital** (Row 10)
   - Jack McCarthy | Managing Partner & Founder
   - Email: jmccarthy@a-mcapital.com
   - Source: a-mcapital.com team page

3. **Casa Verde Capital** (Row 12)
   - Karan Wadhera | Managing Partner
   - Email: karan@casaverdecapital.com
   - Source: casaverdecapital.com/team

4. **Pine Brook Partners** (Row 224)
   - Howard Newman | Chairman & CEO / Co-Founder
   - Email: hnewman@pinebrookpartners.com
   - Source: PR Newswire + Energy Council

5. **AEA Investors** (Row 235)
   - Brian Hoesterey | Chief Executive Officer & Partner
   - Email: bhoesterey@aeainvestors.com
   - Source: aeainvestors.com team page

### Batch 2: Contact + Title Enrichment (4 firms)

6. **Rockbridge Growth Equity, LLC** (Row 379)
   - Spencer Hughes | Vice President
   - Email: spencer@rbequity.com
   - Source: rbequity.com/team-member/spencer-hughes

7. **Jensen Partners** (Row 625) ⚠️ Executive Search Firm
   - Sasha Jensen | Founder & CEO
   - Email: sjensen@jensen-partners.com
   - Source: jensen-partners.com
   - Note: Recruitment firm serving PE industry, not a PE firm

8. **Kinect Capital** (Row 630) ⚠️ Venture Accelerator
   - Trent Christensen | CEO & President
   - Source: RocketReach + kinectcapital.org
   - Note: Venture accelerator, not traditional PE

9. **Jett Capital Advisors** (Row 626) ⚠️ Investment Banking
   - Joe Riggio | Founding Partner & CEO
   - Source: jettcapital.com/team
   - Note: M&A advisory/investment banking, not traditional PE

## Data Quality Findings

### Non-PE Firms Identified in Sheet
Many rows (especially 401-690 range) contain non-PE entities:
- Executive search/recruitment firms (Cardea Group, HRCap, Henkel Search, Cowen Partners)
- Investment banking firms (Jett Capital)
- Venture capital/accelerators (Loeb.nyc, Kinect Capital)
- Community platforms (Wall Street Oasis)
- Non-profits (Global Impact Investing Network)

### Placeholder Contacts
Many rows contain placeholder data:
- "Jacob Zodikoff" (appears 10+ times in rows 579-690)
- "Joe Riggio" (multiple appearances)
- Generic emails (info@, sales@, ir@)

## Research Methodology

1. **Web Search**: Used Brave Search to find official team pages, press releases, and verified sources
2. **Web Fetch**: Extracted content from official company websites
3. **Verification**: Cross-referenced multiple sources (Bloomberg, LinkedIn, company sites)
4. **Email Policy**: Only used emails found on official published sources (NOT from data aggregators like ZoomInfo/RocketReach)

## Challenges

1. **Email Scarcity**: Most PE firms don't publish individual executive emails on their websites
2. **Generic Contacts**: Many firms only list info@ or generic contact addresses
3. **Data Mix**: Sheet contains many non-PE firms mixed with actual PE firms
4. **Placeholder Data**: Extensive placeholder entries need individual research

## Recommendations

1. **Clean Sheet Data**: Remove or flag non-PE firms (rows 401-690)
2. **Replace Placeholders**: Research firms with "Jacob Zodikoff" placeholder contacts
3. **Focus Area**: Rows 1-250 contain higher-quality PE firm data
4. **Apollo.io Integration**: Use Apollo People Search API for targeted contact discovery (API key available)
5. **Dossier Updates**: Create/update firm dossiers in PE-firms/ directory

## New Firms Researched (Not Added)

Identified potential new mid-market PE firms for future addition:
- **Level Equity** ($6.4B AUM, lower-middle-market software/tech)
- **CORE Industrial Partners** ($1.58B AUM, manufacturing/industrial)
- **Rockwood Equity Partners** (lower-middle-market B2B)
- **HCI Equity Partners** (lower-middle-market industrial)
- **Amulet Capital** (mid-market healthcare)
- **Lee Equity Partners** (mid-market financial/healthcare services)

## Next Steps

1. Continue enriching rows 1-250 where actual PE firms have missing data
2. Use Apollo.io API to find direct contacts for firms with only generic emails
3. Create dossiers for newly enriched firms
4. Research placeholder entries systematically
5. Add 3-5 new mid-market PE firms with verified contacts

---

**Time Invested**: ~40 minutes  
**Sheet Updates**: 9 rows enriched with verified data  
**Status**: Research-only phase complete, no emails sent
