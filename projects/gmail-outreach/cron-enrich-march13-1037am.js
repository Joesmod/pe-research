const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

(async () => {
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  
  // Read full sheet
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:N1000'
  });
  
  const rows = res.data.values;
  if (!rows || rows.length < 2) {
    console.log('No data found.');
    return;
  }
  
  const headers = rows[0];
  console.log('📋 Column headers:', headers);
  console.log('\n🔍 Analyzing leads needing enrichment...\n');
  
  const colIdx = {
    company: 0,
    notebookLM: 1,
    contact: 2,
    title: 3,
    email: 4,
    website: 5,
    linkedin: 6,
    sector: 7,
    portfolio: 8,
    status: 9,
    lastContacted: 10,
    notes: 11,
    companyInfo: 12,
    gumboScore: 13
  };
  
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    
    const company = row[colIdx.company] || '';
    const contact = row[colIdx.contact] || '';
    const title = row[colIdx.title] || '';
    const email = row[colIdx.email] || '';
    const status = row[colIdx.status] || '';
    const website = row[colIdx.website] || '';
    
    // Skip if no company name
    if (!company) continue;
    
    // Check if needs enrichment: empty contact OR generic/empty email
    const hasGenericEmail = email && (
      email.toLowerCase().includes('info@') ||
      email.toLowerCase().includes('sales@') ||
      email.toLowerCase().includes('ir@') ||
      email.toLowerCase().includes('contact@') ||
      email.toLowerCase().includes('hello@') ||
      email.toLowerCase().includes('inquiries@')
    );
    
    if (!contact || !email || hasGenericEmail) {
      needsEnrichment.push({
        rowIndex: i + 1,
        company,
        contact,
        title,
        email,
        website,
        status,
        reason: !contact ? 'Missing contact' : (!email ? 'Missing email' : 'Generic email')
      });
    }
  }
  
  console.log(`✅ Found ${needsEnrichment.length} leads needing enrichment\n`);
  console.log('Top 15 to process:\n' + '='.repeat(100));
  
  const toProcess = needsEnrichment.slice(0, 15);
  toProcess.forEach((lead, idx) => {
    console.log(`\n${idx+1}. Row ${lead.rowIndex}: ${lead.company}`);
    console.log(`   Contact: "${lead.contact}" | Email: "${lead.email}"`);
    console.log(`   Website: ${lead.website || 'N/A'}`);
    console.log(`   Status: ${lead.status}`);
    console.log(`   Reason: ${lead.reason}`);
  });
  
  console.log('\n\n📊 SUMMARY:');
  console.log(`Total rows analyzed: ${rows.length - 1}`);
  console.log(`Leads needing enrichment: ${needsEnrichment.length}`);
  console.log(`Selected for this run: ${toProcess.length}`);
  
  // Output JSON for processing
  const outputPath = 'enrichment-targets-march13-1037am.json';
  require('fs').writeFileSync(outputPath, JSON.stringify(toProcess, null, 2));
  console.log(`\n💾 Saved targets to: ${outputPath}`);
  
})().catch(console.error);
