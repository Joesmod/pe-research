const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = JSON.parse(fs.readFileSync('service-account.json'));

const auth = new google.auth.GoogleAuth({
  credentials: SERVICE_ACCOUNT,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function main() {
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read all data from Sheet1
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:K',
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  const headers = rows[0];
  console.log('Headers:', headers.join(' | '));
  console.log('\nColumn indices:');
  headers.forEach((h, i) => console.log(`  ${i}: ${h}`));
  
  // Find indices
  const companyIdx = headers.indexOf('Company Name');
  const contactIdx = headers.indexOf('Contact Name');
  const titleIdx = headers.indexOf('Title');
  const emailIdx = headers.indexOf('Email');
  const websiteIdx = headers.indexOf('Website');
  const linkedinIdx = headers.indexOf('LinkedIn');
  const statusIdx = headers.indexOf('Status');
  const notesIdx = headers.indexOf('Notes');
  
  console.log('\nSearching for leads needing enrichment...\n');
  
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[companyIdx]) continue; // Skip empty rows
    
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    
    // Skip if already marked as Dead, Sent, or Enriched
    if (status === 'Dead' || status === 'Sent' || status === 'Enriched') continue;
    
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
        row: i + 1,
        company,
        contact,
        email,
        website: row[websiteIdx] || '',
        linkedin: row[linkedinIdx] || '',
        status,
      });
    }
  }
  
  console.log(`Found ${needsEnrichment.length} leads needing enrichment:\n`);
  
  needsEnrichment.slice(0, 15).forEach(lead => {
    console.log(`Row ${lead.row}: ${lead.company}`);
    console.log(`  Contact: '${lead.contact}'`);
    console.log(`  Email: '${lead.email}'`);
    console.log(`  Website: ${lead.website}`);
    console.log(`  LinkedIn: ${lead.linkedin}`);
    console.log(`  Status: ${lead.status}`);
    console.log();
  });
  
  console.log(`\nReady to enrich ${Math.min(needsEnrichment.length, 15)} leads.`);
}

main().catch(console.error);
