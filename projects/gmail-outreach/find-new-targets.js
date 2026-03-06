const { google } = require('googleapis');
const fs = require('fs');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
});

(async () => {
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A:J'
  });

  const rows = res.data.values;
  const targets = [];
  
  const excludeKeywords = ['search', 'prep', 'oasis', 'training', 'education', 'incubator', 'accelerator', 'community', 'network', 'association', 'platform', 'directory', 'database', 'software', 'saas'];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const firmName = row[0] || '';
    const website = row[1] || '';
    const contactName = row[2] || '';
    const email = row[4] || '';
    const linkedin = row[6] || '';
    const sectors = row[7] || '';
    const status = row[9] || '';
    
    // Focus on New - Unresearched or Partial status
    if (status !== 'New - Unresearched' && status !== 'Partial') continue;
    
    // Skip if contains exclude keywords
    if (excludeKeywords.some(kw => firmName.toLowerCase().includes(kw))) continue;
    
    // Check if needs enrichment
    const needsEnrichment = !contactName || contactName.trim() === '' || contactName === 'Jacob Zodikoff' ||
      !email || email.includes('info@') || email.includes('sales@') || email.includes('ir@') || email.includes('contact@') || email.trim() === '';
    
    if (needsEnrichment && website) {
      targets.push({ 
        row: i + 1, 
        firmName, 
        website, 
        linkedin,
        sectors,
        contactName, 
        email 
      });
    }
    
    if (targets.length >= 15) break;
  }
  
  console.log(`Found ${targets.length} PE firms needing enrichment (New - Unresearched):\n`);
  targets.forEach(t => {
    console.log(`\nRow ${t.row}: ${t.firmName}`);
    console.log(`  Website: ${t.website}`);
    console.log(`  LinkedIn: ${t.linkedin}`);
    console.log(`  Sectors: ${t.sectors}`);
  });
  
  fs.writeFileSync('new-firm-targets-march5.json', JSON.stringify(targets, null, 2));
})();
