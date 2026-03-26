const {google} = require('googleapis');
const key = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function checkTracker() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({version: 'v4', auth: await auth.getClient()});
  
  // Get Tracker tab
  const trackerResp = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Tracker!A1:P100'
  });
  
  const rows = trackerResp.data.values || [];
  
  if (rows.length === 0) {
    console.log('Tracker tab is empty');
    return;
  }
  
  console.log('Tracker Headers:', rows[0]);
  console.log('');
  
  const headers = rows[0];
  const companyIdx = headers.findIndex(h => h && h.toLowerCase().includes('company'));
  const contactIdx = headers.findIndex(h => h && h.toLowerCase().includes('contact'));
  const emailIdx = headers.findIndex(h => h && (h.toLowerCase() === 'email' || h.toLowerCase().includes('email')));
  const statusIdx = headers.findIndex(h => h && h.toLowerCase().includes('status'));
  const websiteIdx = headers.findIndex(h => h && h.toLowerCase().includes('website'));
  
  console.log(`Column indices: Company=${companyIdx}, Contact=${contactIdx}, Email=${emailIdx}, Status=${statusIdx}, Website=${websiteIdx}`);
  console.log('');
  
  let needsEnrichment = 0;
  const candidates = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;
    
    const company = companyIdx >= 0 ? (row[companyIdx] || '') : '';
    const contact = contactIdx >= 0 ? (row[contactIdx] || '') : '';
    const email = emailIdx >= 0 ? (row[emailIdx] || '') : '';
    const status = statusIdx >= 0 ? (row[statusIdx] || '').toLowerCase() : '';
    const website = websiteIdx >= 0 ? (row[websiteIdx] || '') : '';
    
    // Skip dead/closed firms
    if (status.includes('dead') || status === 'closed') continue;
    
    // Check if needs enrichment
    const needsWork = !contact || 
                     !email || 
                     email.toLowerCase().includes('info@') ||
                     email.toLowerCase().includes('sales@') ||
                     email.toLowerCase().includes('ir@') ||
                     email.toLowerCase().includes('contact@');
    
    if (needsWork && company) {
      needsEnrichment++;
      if (candidates.length < 15) {
        candidates.push({
          rowNum: i + 1,
          company,
          website,
          contact: contact || '(empty)',
          email: email || '(empty)',
          status: row[statusIdx] || ''
        });
      }
    }
  }
  
  console.log(`Found ${needsEnrichment} leads needing enrichment in Tracker tab (first 100 rows)`);
  console.log('');
  console.log(`First ${Math.min(15, candidates.length)} candidates:`);
  candidates.forEach(c => {
    console.log(`  Row ${c.rowNum}: ${c.company}`);
    console.log(`    Website: ${c.website || '(none)'}`);
    console.log(`    Contact: ${c.contact} | Email: ${c.email}`);
  });
  
  return candidates;
}

checkTracker().catch(console.error);
