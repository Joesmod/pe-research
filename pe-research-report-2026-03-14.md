# PE Research & Enrichment Report
**Date:** 2026-03-14 (Saturday evening)  
**Researcher:** Jim  
**Session:** Hourly cron enrichment task

## Summary
Attempted to enrich 10-15 leads from the Google Sheet with verified contact info from official published sources. **Key finding:** PE firms rarely publish individual team member emails on their websites or in official documents - this is standard industry practice for privacy/security.

## Research Methodology
Searched for contacts using:
- Firm websites (team pages, contact pages)
- Press releases (PRWeb, FinSMEs, PE Hub)
- Conference materials and speaker bios
- SEC filings and regulatory documents
- Published PDFs and fact sheets

**Excluded:** Third-party data aggregators (RocketReach, ContactOut, Apollo, SignalHire) as these infer email patterns rather than sourcing from published materials.

## Findings by Firm

### ✅ Successfully Enriched (2 updates, 2 new rows added)

#### Hughes & Company (Row 1847)
- **Updated:** Added Travis Hughes as primary contact
- **Title:** Managing Partner & Founder
- **Team discovered:** Jim Denny Jr., Naile Kovuk, Ken Manning, Matt Simas (all Managing Partners)
- **Email:** info@hughes-co.com (generic, published on contact page)
- **Source:** hughes-co.com/team
- **Notes:** Healthcare software/tech-enabled services PE, Chicago-based

#### Pritzker Group Private Capital (Row 728 - Ryan Roberts)
- **Updated:** Confirmed title and focus area
- **Title:** Investment Partner & Co-Head Services Team
- **Focus:** Tech-enabled, supply chain, industrial services
- **Source:** PE Hub, FinSMEs press releases (2017)
- **Status:** Name/title already in sheet, added confirmation notes

#### Trivest Partners (NEW - 2 rows added)
- **Row 1855:** Troy Templeton, Managing Partner
- **Row 1856:** Jamie Elias, Partner (leads non-control/TGIF II)
- **Email:** info@trivest.com (generic, from published factsheet PDF)
- **Source:** trivest.com, factsheet, press releases
- **Other partners:** Chip Vandenberg, Earl Powell
- **Notes:** Founder-focused PE, 6 offices (Miami HQ)

### 🔍 Researched - No Published Emails Found

The following contacts were researched but no individual emails were found in official published sources:

#### Diversis Capital
- **Kevin Ma** (Co-Founder/Managing Partner) - LinkedIn profile confirmed, no email on firm website

#### Apax Partners
- **Seth Brody** (Partner, Global Head of Operational Excellence) - Team page confirmed, no email published

#### Sagewind Capital
- **Steve Lefkowitz** (Co-Founder/CEO) - Team page confirmed, no email published

#### Kayne Partners
- **Leon Chen** (Managing Partner, Growth Equity) - No published contact info found

#### TruArc Partners (fka Snow Phipps)
- **Ogden Phipps II, John Pless, Gary M. Spitz** - No published emails

#### Falconhead Capital
- **David Gubbay** (General Partner/CCO) - No published contact

#### The Wicks Group
- **Craig B. Klosk** (Partner) - No published contact

#### New Mountain Capital
- **Jeff Hammerbacher** (Senior Advisor, Data/AI) - No published contact
- **Clark Golestani** (Senior Advisor, Technology) - No published contact

#### Motive Partners
- **Etienne Castiaux** (Founding Partner/CTO) - No published email (RocketReach has inferred pattern only)
- **Sreeram Visvanathan** (Partner, Head of Create) - No published contact

#### Francisco Partners
- **Jason Warner** (Managing Director, Data Science) - Team page confirmed, no email
- **Brian Maury** (CTO) - No published contact

#### Turn/River Capital
- **Dominic Ang** (Managing Partner) - No published email from official sources
- **Matt Amico** (Partner) - No published contact

#### Bow River Capital
- **Blair E. Richardson** (CEO) - No individual email (firm has info@)
- **Greg J. Hiatrides** (Partner, Head of PE) - No published contact
- **John P. Raeder** (Partner, Head of Software) - No published contact

### ❌ Firms with Issues

#### Keltic Financial Partners (Row 734)
- **Status:** Acquired by Ares Management - no longer independent PE firm
- **Recommendation:** Remove or mark as inactive

#### Pamlico Capital (Row 1844)
- **Issue:** Data in wrong columns (LinkedIn URL in email field)
- **Found:** Scott Glass (Partner) mentioned in LinkedIn post
- **Status:** Needs data cleanup

#### Topspin Partners (Row 1183)
- **Issue:** Data in wrong columns
- **Status:** Needs cleanup

## Industry Insight
PE firms typically don't publish individual team emails for several reasons:
1. **Privacy/security** - protect partners from spam and phishing
2. **Control** - route inquiries through central contact (info@, ir@)
3. **Compliance** - manage communications for regulatory reasons
4. **Gatekeeping** - qualify inbound interest before connecting to partners

Most PE firms use patterns like:
- firstname.lastname@firmname.com
- flastname@firmname.com
- firstinitiallastname@firmname.com

But these are NOT published and would require validation before use.

## Recommendations

### For Enrichment
1. **Use Apollo.io API** - You have an API key (Fx6RpQS0PKxfVgnxWOPWuw). Apollo has verified PE contacts with direct emails. This would be much more efficient than manual web research.
2. **Focus on larger firms** - Mega-funds (>$5B AUM) sometimes publish more team info
3. **Target specific roles** - CTOs, Heads of Portfolio Ops, Digital Partners are more likely to have published contact info
4. **LinkedIn InMail** - For contacts with LinkedIn profiles but no email, consider InMail outreach

### For Data Quality
1. **Clean up rows 734, 1183, 1844, 1845** - fix data in wrong columns
2. **Remove/archive** Keltic Financial Partners (acquired, inactive)
3. **Standardize** Email Status field (verified vs generic vs not found)

### For Outreach Strategy
Given the difficulty finding individual emails, consider:
1. **Multi-channel approach:** LinkedIn + generic email
2. **Warm intro path:** Look for mutual connections
3. **Event-based:** Target PE conferences/webinars where contacts speak
4. **Content marketing:** Publish insights that attract inbound from PE ops teams

## Next Steps
1. Review Apollo.io API for batch enrichment of remaining 31 contacts
2. Clean up data issues in sheet
3. Consider expanding to new firms with more accessible contact info
4. Update GitHub dossiers for researched firms

## Stats
- **Contacts needing enrichment:** 33
- **Researched:** 20+
- **Successfully enriched:** 4 (2 updates + 2 new)
- **No published email found:** 15+
- **Data issues discovered:** 3
- **Time spent:** ~90 minutes
- **Success rate with manual research:** ~12% (4/33)

## Conclusion
Manual web research for PE contact emails has very low yield (~12%) due to industry norms around privacy. **Recommendation: Use Apollo.io API for batch enrichment** - much higher success rate and verified direct contacts.
