const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = './service-account.json';

async function main() {
  console.log('🔍 Reading Google Sheet...');
  
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read all data from Sheet1
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:Z',
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }

  const headers = rows[0];
  const companyIdx = headers.indexOf('Company');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');
  const websiteIdx = headers.indexOf('Website');
  
  console.log(`\n📊 Found ${rows.length - 1} total rows`);
  console.log(`Headers: ${headers.join(', ')}\n`);

  // Identify leads needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    const website = row[websiteIdx] || '';
    
    // Skip if already sent or dead
    if (status && (status.toLowerCase().includes('sent') || status.toLowerCase().includes('dead'))) {
      continue;
    }
    
    // Needs enrichment if:
    // - No contact name
    // - No email OR generic email (info@, sales@, ir@, contact@, hello@)
    const noContact = !contact || contact.trim() === '';
    const genericEmail = email && (
      email.startsWith('info@') || 
      email.startsWith('sales@') || 
      email.startsWith('ir@') ||
      email.startsWith('contact@') ||
      email.startsWith('hello@') ||
      email.startsWith('support@')
    );
    const noEmail = !email || email.trim() === '';
    
    if (noContact || genericEmail || noEmail) {
      needsEnrichment.push({
        rowIndex: i + 1, // 1-indexed for sheet
        company,
        contact,
        email,
        status,
        website,
        reason: [
          noContact ? 'No contact' : null,
          noEmail ? 'No email' : null,
          genericEmail ? 'Generic email' : null
        ].filter(Boolean).join(', ')
      });
    }
  }

  console.log(`\n✅ Found ${needsEnrichment.length} leads needing enrichment\n`);
  
  // Take first 15 for this run
  const batch = needsEnrichment.slice(0, 15);
  
  console.log(`📋 Batch of ${batch.length} to enrich:\n`);
  batch.forEach((lead, idx) => {
    console.log(`${idx + 1}. ${lead.company} (Row ${lead.rowIndex})`);
    console.log(`   Current: ${lead.contact || '[No contact]'} - ${lead.email || '[No email]'}`);
    console.log(`   Reason: ${lead.reason}`);
    console.log(`   Website: ${lead.website || '[No website]'}\n`);
  });

  // Save to file for enrichment
  fs.writeFileSync(
    'enrichment-targets-march14-637am.json',
    JSON.stringify(batch, null, 2)
  );
  
  console.log(`\n💾 Saved targets to enrichment-targets-march14-637am.json`);
  console.log(`\n🎯 Next: Manual research for each firm to find decision-makers with verified emails`);
}

main().catch(console.error);
