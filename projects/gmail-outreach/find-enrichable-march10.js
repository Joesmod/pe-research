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

async function findEnrichable() {
  const sheets = await getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:P500',
  });
  
  const rows = res.data.values || [];
  if (rows.length === 0) {
    console.log('No data found');
    return;
  }
  
  const header = rows[0];
  console.log('Headers:', header);
  console.log('');
  
  const companyIdx = header.indexOf('Company Name');
  const contactIdx = header.indexOf('Contact Name');
  const titleIdx = header.indexOf('Title');
  const emailIdx = header.indexOf('Email');
  const statusIdx = header.indexOf('Status');
  const notesIdx = header.indexOf('Notes');
  
  const needsWork = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const title = row[titleIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    const notes = row[notesIdx] || '';
    
    // Skip dead leads or duplicates
    if (status.includes('Dead') || status.includes('DUPLICATE') || status.includes('Investment bank')) {
      continue;
    }
    
    // Identify issues
    const issues = [];
    
    // Check for empty contact name
    if (!contact || contact.trim() === '') {
      issues.push('Empty Contact Name');
    }
    
    // Check for generic or missing email
    const emailLower = (email || '').toLowerCase();
    if (!email || email.trim() === '') {
      issues.push('No Email');
    } else if (
      emailLower.includes('info@') ||
      emailLower.includes('sales@') ||
      emailLower.includes('ir@') ||
      emailLower.includes('contact@') ||
      emailLower.includes('hello@') ||
      emailLower.includes('media@') ||
      emailLower.includes('deals@')
    ) {
      issues.push('Generic Email');
    }
    
    // Check for emails that don't match the company (wrong domain)
    if (email && company) {
      const companyWords = company.toLowerCase().split(/\s+/);
      const emailDomain = email.split('@')[1] || '';
      const domainParts = emailDomain.toLowerCase().split('.');
      
      // Check if any company word appears in the domain
      const hasMatch = companyWords.some(word => {
        if (word.length < 4) return false;  // Skip short words like "the", "and"
        return domainParts.some(part => part.includes(word) || word.includes(part));
      });
      
      if (!hasMatch && email.includes('@')) {
        issues.push('Mismatched Domain');
      }
    }
    
    if (issues.length > 0) {
      needsWork.push({
        row: i + 1,
        company,
        contact,
        title,
        email,
        status,
        issues: issues.join(', ')
      });
    }
  }
  
  console.log(`\n=== FOUND ${needsWork.length} LEADS NEEDING ENRICHMENT ===\n`);
  
  // Show first 20
  const toShow = needsWork.slice(0, 20);
  toShow.forEach((lead, idx) => {
    console.log(`${idx + 1}. Row ${lead.row}: ${lead.company}`);
    console.log(`   Contact: "${lead.contact || '(empty)'}"`);
    console.log(`   Title: "${lead.title || '(empty)'}"`);
    console.log(`   Email: "${lead.email || '(empty)'}"`);
    console.log(`   Issues: ${lead.issues}`);
    console.log(`   Status: ${lead.status}`);
    console.log('');
  });
  
  if (needsWork.length > 20) {
    console.log(`... and ${needsWork.length - 20} more\n`);
  }
  
  // Save to JSON
  fs.writeFileSync(
    path.join(__dirname, 'enrichment-needs-march10-1036pm.json'),
    JSON.stringify(needsWork, null, 2)
  );
  
  console.log(`\nFull list saved to: enrichment-needs-march10-1036pm.json`);
  console.log(`\nPRIORITY: Focus on leads with "No Email" or "Generic Email" issues first.`);
}

findEnrichable().catch(console.error);
