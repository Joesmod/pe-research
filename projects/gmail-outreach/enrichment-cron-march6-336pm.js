const { google } = require('googleapis');
const fs = require('fs');

const GENERIC_EMAILS = ['info@', 'sales@', 'ir@', 'contact@', 'hello@', 'support@'];

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  console.log('Reading Google Sheet...');
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:L',
  });
  
  const rows = res.data.values || [];
  console.log(`Total rows: ${rows.length}`);
  
  if (rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  const headers = rows[0];
  console.log('Headers:', headers);
  
  // Find indices
  const companyIdx = headers.findIndex(h => h.includes('Company') || h.includes('Firm'));
  const contactIdx = headers.findIndex(h => h.includes('Contact Name'));
  const emailIdx = headers.findIndex(h => h.includes('Email'));
  const statusIdx = headers.findIndex(h => h.includes('Status'));
  
  console.log(`\nColumn indices: Company=${companyIdx}, Contact=${contactIdx}, Email=${emailIdx}, Status=${statusIdx}`);
  
  // Find leads needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    
    // Skip dead/enriched/sent leads
    if (status.toLowerCase().includes('dead') || 
        status.toLowerCase().includes('enriched') ||
        status.toLowerCase().includes('sent')) {
      continue;
    }
    
    // Check if needs enrichment
    const hasNoContact = !contact || contact.trim() === '';
    const hasGenericEmail = GENERIC_EMAILS.some(g => email.toLowerCase().includes(g));
    const hasNoEmail = !email || email.trim() === '';
    
    if (hasNoContact || hasGenericEmail || hasNoEmail) {
      needsEnrichment.push({
        rowIndex: i + 1,
        company,
        contact,
        email,
        status,
        reason: hasNoContact ? 'No contact name' : hasGenericEmail ? 'Generic email' : 'No email'
      });
    }
  }
  
  console.log(`\n=== LEADS NEEDING ENRICHMENT: ${needsEnrichment.length} ===`);
  
  // Show first 15
  const toShow = needsEnrichment.slice(0, 15);
  toShow.forEach((lead, idx) => {
    console.log(`\n${idx + 1}. ${lead.company}`);
    console.log(`   Row: ${lead.rowIndex}`);
    console.log(`   Contact: ${lead.contact || '(empty)'}`);
    console.log(`   Email: ${lead.email || '(empty)'}`);
    console.log(`   Status: ${lead.status}`);
    console.log(`   Reason: ${lead.reason}`);
  });
  
  // Save full list
  fs.writeFileSync('leads-to-enrich-336pm.json', JSON.stringify(needsEnrichment, null, 2));
  console.log(`\nFull list saved to leads-to-enrich-336pm.json`);
}

main().catch(console.error);
