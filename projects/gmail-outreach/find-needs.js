const { google } = require('googleapis');
const fs = require('fs');

async function findNeedsEnrichment() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Outreach Log!A:I'
  });
  
  const rows = response.data.values || [];
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const [date, company, contact, email, subject, status, title, linkedin, notes] = rows[i];
    
    // Skip if no company
    if (!company || company.trim() === '') continue;
    
    const needsContact = !contact || contact.trim() === '';
    const needsEmail = !email || email.trim() === '';
    const hasGenericEmail = email && email.match(/^(info|sales|ir|contact|businessdevelopment)@/i);
    const notEnriched = status !== 'Enriched';
    
    if ((needsContact || needsEmail || hasGenericEmail) && notEnriched) {
      needsEnrichment.push({
        row: i + 1,
        company,
        contact: contact || '',
        email: email || '',
        title: title || '',
        linkedin: linkedin || '',
        status: status || '',
        notes: notes || ''
      });
    }
  }
  
  console.log(`Found ${needsEnrichment.length} firms needing enrichment\n`);
  needsEnrichment.slice(0, 15).forEach((item, idx) => {
    console.log(`${idx + 1}. Row ${item.row}: ${item.company}`);
    console.log(`   Contact: "${item.contact}" | Email: "${item.email}" | Status: "${item.status}"`);
  });
  
  fs.writeFileSync('needs-enrichment.json', JSON.stringify(needsEnrichment.slice(0, 15), null, 2));
  console.log(`\nSaved top 15 to needs-enrichment.json`);
}

findNeedsEnrichment().catch(console.error);
