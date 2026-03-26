const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const keyFile = 'service-account.json';

async function findTargets() {
  const auth = new google.auth.GoogleAuth({
    keyFile,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:I',
  });
  
  const rows = response.data.values;
  if (!rows || rows.length < 2) {
    console.log('No data found.');
    return;
  }
  
  // Skip header row
  const dataRows = rows.slice(1);
  
  // Find rows that could be improved
  const targets = [];
  
  dataRows.forEach((row, index) => {
    const rowNum = index + 2;
    const firmName = row[0] || '';
    const website = row[1] || '';
    const contactName = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    const status = row[7] || '';
    
    // Skip empty rows
    if (!firmName || firmName.trim() === '') {
      return;
    }
    
    // Skip Dead leads
    if (status.includes('Dead')) {
      return;
    }
    
    // Look for firms that could use better contacts
    const hasLowLevelTitle = title && (
      title.match(/director(?! of business|head of)/i) ||
      title.match(/vice president/i) ||
      title.match(/coo|cfo|cto/i) && !title.match(/ceo|founder|managing partner/i)
    );
    
    const hasGenericEmail = email && email.match(/^(info@|sales@|ir@|contact@|admin@)/i);
    const missingEmail = !email || email.trim() === '';
    const missingContact = !contactName || contactName.trim() === '';
    
    // Needs improvement if:
    // - Missing contact/email
    // - Has generic email
    // - Has mid-level title (could find higher)
    if (missingContact || missingEmail || hasGenericEmail || hasLowLevelTitle) {
      targets.push({
        rowNum,
        firmName,
        website,
        contactName,
        title,
        email,
        status,
        issue: missingContact ? 'No contact' : 
               missingEmail ? 'No email' :
               hasGenericEmail ? 'Generic email' :
               hasLowLevelTitle ? 'Mid-level contact (could find Managing Partner/CEO)' : 'Unknown'
      });
    }
  });
  
  // Take top 15
  const top15 = targets.slice(0, 15);
  
  console.log('\n=== TOP 15 FIRMS TO ENRICH ===\n');
  top15.forEach(target => {
    console.log(`${target.rowNum}. ${target.firmName}`);
    console.log(`   Website: ${target.website}`);
    console.log(`   Current: ${target.contactName || '(none)'} - ${target.title || '(none)'}`);
    console.log(`   Email: ${target.email || '(none)'}`);
    console.log(`   Issue: ${target.issue}`);
    console.log('');
  });
  
  return top15;
}

findTargets().catch(console.error);
