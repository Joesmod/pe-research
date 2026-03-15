const { google } = require('googleapis');
const key = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// New firms to add
const newFirms = [
  {
    'Company Name': 'Bow River Capital',
    'NotebookLM': '',
    'Contact Name': 'Greg J. Hiatrides',
    'Title': 'Partner, Head of Private Equity',
    'Email': '', // Will search for email
    'Website': 'https://www.bowrivercapital.com',
    'LinkedIn': 'https://www.bowrivercapital.com/team',
    'Sector Focus': 'Healthcare Services, Infrastructure Services, Industrial Services, Tech-Enabled Business Services',
    'Portfolio Companies': 'Amazing Care (pediatric home health), Progressive Roofing, Arctic Air Holdings, NextEdge (telecom), Veregy (energy efficiency), Ocean Tomo',
    'Status': 'Researched',
    'Last Contacted': ''
  },
  {
    'Company Name': 'Amulet Capital Partners',
    'NotebookLM': '',
    'Contact Name': 'Avi Uttamchandani',
    'Title': 'Partner',
    'Email': '', // Will search for email
    'Website': 'https://amuletcapital.com',
    'LinkedIn': 'https://www.linkedin.com/company/amulet-capital-partners',
    'Sector Focus': 'Healthcare (Life Sciences Outsourcing, Healthcare Providers, Payor Services)',
    'Portfolio Companies': 'US Fertility, Choice Healthcare Services, United Vein & Vascular Centers, Assembled Intelligence',
    'Status': 'Researched',
    'Last Contacted': ''
  },
  {
    'Company Name': 'Trivest Partners',
    'NotebookLM': '',
    'Contact Name': 'Reid Callaway',
    'Title': 'Managing Director',
    'Email': '', // Will search for email
    'Website': 'https://www.trivestpartners.com',
    'LinkedIn': 'https://www.linkedin.com/company/trivestpartners',
    'Sector Focus': 'Business Services, Healthcare, Niche Manufacturing, Value-Added Distribution, Consumer & Retail',
    'Portfolio Companies': 'Founded 1981, $3.3B+ AUM across multiple funds (Recognition Fund $1.3B, Mid-Market Fund VII $950M)',
    'Status': 'Researched',
    'Last Contacted': ''
  }
];

(async () => {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Get current data to find the last row
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:K'
    });

    const rows = res.data.values || [];
    const lastRow = rows.length;
    console.log(`Current sheet has ${lastRow} rows (including header)`);

    // Prepare new rows
    const headers = rows[0];
    const newRows = newFirms.map(firm => {
      return headers.map(header => firm[header] || '');
    });

    // Append new rows
    const appendRange = `Sheet1!A${lastRow + 1}`;
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: appendRange,
      valueInputOption: 'RAW',
      resource: {
        values: newRows
      }
    });

    console.log(`\n✅ Successfully added ${newFirms.length} new firms starting at row ${lastRow + 1}:`);
    newFirms.forEach((firm, i) => {
      console.log(`\nRow ${lastRow + 1 + i}: ${firm['Company Name']}`);
      console.log(`  Contact: ${firm['Contact Name']} (${firm['Title']})`);
      console.log(`  Sector: ${firm['Sector Focus']}`);
      console.log(`  Status: ${firm['Status']}`);
    });

  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
