const { google } = require('googleapis');

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const sheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Read all data from Sheet1
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'Sheet1!A:K',
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  const headers = rows[0];
  console.log('Headers:', headers);
  
  // Find indices for key columns
  const firmIdx = headers.indexOf('Company Name');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');
  const linkedInIdx = headers.indexOf('LinkedIn');
  const titleIdx = headers.indexOf('Title');
  const websiteIdx = headers.indexOf('Website');
  
  console.log(`\nColumn indices: Firm=${firmIdx}, Contact=${contactIdx}, Email=${emailIdx}, Status=${statusIdx}`);
  
  // Find leads needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const firm = row[firmIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    
    // Skip if status contains Dead, Sent, or is marked Enriched
    const statusLower = status.toLowerCase();
    if (statusLower.includes('dead') || statusLower === 'sent' || statusLower === 'enriched') {
      continue;
    }
    
    // Check if it needs enrichment
    const hasNoContact = !contact || contact.trim() === '';
    const hasGenericEmail = email && (
      email.toLowerCase().includes('info@') ||
      email.toLowerCase().includes('sales@') ||
      email.toLowerCase().includes('ir@') ||
      email.toLowerCase().includes('contact@') ||
      email.toLowerCase().includes('admin@')
    );
    const hasEmptyEmail = !email || email.trim() === '';
    
    if (firm && (hasNoContact || hasGenericEmail || hasEmptyEmail)) {
      needsEnrichment.push({
        row: i + 1,
        firm,
        contact,
        email,
        status,
        reason: hasNoContact ? 'No contact' : hasEmptyEmail ? 'No email' : 'Generic email'
      });
    }
  }
  
  console.log(`\n=== LEADS NEEDING ENRICHMENT: ${needsEnrichment.length} ===\n`);
  
  // Take first 15 for this run
  const targets = needsEnrichment.slice(0, 15);
  
  targets.forEach((lead, idx) => {
    console.log(`${idx + 1}. Row ${lead.row}: ${lead.firm}`);
    console.log(`   Contact: ${lead.contact || '(empty)'}`);
    console.log(`   Email: ${lead.email || '(empty)'}`);
    console.log(`   Status: ${lead.status}`);
    console.log(`   Reason: ${lead.reason}\n`);
  });
  
  console.log(`\nTotal needing enrichment: ${needsEnrichment.length}`);
  console.log(`Processing this batch: ${targets.length}`);
}

main().catch(console.error);
