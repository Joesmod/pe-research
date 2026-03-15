const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:Z1000'
  });
  
  const rows = response.data.values;
  const headers = rows[0];
  
  const companyIdx = headers.indexOf('Company Name');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');
  const titleIdx = headers.indexOf('Title');
  const websiteIdx = headers.indexOf('Website');
  
  const targets = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    const title = row[titleIdx] || '';
    const website = row[websiteIdx] || '';
    
    // Skip Dead/Sent/Enriched
    if (status === 'Sent' || status === 'Enriched' || status.startsWith('Dead')) continue;
    
    if (!company) continue;
    
    const isGeneric = /^(info@|sales@|ir@|contact@|support@)/i.test(email);
    const needsContact = !contact || contact.trim() === '' || contact === 'Jacob Zodikoff';
    const needsEmail = !email || email.trim() === '' || isGeneric;
    
    if (needsContact || needsEmail) {
      targets.push({
        row: i + 1,
        company,
        contact,
        email,
        title,
        status,
        website,
        needsContact,
        needsEmail
      });
    }
  }
  
  console.log(`Found ${targets.length} leads needing enrichment`);
  
  const toEnrich = targets.slice(0, 15);
  console.log(`\nFirst 15 to enrich:\n`);
  toEnrich.forEach(t => {
    console.log(`${t.company} (Row ${t.row})`);
    console.log(`  Website: ${t.website || '(none)'}`);
    console.log(`  Contact: ${t.contact || '(empty)'}`);
    console.log(`  Email: ${t.email || '(empty)'}`);
    console.log('');
  });
  
  fs.writeFileSync('targets-with-domains-march7-536am.json', JSON.stringify(toEnrich, null, 2));
  console.log(`Saved to targets-with-domains-march7-536am.json`);
}

main().catch(console.error);
