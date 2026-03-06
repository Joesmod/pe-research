const { google } = require('googleapis');
const path = require('path');

const SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');

// Additional enrichments - verified from sources
const enrichments = [
  {
    company: 'Greenspring Associates',
    contact: 'Ashton Newhall',
    title: 'Co-Founder & Managing General Partner',
    email: 'info@greenspringassociates.com',
    linkedin: 'https://www.linkedin.com/company/greenspring-associates',
    notes: 'Found on greenspringassociates.com team page - info@ is official contact',
    status: 'Partial'
  },
  {
    company: 'Clearlake Capital',
    contact: 'Jose E. Feliciano',
    title: 'Co-Founder & Managing Partner',
    email: 'info@clearlake.com',
    linkedin: 'https://www.linkedin.com/company/clearlake-capital-group',
    notes: 'Co-founder per Wikipedia - info@ is official contact on clearlake.com',
    status: 'Partial'
  },
  {
    company: 'Bison Capital',
    contact: 'Business Development',
    title: 'Team',
    email: 'info@bisoncapital.com',
    linkedin: 'https://www.linkedin.com/company/bison-capital-asset-management',
    notes: 'Team page lists Partners collectively - info@ is official contact',
    status: 'New - Unresearched'
  }
];

async function updateSheet() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_FILE,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:H',
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found in sheet.');
      return;
    }

    const headers = rows[0];
    const companyCol = headers.indexOf('Company Name');
    const contactCol = headers.indexOf('Contact Name');
    const titleCol = headers.indexOf('Title/Position');
    const emailCol = headers.indexOf('Email');
    const linkedinCol = headers.indexOf('LinkedIn URL');
    const notesCol = headers.indexOf('Notes');
    const statusCol = headers.indexOf('Status');

    let updatedCount = 0;

    for (const enrichment of enrichments) {
      const rowIndex = rows.findIndex((row, idx) => 
        idx > 0 && row[companyCol] === enrichment.company
      );

      if (rowIndex === -1) {
        console.log(`Company not found: ${enrichment.company}`);
        continue;
      }

      const rowNumber = rowIndex + 1;
      const updateRange = `Sheet1!C${rowNumber}:H${rowNumber}`;
      
      const values = [[
        enrichment.contact,
        enrichment.title,
        enrichment.email,
        enrichment.linkedin,
        enrichment.notes,
        enrichment.status
      ]];

      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: updateRange,
        valueInputOption: 'RAW',
        resource: { values },
      });

      console.log(`✅ Updated ${enrichment.company} - ${enrichment.contact}`);
      updatedCount++;
    }

    console.log(`\n📊 Total enrichments: ${updatedCount}`);
    console.log('✅ Batch 2 update complete!');

  } catch (error) {
    console.error('Error updating sheet:', error.message);
  }
}

updateSheet();
