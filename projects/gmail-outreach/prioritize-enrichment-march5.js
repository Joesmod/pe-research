const { google } = require('googleapis');
const key = require('./service-account.json');

const jwtClient = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  ['https://www.googleapis.com/auth/spreadsheets']
);

const sheets = google.sheets({ version: 'v4', auth: jwtClient });
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:M'
  });
  
  const rows = res.data.values || [];
  const headers = rows[0];
  
  const companyCol = headers.indexOf('Company Name');
  const contactCol = headers.indexOf('Contact Name');
  const titleCol = headers.indexOf('Title');
  const emailCol = headers.indexOf('Email');
  const websiteCol = headers.indexOf('Website');
  const linkedinCol = headers.indexOf('LinkedIn');
  const statusCol = headers.indexOf('Status');
  const notesCol = headers.indexOf('Notes');
  
  const targets = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyCol] || '';
    const contact = row[contactCol] || '';
    const email = row[emailCol] || '';
    const website = row[websiteCol] || '';
    const status = (row[statusCol] || '').trim();
    
    // Skip Dead/Contacted/Enriched
    if (status.toLowerCase().includes('dead') || 
        status === 'Contacted' || 
        status === 'Enriched' ||
        status === 'Enriched - Apollo' ||
        status === 'Enriched - Web Research') {
      continue;
    }
    
    // Priority targets:
    // 1. New - Unresearched (need full research)
    // 2. Partial with empty email
    // 3. Partial with generic email
    
    let priority = 99;
    let reason = '';
    
    if (status === 'New - Unresearched') {
      priority = 1;
      reason = 'Unresearched';
    } else if (status === 'Partial' && !email) {
      priority = 2;
      reason = 'Partial - No Email';
    } else if (status === 'Partial' && email.match(/^(info@|sales@|ir@|contact@)/i)) {
      priority = 3;
      reason = 'Partial - Generic Email';
    } else if (!email) {
      priority = 4;
      reason = 'Missing Email';
    }
    
    if (priority < 99 && company) {
      targets.push({
        priority,
        reason,
        rowIndex: i + 1,
        company,
        contact,
        email,
        website,
        status
      });
    }
  }
  
  targets.sort((a, b) => a.priority - b.priority);
  
  console.log(`Found ${targets.length} firms needing enrichment\n`);
  
  console.log('Priority breakdown:');
  const priorityCounts = {};
  targets.forEach(t => {
    priorityCounts[t.reason] = (priorityCounts[t.reason] || 0) + 1;
  });
  Object.entries(priorityCounts).forEach(([reason, count]) => {
    console.log(`  ${reason}: ${count}`);
  });
  
  console.log('\n=== TOP 15 PRIORITY TARGETS ===');
  console.log(JSON.stringify(targets.slice(0, 15), null, 2));
  
  // Save to file
  const fs = require('fs');
  fs.writeFileSync('enrichment-targets-march5-3am.json', JSON.stringify(targets, null, 2));
  console.log('\nSaved all targets to enrichment-targets-march5-3am.json');
}

main().catch(console.error);
