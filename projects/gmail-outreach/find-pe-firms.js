const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const GENERIC_PATTERNS = ['info@', 'sales@', 'ir@', 'contact@', 'hello@', 'admin@'];

(async () => {
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:L'
  });
  
  const rows = res.data.values;
  
  console.log('\n🎯 REAL PE FIRMS NEEDING ENRICHMENT:\n');
  
  let count = 0;
  const targets = [];
  
  for (let i = 1; i < rows.length && count < 15; i++) {
    const [company, website, contact, title, email, , , , , status] = rows[i];
    
    // Skip Dead firms and non-PE service companies
    if (!status || status.includes('Dead') || status.includes('NOT PE') || 
        status.includes('Executive Search') || status.includes('Investment Bank')) continue;
    
    // Look for firms that need enrichment
    const hasGenericEmail = email && GENERIC_PATTERNS.some(p => email.toLowerCase().includes(p));
    const hasNoContact = !contact || contact.trim().length < 3 || contact === 'Jacob Zodikoff';
    const hasNoEmail = !email || email.trim().length < 5;
    
    // Focus on "New - Unresearched" or "Partial" firms that are likely real PE
    if ((status === 'New - Unresearched' || status === 'Partial' || hasGenericEmail) && 
        (hasNoContact || hasNoEmail || hasGenericEmail)) {
      
      targets.push({
        rowNum: i + 1,
        company,
        website,
        contact: contact || '[NONE]',
        email: email || '[NONE]',
        status
      });
      
      console.log(`${++count}. Row ${i + 1}: ${company}`);
      console.log(`   Website: ${website || '[NONE]'}`);
      console.log(`   Current: ${contact || '[NONE]'} | ${email || '[NONE]'}`);
      console.log(`   Status: ${status}\n`);
    }
  }
  
  console.log(`\nTotal: ${targets.length} real PE firms to enrich`);
  
  require('fs').writeFileSync(
    'pe-firms-to-enrich.json',
    JSON.stringify(targets, null, 2)
  );
  
  console.log('✅ Saved to pe-firms-to-enrich.json');
})();
