const { google } = require('googleapis');
const fs = require('fs');

async function findRealPETargets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:J',
  });
  
  const rows = response.data.values;
  const headers = rows[0];
  
  const companyIdx = headers.indexOf('Company Name');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');
  const websiteIdx = headers.indexOf('Website');
  
  const targets = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    const website = row[websiteIdx] || '';
    
    // Skip if no company name
    if (!company) continue;
    
    // Only look at Active or Partial status (real PE targets being worked on)
    if (!status.toLowerCase().includes('active') && !status.toLowerCase().includes('partial')) {
      continue;
    }
    
    // Needs enrichment if: no contact OR no email
    const needsContact = !contact || contact.trim() === '';
    const needsEmail = !email || email.trim() === '' || email.includes('info@') || email.includes('sales@') || email.includes('ir@') || email.includes('contact@');
    
    if (needsContact || needsEmail) {
      targets.push({
        rowIndex: i + 1,
        company,
        contact,
        email,
        status,
        website,
        needsContact,
        needsEmail
      });
    }
  }
  
  console.log(`\n=== REAL PE FIRMS NEEDING ENRICHMENT (${targets.length} total) ===\n`);
  
  targets.forEach((t, idx) => {
    console.log(`${idx + 1}. ${t.company}`);
    console.log(`   Row: ${t.rowIndex}`);
    console.log(`   Contact: ${t.contact || '(empty)'}`);
    console.log(`   Email: ${t.email || '(empty)'}`);
    console.log(`   Website: ${t.website}`);
    console.log(`   Needs: ${t.needsContact ? 'Contact' : ''} ${t.needsEmail ? 'Email' : ''}`);
    console.log('');
  });
  
  fs.writeFileSync('real-pe-targets-march7-1136pm.json', JSON.stringify(targets, null, 2));
  console.log(`Saved ${targets.length} targets`);
}

findRealPETargets().catch(console.error);
