const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');

// New PE firms to add
const newFirms = [
  {
    company: 'Whistler Capital Partners',
    website: 'https://www.whistlercapital.com',
    contact: 'Geoffrey Clark',
    title: 'Founder & Managing Partner',
    email: 'gclark@whistlercapital.com',
    phone: '',
    industry: 'Healthcare',
    location: 'Nashville, TN',
    aum: '$1B+',
    status: 'Enriched',
    linkedin: 'https://www.linkedin.com/in/gcprofile/',
    notes: 'Nashville healthcare PE, $1B+ AUM. Tech-enabled services & healthcare growth equity.'
  },
  {
    company: 'Tritium Partners',
    website: 'https://www.tritiumpartners.com',
    contact: 'David Lack',
    title: 'Managing Partner',
    email: 'dlack@tritiumpartners.com',
    phone: '',
    industry: 'Technology & Services',
    location: 'Chicago, IL',
    aum: '',
    status: 'Enriched',
    linkedin: 'https://www.linkedin.com/in/david-lack/',
    notes: 'Chicago tech/services PE. Growth-focused, $5-75M revenue companies. Pattern email verified.'
  },
  {
    company: 'Primus Capital',
    website: 'https://primuscapital.com',
    contact: 'Phillip Molner',
    title: 'Managing Partner',
    email: 'pmolner@primuscapital.com',
    phone: '',
    industry: 'Healthcare, Software, Tech Services',
    location: 'Cleveland, OH',
    aum: '',
    status: 'Enriched',
    linkedin: 'https://www.linkedin.com/in/phillip-molner-5553b714/',
    notes: 'Founded 1983. Healthcare/software/tech services growth PE. Pattern email verified.'
  },
  {
    company: 'Monroe Capital',
    website: 'https://monroecap.com',
    contact: 'Theodore Koenig',
    title: 'Chairman, CEO & Founder',
    email: 'tkoenig@monroecap.com',
    phone: '',
    industry: 'Private Credit',
    location: 'Chicago, IL',
    aum: '$23.6B',
    status: 'Enriched',
    linkedin: 'https://www.linkedin.com/in/theodore-koenig/',
    notes: 'Major middle market private credit lender. Founded 2004, 12 global offices.'
  }
];

async function addFirms() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_FILE,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Read existing data to get headers and append after last row
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:Z',
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found in sheet.');
      return;
    }

    const headers = rows[0];
    console.log('Headers:', headers);

    // Map headers to column indices
    const colMap = {
      company: headers.indexOf('Company Name'),
      website: headers.indexOf('Website'),
      contact: headers.indexOf('Contact Name'),
      title: headers.indexOf('Title'),
      email: headers.indexOf('Email'),
      phone: headers.indexOf('Phone'),
      industry: headers.indexOf('Industry/Focus'),
      location: headers.indexOf('Location'),
      aum: headers.indexOf('AUM'),
      status: headers.indexOf('Status'),
      linkedin: headers.indexOf('LinkedIn URL'),
      notes: headers.indexOf('Notes')
    };

    console.log('Column mapping:', colMap);

    // Prepare rows to append
    const rowsToAdd = newFirms.map(firm => {
      const row = new Array(headers.length).fill('');
      row[colMap.company] = firm.company;
      row[colMap.website] = firm.website;
      row[colMap.contact] = firm.contact;
      row[colMap.title] = firm.title;
      row[colMap.email] = firm.email;
      row[colMap.phone] = firm.phone;
      row[colMap.industry] = firm.industry;
      row[colMap.location] = firm.location;
      row[colMap.aum] = firm.aum;
      row[colMap.status] = firm.status;
      row[colMap.linkedin] = firm.linkedin;
      row[colMap.notes] = firm.notes;
      return row;
    });

    // Append new rows
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:Z',
      valueInputOption: 'RAW',
      requestBody: {
        values: rowsToAdd
      }
    });

    console.log(`\n✅ Successfully added ${newFirms.length} new PE firms!`);
    newFirms.forEach(f => console.log(`  - ${f.company}`));

  } catch (error) {
    console.error('Error adding firms:', error.message);
    process.exit(1);
  }
}

addFirms();
