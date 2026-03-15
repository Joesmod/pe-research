const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:O',
  });

  const rows = result.data.values || [];
  
  console.log(`Total rows: ${rows.length}\n`);
  
  const unenriched = [];
  const needsEmail = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const statusH = row[7] || '';
    const statusJ = row[9] || '';
    const contact = row[2] || '';
    const email = row[4] || row[6] || '';
    
    // Skip header row
    if (company === 'Company Name') continue;
    
    // Skip if no company
    if (!company) continue;
    
    // Check if enriched
    const isEnriched = statusH.includes('Enriched') || statusJ === 'Enriched';
    
    // Check if has generic/missing email
    const genericEmail = email && email.match(/^(info|sales|ir|investor|contact|admin|hello)@/i);
    const noEmail = !email;
    const noContact = !contact;
    
    if (!isEnriched || noContact || noEmail || genericEmail) {
      const issue = [];
      if (!isEnriched) issue.push('not enriched');
      if (noContact) issue.push('no contact');
      if (noEmail) issue.push('no email');
      if (genericEmail) issue.push('generic email');
      
      unenriched.push({
        row: i + 1,
        company,
        contact,
        email,
        statusH,
        statusJ,
        issues: issue.join(', '),
      });
    }
  }
  
  console.log(`\n=== UNENRICHED / INCOMPLETE LEADS ===`);
  console.log(`Found ${unenriched.length} leads needing work\n`);
  
  unenriched.slice(0, 20).forEach(lead => {
    console.log(`Row ${lead.row}: ${lead.company}`);
    console.log(`  Contact: ${lead.contact || '(empty)'}`);
    console.log(`  Email: ${lead.email || '(empty)'}`);
    console.log(`  Status H: ${lead.statusH || '(empty)'}`);
    console.log(`  Status J: ${lead.statusJ || '(empty)'}`);
    console.log(`  Issues: ${lead.issues}`);
    console.log('');
  });
  
  if (unenriched.length > 20) {
    console.log(`... and ${unenriched.length - 20} more\n`);
  }
  
  return unenriched.slice(0, 15);
}

main().catch(console.error);
