const { google } = require('googleapis');

async function findPriorityTargets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'sheets-service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A:N'
  });
  
  const rows = res.data.values || [];
  const headers = rows[0];
  
  console.log('Looking for high-priority enrichment targets (Gumbo Score >= 8, needs contact/email)...\n');
  
  const targets = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0];
    const contactName = row[2];
    const email = row[4];
    const status = row[9];
    const gumboScore = parseInt(row[13]) || 0;
    
    // Skip if already contacted or dead
    if (status === 'Contacted' || status === 'Dead Lead') continue;
    
    // High priority: Gumbo Score >= 8 and missing contact or email
    if (gumboScore >= 8 && (!contactName || !email || contactName.trim() === '' || email.trim() === '')) {
      targets.push({
        row: i + 1,
        company,
        contactName: contactName || '(empty)',
        email: email || '(empty)',
        gumboScore,
        website: row[5] || '(empty)'
      });
    }
  }
  
  // Sort by Gumbo Score descending
  targets.sort((a, b) => b.gumboScore - a.gumboScore);
  
  console.log(`Found ${targets.length} high-priority targets (Score >= 8)\n`);
  
  if (targets.length === 0) {
    console.log('\n⚠️ No high-priority targets found. Checking targets with Score >= 7...\n');
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const company = row[0];
      const contactName = row[2];
      const email = row[4];
      const status = row[9];
      const gumboScore = parseInt(row[13]) || 0;
      
      if (status === 'Contacted' || status === 'Dead Lead') continue;
      
      if (gumboScore >= 7 && (!contactName || !email || contactName.trim() === '' || email.trim() === '')) {
        targets.push({
          row: i + 1,
          company,
          contactName: contactName || '(empty)',
          email: email || '(empty)',
          gumboScore,
          website: row[5] || '(empty)'
        });
      }
    }
    
    targets.sort((a, b) => b.gumboScore - a.gumboScore);
    console.log(`Found ${targets.length} targets with Score >= 7\n`);
  }
  
  console.log('Top 20 targets:');
  targets.slice(0, 20).forEach((t, idx) => {
    console.log(`${idx + 1}. Row ${t.row}: ${t.company} | Score: ${t.gumboScore} | Contact: ${t.contactName} | Email: ${t.email}`);
  });
  
  return targets;
}

findPriorityTargets().catch(console.error);
