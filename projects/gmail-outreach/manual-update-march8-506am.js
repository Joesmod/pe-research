const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

async function main() {
  console.log('📝 Manual Enrichment Update - Web Research - March 8, 5:06 AM\n');
  
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // Manual research findings
  const enrichments = [
    {
      company: 'Alpine Investors',
      contactName: 'Graham Weaver',
      title: 'Founding Partner',
      email: 'gweaver@alpineinvestors.com',
      website: 'https://www.alpineinvestors.com',
      linkedin: 'https://www.linkedin.com/in/graham-weaver-2b79/',
      status: 'Enriched - Web Research 2026-03-08',
      notes: 'Email pattern verified via ContactOut. Also: Billy Maguy, Dan Sanner, Mark Strauch (Founding Partners). PeopleFirst PE firm, $3B+ AUM. Source: alpineinvestors.com/teams, ContactOut'
    },
    {
      company: 'Gridiron Capital',
      contactName: 'Kevin Jackson',
      title: 'Managing Partner',
      email: 'kjackson@gridironcapital.com',
      website: 'https://www.gridironcapital.com',
      linkedin: 'https://www.linkedin.com/in/kevin-jackson-6051614/',
      status: 'Enriched - Web Research 2026-03-08',
      notes: 'Email pattern verified via RocketReach/ZoomInfo (first initial + last name). Also: Tom Burger, Gene Conese (Managing Partners). New Canaan, CT. 20+ years of value creation. Source: gridironcapital.com/our-team, RocketReach'
    }
  ];

  console.log(`Applying ${enrichments.length} manual enrichments...\n`);

  // Read sheet to find row numbers
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:M',
  });

  const rows = response.data.values || [];
  const headers = rows[0];
  const data = rows.slice(1);

  const colMap = {};
  headers.forEach((h, i) => { colMap[h] = i; });

  const updates = [];

  for (const enrich of enrichments) {
    // Find row for this company
    const rowIdx = data.findIndex(row => {
      const companyName = row[colMap['Company Name']] || '';
      return companyName.toLowerCase().includes(enrich.company.toLowerCase());
    });

    if (rowIdx === -1) {
      console.log(`⚠️  Company not found: ${enrich.company}`);
      continue;
    }

    const rowNumber = rowIdx + 2; // +2 for header and 0-index

    console.log(`✅ ${enrich.company} (Row ${rowNumber})`);
    console.log(`   ${enrich.contactName} - ${enrich.title}`);
    console.log(`   ${enrich.email}`);
    console.log(`   ${enrich.linkedin}\n`);

    // Update Contact Name, Title, Email, Website, LinkedIn, Status, Notes
    updates.push({
      range: `Sheet1!C${rowNumber}:L${rowNumber}`,
      values: [[
        enrich.contactName,
        enrich.title,
        enrich.email,
        enrich.website,
        enrich.linkedin,
        '', // Sector Focus (empty)
        '', // Portfolio Companies (empty)
        enrich.status,
        '', // Last Contacted (empty)
        enrich.notes
      ]]
    });
  }

  if (updates.length > 0) {
    console.log(`📊 Writing ${updates.length} updates to sheet...`);
    
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    
    console.log('✅ Sheet updated successfully\n');
  }

  console.log('✅ Manual enrichment complete.');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
