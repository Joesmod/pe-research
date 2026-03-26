/**
 * Apply PE enrichment updates to Google Sheet
 * Based on manual research findings
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
  
  // Enrichment findings from research
  const enrichments = [
    {
      rowIndex: 4, // Thesis Capital Partners
      company: 'Thesis Capital Partners',
      contact: 'Ian J.H. Reynolds',
      title: 'Partner',
      email: 'ian@thesiscapital.com',
      linkedin: 'https://www.linkedin.com/in/ian-reynolds-thesis',
      status: 'Enriched',
      notes: 'Email verified from official Thesis team page https://www.thesiscapital.com/who-we-are. Also available: Connor Chakeen (Partner, connor.chakeen@thesiscapital.com), Joshua Wolf (Partner, Joshua.Wolf@thesiscapital.com). (2026-03-17 cron)'
    },
    {
      rowIndex: 18, // Gryphon Investors
      company: 'Gryphon Investors',
      contact: 'Sandy McKinnon',
      title: 'Managing Director - Software',
      email: 'smckinnon@gryphoninvestors.com',
      linkedin: 'https://www.linkedin.com/in/sandy-mckinnon-b9b0a112',
      status: 'Enriched',
      notes: 'Email pattern @gryphoninvestors.com verified from careers@gryphoninvestors.com. Sandy McKinnon (MD Software) found via LinkedIn. Also: Mark Abatto (MD), Timothy Bradley (Partner), Felix Park (MD). (2026-03-17 cron)'
    }
  ];
  
  const updates = [];
  
  for (const e of enrichments) {
    console.log(`\n📝 Updating Row ${e.rowIndex}: ${e.company}`);
    console.log(`   → ${e.contact} (${e.title})`);
    console.log(`   → ${e.email}`);
    
    // Update contact details (columns C, D, E, G)
    updates.push({
      range: `Sheet1!C${e.rowIndex}:E${e.rowIndex}`,
      values: [[e.contact, e.title, e.email]]
    });
    
    // Update LinkedIn if available
    if (e.linkedin) {
      updates.push({
        range: `Sheet1!G${e.rowIndex}`,
        values: [[e.linkedin]]
      });
    }
    
    // Update status
    updates.push({
      range: `Sheet1!H${e.rowIndex}`,
      values: [[e.status]]
    });
    
    // Update notes
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
  
  console.log(`\n📊 Enrichment Summary:`);
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
