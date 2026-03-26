const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

async function main() {
  console.log('\n=== PE Research & Enrichment - Hourly Run ===\n');
  
  // Auth
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read sheet
  console.log('Reading Google Sheet...');
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:Z1000',
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  const headers = rows[0];
  const firmIdx = headers.indexOf('Firm');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');
  const titleIdx = headers.indexOf('Position/Title');
  const linkedinIdx = headers.indexOf('LinkedIn URL');
  const notesIdx = headers.indexOf('Notes');
  
  console.log(`Headers: ${headers.join(', ')}`);
  console.log(`Found ${rows.length - 1} total rows\n`);
  
  // Find leads needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    
    const firm = row[firmIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    
    // Skip if already Dead/Paused/Sent
    if (status && ['Dead', 'Paused', 'Sent', 'Replied'].includes(status)) continue;
    
    // Needs enrichment if:
    // - Empty contact name OR
    // - Empty email OR generic email (info@, sales@, ir@, contact@)
    const hasGenericEmail = email && (
      email.toLowerCase().startsWith('info@') ||
      email.toLowerCase().startsWith('sales@') ||
      email.toLowerCase().startsWith('ir@') ||
      email.toLowerCase().startsWith('contact@')
    );
    
    if (!contact || !email || hasGenericEmail) {
      needsEnrichment.push({
        rowIndex: i + 1, // 1-indexed for sheets
        firm,
        contact,
        email,
        status,
      });
    }
  }
  
  console.log(`Found ${needsEnrichment.length} leads needing enrichment\n`);
  
  if (needsEnrichment.length === 0) {
    console.log('No leads need enrichment at this time.');
    return;
  }
  
  // Take top 10-15
  const batch = needsEnrichment.slice(0, 15);
  
  console.log('Leads to enrich in this batch:');
  batch.forEach((lead, idx) => {
    console.log(`${idx + 1}. ${lead.firm} (Row ${lead.rowIndex}) - Contact: "${lead.contact}", Email: "${lead.email}"`);
  });
  
  console.log('\n--- Research Required ---');
  console.log('For each firm above, manually search:');
  console.log('1. Firm website /team /about /leadership pages');
  console.log('2. site:linkedin.com "firm name" + title keywords');
  console.log('3. Press releases, conference speaker lists');
  console.log('4. SEC filings, downloadable PDFs');
  console.log('\nTarget titles: CEO, CTO, COO, CFO, CMO, Partner, Managing Partner, VP Operations, Director Technology, Head of Portfolio Operations, etc.');
  console.log('\nONLY record emails found on official published sources.');
  console.log('NEVER guess email patterns. Leave blank if not found.\n');
  
  // Save batch for reference
  const fs = require('fs');
  fs.writeFileSync(
    path.join(__dirname, 'enrichment-targets-march15-hourly.json'),
    JSON.stringify(batch, null, 2)
  );
  
  console.log(`Batch saved to enrichment-targets-march15-hourly.json`);
}

main().catch(console.error);
