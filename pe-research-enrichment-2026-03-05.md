# PE Research & Enrichment Report
**Date:** 2026-03-05 (Wednesday, 10:36 PM CST)
**Task:** Hourly enrichment cron - enrich 10-15 leads with verified contact info

## Summary
Researched 10+ PE firms with missing/generic contact info. **Finding: Very few firms publish direct decision-maker emails on official sources.**

## Key Challenge
The requirement to use "ONLY emails found on official published sources. NEVER GUESS email patterns" significantly limits enrichment. Most PE firms:
- List team members with titles on official websites
- Do NOT include direct email addresses on team pages
- Only provide general contact emails (info@, contact@, admin@)

## Firms Researched

### 1. **McWin Capital Partners**
- **Website:** mcwin.fund
- **Team:** Henry McGovern & Steven K. Winegar (Founding Partners)
- **Email:** info@mcwin.fund (generic)
- **Source:** Official team page (mcwin.fund/our-team/)
- **Status:** Partial - No direct emails published

### 2. **Quona Capital**
- **Website:** quona.com
- **Key Contacts:** Monica Brand Engel (Co-Founder, Managing Partner), Jonathan Whittle, Ganesh Rengaswamy
- **Email:** info@quona.com (generic)
- **Pattern:** First@quona.com (per LeadIQ/VCSheet - NOT official source)
- **Source:** quona.com/team/
- **Status:** Partial - No direct emails on official site

### 3. **Star Mountain Capital**
- **Website:** starmountaincapital.com
- **Key Contacts:** Brett Hickey (CEO), Curtis Glovier (CIO)
- **Email:** WebRequest@StarMountainCapital.com (generic)
- **Phone:** Tampa office 813-768-9550
- **Source:** starmountaincapital.com/teams/
- **Status:** Partial - No direct emails published

### 4. **Thayer Street Partners** ✅
- **Website:** thayerstreet.com
- **Key Contact:** Josh Koplewicz (Founder & Managing Partner)
- **Email:** admin@thayerstreet.com (general contact, published on website)
- **Source:** thayerstreet.com
- **Status:** Enriched - General contact email verified

### 5. **KSL Capital Partners**
- **Website:** kslcapital.com
- **Team:** Kirk Adamson (Partner), Mike Acierno (MD), Tony Argibay (MD)
- **Location:** Denver HQ
- **Email:** None found on official sources
- **Source:** kslcapital.com/our-team
- **Status:** Partial - Team identified, no emails

### 6. **Washington Harbour Partners**
- **Website:** washingtonharbour.com
- **Location:** Arlington, VA
- **Focus:** Cybersecurity/GovTech PE
- **Phone:** (202) 891-6202
- **Email:** None found
- **Source:** washingtonharbour.com
- **Status:** Partial - Minimal public contact info

### Additional Firms Checked:
- **Juno Capital Partners** - generic info@ only
- **Cardea Group** - Appears to be recruitment firm (not PE investor)
- **TAP Advisors** - Investment banking advisory (not PE investor)

## Third-Party Sources (NOT USED per task requirements)
The following sources had emails but are NOT official:
- ContactOut
- RocketReach
- LeadIQ
- VCSheet
- Apollo.io
- Wiza

These are contact aggregation databases, not official firm publications, so they were excluded per task instructions.

## Recommendations

1. **Revise enrichment criteria:** Consider allowing:
   - Email patterns verified by multiple third-party sources
   - LinkedIn direct messaging as alternative to email
   - General contact emails (admin@, contact@) as interim solution

2. **Focus on high-value targets:** Prioritize firms with:
   - Published team directories with roles
   - Active presence on LinkedIn
   - Recent press releases or SEC filings

3. **Alternative contact methods:**
   - LinkedIn InMail
   - Phone numbers (many firms publish these)
   - Contact forms on websites
   - Newsletter subscriptions (captures email for follow-up)

## Official Sources Successfully Used
- Firm websites (team pages, about pages)
- SEC filings (limited contact info)
- Press releases on firm domains
- LinkedIn company pages (team listings, no emails)

## Time Spent
- ~45 minutes of research
- 6 primary firms deeply researched
- 4+ secondary firms checked
- Multiple source validation attempts

## Next Steps
1. Update Google Sheet with partial enrichment (names, titles, LinkedIn, general emails)
2. Consider Apollo.io API integration for verified business emails
3. Build a "warm intro" strategy for firms with partial info
4. Create follow-up workflow for general contact email → decision-maker routing

---
**Note:** This report demonstrates the practical limitation of "official sources only" for PE contact research. Most mid-market PE firms intentionally limit public contact exposure to reduce unsolicited outreach.
