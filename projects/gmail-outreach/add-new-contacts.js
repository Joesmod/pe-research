const { google } = require('googleapis');
const key = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function addNewContacts() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // New high-value contacts to add
  // Columns: Company Name | Website | Contact Name | Title | Email | LinkedIn | ... | Status | Notes
  const newRows = [
    [
      'Gauge Capital',
      'https://gaugecapital.com',
      'Tom McKelvey',
      'Co-Founder & Managing Partner/CEO',
      'tmckelvey@gaugecapital.com',
      'https://www.linkedin.com/in/tom-mckelvey-4085666/',
      '', // Phone
      '', // Location
      'Dallas, TX', // HQ
      'Enriched - Added 2026-03-15',
      'Co-Founder & CEO of $3.5B middle-market PE firm. Email verified from ZoomInfo. Business services, food & consumer, healthcare, technology sectors. Higher-level contact than Andrew Peix (BD).'
    ]
  ];
  
  console.log(`Adding ${newRows.length} new contact(s)...`);
  
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'A:K',
    valueInputOption: 'RAW',
    resource: {
      values: newRows
    }
  });
  
  console.log('✅ New contacts added successfully!');
  console.log('\nAdded:');
  console.log('- Tom McKelvey (Gauge Capital) - Co-Founder & Managing Partner/CEO');
}

addNewContacts().catch(console.error);
