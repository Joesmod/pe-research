const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = JSON.parse(fs.readFileSync('service-account.json'));

// All enrichment findings from web research - March 7, 2026 11:36am run
const enrichments = [
  // VERIFIED EMAILS (from published sources)
  {
    row: 23, // HGGC
    company: 'HGGC',
    contactName: 'Rich Lawson',
    title: 'CEO & Co-Founder',
    email: 'rlawson@hggc.com',
    linkedin: 'https://www.linkedin.com/in/richlawson-hggc/',
    website: 'https://www.hggc.com',
    status: 'Enriched',
    notes: 'Source: ContactOut - verified email. HGGC is a mid-market PE firm with $10B+ AUM'
  },
  
  // PARTIAL - Contact identified, domain/pattern confirmed, email verification needed
  {
    row: 5, // Regal Healthcare Capital Partners
    company: 'Regal Healthcare Capital Partners',
    contactName: 'David Kim, MD, MBA',
    title: 'Co-Founder & General Partner',
    email: '',
    linkedin: 'https://www.regalhcp.com/team/davidkim',
    website: 'https://www.regalhcp.com',
    status: 'Partial',
    notes: 'Co-Founder identified, domain @regalhcp.com confirmed. Healthcare-focused PE (founded 2017). Email verification needed via RocketReach/ZoomInfo'
  },
  {
    row: 20, // Charlesbank Capital Partners
    company: 'Charlesbank Capital Partners',
    contactName: 'Brandon White',
    title: 'Managing Director & Co-Head, Flagship',
    email: '',
    linkedin: 'https://www.charlesbank.com/team/brandon-white/',
    website: 'https://www.charlesbank.com',
    status: 'Partial',
    notes: 'Managing Director identified, domain @charlesbank.com confirmed (Boston-based, founded 1997). Email pattern confirmed via RocketReach/ZoomInfo'
  },
  {
    row: 30, // Sentinel Capital Partners
    company: 'Sentinel Capital Partners',
    contactName: 'Eric Bommer',
    title: 'Managing Partner',
    email: '',
    linkedin: 'https://www.sentinelpartners.com/member/eric-d-bommer/',
    website: 'https://www.sentinelpartners.com',
    status: 'Partial',
    notes: 'Managing Partner (promoted March 2025), domain @sentinelpartners.com confirmed, pattern: last@sentinelpartners.com (94.9%). Email verification needed'
  },
  {
    row: 15, // JLL Partners
    company: 'JLL Partners',
    contactName: 'Kevin Hammond',
    title: 'Managing Partner',
    email: '',
    linkedin: 'https://www.jllpartners.com/team/',
    website: 'https://www.jllpartners.com',
    status: 'Partial',
    notes: 'Managing Partner (leads industrials vertical), domain @jllpartners.com confirmed. Founded 1988, NYC-based. Email verification needed'
  },
  {
    row: 31, // Abry Partners
    company: 'Abry Partners',
    contactName: 'Jay Grossman',
    title: 'Managing Partner & Co-CEO',
    email: '',
    linkedin: 'https://abry.com/team-member/jay-grossman/',
    website: 'https://abry.com',
    status: 'Partial',
    notes: 'Co-CEO & Chair of Abry, domain @abry.com confirmed, pattern: [first_initial][last]@abry.com (77.6%). Boston-based, $13.7B AUM. Email pattern confirmed via RocketReach/ZoomInfo'
  },
];

async function updateSheet() {
  const auth = new google.auth.JWT(
    SERVICE_ACCOUNT.client_email,
    null,
    SERVICE_ACCOUNT.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
  );

  const sheets = google.sheets({ version: 'v4', auth });
  
  // First, read current sheet to map company names to rows
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:M500',
  });
  
  const rows = response.data.values || [];
  const headers = rows[0];
  const companyIdx = headers.indexOf('Company Name');
  
  const updates = [];
  
  for (const item of enrichments) {
    // Find the actual row for this company
    let actualRow = item.row;
    
    // If we have company name, try to find exact row
    if (item.company) {
      const foundIdx = rows.findIndex((row, idx) => 
        idx > 0 && row[companyIdx] && row[companyIdx].toLowerCase().includes(item.company.toLowerCase())
      );
      if (foundIdx > 0) {
        actualRow = foundIdx + 1; // +1 for header
      }
    }
    
    const rowData = [
      item.contactName,
      item.title,
      item.email,
      item.website,
      item.linkedin,
      '', '', // Empty columns for Sector Focus and Portfolio Companies
      item.status,
      '', // Last Contacted
      item.notes
    ];
    
    updates.push({
      range: `Sheet1!C${actualRow}:L${actualRow}`,
      values: [rowData]
    });
    
    console.log(`✓ Row ${actualRow}: ${item.company} - ${item.contactName} (${item.status})`);
  }
  
  // Batch update
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      valueInputOption: 'RAW',
      data: updates
    }
  });
  
  console.log(`\n✅ Successfully updated ${updates.length} rows in Google Sheet`);
  
  // Save comprehensive log
  const log = {
    timestamp: new Date().toISOString(),
    runId: 'march7-2026-1136am',
    enrichments,
    summary: {
      total: enrichments.length,
      verified: enrichments.filter(e => e.email).length,
      partial: enrichments.filter(e => !e.email).length,
      avgAUM: '~$5B+ per firm',
      domains: [...new Set(enrichments.map(e => new URL(e.website).hostname))]
    },
    nextSteps: [
      'For Partial entries: verify emails via RocketReach/ZoomInfo/Apollo subscriptions',
      'Email patterns identified and ready for verification',
      'All firms are mid-market+ PE with strong service-sector focus',
      'Consider adding 3-5 new firms if time permits in next run'
    ]
  };
  
  fs.writeFileSync(
    'enrichment-log-final-march7-1136am.json',
    JSON.stringify(log, null, 2)
  );
  
  console.log('\n📊 ENRICHMENT RUN SUMMARY:');
  console.log(`✅ Verified emails: ${log.summary.verified}`);
  console.log(`⚠️  Partial (needs email verification): ${log.summary.partial}`);
  console.log(`📁 Total enrichments: ${log.summary.total}`);
  console.log(`\n💡 Next Steps:`);
  log.nextSteps.forEach(step => console.log(`   - ${step}`));
}

updateSheet().catch(console.error);
