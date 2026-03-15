const { google } = require('googleapis');

async function findPartialLeads() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Read the sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:J',
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  // Find leads with Partial status or generic emails
  const leads = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const firm = row[0] || '';
    const contactName = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    const status = row[9] || '';
    
    // Skip Dead leads
    if (status.toLowerCase().includes('dead')) continue;
    
    // Check for Partial, generic email, or improvable status
    const genericEmail = email.match(/^(info|sales|ir|contact|hello|support|invest)@/i);
    const needsWork = status.toLowerCase().includes('partial') || 
                      status.toLowerCase().includes('needs email') ||
                      status.toLowerCase().includes('new - unresearched') ||
                      genericEmail ||
                      !contactName ||
                      !email;
    
    if (needsWork) {
      leads.push({
        row: i + 1,
        firm,
        contactName,
        title,
        email,
        status
      });
    }
  }
  
  // Show top 15 
  console.log(`Found ${leads.length} leads that could be enriched\n`);
  console.log('Top 15:');
  leads.slice(0, 15).forEach((lead, idx) => {
    console.log(`${idx + 1}. Row ${lead.row}: ${lead.firm}`);
    console.log(`   Contact: ${lead.contactName || 'MISSING'}`);
    console.log(`   Email: ${lead.email || 'MISSING'}`);
    console.log(`   Status: ${lead.status}`);
    console.log('');
  });
  
  return leads.slice(0, 15);
}

findPartialLeads().catch(console.error);
