// Get Unresearched List - Friday 5:36 PM
const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function getUnresearchedList() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A1:Z1000',
    });

    const rows = response.data.values;
    const header = rows[0];
    
    const companyIdx = header.indexOf('Company Name');
    const contactIdx = header.indexOf('Contact Name');
    const emailIdx = header.indexOf('Email');
    const statusIdx = header.indexOf('Status');
    const websiteIdx = header.indexOf('Website');
    const linkedinIdx = header.indexOf('LinkedIn');
    const sectorIdx = header.indexOf('Sector Focus');

    const unresearched = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const company = row[companyIdx] || '';
      if (!company || company.trim() === '') continue;

      const status = row[statusIdx] || '';

      if (status === 'New - Unresearched') {
        unresearched.push({
          row: i + 1,
          company: company.trim(),
          website: row[websiteIdx] || '',
          linkedin: row[linkedinIdx] || '',
          contact: row[contactIdx] || '',
          email: row[emailIdx] || '',
          sector: row[sectorIdx] || ''
        });
      }
    }

    return unresearched;
  } catch (error) {
    console.error('Error:', error.message);
    return [];
  }
}

async function main() {
  const list = await getUnresearchedList();
  
  console.log(`Found ${list.length} unresearched firms\n`);
  console.log('First 15 for enrichment:\n');
  
  list.slice(0, 15).forEach((firm, idx) => {
    console.log(`${idx + 1}. Row ${firm.row}: ${firm.company}`);
    console.log(`   Website: ${firm.website || '(none)'}`);
    console.log(`   LinkedIn: ${firm.linkedin || '(none)'}`);
    console.log(`   Current contact: ${firm.contact || '(none)'}`);
    console.log();
  });

  fs.writeFileSync(
    'unresearched-targets-536pm.json',
    JSON.stringify(list.slice(0, 15), null, 2)
  );

  console.log('Saved to unresearched-targets-536pm.json');
}

main();
