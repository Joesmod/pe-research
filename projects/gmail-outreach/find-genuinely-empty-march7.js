const { google } = require('googleapis');

async function findGenuinelyEmpty() {
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
  
  console.log('Finding firms that are COMPLETELY unenriched (empty contact AND empty email)...\n');
  
  const targets = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0];
    const contactName = row[2];
    const email = row[4];
    const website = row[5];
    const status = row[9];
    const gumboScore = parseInt(row[13]) || 0;
    
    // Skip if already contacted or dead
    if (status === 'Contacted' || status === 'Dead Lead') continue;
    
    // Genuinely empty: BOTH contact AND email are missing
    const hasNoContact = !contactName || contactName.trim() === '';
    const hasNoEmail = !email || email.trim() === '';
    
    if (hasNoContact && hasNoEmail && website) {
      targets.push({
        row: i + 1,
        company,
        gumboScore,
        website
      });
    }
  }
  
  // Sort by Gumbo Score descending
  targets.sort((a, b) => b.gumboScore - a.gumboScore);
  
  console.log(`Found ${targets.length} completely unenriched firms\n`);
  console.log('Top 20 (sorted by Gumbo Score):');
  targets.slice(0, 20).forEach((t, idx) => {
    console.log(`${idx + 1}. Row ${t.row}: ${t.company} | Score: ${t.gumboScore} | ${t.website}`);
  });
  
  console.log('\n');
  console.log(`Firms with Score >= 8: ${targets.filter(t => t.gumboScore >= 8).length}`);
  console.log(`Firms with Score >= 7: ${targets.filter(t => t.gumboScore >= 7).length}`);
  console.log(`Firms with Score >= 6: ${targets.filter(t => t.gumboScore >= 6).length}`);
  
  return targets;
}

findGenuinelyEmpty().catch(console.error);
