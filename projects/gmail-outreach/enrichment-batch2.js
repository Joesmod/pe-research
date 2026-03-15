const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Batch 2 enrichment data
const enrichments = [
  {
    firm: 'Rotunda Capital Partners',
    contactName: 'John Fruehwirth',
    title: 'Founder, Managing Partner',
    email: '',
    linkedin: 'https://www.linkedin.com/in/john-fruehwirth',
    notes: 'Founded RCP in 2009, lower middle-market PE, Philadelphia/Washington DC',
    source: 'https://www.rotundacapital.com/leadership-team/john-fruehwirth',
    status: 'Research Only'
  },
  {
    firm: 'Brighton Park Capital',
    contactName: 'Mark F. Dzialga',
    title: 'Founder, Managing Partner',
    email: '',
    linkedin: 'https://www.linkedin.com/in/mark-dzialga',
    notes: 'Former MD at General Atlantic, growth equity focus, Chicago-based',
    source: 'https://www.bpc.com/team/mark-f-dzialga',
    status: 'Research Only'
  },
  {
    firm: 'Marlin Equity Partners',
    contactName: 'Nick Kaiser',
    title: 'Co-Founder, Senior Managing Partner',
    email: '',
    linkedin: 'https://www.linkedin.com/in/nick-kaiser',
    notes: 'Software and technology PE, Los Angeles-based, $10B+ AUM',
    source: 'https://www.marlinequity.com/team/',
    status: 'Research Only'
  }
];

async function updateSheet() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:M'
    });
    
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found in sheet.');
      return;
    }

    const headers = rows[0];
    const colIndices = {
      companyName: headers.indexOf('Company Name'),
      website: headers.indexOf('Website'),
      contactName: headers.indexOf('Contact Name'),
      title: headers.indexOf('Title'),
      email: headers.indexOf('Email'),
      linkedin: headers.indexOf('LinkedIn'),
      status: headers.indexOf('Status'),
      notes: headers.indexOf('Notes'),
      companyInfoUrl: headers.indexOf('Company Info URL')
    };

    console.log('Column indices:', colIndices);

    for (const enrichment of enrichments) {
      const rowIndex = rows.findIndex((row, idx) => 
        idx > 0 && row[colIndices.companyName] === enrichment.firm
      );

      if (rowIndex === -1) {
        console.log(`Firm not found in sheet: ${enrichment.firm}`);
        continue;
      }

      const actualRowNumber = rowIndex + 1;
      console.log(`\nUpdating ${enrichment.firm} at row ${actualRowNumber}`);

      const updates = [];
      
      if (enrichment.contactName && colIndices.contactName >= 0) {
        updates.push({
          range: `Sheet1!${String.fromCharCode(65 + colIndices.contactName)}${actualRowNumber}`,
          values: [[enrichment.contactName]]
        });
      }
      
      if (enrichment.title && colIndices.title >= 0) {
        updates.push({
          range: `Sheet1!${String.fromCharCode(65 + colIndices.title)}${actualRowNumber}`,
          values: [[enrichment.title]]
        });
      }
      
      if (enrichment.email && colIndices.email >= 0) {
        updates.push({
          range: `Sheet1!${String.fromCharCode(65 + colIndices.email)}${actualRowNumber}`,
          values: [[enrichment.email]]
        });
      }
      
      if (enrichment.linkedin && colIndices.linkedin >= 0) {
        updates.push({
          range: `Sheet1!${String.fromCharCode(65 + colIndices.linkedin)}${actualRowNumber}`,
          values: [[enrichment.linkedin]]
        });
      }
      
      if (enrichment.status && colIndices.status >= 0) {
        updates.push({
          range: `Sheet1!${String.fromCharCode(65 + colIndices.status)}${actualRowNumber}`,
          values: [[enrichment.status]]
        });
      }
      
      if (enrichment.notes && colIndices.notes >= 0) {
        updates.push({
          range: `Sheet1!${String.fromCharCode(65 + colIndices.notes)}${actualRowNumber}`,
          values: [[enrichment.notes]]
        });
      }
      
      if (enrichment.source && colIndices.companyInfoUrl >= 0) {
        updates.push({
          range: `Sheet1!${String.fromCharCode(65 + colIndices.companyInfoUrl)}${actualRowNumber}`,
          values: [[enrichment.source]]
        });
      }

      if (updates.length > 0) {
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: SPREADSHEET_ID,
          resource: {
            valueInputOption: 'RAW',
            data: updates
          }
        });
        console.log(`✓ Updated ${enrichment.firm} with ${updates.length} fields`);
      }
    }

    console.log('\n=== BATCH 2 ENRICHMENT COMPLETE ===');
    console.log(`Updated ${enrichments.length} firms`);

  } catch (error) {
    console.error('Error updating sheet:', error.message);
    throw error;
  }
}

updateSheet().catch(console.error);
