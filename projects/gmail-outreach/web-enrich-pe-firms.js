const axios = require('axios');
const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Load service account credentials
const credentials = JSON.parse(fs.readFileSync('service-account.json', 'utf8'));

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

// Generic emails to flag
const GENERIC_EMAILS = ['info@', 'sales@', 'ir@', 'contact@', 'hello@', 'press@', 'media@', 'admin@', 'support@'];

function isGenericEmail(email) {
  if (!email) return true;
  return GENERIC_EMAILS.some(prefix => email.toLowerCase().startsWith(prefix));
}

async function readSheet() {
  console.log('Reading Sheet1 (PE firms)...');
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:K'
  });
  
  return response.data.values || [];
}

async function updateSheet(rowIndex, data) {
  // Sheet1 columns: A=Company, B=NotebookLM, C=Contact Name, D=Title, E=Email, F=Website, G=LinkedIn, H=Sector, I=Portfolio, J=Status, K=Last Contacted
  const updates = [];
  
  if (data.name) {
    updates.push({
      range: `Sheet1!C${rowIndex}`,
      values: [[data.name]]
    });
  }
  
  if (data.title) {
    updates.push({
      range: `Sheet1!D${rowIndex}`,
      values: [[data.title]]
    });
  }
  
  if (data.email) {
    updates.push({
      range: `Sheet1!E${rowIndex}`,
      values: [[data.email]]
    });
  }
  
  if (data.linkedin) {
    updates.push({
      range: `Sheet1!G${rowIndex}`,
      values: [[data.linkedin]]
    });
  }
  
  if (data.website) {
    updates.push({
      range: `Sheet1!F${rowIndex}`,
      values: [[data.website]]
    });
  }
  
  // Update status
  updates.push({
    range: `Sheet1!J${rowIndex}`,
    values: [[data.status || 'Enriched']]
  });
  
  // Update last contacted with enrichment note
  const now = new Date().toISOString();
  const note = data.source ? `${data.status || 'Enriched'} - ${data.source} (${now.split('T')[0]})` : `Enriched - ${now.split('T')[0]}`;
  updates.push({
    range: `Sheet1!K${rowIndex}`,
    values: [[note]]
  });
  
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    resource: {
      data: updates,
      valueInputOption: 'USER_ENTERED'
    }
  });
  
  console.log(`  ✓ Updated sheet row ${rowIndex}`);
}

async function main() {
  console.log('=== PE Research & Enrichment - Web Research Mode ===');
  console.log('Time:', new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));
  console.log('\nThis script identifies firms needing enrichment.');
  console.log('Use OpenClaw web_search and web_fetch tools for manual research.\n');
  
  const rows = await readSheet();
  
  if (rows.length < 2) {
    console.log('No data in sheet');
    return;
  }
  
  const headers = rows[0];
  console.log('Headers:', headers.slice(0, 11).join(' | '));
  console.log();
  
  // Find firms needing enrichment
  const toEnrich = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowIndex = i + 1; // 1-indexed for sheets
    
    const company = row[0] || ''; // Column A
    const website = row[1] || ''; // Column B (NotebookLM)
    const contactName = row[2] || ''; // Column C
    const email = row[4] || ''; // Column E
    const status = row[9] || ''; // Column J
    
    // Skip if already Dead
    if (status && (status.toLowerCase().includes('dead') || status.toLowerCase().includes('sent'))) continue;
    
    // Skip if both contact name and valid email exist
    if (contactName && email && !isGenericEmail(email)) continue;
    
    // This one needs enrichment
    if (company) {
      toEnrich.push({
        rowIndex,
        company,
        website,
        contactName: contactName || '(none)',
        email: email || '(none)',
        status
      });
    }
  }
  
  console.log(`Found ${toEnrich.length} firms needing enrichment\n`);
  console.log('=== TOP 15 PRIORITY TARGETS ===\n');
  
  // Show top 15
  const batch = toEnrich.slice(0, 15);
  
  batch.forEach((lead, i) => {
    console.log(`${i+1}. [Row ${lead.rowIndex}] ${lead.company}`);
    console.log(`   Website: ${lead.website || '(none)'}`);
    console.log(`   Current Contact: ${lead.contactName} / ${lead.email}`);
    console.log(`   Status: ${lead.status || '(none)'}`);
    console.log();
  });
  
  console.log('\n=== NEXT STEPS ===');
  console.log('For each firm above, research using:');
  console.log('1. Company website /team, /about, /contact pages');
  console.log('2. LinkedIn: site:linkedin.com "[Company]" "Partner" OR "CTO" OR "VP"');
  console.log('3. Press releases and conference speaker bios');
  console.log('4. SEC filings (for publicly-traded firms)');
  console.log('\nWhen you find a verified email from a published source:');
  console.log('node web-enrich-pe-firms.js update <row> "<name>" "<title>" "<email>" "<linkedin>" "<source>"');
  console.log('\nExample:');
  console.log('node web-enrich-pe-firms.js update 778 "Jane Smith" "CTO" "jsmith@company.com" "linkedin.com/in/janesmith" "Found on company.com/team"');
}

// Handle manual update command
if (process.argv[2] === 'update') {
  const rowIndex = parseInt(process.argv[3]);
  const name = process.argv[4];
  const title = process.argv[5];
  const email = process.argv[6];
  const linkedin = process.argv[7];
  const source = process.argv[8];
  
  if (!rowIndex || !name || !title || !email || !source) {
    console.error('Usage: node web-enrich-pe-firms.js update <row> "<name>" "<title>" "<email>" "<linkedin>" "<source>"');
    process.exit(1);
  }
  
  updateSheet(rowIndex, {
    name,
    title,
    email,
    linkedin: linkedin || '',
    source,
    status: 'Enriched - Web Research'
  }).then(() => {
    console.log(`✅ Row ${rowIndex} updated successfully`);
  }).catch(console.error);
  
} else {
  main().catch(console.error);
}
