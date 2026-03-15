const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');

async function scan() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:N'
  });
  
  const rows = response.data.values || [];
  
  console.log('Total rows (including potential header):', rows.length);
  console.log('');
  
  // Check if first row is header or data
  console.log('First row:', rows[0]);
  console.log('');
  
  const needsEnrichment = [];
  const alreadyEnriched = [];
  const genericEmails = [];
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contact = row[2] || '';
    const email = row[4] || '';
    const status = (row[9] || '').toLowerCase();
    
    if (!company) continue; // Skip empty rows
    
    // Skip "dead" firms
    if (status.includes('dead') || status === 'closed') continue;
    
    const hasGenericEmail = email.toLowerCase().includes('info@') ||
                           email.toLowerCase().includes('sales@') ||
                           email.toLowerCase().includes('ir@') ||
                           email.toLowerCase().includes('contact@');
    
    if (!contact || !email || hasGenericEmail) {
      needsEnrichment.push({
        row: i + 1,
        company,
        contact: contact || '(empty)',
        email: email || '(empty)',
        status
      });
      
      if (hasGenericEmail) {
        genericEmails.push({ row: i + 1, company, email });
      }
    } else {
      alreadyEnriched.push({ row: i + 1, company, contact, email });
    }
  }
  
  console.log('📊 SHEET ANALYSIS:');
  console.log('');
  console.log(`✅ Fully enriched leads: ${alreadyEnriched.length}`);
  console.log(`⚠️  Needs enrichment: ${needsEnrichment.length}`);
  console.log(`📧 Generic emails: ${genericEmails.length}`);
  console.log('');
  
  if (needsEnrichment.length > 0) {
    console.log('LEADS NEEDING ENRICHMENT (first 20):');
    needsEnrichment.slice(0, 20).forEach(lead => {
      console.log(`  Row ${lead.row}: ${lead.company}`);
      console.log(`    Contact: ${lead.contact}`);
      console.log(`    Email: ${lead.email}`);
      console.log(`    Status: ${lead.status || '(empty)'}`);
      console.log('');
    });
  }
  
  if (genericEmails.length > 0) {
    console.log('GENERIC EMAILS (first 10):');
    genericEmails.slice(0, 10).forEach(item => {
      console.log(`  Row ${item.row}: ${item.company} - ${item.email}`);
    });
  }
}

scan().catch(console.error);
