const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Read the main sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:K', // Adjust range as needed
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }

  // Parse headers
  const headers = rows[0];
  const companyIdx = headers.indexOf('Company Name');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');
  const titleIdx = headers.indexOf('Title');
  const linkedinIdx = headers.indexOf('LinkedIn');
  const notesIdx = headers.indexOf('Notes');

  console.log(`Found ${rows.length - 1} total rows`);
  console.log(`Column indices: Company=${companyIdx}, Contact=${contactIdx}, Email=${emailIdx}, Status=${statusIdx}`);

  // Find rows needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    
    // Skip if status contains "Dead" or is Sent, Replied, Bounced
    if (status.includes('Dead') || ['Sent', 'Replied', 'Bounced'].includes(status)) {
      continue;
    }

    // Check if needs enrichment
    const hasNoContact = !contact || contact.trim() === '';
    const hasGenericEmail = email && (email.includes('info@') || email.includes('sales@') || email.includes('ir@') || email.includes('contact@'));
    const hasNoEmail = !email || email.trim() === '';

    if (hasNoContact || hasGenericEmail || hasNoEmail) {
      needsEnrichment.push({
        rowIndex: i + 1, // 1-indexed for sheet
        company,
        contact,
        email,
        status,
      });
    }
  }

  console.log(`\nFound ${needsEnrichment.length} leads needing enrichment:`);
  needsEnrichment.slice(0, 15).forEach(lead => {
    console.log(`  Row ${lead.rowIndex}: ${lead.company} - Contact: "${lead.contact}" | Email: "${lead.email}" | Status: ${lead.status}`);
  });

  // Save to JSON for processing
  const fs = require('fs');
  fs.writeFileSync(
    path.join(__dirname, 'enrichment-targets-march4-2pm.json'),
    JSON.stringify(needsEnrichment, null, 2)
  );

  console.log(`\nSaved ${needsEnrichment.length} targets to enrichment-targets-march4-2pm.json`);
}

main().catch(console.error);
