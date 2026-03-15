const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

(async () => {
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A1:M300'
  });
  
  const rows = res.data.values || [];
  
  console.log('Looking for PE firms that need fresh research...\n');
  
  const needsResearch = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const website = row[5] || '';
    const status = row[9] || '';
    const notes = row[11] || '';
    const contact = row[2] || '';
    const email = row[4] || '';
    
    // Skip if dead or already sent
    if (!company || status === 'Dead' || status === 'Dead Lead' || status === 'Sent') {
      continue;
    }
    
    // Look for signs that this needs enrichment:
    // 1. No real contact name
    // 2. Notes mention "No direct partner emails found" or similar
    // 3. Only has info@/contact@/deals@ emails mentioned
    // 4. Status is not "Enriched" or has problematic data
    
    const noDirectContact = !contact || contact.trim() === '';
    const notesIndicateNoEmail = notes && (
      notes.includes('No direct partner emails found') ||
      notes.includes('No direct emails') ||
      notes.includes('only info@') ||
      notes.includes('only contact@') ||
      notes.includes('only deals@') ||
      notes.includes('blocks direct access') ||
      notes.includes('Website blocks')
    );
    const hasGenericEmailOnly = !email || email.includes('info@') || email.includes('contact@') || email.includes('deals@') || email.includes('sales@');
    
    // Email is clearly wrong (has title words in it)
    const emailFieldHasTitle = email && (email.includes('Partner') || email.includes('CEO') || email.includes('Director') || email.includes('Founder'));
    
    if (noDirectContact || notesIndicateNoEmail || emailFieldHasTitle) {
      needsResearch.push({
        row: i + 1,
        company,
        contact: contact || '[EMPTY]',
        email: email || '[EMPTY]',
        website,
        status,
        notes: notes.substring(0, 150)
      });
    }
  }
  
  console.log(`Found ${needsResearch.length} firms needing fresh research:\n`);
  
  needsResearch.slice(0, 15).forEach((firm, idx) => {
    console.log(`${idx + 1}. Row ${firm.row}: ${firm.company}`);
    console.log(`   Contact: ${firm.contact}`);
    console.log(`   Email: ${firm.email}`);
    console.log(`   Website: ${firm.website}`);
    console.log(`   Status: ${firm.status}`);
    console.log(`   Notes: ${firm.notes}...\n`);
  });
  
  if (needsResearch.length > 15) {
    console.log(`... and ${needsResearch.length - 15} more`);
  }
  
  // Output just the list for enrichment
  console.log('\n\n=== FIRMS TO ENRICH (CSV format) ===');
  console.log('Row,Company,Website,CurrentContact,CurrentEmail');
  needsResearch.slice(0, 15).forEach(firm => {
    console.log(`${firm.row},"${firm.company}","${firm.website}","${firm.contact}","${firm.email}"`);
  });
})();
