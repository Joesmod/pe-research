# PE Enrichment Report - March 4, 2026 03:06 AM

## Status: Apollo Credits Exhausted
Apollo API returned "insufficient credits" error. Pivoted to manual web research.

## Firms Analyzed

### 1. Keltic Financial Partners (Row 117)
- **Status**: Appears to be a debt/lending firm, not traditional PE
- **Finding**: May not fit target profile (services-heavy mid-market PE)
- **Action**: Skip or re-evaluate firm type

### 2. Falconhead Capital (Row 216)
- **Current**: "Principal" listed as title, email field in title column
- **Finding**: 
  - David Gubbay - General Partner & Chief Compliance Officer
  - David Moross - Founder, Chairman & CEO
- **Source**: Falconhead Capital website (personnel page)
- **Website**: https://www.falconheadcapital.com
- **Action**: Need direct emails (not found in public sources)

### 3. Clayton Dubilier & Rice / CD&R (Row 231)
- **Current**: Vindi Banga listed, no email
- **Finding**: Vindi Banga confirmed as Operating Partner
- **Source**: CD&R website team page (https://www.cdr.com/team)
- **Team Size**: 323 employees, extensive partner roster
- **Action**: Need direct email for Vindi Banga or alternative contact

### 4. Bindley Capital Partners (Row 258)
- **Current**: Empty contact/email
- **Finding**: William Bindley - Founder (from Mergr profile)
- **Focus**: Healthcare Services, Life Sciences, FinTech
- **Location**: Indianapolis, Indiana
- **Founded**: 2001
- **Action**: Need direct email/phone

## Challenges

1. **Apollo API**: Out of credits - cannot use for bulk enrichment
2. **Direct Emails**: Most public sources (PitchBook, RocketReach, etc.) require paid access
3. **Firm Websites**: Many PE firms don't publish direct emails on team pages
4. **Generic Emails**: Many firms only list info@, contact@, or ir@ addresses

## Recommended Approach

### Short-term (This Cron Run):
1. Focus on firms with public team pages and searchable contact info
2. Use LinkedIn for manual verification
3. Check press releases, conference bios, SEC filings for contact mentions
4. Document partial findings (name + title even without email)

### Long-term:
1. **Apollo Credits**: Need to upgrade plan or wait for credit reset
2. **Alternative Tools**: Consider ContactOut, Hunter.io, or other email finder services
3. **Manual Outreach**: For top-priority firms, call the main number and ask for BD/IR contact
4. **LinkedIn Premium**: Could enable InMail or more contact visibility

## Firms Still Needing Enrichment

Out of 211 firms identified, priority should be:
- Mid-market PE ($500M-$5B AUM)
- Services-heavy focus (business services, healthcare services, industrial)
- US-based with active deal flow
- Firms with public team pages

## Next Steps

1. Create targeted list of 25-30 highest-priority firms
2. Manual research via:
   - Firm website team/about pages
   - LinkedIn company pages
   - Recent press releases (funding announcements often include contact names)
   - Conference speaker lists (PE conferences often list firm + title)
3. Update sheet with partial data (name + title + source, even without email)
4. Flag firms as "Needs Manual Outreach" if no public email found
5. Consider calling main office lines for BD/IR contact info

## Time Invested This Run
- Apollo API setup/debugging: ~5 minutes
- Manual web research: ~10 minutes  
- Firms analyzed: 4
- Contacts found: 4 names, 0 verified direct emails
- Success rate: 0% (no actionable email contacts)

## Recommendation
Given Apollo exhaustion and the difficulty finding direct emails via free sources, suggest:
1. Pause automated enrichment until Apollo credits restore
2. Focus on manually enriching the top 50 firms via phone calls to main offices
3. OR invest in paid email enrichment tool with API access (Hunter.io, ContactOut, etc.)
