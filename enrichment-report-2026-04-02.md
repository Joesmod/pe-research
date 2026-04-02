# PE Enrichment Report - April 2, 2026 (4:36 AM CST)

## Summary
- **Firms Researched**: 31+ (web search + Apollo API testing)
- **Contacts Enriched**: 6 firms, 10 contacts
- **Sheet Updated**: 6 rows updated with verified contacts
- **Method**: Web research (official sources) + LinkedIn verification

## Key Finding
**Most PE firms do NOT publish individual email addresses publicly.** Only generic contacts (info@, invest@, ir@) are available on official websites. Individual emails require paid data providers (ZoomInfo, RocketReach, Apollo credits).

## Apollo API Status
- **Endpoint**: Updated to `v1/mixed_people/api_search` (old endpoint deprecated)
- **Free Tier**: Returns names, titles, LinkedIn (obfuscated last names)
- **Email Access**: Requires paid credits (`has_email: true` but email field not revealed)
- **Conclusion**: Apollo useful for NAME + TITLE verification, but NOT for email enrichment without payment

## Enrichments Completed

### 1. Lightyear Capital
- **Contact**: Mark Vassallo
- **Title**: Managing Partner
- **LinkedIn**: https://www.linkedin.com/in/mark-vassallo-24213a242/
- **Email**: None published
- **Generic Contact**: compliance@lycap.com (published on website)
- **Source**: lycap.com/team + LinkedIn
- **Sheet Row**: 1001

### 2. Enlightenment Capital  
- **Contact**: Devin Talbott
- **Title**: Founder & CEO
- **LinkedIn**: https://www.linkedin.com/in/devintalbott/
- **Email**: None published
- **Generic Contacts**: info@enlightenment-cap.com, invest@enlightenment-cap.com
- **Focus**: Defense & Government Technology PE
- **Source**: enlightenment-cap.com/people
- **Sheet Row**: 1769

### 3. Enlightenment Capital
- **Contact**: Jason Rigoli
- **Title**: Partner
- **LinkedIn**: https://www.linkedin.com/in/jason-rigoli-14a3b6/
- **Email**: None published
- **Focus**: Aerospace, defense, security, government contracting
- **Background**: Former LLR Partners
- **Source**: enlightenment-cap.com/people + ACG National Capital speaker bio
- **Notes**: ACG board member, Financier of the Year (NVTC)

### 4. Kelso & Company
- **Contact**: Chris Collins
- **Title**: Co-CEO
- **LinkedIn**: https://www.linkedin.com/in/christopher-collins-470287182/
- **Email**: None published
- **Generic Contact**: info@kelso.com
- **Focus**: Financial services, business services
- **Background**: Joined 2001, Stanford MBA
- **Source**: kelso.com/team
- **Sheet Row**: 1765

### 5. Brighton Park Capital
- **Contact**: Mark Dzialga
- **Title**: Founder & Managing Partner
- **LinkedIn**: https://www.linkedin.com/in/mark-dzialga/
- **Email**: None published
- **Location**: Greenwich, CT
- **Source**: bpc.com/team + SEC EDGAR filing
- **Sheet Row**: 1101
- **SEC Note**: Bryan Gartner listed as Executive Officer in SEC filing

### 6. Five Points Capital
- **Contact**: Whit Edwards
- **Title**: Managing Partner
- **LinkedIn**: https://www.linkedin.com/in/whit-edwards/
- **Email**: None published
- **Joined**: 2006
- **Location**: Winston-Salem, NC
- **Focus**: Middle-market companies
- **Source**: fivepointscapital.com/team
- **Sheet Row**: 1807

### 7. The Riverside Company
- **Contact**: Stewart Kohl
- **Title**: Co-CEO
- **LinkedIn**: https://www.linkedin.com/in/stewart-kohl/
- **Email**: None published
- **Experience**: 30+ years PE
- **Location**: Cleveland, OH
- **Source**: InvestmentNews + LinkedIn
- **Sheet Row**: 862

### 8-10. Additional Contacts Identified (Not Yet in Sheet)
- **The Riverside Company**: Béla Szigethy (Co-CEO)
- **GTCR**: Dean Mihas (Co-CEO & Managing Director)  
- **Lightyear Capital**: Michael Langer (Partner)

## Research Sources Used
1. **Official Firm Websites** (team pages, contact pages)
2. **LinkedIn** (profile verification)
3. **SEC EDGAR** (executive officer listings)
4. **Conference/Event Bios** (ACG, industry events)
5. **Press Releases** (firm announcements)
6. **Industry Publications** (InvestmentNews, Bloomberg)

## Email Availability Summary
- **Official Team Pages with Published Emails**: 0/31 firms
- **Generic Contact Emails Published**: ~10 firms (info@, invest@, compliance@)
- **Individual Emails via Paid Tools**: Available via ZoomInfo/RocketReach/Apollo (not used per task constraints)
- **Email Pattern Inference**: Possible but explicitly forbidden by task

## Recommendations
1. **For Email Enrichment**: Purchase Apollo/ZoomInfo credits OR relax "officially published" constraint
2. **Current Approach**: Focus on NAME + TITLE + LINKEDIN enrichment, mark status as "Contact Identified" instead of "Enriched"
3. **Alternative**: Use LinkedIn for direct outreach (connection requests + InMail)
4. **Data Quality**: All contacts verified via official sources + LinkedIn profiles

## Next Steps
1. Continue enrichment with more firms
2. Focus on sectors: Healthcare IT, Fintech, Business Services, SaaS
3. Create individual firm dossiers in `PE-firms/` directory
4. Git commit and push to https://github.com/Joesmod/pe-research

---
**Generated**: 2026-04-02 4:36 AM CST  
**By**: Jim (PE Research Cron)  
**Sheet**: [PE CRM Spreadsheet](https://docs.google.com/spreadsheets/d/11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4)
