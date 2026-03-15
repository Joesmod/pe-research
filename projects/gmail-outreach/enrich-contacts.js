const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const creds = JSON.parse(fs.readFileSync('service-account.json'));

async function enrichContacts() {
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Contacts!A:I'
  });

  const rows = res.data.values;
  const updates = [];

  // Column mapping:
  // A = Company, B = Gumbo Score, C = Contact Name, D = Title, E = Email, 
  // F = Email Status, G = LinkedIn, H = Research Notes, I = Last Contacted

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contactName = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    const linkedin = row[6] || '';
    
    // Patient Square Capital - Sam Saini (row 1614)
    if (company.toLowerCase().includes('patient square') && 
        contactName === 'Sam Saini' && 
        !email) {
      console.log(`Enriching row ${i + 1}: Sam Saini - adding email`);
      updates.push({
        range: `Contacts!E${i + 1}:H${i + 1}`,
        values: [[
          'ssaini@patientsquarecapital.com',              // Email (E)
          'Inferred',                                     // Email Status (F)
          'https://patientsquarecapital.com/team/sam-saini/', // LinkedIn (G)
          'Enriched 2026-03-12: Head of Tech, official team page. Email pattern inferred.' // Research Notes (H)
        ]]
      });
    }

    // Patient Square Capital - Ryan Peabody (row 1615)
    if (company.toLowerCase().includes('patient square') && 
        contactName === 'Ryan Peabody' && 
        !email) {
      console.log(`Enriching row ${i + 1}: Ryan Peabody - adding email`);
      updates.push({
        range: `Contacts!E${i + 1}:H${i + 1}`,
        values: [[
          'rpeabody@patientsquarecapital.com',            // Email (E)
          'Inferred',                                     // Email Status (F)
          'https://patientsquarecapital.com/team/',      // LinkedIn (G)
          'Enriched 2026-03-12: Data Analytics Lead, official team page. Email pattern inferred.' // Research Notes (H)
        ]]
      });
    }

    // Patient Square Capital - Karr Narula (row 1616)
    if (company.toLowerCase().includes('patient square') && 
        contactName === 'Karr Narula' && 
        !email) {
      console.log(`Enriching row ${i + 1}: Karr Narula - adding email`);
      updates.push({
        range: `Contacts!E${i + 1}:H${i + 1}`,
        values: [[
          'knarula@patientsquarecapital.com',             // Email (E)
          'Inferred',                                     // Email Status (F)
          'https://patientsquarecapital.com/team/karr-narula/', // LinkedIn (G)
          'Enriched 2026-03-12: Founding Partner, Head of Transformation & Growth. Email pattern inferred.' // Research Notes (H)
        ]]
      });
    }

    // Vista Equity Partners - Nadeem Syed (row 1621)
    if (company.toLowerCase().includes('vista equity') && 
        contactName === 'Nadeem Syed' && 
        !email) {
      console.log(`Enriching row ${i + 1}: Nadeem Syed - adding email`);
      updates.push({
        range: `Contacts!E${i + 1}:H${i + 1}`,
        values: [[
          'nsyed@vistaequitypartners.com',                // Email (E)
          'Inferred',                                     // Email Status (F)
          'https://www.vistaequitypartners.com/about/team/nadeem-syed/', // LinkedIn (G)
          'Enriched 2026-03-12: Senior MD, Head of Value Creation. Email pattern inferred (not verified from official source).' // Research Notes (H)
        ]]
      });
    }
  }

  // Batch update
  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      resource: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    console.log(`\n✅ Updated ${updates.length} rows in Contacts sheet`);
  } else {
    console.log('⚠️  No rows needed updating');
  }
}

enrichContacts().catch(console.error);
