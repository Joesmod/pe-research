/**
 * Read CRM to find qualified PE contacts for outreach
 * Sheet1 + Contacts sheet from CRM spreadsheet
 */

const { google } = require('googleapis');
const path = require('path');

const CRM_SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function readCRM() {
  const sheets = await getSheets();
  
  // Read Sheet1
  const sheet1Res = await sheets.spreadsheets.values.get({
    spreadsheetId: CRM_SHEET_ID,
    range: 'Sheet1!A:Z',
  });
  const sheet1Rows = sheet1Res.data.values || [];
  
  // Read Contacts sheet
  const contactsRes = await sheets.spreadsheets.values.get({
    spreadsheetId: CRM_SHEET_ID,
    range: 'Contacts!A:Z',
  });
  const contactsRows = contactsRes.data.values || [];
  
  console.log(`Sheet1: ${sheet1Rows.length} rows`);
  console.log(`Contacts: ${contactsRows.length} rows`);
  
  // Parse headers
  const sheet1Headers = sheet1Rows[0] || [];
  const contactsHeaders = contactsRows[0] || [];
  
  console.log('\nSheet1 headers:', sheet1Headers.slice(0, 15).join(' | '));
  console.log('Contacts headers:', contactsHeaders.slice(0, 15).join(' | '));
  
  // Map rows to objects
  const sheet1Data = sheet1Rows.slice(1).map(row => {
    const obj = {};
    sheet1Headers.forEach((h, i) => {
      obj[h] = row[i] || '';
    });
    return obj;
  });
  
  const contactsData = contactsRows.slice(1).map(row => {
    const obj = {};
    contactsHeaders.forEach((h, i) => {
      obj[h] = row[i] || '';
    });
    return obj;
  });
  
  // Filter qualified contacts
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const qualified = [];
  
  for (const contact of contactsData) {
    // Check Gumbo Score >= 8
    const score = parseFloat(contact['Gumbo Score'] || contact['Score'] || '0');
    if (score < 8) continue;
    
    // Check verified email
    const email = (contact['Email'] || '').trim().toLowerCase();
    if (!email || email.includes('@example.com') || !email.includes('@')) continue;
    
    // Check if email status is verified
    const emailStatus = (contact['Email Status'] || '').toLowerCase();
    if (emailStatus !== 'verified' && emailStatus !== 'valid') continue;
    
    // Check role matches tech/AI/value creation focus
    const title = (contact['Title'] || contact['Position'] || '').toLowerCase();
    const techRoles = ['cto', 'cio', 'chief ai', 'chief technology', 'chief information', 
                       'vp product', 'vp tech', 'operating partner', 'principal', 
                       'value creation', 'digital', 'technology'];
    const hasRelevantRole = techRoles.some(role => title.includes(role));
    if (!hasRelevantRole) continue;
    
    // Check Last Contacted in Contacts sheet (col I)
    const contactLastContacted = contact['Last Contacted'] || '';
    if (contactLastContacted) {
      const lastDate = new Date(contactLastContacted);
      if (lastDate >= sevenDaysAgo) {
        console.log(`Skipping ${email}: contacted ${contactLastContacted}`);
        continue;
      }
    }
    
    // Check company Last Contacted in Sheet1 (col J)
    const companyName = contact['Company'] || contact['Firm'] || '';
    const companyRow = sheet1Data.find(r => 
      (r['Company'] || r['Firm'] || '').toLowerCase() === companyName.toLowerCase()
    );
    
    if (companyRow) {
      const companyLastContacted = companyRow['Last Contacted'] || '';
      if (companyLastContacted) {
        const lastDate = new Date(companyLastContacted);
        if (lastDate >= sevenDaysAgo) {
          console.log(`Skipping ${email}: company ${companyName} contacted ${companyLastContacted}`);
          continue;
        }
      }
    }
    
    qualified.push({
      company: companyName,
      contact: contact['Name'] || contact['Contact'] || '',
      title: contact['Title'] || contact['Position'] || '',
      email: email,
      score: score,
      sector: companyRow ? (companyRow['Sector'] || companyRow['Focus'] || '') : '',
      portfolio: companyRow ? (companyRow['Portfolio'] || companyRow['Portfolio Size'] || '') : '',
      aum: companyRow ? (companyRow['AUM'] || '') : '',
    });
  }
  
  // Sort by score descending
  qualified.sort((a, b) => b.score - a.score);
  
  // Take top 25
  const top25 = qualified.slice(0, 25);
  
  console.log(`\n✅ Found ${qualified.length} qualified contacts`);
  console.log(`📧 Top 25 for outreach:\n`);
  
  top25.forEach((c, i) => {
    console.log(`${i + 1}. ${c.contact} (${c.title}) at ${c.company} — ${c.email} (Score: ${c.score})`);
  });
  
  return top25;
}

readCRM().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
