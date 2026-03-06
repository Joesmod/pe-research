const { google } = require('googleapis');
const key = require('./service-account.json');
const fs = require('fs');

const SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function updateEnrichment() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth });

  const findings = [
    {
      company: 'Yellow Wood Partners, LLC',
      contactName: 'Dana Schmaltz',
      title: 'Managing Partner',
      email: 'dschmaltz@yellowwoodpartners.com',
      linkedin: 'https://www.linkedin.com/in/dana-schmaltz-a1a56918/',
      website: 'http://www.yellowwoodpartners.com',
      notes: 'Email found in official Yellow Wood Partners PDF (YellowWood_Brief_Overview_2022.10.17_newaddress.pdf)',
      status: 'Enriched'
    },
    {
      company: 'Bindley Capital Partners',
      contactName: 'Keith Burks',
      title: 'Partner',
      email: '',
      linkedin: 'https://www.linkedin.com/in/keith-burks-80659662/',
      website: 'https://www.bindleycapital.com',
      notes: 'Partner found on LinkedIn, email not publicly available (RocketReach/Apollo only)',
      status: 'Partial - No Direct Email'
    },
    {
      company: 'American Industrial Partners',
      contactName: 'Kim Marvin',
      title: 'General Partner',
      email: '',
      linkedin: 'https://www.linkedin.com/in/kimkmarvin',
      website: 'https://americanindustrial.com',
      notes: 'General Partner identified, no public email found (firm uses @americanindustrial.com domain)',
      status: 'Partial - No Direct Email'
    }
  ];

  // Read current sheet data
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Sheet1!A:J'
  });

  const rows = result.data.values;
  const updates = [];

  // Find and update rows
  for (const finding of findings) {
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const companyName = row[0] || '';
      
      if (companyName.toLowerCase().includes(finding.company.toLowerCase()) || 
          finding.company.toLowerCase().includes(companyName.toLowerCase())) {
        
        console.log(`Updating row ${i + 1}: ${companyName}`);
        
        // Only update if we have a verified email
        if (finding.email) {
          updates.push({
            range: `Sheet1!C${i + 1}:J${i + 1}`,
            values: [[
              finding.contactName,
              finding.title,
              finding.email,
              finding.website,
              finding.linkedin,
              row[7] || '', // Sector Focus
              row[8] || '', // Portfolio Companies
              finding.status
            ]]
          });
        }
        break;
      }
    }
  }

  // Apply updates
  if (updates.length > 0) {
    console.log(`\nApplying ${updates.length} updates...`);
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    console.log('✅ Sheet updated successfully!');
  }

  // Write report
  const report = {
    timestamp: new Date().toISOString(),
    apolloStatus: 'OUT OF CREDITS - 422 error on all requests',
    method: 'Manual research via web search and web fetch',
    leadsReviewed: 20,
    leadsEnriched: findings.filter(f => f.email).length,
    partialFindings: findings.filter(f => !f.email).length,
    findings: findings,
    blockedFirms: [
      'Keltic Financial Partners - Website down, no LinkedIn presence',
      '3G Capital - Very large firm, no public emails',
      'Alta Park Capital - Tech-focused, no public team emails'
    ],
    nextSteps: [
      'Wait for Apollo API credits to refresh',
      'Consider alternative data providers (Hunter.io, RocketReach)',
      'Focus on firms with active websites and team pages',
      'Prioritize mid-market PE firms ($500M-$5B AUM) over mega-funds'
    ]
  };

  fs.writeFileSync('CRON-PE-ENRICHMENT-2026-03-04-1806.md', `# PE Research Enrichment - March 4, 2026 6:00 PM

## Status
**Apollo API: OUT OF CREDITS** (422 Unprocessable Entity error)

## Research Method
Manual web research using:
- Firm websites (team pages, PDFs)
- LinkedIn searches
- SEC filings and press releases
- Web searches for published contact info

## Results

### Successfully Enriched (1)
1. **Yellow Wood Partners, LLC**
   - Contact: Dana Schmaltz
   - Title: Managing Partner
   - Email: dschmaltz@yellowwoodpartners.com
   - LinkedIn: https://www.linkedin.com/in/dana-schmaltz-a1a56918/
   - Source: Official Yellow Wood Partners PDF
   - Status: ✅ Enriched

### Partial Enrichment (2)
Decision-makers identified but no direct email found:

2. **Bindley Capital Partners**
   - Contact: Keith Burks
   - Title: Partner
   - LinkedIn: https://www.linkedin.com/in/keith-burks-80659662/
   - Status: 🟡 Partial - contact info requires paid data provider

3. **American Industrial Partners**
   - Contact: Kim Marvin
   - Title: General Partner
   - LinkedIn: https://www.linkedin.com/in/kimkmarvin
   - Website: https://americanindustrial.com
   - Status: 🟡 Partial - email domain @americanindustrial.com confirmed but no public email

### Blocked/Inactive Firms (3)
- Keltic Financial Partners - Website down, no active LinkedIn
- 3G Capital - Mega-fund with no public contact info
- Alta Park Capital - Tech-focused, no team emails published

## Summary
- **Leads Reviewed:** 20
- **Successfully Enriched:** 1
- **Partial Findings:** 2
- **Unable to Enrich:** 17

## Recommendations

1. **Apollo API Credits:** Wait for daily credit refresh (currently 0 credits remaining)
2. **Alternative Sources:** Consider Hunter.io or RocketReach for email verification
3. **Focus Strategy:** Prioritize mid-market PE firms with active websites
4. **Manual Research:** Continue reviewing firm PDFs, press releases, and SEC filings

## Next Cron Run
Scheduled for 7:00 PM - will retry with Apollo API if credits have refreshed.
`);

  console.log('\n📊 Summary:');
  console.log(`- Enriched with verified email: ${findings.filter(f => f.email).length}`);
  console.log(`- Partial findings (no email): ${findings.filter(f => !f.email).length}`);
  console.log(`- Total leads reviewed: 20`);
  console.log('\n📝 Report written to: CRON-PE-ENRICHMENT-2026-03-04-1806.md');
  
  return report;
}

updateEnrichment().catch(console.error);
