const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

async function getClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

// Extract name and email patterns from notes
function extractContacts(notes, firmDomain) {
  const contacts = [];
  
  // Pattern: "Name (Title)" or "Name (Title, email@domain.com)"
  // Pattern: "email verified" or "email@domain.com verified"
  // Pattern: "Name email@domain.com"
  
  // Look for explicit email mentions with names
  const patterns = [
    /([A-Z][a-z]+ [A-Z][a-z]+(?:-[A-Z][a-z]+)?)\s+\(([^)]+),\s+([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})\)/gi,
    /([A-Z][a-z]+ [A-Z][a-z]+(?:-[A-Z][a-z]+)?)\s+\(([^)]+)\).*?([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/gi,
    /([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/gi
  ];
  
  patterns.forEach(pattern => {
    const matches = notes.matchAll(pattern);
    for (const match of matches) {
      if (match.length > 1) {
        contacts.push({
          name: match[1] || '',
          title: match[2] || '',
          email: match[3] || match[1] || ''
        });
      }
    }
  });
  
  return contacts.filter(c => c.email && c.email.includes('@'));
}

async function extractCorrectContacts() {
  const sheets = await getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:P500',
  });
  
  const rows = res.data.values || [];
  const header = rows[0];
  
  const companyIdx = header.indexOf('Company Name');
  const contactIdx = header.indexOf('Contact Name');
  const titleIdx = header.indexOf('Title');
  const emailIdx = header.indexOf('Email');
  const websiteIdx = header.indexOf('Website');
  const notesIdx = header.indexOf('Notes');
  
  const corrections = [];
  
  // Check the mismatched rows
  const mismatchedRows = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'enrichment-needs-march10-1036pm.json'), 'utf8')
  );
  
  console.log(`Analyzing ${mismatchedRows.length} mismatched entries...\n`);
  
  mismatchedRows.forEach(mismatch => {
    const rowNum = mismatch.row;
    const row = rows[rowNum - 1];
    const company = row[companyIdx] || '';
    const notes = row[notesIdx] || '';
    const website = row[websiteIdx] || '';
    
    // Extract company domain from website or company name
    let firmDomain = '';
    if (website) {
      firmDomain = website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
    } else {
      // Infer from company name
      firmDomain = company.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 3)[0] + '.com';
    }
    
    // Extract contacts from notes
    const foundContacts = extractContacts(notes, firmDomain);
    
    // Filter to those matching the firm domain
    const correctContacts = foundContacts.filter(c => {
      const domain = c.email.split('@')[1] || '';
      return domain.includes(firmDomain.split('.')[0]);
    });
    
    if (correctContacts.length > 0) {
      corrections.push({
        row: rowNum,
        company,
        currentContact: mismatch.contact,
        currentEmail: mismatch.email,
        suggestions: correctContacts.slice(0, 3), // Top 3
        notes: notes.substring(0, 300)
      });
    }
  });
  
  console.log(`Found ${corrections.length} entries with potential corrections in notes\n`);
  
  // Show first 10
  corrections.slice(0, 10).forEach((corr, idx) => {
    console.log(`${idx + 1}. Row ${corr.row}: ${corr.company}`);
    console.log(`   Current: ${corr.currentContact} <${corr.currentEmail}>`);
    console.log(`   Suggested replacements from notes:`);
    corr.suggestions.forEach((sug, i) => {
      console.log(`     ${i + 1}) ${sug.name || 'N/A'} ${sug.title ? `(${sug.title})` : ''} <${sug.email}>`);
    });
    console.log('');
  });
  
  // Save for manual review
  fs.writeFileSync(
    path.join(__dirname, 'correction-suggestions-march10.json'),
    JSON.stringify(corrections, null, 2)
  );
  
  console.log(`\nSaved ${corrections.length} correction suggestions to: correction-suggestions-march10.json`);
  console.log('\nNext step: Review and apply corrections to the sheet');
}

extractCorrectContacts().catch(console.error);
