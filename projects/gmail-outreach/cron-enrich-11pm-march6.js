const { google } = require('googleapis');
const creds = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Read the Tracker
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Tracker!A:J'
  });

  const rows = res.data.values || [];
  if (rows.length < 2) {
    console.log('No data found in sheet');
    return;
  }

  const headers = rows[0];
  console.log('Headers:', headers);

  // Find column indices
  const companyIdx = headers.indexOf('Company');
  const contactIdx = headers.indexOf('Name'); // Changed from 'Contact Name'
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');

  console.log(`\nColumn indices: Company=${companyIdx}, Contact=${contactIdx}, Email=${emailIdx}, Status=${statusIdx}`);

  // Find rows needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';

    // Skip if dead/sent/enriched
    if (status.toLowerCase().includes('dead') || 
        status.toLowerCase().includes('sent') ||
        status.toLowerCase() === 'enriched') {
      continue;
    }

    // Check if needs enrichment
    const needsContact = !contact || contact.trim() === '';
    const needsEmail = !email || email.trim() === '' || 
                        email.includes('info@') || 
                        email.includes('sales@') || 
                        email.includes('ir@') ||
                        email.includes('contact@');

    if (needsContact || needsEmail) {
      needsEnrichment.push({
        rowNum: i + 1,
        company,
        contact,
        email,
        status,
        needsContact,
        needsEmail
      });
    }
  }

  console.log(`\n=== LEADS NEEDING ENRICHMENT ===`);
  console.log(`Total leads needing enrichment: ${needsEnrichment.length}`);
  console.log(`\nFirst 15 to enrich:`);
  
  needsEnrichment.slice(0, 15).forEach(lead => {
    console.log(`\nRow ${lead.rowNum}: ${lead.company}`);
    console.log(`  Current Contact: ${lead.contact || '(empty)'}`);
    console.log(`  Current Email: ${lead.email || '(empty)'}`);
    console.log(`  Needs: ${lead.needsContact ? 'Contact' : ''} ${lead.needsEmail ? 'Email' : ''}`);
  });

  console.log(`\n=== ACTION PLAN ===`);
  console.log('Now manually research these firms to find:');
  console.log('- Decision-maker names (C-level, Partners, Directors, VPs, Heads)');
  console.log('- Direct emails (from firm websites, LinkedIn, press releases)');
  console.log('- LinkedIn URLs for verification');
  console.log('\nDO NOT guess email patterns. ONLY use published emails.');
}

main().catch(console.error);
