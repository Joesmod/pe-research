const { google } = require('googleapis');

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

  // Enrichment data - verified contacts from manual research
  const updates = [
    {
      row: 254,
      firm: 'Chicago Pacific Founders',
      contact: 'Mary Tolan',
      title: 'Co-Founder and Managing Partner',
      email: 'mtolan@cpfounders.com',
      linkedin: 'https://www.linkedin.com/company/chicago-pacific-founders',
      status: 'Enriched',
      notes: 'Email verified from ContactOut 2026-03-03. Healthcare-focused PE, former healthcare CEO team, ~$3B AUM.'
    }
  ];

  console.log('🫡 PE Enrichment Update - March 3, 2026 1:36 AM\n');
  console.log('Updating Google Sheet with verified contacts...\n');

  // Prepare batch update
  const batchData = [];
  
  updates.forEach(update => {
    // Column mapping: A=Firm, B=Contact, C=Title, D=Email, E=Website, F=LinkedIn, G=Sectors, H=Description, I=Status, J=Last Contacted, K=Notes
    if (update.contact) {
      batchData.push({
        range: `Sheet1!B${update.row}`,
        values: [[update.contact]]
      });
    }
    if (update.title) {
      batchData.push({
        range: `Sheet1!C${update.row}`,
        values: [[update.title]]
      });
    }
    if (update.email) {
      batchData.push({
        range: `Sheet1!D${update.row}`,
        values: [[update.email]]
      });
    }
    if (update.linkedin) {
      batchData.push({
        range: `Sheet1!F${update.row}`,
        values: [[update.linkedin]]
      });
    }
    if (update.status) {
      batchData.push({
        range: `Sheet1!I${update.row}`,
        values: [[update.status]]
      });
    }
    if (update.notes) {
      batchData.push({
        range: `Sheet1!K${update.row}`,
        values: [[update.notes]]
      });
    }
  });

  if (batchData.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'RAW',
        data: batchData
      }
    });
    console.log(`✅ Updated ${updates.length} firm(s) in the Google Sheet\n`);
    
    updates.forEach(u => {
      console.log(`📊 ${u.firm} (Row ${u.row})`);
      console.log(`   Contact: ${u.contact}`);
      console.log(`   Title: ${u.title}`);
      console.log(`   Email: ${u.email}`);
      console.log(`   Status: ${u.status}`);
      console.log('');
    });
  } else {
    console.log('⚠️ No updates to apply');
  }

  console.log('=' . repeat(60));
  console.log('📋 ENRICHMENT SUMMARY');
  console.log('=' . repeat(60));
  console.log('Firms enriched: 1');
  console.log('Apollo API results: 0/15');
  console.log('Manual research conducted: 5 firms');
  console.log('Verified contacts found: 1');
  console.log('');
  console.log('See enrichment-log-2026-03-03-cron.md for full research notes.');
  console.log('🫡 Cron job complete.');
}

updateSheet().catch(console.error);
