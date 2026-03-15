const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Additional verified contacts with published emails
const enrichments = [
  {
    row: 319, // CIVC Partners
    contactName: 'Nicholas Canderan',
    title: 'Principal - Head of Business Development',
    email: 'ncanderan@civc.com',
    linkedin: '',
    status: 'Enriched',
    notes: 'Email verified from company website contact page (civc.com/contact)'
  }
];

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  console.log('Updating enriched contacts...\n');

  for (const enrich of enrichments) {
    const range = `Sheet1!B${enrich.row}:L${enrich.row}`;
    
    const values = [[
      '', // NotebookLM (B)
      enrich.contactName, // C
      enrich.title, // D
      enrich.email, // E
      '', // Website (F) - keep existing
      enrich.linkedin, // G
      '', // Sector Focus (H) - keep existing
      '', // Portfolio Companies (I) - keep existing
      enrich.status, // J
      '', // Last Contacted (K)
      enrich.notes // L
    ]];

    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: range,
        valueInputOption: 'RAW',
        resource: { values },
      });
      console.log(`✅ Row ${enrich.row}: ${enrich.contactName} (${enrich.email})`);
    } catch (error) {
      console.error(`❌ Row ${enrich.row}: Error - ${error.message}`);
    }
  }

  console.log(`\nCompleted ${enrichments.length} enrichments.`);
}

updateSheet().catch(console.error);
