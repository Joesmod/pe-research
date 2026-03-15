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

  // Count statuses
  const statusCounts = {};
  const activeStatuses = ['Unresearched', 'Active', 'Queued', 'Enriching', 'Enriched', 'Ready to Send'];
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    const website = row[websiteIdx] || '';
    
    // Count statuses
    statusCounts[status] = (statusCounts[status] || 0) + 1;
    
    // Skip if empty company or dead
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
    const needsEmail = !email || email.trim() === '' || hasGenericEmail;
    
    if (needsContact || needsEmail) {
      needsEnrichment.push({
        row: i + 1,
        company,
        contact,
        email,
        website,
        status,
        needsContact,
        needsEmail,
        reason: needsContact ? 'Missing Contact' : (needsEmail ? 'Missing/Generic Email' : '')
      });
    }
  }

  console.log('\nStatus counts:');
  Object.entries(statusCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });

  console.log(`\n\nFound ${needsEnrichment.length} leads needing enrichment:`);
  console.log(JSON.stringify(needsEnrichment.slice(0, 15), null, 2));
  
  // Save to file
  fs.writeFileSync(
    'active-enrichment-needs-march10-1236am.json',
    JSON.stringify(needsEnrichment.slice(0, 15), null, 2)
  );
  
  console.log(`\nTop 15 saved to active-enrichment-needs-march10-1236am.json`);
}

main().catch(console.error);
