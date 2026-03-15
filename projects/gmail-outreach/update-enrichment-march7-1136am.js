const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = JSON.parse(fs.readFileSync('service-account.json'));

// Manual research findings from web search
const enrichments = [
  {
    row: 10, // HGGC
    contactName: 'Rich Lawson',
    title: 'CEO & Co-Founder',
    email: 'rlawson@hggc.com',
    linkedin: 'https://www.linkedin.com/in/richlawson-hggc/',
    website: 'https://www.hggc.com',
    status: 'Enriched',
    notes: 'Source: ContactOut - verified email'
  },
  {
    row: 5, // Regal Healthcare Capital Partners
    contactName: 'David Kim, MD, MBA',
    title: 'Co-Founder & General Partner',
    email: '', // Domain @regalhcp.com confirmed but exact email not verified
    linkedin: 'https://www.regalhcp.com/team/davidkim',
    website: 'https://www.regalhcp.com',
    status: 'Partial',
    notes: 'Co-Founder identified, domain @regalhcp.com confirmed, email verification needed'
  },
  {
    row: 9, // Charlesbank Capital Partners
    contactName: 'Brandon White',
    title: 'Managing Director & Co-Head, Flagship',
    email: '', // Domain @charlesbank.com confirmed but exact email not verified
    linkedin: 'https://www.charlesbank.com/team/brandon-white/',
    website: 'https://www.charlesbank.com',
    status: 'Partial',
    notes: 'Managing Director identified, domain @charlesbank.com confirmed, email verification needed'
  },
  {
    row: 12, // Sentinel Capital Partners
    contactName: 'Eric Bommer',
    title: 'Managing Partner',
    email: '', // Domain @sentinelpartners.com confirmed but exact email not verified
    linkedin: 'https://www.sentinelpartners.com/member/eric-d-bommer/',
    website: 'https://www.sentinelpartners.com',
    status: 'Partial',
    notes: 'Managing Partner identified, domain @sentinelpartners.com confirmed (pattern: last@domain), email verification needed'
  }
];

async function updateSheet() {
  const auth = new google.auth.JWT(
    SERVICE_ACCOUNT.client_email,
    null,
    SERVICE_ACCOUNT.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
  );

  const sheets = google.sheets({ version: 'v4', auth });
  
  const updates = [];
  
  for (const item of enrichments) {
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
      range: `Sheet1!C${item.row}:L${item.row}`,
      values: [rowData]
    });
    
    console.log(`Prepared update for row ${item.row}: ${item.contactName} (${item.status})`);
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
  
  // Save log
  const log = {
    timestamp: new Date().toISOString(),
    enrichments,
    summary: {
      total: enrichments.length,
      verified: enrichments.filter(e => e.email).length,
      partial: enrichments.filter(e => !e.email).length
    }
  };
  
  fs.writeFileSync(
    'enrichment-log-march7-1136am.json',
    JSON.stringify(log, null, 2)
  );
  
  console.log('\n📊 Summary:');
  console.log(`Total enrichments: ${log.summary.total}`);
  console.log(`Verified emails: ${log.summary.verified}`);
  console.log(`Partial (needs email verification): ${log.summary.partial}`);
}

updateSheet().catch(console.error);
