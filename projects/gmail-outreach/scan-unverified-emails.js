const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');

const COLUMNS = {
  company: 0,
  website: 1,
  contact: 2,
  title: 3,
  email: 4,
  linkedIn: 6,  
  status: 9,
  lastContacted: 10,
  notes: 11,
  companyInfoUrl: 12,
  gumboScore: 13
};

async function run() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:O'
  });
  
  const rows = response.data.values || [];
  console.log(`\nScanning ${rows.length} rows for unverified/inferred emails...\n`);
  
  const unverified = [];
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const company = row[COLUMNS.company] || '';
    const contact = row[COLUMNS.contact] || '';
    const email = row[COLUMNS.email] || '';
    const status = (row[COLUMNS.status] || '').toLowerCase();
    const notes = (row[COLUMNS.notes] || '').toLowerCase();
    const lastContacted = (row[COLUMNS.lastContacted] || '').toLowerCase();
    
    if (!company || status.includes('dead') || status.includes('closed')) continue;
    
    // Look for indicators of unverified/inferred emails
    const needsVerification = 
      status.includes('needs email verification') ||
      status.includes('needs verification') ||
      notes.includes('inferred') ||
      notes.includes('pattern') ||
      notes.includes('not verified') ||
      notes.includes('needs verification') ||
      lastContacted.includes('inferred') ||
      lastContacted.includes('pattern');
    
    if (needsVerification && email) {
      unverified.push({
        rowNum: i + 1,
        company,
        contact,
        email,
        status: row[COLUMNS.status] || '',
        indicator: status.includes('needs') ? 'Status' : 'Notes/LastContacted',
        snippet: notes.slice(0, 150) || lastContacted.slice(0, 150)
      });
    }
  }
  
  console.log(`Found ${unverified.length} leads with potentially unverified emails:\n`);
  
  unverified.slice(0, 20).forEach((lead, idx) => {
    console.log(`${idx + 1}. Row ${lead.rowNum}: ${lead.company}`);
    console.log(`   Contact: ${lead.contact} | Email: ${lead.email}`);
    console.log(`   Status: ${lead.status}`);
    console.log(`   Indicator: ${lead.indicator}`);
    console.log(`   Note: ${lead.snippet}`);
    console.log('');
  });
  
  return unverified;
}

run().then(leads => {
  console.log(`\nScan complete. ${leads.length} leads flagged for verification.`);
  process.exit(0);
}).catch(console.error);
