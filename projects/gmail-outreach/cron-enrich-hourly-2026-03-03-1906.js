const { google } = require('googleapis');

async function enrichLeads() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // First, list all sheets to see what we're working with
  console.log('=== STEP 1: Listing all sheets ===');
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetNames = spreadsheet.data.sheets.map(s => s.properties.title);
  console.log('Available sheets:', sheetNames);
  
  // Read the PE Firms / Tracker sheet (adjust based on what we find)
  const targetSheet = sheetNames.find(name => 
    name.toLowerCase().includes('pe') || 
    name.toLowerCase().includes('firm') ||
    name.toLowerCase().includes('tracker') ||
    name === 'Sheet1'
  ) || sheetNames[0];
  
  console.log(`\n=== STEP 2: Reading from "${targetSheet}" ===`);
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${targetSheet}!A:K`,
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  // Identify header row and columns
  const headers = rows[0];
  console.log('\nHeaders:', headers);
  
  // Find the column indices
  const colMap = {};
  headers.forEach((header, i) => {
    const normalized = header.toLowerCase().trim();
    if (normalized.includes('company') || normalized.includes('firm')) colMap.company = i;
    if (normalized.includes('contact') && normalized.includes('name')) colMap.contactName = i;
    if (normalized.includes('title')) colMap.title = i;
    if (normalized.includes('email')) colMap.email = i;
    if (normalized.includes('status')) colMap.status = i;
    if (normalized.includes('website')) colMap.website = i;
    if (normalized.includes('linkedin')) colMap.linkedin = i;
    if (normalized.includes('note')) colMap.notes = i;
  });
  
  console.log('\nColumn mapping:', colMap);
  
  // Find leads needing enrichment
  console.log('\n=== STEP 3: Finding leads needing enrichment ===');
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    
    const company = row[colMap.company] || '';
    const contactName = row[colMap.contactName] || '';
    const email = row[colMap.email] || '';
    const status = row[colMap.status] || '';
    
    // Skip if already enriched or dead/researched
    if (status && (
      status.toLowerCase().includes('enriched') ||
      status.toLowerCase().includes('dead') ||
      status.toLowerCase().includes('sent')
    )) {
      continue;
    }
    
    // Need enrichment if:
    // - No contact name
    // - Generic email (info@, sales@, ir@, contact@, hello@)
    // - Empty email
    const hasGenericEmail = email && /^(info|sales|ir|contact|hello|general|admin)@/i.test(email);
    const needsContact = !contactName || contactName.trim() === '';
    const needsEmail = !email || hasGenericEmail;
    
    if (needsContact || needsEmail) {
      needsEnrichment.push({
        rowIndex: i + 1, // 1-indexed for Google Sheets
        company,
        contactName,
        email,
        website: row[colMap.website] || '',
        status,
        needsContact,
        needsEmail,
        hasGenericEmail
      });
    }
  }
  
  console.log(`\nFound ${needsEnrichment.length} leads needing enrichment`);
  console.log('\nFirst 15 targets:');
  needsEnrichment.slice(0, 15).forEach((lead, idx) => {
    console.log(`\n${idx + 1}. ${lead.company} (Row ${lead.rowIndex})`);
    console.log(`   Contact: ${lead.contactName || '(empty)'}`);
    console.log(`   Email: ${lead.email || '(empty)'}${lead.hasGenericEmail ? ' (generic)' : ''}`);
    console.log(`   Website: ${lead.website || '(empty)'}`);
    console.log(`   Status: ${lead.status || '(empty)'}`);
  });
  
  // Write the targets to a JSON file for manual research
  const fs = require('fs');
  fs.writeFileSync(
    'enrichment-targets-hourly.json',
    JSON.stringify(needsEnrichment.slice(0, 15), null, 2)
  );
  
  console.log('\n=== Targets written to enrichment-targets-hourly.json ===');
  console.log('\nNext step: Manual web research for each target.');
  console.log('Search for: C-level, Partners, Directors, VPs, Heads of Operations/Value Creation');
  console.log('Sources: firm website, LinkedIn, press releases, SEC filings, conference bios');
  console.log('ONLY use verified emails from official sources. NO GUESSING.');
}

enrichLeads().catch(console.error);
