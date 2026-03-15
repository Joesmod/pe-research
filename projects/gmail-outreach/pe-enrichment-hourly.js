const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

async function readSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:N',
  });

  return response.data.values || [];
}

async function findLeadsNeedingEnrichment() {
  const rows = await readSheet();
  if (rows.length === 0) {
    console.log('No data found in sheet');
    return [];
  }

  const headers = rows[0];
  const companyIdx = headers.indexOf('Company');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');
  const websiteIdx = headers.indexOf('Website');
  
  console.log(`Headers: ${headers.join(', ')}`);
  console.log(`Column indices - Company: ${companyIdx}, Contact: ${contactIdx}, Email: ${emailIdx}, Status: ${statusIdx}`);

  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    const website = row[websiteIdx] || '';

    // Skip if status is Sent, Dead, or Replied
    if (['Sent', 'Dead', 'Replied'].includes(status)) {
      continue;
    }

    // Check if needs enrichment
    const hasNoContact = !contact || contact.trim() === '';
    const hasGenericEmail = email && (
      email.includes('info@') ||
      email.includes('sales@') ||
      email.includes('ir@') ||
      email.includes('contact@') ||
      email.includes('hello@')
    );
    const hasNoEmail = !email || email.trim() === '';

    if (hasNoContact || hasGenericEmail || hasNoEmail) {
      needsEnrichment.push({
        rowIndex: i + 1,
        company,
        contact,
        email,
        status,
        website,
        reason: hasNoContact ? 'No contact' : (hasGenericEmail ? 'Generic email' : 'No email')
      });
    }
  }

  return needsEnrichment;
}

async function main() {
  try {
    console.log('Reading Google Sheet...');
    const leads = await findLeadsNeedingEnrichment();
    
    console.log(`\n=== PE RESEARCH & ENRICHMENT - ${new Date().toISOString()} ===`);
    console.log(`Found ${leads.length} leads needing enrichment\n`);
    
    // Take first 15 for this run
    const batch = leads.slice(0, 15);
    
    console.log('Leads to enrich in this batch:');
    batch.forEach((lead, idx) => {
      console.log(`\n${idx + 1}. ${lead.company} (Row ${lead.rowIndex})`);
      console.log(`   Current Contact: ${lead.contact || '(empty)'}`);
      console.log(`   Current Email: ${lead.email || '(empty)'}`);
      console.log(`   Reason: ${lead.reason}`);
      console.log(`   Website: ${lead.website || '(not listed)'}`);
    });

    return batch;
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { findLeadsNeedingEnrichment };
