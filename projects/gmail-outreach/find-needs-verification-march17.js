/**
 * Find leads that need email verification or manual review
 */

const { google } = require('googleapis');
const path = require('path');

const CRM_SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

async function findNeedsVerification() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: CRM_SHEET_ID,
    range: 'Sheet1!A:N',
  });
  
  const rows = res.data.values || [];
  
  console.log(`📊 Total rows: ${rows.length}\n`);
  
  const needsReview = [];
  
  for (let i = 2; i < rows.length; i++) {
    const row = rows[i] || [];
    
    const company = (row[0] || '').trim();
    const website = (row[1] || '').trim();
    const contact = (row[2] || '').trim();
    const email = (row[4] || '').trim();
    const status1 = (row[7] || '').trim();
    const status2 = (row[9] || '').trim();
    const notes1 = (row[8] || '').trim();
    const notes2 = (row[11] || '').trim();
    
    if (!company) continue;
    
    const allText = (status1 + ' ' + status2 + ' ' + notes1 + ' ' + notes2).toLowerCase();
    
    // Look for keywords suggesting manual review needed
    const needsVerification = allText.includes('need') && (
      allText.includes('verif') ||
      allText.includes('manual') ||
      allText.includes('research') ||
      allText.includes('not publicly available') ||
      allText.includes('not available')
    );
    
    // Check if email domain doesn't match company website
    let domainMismatch = false;
    if (email && website) {
      const emailDomain = email.split('@')[1] || '';
      const websiteDomain = website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0].toLowerCase();
      if (emailDomain && websiteDomain && !emailDomain.includes(websiteDomain.split('.')[0])) {
        domainMismatch = true;
      }
    }
    
    if (needsVerification || domainMismatch) {
      needsReview.push({
        rowNum: i + 1,
        company,
        contact,
        email,
        website,
        issue: domainMismatch ? 'Domain Mismatch' : 'Needs Verification',
        emailDomain: email.split('@')[1] || '',
        websiteDomain: website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0],
      });
    }
  }
  
  console.log(`🔍 Found ${needsReview.length} leads needing review:\n`);
  
  needsReview.slice(0, 30).forEach(lead => {
    console.log(`Row ${lead.rowNum}: ${lead.company}`);
    console.log(`  Contact: ${lead.contact}`);
    console.log(`  Email: ${lead.email}`);
    console.log(`  Website: ${lead.website}`);
    console.log(`  Issue: ${lead.issue}\n`);
  });
  
  if (needsReview.length > 30) {
    console.log(`... and ${needsReview.length - 30} more\n`);
  }
}

findNeedsVerification().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
