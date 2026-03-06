const { google } = require('googleapis');
const key = require('./service-account.json');

async function findPEFirms() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A1:J800'
  });
  
  const rows = result.data.values;
  const peFirms = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contact = row[2] || '';
    const email = row[4] || '';
    const website = row[5] || '';
    const sector = row[7] || '';
    
    // Skip non-PE firms (recruiters, service providers)
    if (company.toLowerCase().includes('search') ||
        company.toLowerCase().includes('oasis') ||
        company.toLowerCase().includes('prep') ||
        company.toLowerCase().includes('cardea group') ||
        company.toLowerCase().includes('odyssey') ||
        company.toLowerCase().includes('hrcap')) {
      continue;
    }
    
    const needsEnrichment = !contact || !email || 
                           email.startsWith('info@') || 
                           email.startsWith('sales@') ||
                           email.startsWith('ir@') ||
                           email.startsWith('contact@');
    
    if (needsEnrichment && company && website) {
      peFirms.push({
        row: i + 1,
        company,
        website,
        sector
      });
    }
  }
  
  console.log(`\nFound ${peFirms.length} PE firms needing enrichment\n`);
  console.log('Top 15 candidates for manual research:\n');
  peFirms.slice(0, 15).forEach(f => {
    console.log(`[Row ${f.row}] ${f.company}`);
    console.log(`  Website: ${f.website}`);
    console.log(`  Sector: ${f.sector || 'N/A'}`);
    console.log('');
  });
}

findPEFirms().catch(console.error);
