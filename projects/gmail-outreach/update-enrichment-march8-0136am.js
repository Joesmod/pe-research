const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const updates = [
  {
    company: 'Sunstone Partners',
    contactName: 'Kara Donnelly',
    title: 'VP of Business Development',
    email: 'kdonnelly@sunstonepartners.com',
    linkedin: 'https://www.linkedin.com/in/kara-donnelly-18b52718/',
    status: 'Enriched',
    notes: 'VP of Business Development - responsible for sourcing platforms and add-on acquisitions. Email pattern based on standard format. Source: Company team page + LinkedIn. [Enriched: 2026-03-08 cron]'
  },
  {
    company: 'Tola Capital',
    contactName: 'Sheila Gulati',
    title: 'Managing Director',
    email: 'sheila@tolacapital.com',
    linkedin: 'https://www.linkedin.com/in/sheilagulati/',
    status: 'Enriched',
    notes: 'Managing Director - Email verified from ContactOut (published source). VC firm (early-stage enterprise software), not mid-market PE. [Enriched: 2026-03-08 cron]'
  },
  {
    company: 'ScaleView Partners',
    contactName: 'ScaleView Partners',
    title: '',
    email: '',
    status: 'Dead - Investment Bank',
    notes: 'Investment banking firm (M&A advisory for tech companies). Not a PE investor. Founded 2021. Austin, TX. [Research: 2026-03-08]'
  }
];

async function updateSheet() {
  try {
    // First, read the sheet to find the right rows
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:M'
    });
    
    const rows = response.data.values || [];
    const updateRequests = [];
    
    for (const update of updates) {
      // Find the row for this company
      const rowIndex = rows.findIndex(row => row[0] === update.company);
      
      if (rowIndex === -1) {
        console.log(`⚠️  Company not found: ${update.company}`);
        continue;
      }
      
      const actualRow = rowIndex + 1; // Sheet rows are 1-indexed
      console.log(`Updating ${update.company} at row ${actualRow}`);
      
      // Prepare the update
      const rowData = [
        update.contactName,
        update.title,
        update.email,
        '', // Website - keep existing
        update.linkedin,
        '', // Sector - keep existing
        '', // Portfolio - keep existing
        update.status,
        '', // Last Contacted - keep existing
        update.notes
      ];
      
      updateRequests.push({
        range: `Sheet1!C${actualRow}:L${actualRow}`,
        values: [rowData]
      });
    }
    
    if (updateRequests.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SHEET_ID,
        resource: {
          valueInputOption: 'RAW',
          data: updateRequests
        }
      });
      
      console.log(`\n✅ Successfully updated ${updateRequests.length} rows`);
    } else {
      console.log('\n⚠️  No updates made');
    }
    
  } catch (error) {
    console.error('Error updating sheet:', error.message);
    throw error;
  }
}

updateSheet().catch(console.error);
