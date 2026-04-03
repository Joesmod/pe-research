# PE Lead Enrichment - April 3, 2026 1:13 PM

## Session Summary
**Duration:** ~40 minutes  
**Leads Enriched:** 9 firms  
**Verified Emails Found:** 4 firms  
**Contact Names Added:** 9 firms  

## Enrichment Results

### ✅ Firms with Verified Published Emails

1. **Enhanced Healthcare Partners**
   - Contact: Matthew Thompson (General Partner)
   - Email: ehp@enhancedhealthcare.com
   - Source: Official contact page
   - Phone: (929) 242-5196

2. **Gryphon Investors**
   - Contact: Business Development
   - Email: businessdevelopment@gryphoninvestors.com
   - Source: Official contact page
   - Phone: 415-217-7400

3. **Trinity Hunt Partners**
   - Contact: Scott Colvert (Business Development)
   - Email: scolvert@trinityhunt.com
   - Source: Official contact page
   - Phone: 214.777.6603

4. **Hildred Capital Management**
   - Contact: General Contact
   - Email: info@hildredcapital.com
   - Source: Web search → official contact reference
   - Phone: (646) 604-8633

### 📝 Firms with Contact Names (No Published Emails)

5. **Excellere Partners**
   - Contact: Matt Hicks (Managing Partner)
   - LinkedIn: https://www.linkedin.com/in/matthew-hicks-30620311
   - Phone: (303) 765-2410 (from portfolio page)
   - Notes: No email addresses published on official site

6. **Searchlight Capital Partners**
   - Contact: Eric Zinterhofer (Founding Partner)
   - LinkedIn: https://www.linkedin.com/in/eric-zinterhofer-91a14729
   - Notes: Extensive team bios but no individual emails published

7. **Platte River Equity**
   - Contact: Eric Crawford (Managing Director)
   - LinkedIn: https://www.linkedin.com/in/ericacrawford
   - Notes: Team page minimal, no published emails

8. **Coalesce Capital**
   - Contact: Stephanie Geveda (Founder & Managing Partner)
   - Notes: PR contact found ([email protected] - Joele Frank firm), no direct firm emails

9. **Mako Capital Group**
   - Contact: Angel Morales (Founding Partner)
   - Notes: Just launched March 2026, no direct emails found yet
   - Background: Former Founding Partner of Morales Capital, Co-Head of BAML Capital Partners

## Methods Used

- Official website contact pages ✓
- Team/About pages
- LinkedIn searches
- Press release scanning
- Web searches for published contact information

## Apollo API Issues

- Attempted to use Apollo.io API for contact enrichment
- API endpoint deprecated - returned errors
- Pivoted to manual research using web searches and official sources

## Google Sheet Updates

- Updated 9 rows in the PE leads spreadsheet
- Added contact names, titles, emails (where found), LinkedIn URLs
- Marked status as "Enriched" (with email) or "Research in progress" (contact only)
- Added source notes for all findings

## GitHub Repository

✅ Committed 4 new firm dossiers to https://github.com/Joesmod/pe-research
- enhanced-healthcare-partners/README.md
- gryphon-investors/README.md
- trinity-hunt-partners/README.md
- hildred-capital-management/README.md

## Key Insights

1. **Email Publishing Trends:**
   - Mid-market PE firms (~$500M-$2B AUM) rarely publish individual partner emails
   - Common to find general emails (info@, bd@, ir@) but not direct contacts
   - Larger firms (Searchlight, Coalesce) tend to have NO published emails

2. **Best Sources for Verified Emails:**
   - Official contact pages (4/9 success rate)
   - Business development sections
   - Press releases sometimes list PR contacts

3. **Apollo.io Status:**
   - API appears to have changed endpoints
   - Need to update integration or find alternative data source

## Next Steps

- Continue enriching remaining leads in next cron cycle
- Consider alternative contact data sources (ZoomInfo, RocketReach APIs)
- Focus on firms more likely to have published contacts (smaller/regional firms)
- Update Apollo.io integration to use new API endpoints

## Metrics

- **Success Rate (Verified Emails):** 44% (4/9)
- **Contact Info Found:** 100% (9/9)
- **Average Time per Lead:** ~4.5 minutes
- **Sources Checked per Lead:** 3-5 (website, LinkedIn, press releases, web search)
