const { google } = require('googleapis');

async function checkTargets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'sheets-service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A:M'
  });
  
  const rows = res.data.values || [];
  const headers = rows[0];
  
  console.log('Headers:', headers);
  console.log('\nFinding firms needing enrichment (empty Contact Name or Email)...\n');
  
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0];
    const contactName = row[2];
    const email = row[4];
    const status = row[9];
    const gumboScore = row[13];
    
    // Skip if already contacted or dead
    if (status === 'Contacted' || status === 'Dead Lead') continue;
    
    // Need enrichment if missing contact or email
    if (!contactName || !email || contactName.trim() === '' || email.trim() === '') {
      needsEnrichment.push({
        row: i + 1,
        company,
        contactName: contactName || '(empty)',
        email: email || '(empty)',
        gumboScore: gumboScore || 'N/A'
      });
    }
  }
  
  console.log(`Found ${needsEnrichment.length} firms needing enrichment\n`);
  console.log('Top 20:');
  needsEnrichment.slice(0, 20).forEach(f => {
    console.log(`Row ${f.row}: ${f.company} | Score: ${f.gumboScore} | Contact: ${f.contactName} | Email: ${f.email}`);
  });
}

checkTargets().catch(console.error);
