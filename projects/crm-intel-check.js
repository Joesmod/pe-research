const path = require('path');
const dir = path.join(__dirname, 'gmail-outreach');
const {google} = require(path.join(dir, 'node_modules', 'googleapis'));
const {JWT} = require(path.join(dir, 'node_modules', 'google-auth-library'));
const creds = require(path.join(dir, 'service-account.json'));
const auth = new JWT({email: creds.client_email, key: creds.private_key, scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']});
const sheets = google.sheets({version:'v4', auth});
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Sheet1!A:M' });
  const rows = res.data.values || [];
  const header = rows[0];
  console.log('Headers:', header);
  
  const data = rows.slice(1);
  // Filter to firms WITH contacts
  const withContact = data.filter(r => r[1] && r[1].trim());
  console.log(`\nFirms with contacts: ${withContact.length}`);
  
  // Check columns: F=Sector Focus(5), G=Portfolio Companies(6), H=Status(7), K=Notes(10)
  // Let's check what columns exist and their fill rates
  const cols = {
    'Website (E/4)': 4,
    'LinkedIn (F/5)': 5,
    'Sector Focus (G/6)': 6,
    'Portfolio Cos (H/7)': 7,
    'Status (I/8)': 8,
  };
  
  for (const [label, idx] of Object.entries(cols)) {
    const filled = withContact.filter(r => r[idx] && r[idx].trim() && r[idx].trim() !== 'New - Unresearched').length;
    console.log(`  ${label}: ${filled}/${withContact.length} filled (${(filled/withContact.length*100).toFixed(0)}%)`);
  }
  
  // How many have BOTH sector focus AND portfolio cos?
  const hasBoth = withContact.filter(r => 
    (r[6] && r[6].trim()) && (r[7] && r[7].trim())
  ).length;
  console.log(`\n  Both Sector + Portfolio: ${hasBoth}/${withContact.length}`);
  
  // Sample a few rows to see what data looks like
  console.log('\nSample rows (first 5 with contacts):');
  withContact.slice(0, 5).forEach(r => {
    console.log(`  ${r[0]} | Contact: ${r[1]} | Sector: ${r[6]||'EMPTY'} | Portfolio: ${r[7]||'EMPTY'}`);
  });
}
main().catch(console.error);
