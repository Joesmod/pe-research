const fs = require('fs');
const { google } = require('googleapis');

async function analyzeSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A:I'
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }

  const needsEnrichment = [];
  
  // Skip header row
  for (let i = 1; i < rows.length; i++) {
    const [company, website, contact, title, email, , , sector, status] = rows[i];
    
    // Check if needs enrichment
    const hasPlaceholder = contact === 'Jacob Zodikoff' || !contact || contact.trim() === '';
    const hasGenericEmail = !email || 
                           email.includes('info@') || 
                           email.includes('sales@') || 
                           email.includes('ir@') ||
                           email.includes('contact@') ||
                           email.trim() === '';
    
    const needsEmail = status && (status.includes('Needs Email') || status === 'Partial');
    
    if (hasPlaceholder || hasGenericEmail || needsEmail) {
      needsEnrichment.push({
        row: i + 1,
        company,
        website,
        contact,
        title,
        email,
        sector,
        status,
        reason: hasPlaceholder ? 'placeholder contact' : hasGenericEmail ? 'generic/missing email' : 'marked partial'
      });
    }
  }
  
  console.log(`\nFound ${needsEnrichment.length} firms needing enrichment\n`);
  console.log('Top 15 targets:\n');
  
  const targets = needsEnrichment.slice(0, 15);
  targets.forEach((t, idx) => {
    console.log(`${idx + 1}. ${t.company} (Row ${t.row})`);
    console.log(`   Website: ${t.website}`);
    console.log(`   Current: ${t.contact || '(none)'} / ${t.email || '(none)'}`);
    console.log(`   Reason: ${t.reason}`);
    console.log(`   Status: ${t.status || 'none'}\n`);
  });
  
  // Save to file for processing
  fs.writeFileSync('enrich-targets-1036pm.json', JSON.stringify(targets, null, 2));
  console.log('Saved targets to enrich-targets-1036pm.json');
}

analyzeSheet().catch(console.error);
