const { google } = require('googleapis');

// Expected columns (no header row, starts with data)
const COLS = {
  COMPANY: 0,
  WEBSITE: 1,
  CONTACT_NAME: 2,
  TITLE: 3,
  EMAIL: 4,
  OTHER_URL: 5,
  LINKEDIN: 6,
  STATUS: 7,
  NOTES: 8,
  // ...more columns beyond 8
};

async function enrichLeads() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Read the sheet
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:Z',
  });
  
  const rows = result.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  console.log(`📊 Total rows in sheet: ${rows.length}`);
  
  // Find rows that need enrichment
  const needsEnrichment = [];
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const company = row[COLS.COMPANY] || '';
    const contactName = row[COLS.CONTACT_NAME] || '';
    const email = row[COLS.EMAIL] || '';
    const status = row[COLS.STATUS] || '';
    
    if (!company || company.trim() === '') continue; // Skip empty companies
    
    const hasGenericEmail = email && email.match(/^(info|sales|ir|contact|hello|admin|investor)@/i);
    const needsWork = (!contactName || !email || hasGenericEmail) && status !== 'Enriched';
    
    if (needsWork) {
      needsEnrichment.push({
        rowIndex: i,
        company,
        website: row[COLS.WEBSITE] || '',
        contactName,
        email,
        status,
      });
    }
  }
  
  console.log(`🔍 Found ${needsEnrichment.length} leads needing enrichment`);
  
  if (needsEnrichment.length === 0) {
    console.log('✅ All leads are enriched!');
    return;
  }
  
  // Pick top 10-15 to enrich
  const toEnrich = needsEnrichment.slice(0, 15);
  console.log(`\n🎯 Enriching ${toEnrich.length} leads:\n`);
  
  for (const lead of toEnrich) {
    console.log(`Row ${lead.rowIndex + 1}: ${lead.company}`);
    console.log(`  Website: ${lead.website}`);
    console.log(`  Current contact: '${lead.contactName}'`);
    console.log(`  Current email: '${lead.email}'`);
    console.log(`  Status: ${lead.status}`);
    console.log('');
  }
  
  console.log('\n📝 Starting manual research for each firm...\n');
  
  // TODO: For each lead, we need to:
  // 1. Search the firm's website for team/contact pages
  // 2. Look for decision-makers (C-level, Partners, VPs, Directors)
  // 3. Find published emails (no guessing patterns)
  // 4. Update the sheet with findings
  
  console.log('⚠️  Manual research step needed - I will now search for contacts one by one.');
  console.log('Script complete - enrichment data collection in progress...');
}

enrichLeads().catch(console.error);
