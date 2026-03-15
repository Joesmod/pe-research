const { google } = require('googleapis');
const fs = require('fs');

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });
  const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

  // Read Sheet1
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:K',
  });

  const rows = res.data.values;
  const headers = rows[0];
  
  // Find indices
  const companyIdx = headers.indexOf('Company Name');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');
  const websiteIdx = headers.indexOf('Website');
  const titleIdx = headers.indexOf('Title');

  const targets = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    const website = row[websiteIdx] || '';
    const title = row[titleIdx] || '';
    
    // Target unresearched and partial leads
    if (status === 'New - Unresearched' || status === 'Partial' || status === 'Research - Needs Email') {
      targets.push({
        row: i + 1,
        company,
        contact,
        title,
        email,
        website,
        status
      });
    }
  }

  console.log(`\nFound ${targets.length} unresearched/partial leads`);
  console.log(`Taking first 15 for enrichment:\n`);
  
  const batch = targets.slice(0, 15);
  console.log(JSON.stringify(batch, null, 2));
  
  // Save to file
  fs.writeFileSync(
    'unresearched-batch-march10.json',
    JSON.stringify(batch, null, 2)
  );
  
  console.log(`\nBatch saved to unresearched-batch-march10.json`);
}

main().catch(console.error);
