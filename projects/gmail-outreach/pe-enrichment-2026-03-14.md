# PE Enrichment Report - March 14, 2026

## Summary

**Task:** Enrich 10-15 PE firm leads with verified decision-maker contacts and direct emails  
**Results:** 3 firms successfully enriched with verified contacts from official sources  
**Time:** Hourly cron run (Saturday, 5:07 PM CST)

## Successfully Enriched (3 firms)

### 1. Littlejohn & Co (Row 879)
- **Contact:** Jordan Tongalson
- **Title:** Business Development
- **Email:** jtongalson@littlejohnllc.com (verified)
- **Source:** littlejohnllc.com/contact (official contact page)
- **Notes:** Also has general email info@littlejohnllc.com. Located in Greenwich, CT.

### 2. Blackford Capital (Row 499)
- **Contact:** Martin Stein
- **Title:** Founder and Managing Director
- **Email:** deals@blackfordcapital.com (verified)
- **Source:** blackfordcapital.com/investors (official investors page)
- **Notes:** Leads acquisition sourcing. General deal inquiries welcome at this email. Grand Rapids, MI-based.

### 3. TruArc Partners (Row 717)
- **Contact:** Alan Mantel
- **Title:** Co-Managing Partner
- **Email:** amantel@truarcpartners.com (verified)
- **Source:** truarcpartners.com/alan-mantel (official team bio page)
- **Notes:** Co-Managing Partner since 2005. Tech-Enabled Business Services focus. Also has transactions@truarcpartners.com for general inquiries.

## Firms Researched - No Published Emails Found (7 firms)

### 1. Apax Partners (Row 49)
- **Contact Identified:** Seth Brody - Partner, Global Head of Operational Excellence
- **Finding:** No email published on team page (apax.com). Aggregator sites suggest email patterns but NOT verified on official source.
- **LinkedIn:** https://www.linkedin.com/in/seth-brody-6721511/

### 2. The Wicks Group (Row 776)
- **Contact Identified:** Craig B. Klosk - Partner
- **Finding:** No email on official website (wicksgroup.com/team). Aggregator sites have unverified suggestions.
- **LinkedIn:** https://www.linkedin.com/in/craig-klosk/

### 3. New Mountain Capital (Row 1617)
- **Contact Identified:** Jeff Hammerbacher - Senior Advisor (Data/AI)
- **Finding:** Confirmed on team page (newmountaincapital.com/team) but no email published. Former Facebook data lead, Cloudera co-founder.

### 4. Clayton Dubilier & Rice / CD&R (Row 800)
- **Contact Identified:** Bill Berutti - Operating Partner
- **Finding:** Confirmed on cdr.com/team but no email published. Former Plex Systems CEO. Aggregator sites suggest patterns.

### 5. Siris Capital Group (Row 806)
- **Contact Identified:** Frank Baker - Co-Founder & Managing Partner
- **Finding:** Team confirmed on siris.com/team. Only generic info@siris.com published.

### 6. Bow River Capital (Rows 1850-1852)
- **Contacts Identified:** 
  - Blair E. Richardson - CEO
  - Greg J. Hiatrides - Partner, Head of Private Equity
  - John P. Raeder - Partner, Head of Software Investments
- **Finding:** Team confirmed on bowrivercapital.com. Only generic info@bowrivercapital.com published.

### 7. Turn/River Capital (Rows 1853-1854)
- **Contacts Identified:**
  - Dominic Ang - Managing Partner
  - Matt Amico - Partner
- **Finding:** B2B software specialist. Website blocked by Cloudflare. Aggregator sites have unverified suggestions.

## Key Findings & Observations

### Email Publishing Practices
Most mid-to-large PE firms (>$500M AUM) **intentionally do not publish** individual email addresses on their websites. This is a deliberate access control strategy:

1. **Generic Contact Points Only:** Most firms publish only info@, deals@, or transactions@ emails
2. **Web Forms Preferred:** Many use contact forms instead of publishing emails
3. **Aggregator Data Unreliable:** RocketReach, ZoomInfo, ContactOut have guessed email patterns but these are NOT published on official sources
4. **Compliance Issue:** Per instructions, we cannot use aggregator-sourced emails unless verified on official published sources

### Firms That Publish Contacts
The 3 firms successfully enriched represent exceptions:
- **Littlejohn & Co:** Publishes specific contact emails for BD and IR on contact page
- **Blackford Capital:** Publishes deals@ email on investors page (explicitly for deal inquiries)
- **TruArc Partners:** Publishes partner email on individual bio page (amantel@truarcpartners.com)

### Alternative Contact Strategies
For firms without published emails, alternative approaches:
1. **Press Release Contacts:** Some firms include PR/media contact emails in press releases
2. **SEC Filings:** May contain contact information for publicly-filed transactions
3. **Conference Materials:** Speaker bios sometimes include emails
4. **LinkedIn InMail:** Direct outreach via LinkedIn when email not published
5. **Phone Contact:** Many firms publish phone numbers (can call to request proper contact)

## Recommendations

### Short-term (Next Enrichment Run)
1. **Search Press Releases:** Check recent news/press pages for media contact emails
2. **Check SEC EDGAR:** For firms with recent filings (M&A activity)
3. **Conference Materials:** Search for speaker bios from PE conferences
4. **Smaller Firms:** Target firms <$1B AUM who may be more accessible

### Long-term
1. **Apollo API Alternative:** Consider Apollo.io API for verified business emails (not free aggregators)
2. **Multi-touch Approach:** Combine web forms + phone + LinkedIn for firms without emails
3. **Relationship Building:** Warm intros via existing contacts may be more effective than cold emails for top-tier firms

## Next Actions

### High-Priority Follow-ups (Have Contacts, Need Emails)
1. Apax Partners - Seth Brody (LinkedIn outreach or phone)
2. New Mountain Capital - Jeff Hammerbacher (high-value AI/data advisor)
3. Bow River Capital - Multiple partners identified (phone: 303-861-8466)
4. CD&R - Bill Berutti (former SaaS CEO, relevant)

### Data Quality Notes
- Total database: 1,854 contact rows
- Firms needing enrichment: 37 (as of this run)
- High-priority firms (score 7-10) needing enrichment: 10
- Successfully enriched this run: 3 (30% of high-priority targets)

---

**Research completed:** 2026-03-14 17:00-17:15 CST  
**Sources:** Official company websites only (no aggregator data used)  
**Next run:** 2026-03-14 18:07 CST (hourly cron)
