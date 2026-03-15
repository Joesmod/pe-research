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
  console.log('Headers:', headers);
  
  // Find indices
  const companyIdx = headers.indexOf('Company Name');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');
  const websiteIdx = headers.indexOf('Website');

  // Identify leads needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    const website = row[websiteIdx] || '';
    
    // Skip if empty company or starts with "Dead"
    if (!company || company.trim() === '' || status.toLowerCase().startsWith('dead') || status === 'Sent' || status === 'Bounced' || status === 'Replied') continue;
    
    // Check if needs enrichment
    const hasGenericEmail = email && (
      email.toLowerCase().includes('info@') ||
      email.toLowerCase().includes('sales@') ||
      email.toLowerCase().includes('ir@') ||
      email.toLowerCase().includes('contact@') ||
      email.toLowerCase().includes('hello@')
    );
    
    const needsContact = !contact || contact.trim() === '';
    const needsEmail = !email || hasGenericEmail;
    
    if (needsContact || needsEmail) {
      needsEnrichment.push({
        row: i + 1,
        company,
        contact,
        email,
        website,
        status,
        reason: needsContact ? 'Missing Contact' : 'Generic Email'
      });
    }
  }

  console.log(`\nFound ${needsEnrichment.length} leads needing enrichment:`);
  console.log(JSON.stringify(needsEnrichment.slice(0, 15), null, 2));
  
  // Save to file
  fs.writeFileSync(
    'enrichment-needs-march10-1236am.json',
    JSON.stringify(needsEnrichment.slice(0, 15), null, 2)
  );
  
  console.log('\nTop 15 saved to enrichment-needs-march10-1236am.json');
}

main().catch(console.error);
