const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = JSON.parse(fs.readFileSync('service-account.json'));

async function debugContacts() {
  const auth = new google.auth.GoogleAuth({
    credentials: SERVICE_ACCOUNT,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:M',
  });

  const rows = response.data.values;
  const issues = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    
    if (!company) continue;
    
    const website = row[1] || '';
    const contactName = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    
    // Check for various issues
    const hasNoProperName = !contactName || !contactName.trim() || contactName.length < 3;
    const hasUrlAsName = contactName && (contactName.startsWith('http') || contactName.includes('linkedin.com'));
    const hasGenericTitle = contactName && /^(CEO|CFO|CTO|Managing Partner|Partner|Founder)$/.test(contactName);
    const hasNoEmail = !email || !email.trim();
    const hasUrlAsEmail = email && (email.startsWith('http') || !email.includes('@'));
    
    if (hasNoProperName || hasUrlAsName || hasGenericTitle || hasNoEmail || hasUrlAsEmail) {
      issues.push({
        rowIndex: i + 1,
        company,
        website,
        contactName: contactName || '(empty)',
        title: title || '(empty)',
        email: email || '(empty)',
        issue: hasNoProperName ? 'No proper name' : 
               hasUrlAsName ? 'URL as name' :
               hasGenericTitle ? 'Generic title as name' :
               hasNoEmail ? 'No email' :
               'URL as email'
      });
    }
  }
  
  console.log(`\n📋 Found ${issues.length} leads with enrichment issues\n`);
  
  // Show first 15
  const first15 = issues.slice(0, 15);
  first15.forEach((lead, idx) => {
    console.log(`${idx + 1}. Row ${lead.rowIndex}: ${lead.company}`);
    console.log(`   Website: ${lead.website}`);
    console.log(`   Contact: ${lead.contactName}`);
    console.log(`   Title: ${lead.title}`);
    console.log(`   Email: ${lead.email}`);
    console.log(`   Issue: ${lead.issue}\n`);
  });
  
  // Save to file
  fs.writeFileSync(
    'enrichment-issues-march14-644pm.json',
    JSON.stringify(first15, null, 2)
  );
  
  console.log(`✅ Saved first 15 to enrichment-issues-march14-644pm.json`);
}

debugContacts().catch(console.error);
