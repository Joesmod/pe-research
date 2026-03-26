const { google } = require('googleapis');

async function analyzeSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const sheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'Uncontacted Leads!A:L',
  });
  
  const rows = result.data.values;
  if (!rows || rows.length < 2) {
    console.log('No data to analyze.');
    return;
  }

  const header = rows[0];
  const firmIdx = 0;
  const contactIdx = 2;
  const emailIdx = 4;
  const statusIdx = 6;

  let needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const firm = row[firmIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    
    // Skip if already enriched recently or has good contact
    if (status.toLowerCase().includes('enriched') && status.includes('2026-03')) continue;
    
    // Needs enrichment if:
    // 1. No contact name
    // 2. Generic email (info@, ir@, deals@, sales@, contact@)
    // 3. No email at all
    const genericEmail = email.match(/^(info|ir|deals|sales|contact|general|admin)@/i);
    const missingContact = !contact || contact.trim() === '';
    const missingEmail = !email || email.trim() === '';
    
    if (missingContact || missingEmail || genericEmail) {
      needsEnrichment.push({
        row: i + 1,
        firm: firm,
        contact: contact,
        email: email,
        reason: missingContact ? 'No contact' : (missingEmail ? 'No email' : 'Generic email')
      });
    }
  }

  console.log('=== LEADS NEEDING ENRICHMENT ===');
  console.log('Total rows:', rows.length - 1);
  console.log('Need enrichment:', needsEnrichment.length);
  console.log('');
  
  // Show first 15
  needsEnrichment.slice(0, 15).forEach(lead => {
    console.log(`Row ${lead.row}: ${lead.firm}`);
    console.log(`  Current: ${lead.contact || '(none)'} / ${lead.email || '(none)'}`);
    console.log(`  Reason: ${lead.reason}`);
    console.log('');
  });
}

analyzeSheet().catch(console.error);
