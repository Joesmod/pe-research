const { google } = require('googleapis');

async function investigateLeads() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'A:K',
  });
  
  const rows = response.data.values;
  const headers = rows[0];
  
  console.log('=== All Leads With Empty Contact or Generic Email ===\n');
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contact = row[2] || '';
    const email = row[4] || '';
    const status = row[9] || '';
    const website = row[5] || '';
    const sector = row[7] || '';
    
    if (!company) continue;
    
    const hasNoContact = !contact || contact.trim() === '';
    const hasGenericEmail = email && (
      email.toLowerCase().startsWith('info@') ||
      email.toLowerCase().startsWith('sales@') ||
      email.toLowerCase().startsWith('ir@') ||
      email.toLowerCase().startsWith('contact@')
    );
    
    if (hasNoContact || hasGenericEmail) {
      console.log(`\n--- ${company} (Row ${i + 1}) ---`);
      console.log(`  Website: ${website}`);
      console.log(`  Status: "${status}"`);
      console.log(`  Status check: Enriched=${status === 'Enriched'}, Dead=${status === 'Dead'}, StartsWithDead=${status.startsWith('Dead -')}`);
      console.log(`  Sector Focus: ${sector || 'None'}`);
      console.log(`  Current Contact: "${contact}"`);
      console.log(`  Current Email: "${email}"`);
      console.log(`  Issue: ${hasNoContact ? 'No contact' : 'Generic email'}`);
    }
  }
}

investigateLeads().catch(console.error);
