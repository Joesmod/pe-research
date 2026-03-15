const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

async function findNeeds() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read all data
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:Z1000',
  });
  
  const [headers, ...rows] = response.data.values;
  
  console.log(`Total rows: ${rows.length}`);
  console.log(`Headers: ${headers.join(', ')}\n`);
  
  const colIdx = {
    company: headers.indexOf('Company Name'),
    contact: headers.indexOf('Contact Name'),
    email: headers.indexOf('Email'),
    title: headers.indexOf('Title'),
    status: headers.indexOf('Status'),
    website: headers.indexOf('Website'),
    linkedin: headers.indexOf('LinkedIn'),
  };
  
  console.log('=== LOOKING FOR ENRICHMENT NEEDS ===\n');
  
  const candidates = [];
  
  rows.forEach((row, idx) => {
    const rowNum = idx + 2;
    const company = row[colIdx.company] || '';
    const contact = row[colIdx.contact] || '';
    const email = row[colIdx.email] || '';
    const title = row[colIdx.title] || '';
    const status = (row[colIdx.status] || '').toLowerCase();
    const website = row[colIdx.website] || '';
    const linkedin = row[colIdx.linkedin] || '';
    
    // Skip completely empty rows
    if (!company && !contact && !email) return;
    
    // Criteria for needing enrichment:
    // 1. Missing contact name
    // 2. Missing email
    // 3. Generic email (info@, sales@, etc.)
    // 4. Status doesn't say "Enriched" clearly
    
    const hasGenericEmail = email && /^(info|sales|ir|contact|admin|support|hello|team|general)@/i.test(email);
    const missingContact = !contact;
    const missingEmail = !email;
    const unclearStatus = !status.includes('enriched') && !status.includes('dead') && !status.includes('sent');
    
    let reasons = [];
    if (missingContact) reasons.push('No contact name');
    if (missingEmail) reasons.push('No email');
    if (hasGenericEmail) reasons.push(`Generic email: ${email}`);
    
    if (reasons.length > 0 && website) {
      candidates.push({
        rowNum,
        company,
        contact,
        email,
        title,
        website,
        linkedin,
        status,
        reasons: reasons.join(', '),
      });
    }
  });
  
  console.log(`Found ${candidates.length} candidates for enrichment:\n`);
  
  candidates.slice(0, 20).forEach(c => {
    console.log(`Row ${c.rowNum}: ${c.company || '(no company)'}`);
    console.log(`  Contact: ${c.contact || '(empty)'}`);
    console.log(`  Email: ${c.email || '(empty)'}`);
    console.log(`  Website: ${c.website}`);
    console.log(`  Reasons: ${c.reasons}`);
    console.log(`  Status: ${c.status}`);
    console.log('');
  });
  
  if (candidates.length === 0) {
    console.log('\n✅ All leads appear to be enriched!');
    console.log('Checking for potential improvements...\n');
    
    // Look for rows that might need better data
    const needsImprovement = [];
    rows.forEach((row, idx) => {
      const rowNum = idx + 2;
      const contact = row[colIdx.contact] || '';
      const email = row[colIdx.email] || '';
      const title = row[colIdx.title] || '';
      const website = row[colIdx.website] || '';
      const linkedin = row[colIdx.linkedin] || '';
      
      if (!contact && !email) return; // Skip empty rows
      
      let improvements = [];
      if (contact && !title) improvements.push('Missing title');
      if (contact && !linkedin) improvements.push('Missing LinkedIn');
      if (email && /\*/.test(email)) improvements.push('Inferred email pattern');
      
      if (improvements.length > 0 && website) {
        needsImprovement.push({
          rowNum,
          contact,
          email,
          website,
          improvements: improvements.join(', '),
        });
      }
    });
    
    console.log(`Found ${needsImprovement.length} rows that could be improved:\n`);
    needsImprovement.slice(0, 15).forEach(r => {
      console.log(`Row ${r.rowNum}: ${r.contact}`);
      console.log(`  Improvements: ${r.improvements}`);
      console.log('');
    });
  }
  
  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    total_rows: rows.length,
    needs_enrichment: candidates.length,
    candidates: candidates.slice(0, 50),
  };
  
  const fs = require('fs');
  fs.writeFileSync(
    path.join(__dirname, 'enrichment-needs-march12-11pm.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n✅ Report saved to enrichment-needs-march12-11pm.json');
}

findNeeds().catch(console.error);
