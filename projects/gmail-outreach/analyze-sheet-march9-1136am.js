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
  
  // Find indices for key columns
  const firmIdx = headers.indexOf('Company Name');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');
  const linkedInIdx = headers.indexOf('LinkedIn');
  const titleIdx = headers.indexOf('Title');
  const websiteIdx = headers.indexOf('Website');
  
  // Count statuses
  const statusCounts = {};
  const noContact = [];
  const noEmail = [];
  const genericEmail = [];
  const fullyEnriched = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const firm = row[firmIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || 'No Status';
    
    // Count statuses
    statusCounts[status] = (statusCounts[status] || 0) + 1;
    
    if (!firm) continue;
    
    // Check enrichment status
    const hasContact = contact && contact.trim() !== '';
    const hasEmail = email && email.trim() !== '';
    const isGeneric = email && (
      email.toLowerCase().includes('info@') ||
      email.toLowerCase().includes('sales@') ||
      email.toLowerCase().includes('ir@') ||
      email.toLowerCase().includes('contact@') ||
      email.toLowerCase().includes('admin@')
    );
    
    const statusLower = status.toLowerCase();
    const isDead = statusLower.includes('dead');
    const isSent = statusLower === 'sent';
    
    if (!hasContact && !isDead && !isSent) {
      noContact.push({ row: i + 1, firm, status, email });
    }
    if (!hasEmail && !isDead && !isSent) {
      noEmail.push({ row: i + 1, firm, contact, status });
    }
    if (isGeneric && !isDead && !isSent) {
      genericEmail.push({ row: i + 1, firm, contact, email, status });
    }
    if (hasContact && hasEmail && !isGeneric) {
      fullyEnriched.push({ row: i + 1, firm, contact, email, status });
    }
  }
  
  console.log('\n=== STATUS BREAKDOWN ===');
  Object.entries(statusCounts).sort((a, b) => b[1] - a[1]).forEach(([status, count]) => {
    console.log(`${status}: ${count}`);
  });
  
  console.log(`\n=== ACTIVE LEADS ANALYSIS ===`);
  console.log(`Total rows: ${rows.length - 1}`);
  console.log(`No Contact Name: ${noContact.length}`);
  console.log(`No Email: ${noEmail.length}`);
  console.log(`Generic Email: ${genericEmail.length}`);
  console.log(`Fully Enriched (has contact + real email): ${fullyEnriched.length}`);
  
  if (noContact.length > 0) {
    console.log(`\n=== LEADS WITH NO CONTACT (First 10) ===`);
    noContact.slice(0, 10).forEach(lead => {
      console.log(`Row ${lead.row}: ${lead.firm} | Status: ${lead.status} | Email: ${lead.email || '(none)'}`);
    });
  }
  
  if (noEmail.length > 0) {
    console.log(`\n=== LEADS WITH NO EMAIL (First 10) ===`);
    noEmail.slice(0, 10).forEach(lead => {
      console.log(`Row ${lead.row}: ${lead.firm} | Contact: ${lead.contact} | Status: ${lead.status}`);
    });
  }
  
  if (genericEmail.length > 0) {
    console.log(`\n=== LEADS WITH GENERIC EMAIL (First 10) ===`);
    genericEmail.slice(0, 10).forEach(lead => {
      console.log(`Row ${lead.row}: ${lead.firm} | Contact: ${lead.contact} | Email: ${lead.email} | Status: ${lead.status}`);
    });
  }
  
  // Find best candidates for enrichment
  const needsWork = [...noContact, ...noEmail, ...genericEmail];
  const unique = Array.from(new Set(needsWork.map(l => l.row))).map(row => 
    needsWork.find(l => l.row === row)
  );
  
  console.log(`\n=== TOTAL UNIQUE LEADS NEEDING ENRICHMENT ===`);
  console.log(`${unique.length} leads need enrichment work`);
}

main().catch(console.error);
