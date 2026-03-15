const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = './service-account.json';

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read from Sheet1, starting at row 2 (skip broken header in row 1)
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A2:L',
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }

  // Column mapping:
  // A=Company Name, B=NotebookLM/Website, C=Contact Name, D=Title, E=Email, 
  // F=Website, G=LinkedIn, H=Status/Enriched, I=Notes
  
  console.log(`\n📊 Total rows: ${rows.length + 1} (including row 1)\n`);
  
  const needsEnrichment = [];
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const company = (row[0] || '').trim(); // Company Name (A)
    const contact = (row[2] || '').trim();  // Contact Name (C)
    const title = (row[3] || '').trim();    // Title (D)
    const email = (row[4] || '').trim();    // Email (E)
    const website = row[1] || row[5] || ''; // NotebookLM or Website
    const status = (row[7] || '').trim();   // Status (H)
    const notes = (row[8] || '').trim();    // Notes (I)
    
    // Skip if no company name
    if (!company) continue;
    
    // Skip if already sent or dead
    if (status && (status.toLowerCase().includes('sent') || status.toLowerCase().includes('dead'))) {
      continue;
    }
    
    // Check if needs enrichment
    const noContact = !contact;
    const genericEmail = email && (
      email.toLowerCase().startsWith('info@') || 
      email.toLowerCase().startsWith('sales@') || 
      email.toLowerCase().startsWith('ir@') ||
      email.toLowerCase().startsWith('contact@') ||
      email.toLowerCase().startsWith('hello@') ||
      email.toLowerCase().startsWith('support@')
    );
    const noEmail = !email;
    
    if (noContact || genericEmail || noEmail) {
      needsEnrichment.push({
        rowIndex: i + 2, // +2 because we skipped row 1 and arrays are 0-indexed
        company,
        contact: contact || '[EMPTY]',
        title: title || '[EMPTY]',
        email: email || '[EMPTY]',
        website,
        status,
        notes,
        reason: [
          noContact ? 'No contact' : null,
          noEmail ? 'No email' : null,
          genericEmail ? `Generic email (${email})` : null
        ].filter(Boolean).join(', ')
      });
    }
  }

  console.log(`✅ Found ${needsEnrichment.length} leads needing enrichment\n`);
  
  // Take first 15 for this run
  const batch = needsEnrichment.slice(0, 15);
  
  console.log(`📋 Batch of ${batch.length} to research:\n`);
  console.log('─'.repeat(80));
  batch.forEach((lead, idx) => {
    console.log(`\n${idx + 1}. ${lead.company} (Row ${lead.rowIndex})`);
    console.log(`   Contact: ${lead.contact}`);
    console.log(`   Title: ${lead.title}`);
    console.log(`   Email: ${lead.email}`);
    console.log(`   Website: ${lead.website || '[EMPTY]'}`);
    console.log(`   Status: ${lead.status || '[EMPTY]'}`);
    console.log(`   ⚠️  ${lead.reason}`);
  });

  // Save to file for enrichment
  fs.writeFileSync(
    'enrichment-targets-current.json',
    JSON.stringify(batch, null, 2)
  );
  
  console.log(`\n\n💾 Saved ${batch.length} targets to enrichment-targets-current.json`);
  console.log(`\n🎯 Total needing enrichment: ${needsEnrichment.length}`);
}

main().catch(console.error);
