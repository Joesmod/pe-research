/**
 * Apply batch 4 final enrichment updates
 * Compass Group
 */

const { google } = require('googleapis');
const path = require('path');

const CRM_SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function applyUpdates() {
  const sheets = await getSheets();
  
  const enrichments = [
    {
      rowIndex: 29, // Compass Group Equity Partners
      company: 'Compass Group Equity Partners',
      contact: 'Chris Gibson',
      title: 'Managing Partner',
      email: 'cgibson@cgep.com',
      linkedin: 'https://www.linkedin.com/in/chris-gibson-cgep',
      status: 'Enriched',
      notes: 'Email pattern verified from RocketReach/SignalHire. Managing Partner joined 2016. St. Louis LMM PE. Also: John Huhn (Founder, 35yr track record). Email verified indirectly via contact lookup services. (2026-03-17 cron)'
    }
  ];
  
  const updates = [];
  
  for (const e of enrichments) {
    console.log(`\n📝 Updating Row ${e.rowIndex}: ${e.company}`);
    console.log(`   → ${e.contact} (${e.title})`);
    console.log(`   → ${e.email}`);
    
    updates.push({
      range: `Sheet1!C${e.rowIndex}:E${e.rowIndex}`,
      values: [[e.contact, e.title, e.email]]
    });
    
    if (e.linkedin) {
      updates.push({
        range: `Sheet1!G${e.rowIndex}`,
        values: [[e.linkedin]]
      });
    }
    
    updates.push({
      range: `Sheet1!H${e.rowIndex}`,
      values: [[e.status]]
    });
    
    updates.push({
      range: `Sheet1!I${e.rowIndex}`,
      values: [[e.notes]]
    });
  }
  
  if (updates.length > 0) {
    console.log(`\n✅ Applying ${updates.length} updates to Google Sheet...`);
    
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: CRM_SHEET_ID,
      requestBody: {
        data: updates,
        valueInputOption: 'RAW'
      }
    });
    
    console.log('✅ Updates applied successfully!');
  }
  
  console.log(`\n📊 Batch 4 Final Enrichment Summary:`);
  console.log(`  Firms enriched: ${enrichments.length}`);
  enrichments.forEach((e, i) => {
    console.log(`  ${i + 1}. ${e.company} → ${e.contact} (${e.email})`);
  });
  
  return enrichments;
}

applyUpdates().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
