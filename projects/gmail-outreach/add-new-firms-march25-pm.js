const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

const newFirms = [
  {
    company: 'Sole Source Capital',
    website: 'https://solesourcecapital.com',
    contact: 'Sumil Menon',
    title: 'Managing Director, Head of Investor Relations',
    email: 'investor.relations@solesourcecapital.com',
    linkedin: 'https://www.linkedin.com/in/sumil-menon-0478947/',
    status: 'Enriched',
    notes: 'Founded 2016 by David Fredston. Lower-middle market PE, $500M+ AUM. Industrial services, cybersecurity. Dallas TX/Santa Monica CA. Email verified from multiple press releases (2022-2026). Recent portfolio: Brite (cybersecurity MSP, Jan 2026). Source: solesourcecapital.com press releases 2026-03-25'
  },
  {
    company: 'Haveli Investments',
    website: 'https://www.haveliinvestments.com',
    contact: 'Caroline Bal Doherty',
    title: 'SVP of Capital Partnerships',
    email: 'cdoherty@havelii.com',
    linkedin: 'https://www.linkedin.com/company/haveli-investments',
    status: 'Enriched',
    notes: 'Founded 2021 by Brian Sheth (ex-Vista Equity). Austin-based. Strategic partnership with Apollo (2022). Tech-focused PE: software, gaming, cybersecurity. Recent deals: ZeroFox (SaaS cybersecurity, Nov 2025), Couchbase ($1.5B). Email domain: @havelii.com. Email verified from BusinessWire press releases. Source: haveliinvestments.com + BusinessWire 2026-03-25'
  },
  {
    company: 'Allied Industrial Partners',
    website: 'https://www.alliedindustrialpartners.com',
    contact: 'Bradford Rossi',
    title: 'Co-Founder & Managing Partner',
    email: 'contact@aipgp.com',
    linkedin: 'https://www.linkedin.com/in/bradrossi/',
    status: 'Enriched',
    notes: 'Founded 2019 by Bradford Rossi & Philip Wright. Houston-based lower-middle market PE. $1B+ AUM, Fund I closed at $300M (Feb 2026). Focus: industrial services, waste mgmt, environmental services, infrastructure. 40+ acquisitions since 2019. Portfolio: CES Power, Waste Eliminator, Celebrity Coaches, Pride Dynamo. General contact email verified from official website. Source: alliedindustrialpartners.com 2026-03-25'
  }
];

async function addNewFirms() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // First, get current row count
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:A',
  });

  const currentRows = response.data.values ? response.data.values.length : 1;
  const nextRow = currentRows + 1;

  console.log(`\n📝 Adding ${newFirms.length} new PE firms to the sheet...\n`);
  console.log(`Current row count: ${currentRows}`);
  console.log(`Starting at row: ${nextRow}\n`);

  const values = newFirms.map(firm => [
    firm.company,
    firm.website,
    firm.contact,
    firm.title,
    firm.email,
    '', // Phone (column F)
    firm.linkedin,
    firm.status,
    firm.notes
  ]);

  const updateResponse = await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:I',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    resource: {
      values: values
    }
  });

  console.log('✅ Successfully added new firms!\n');

  newFirms.forEach((firm, idx) => {
    const rowNum = nextRow + idx;
    console.log(`Row ${rowNum}: ${firm.company}`);
    console.log(`  Contact: ${firm.contact} (${firm.title})`);
    console.log(`  Email: ${firm.email}`);
    console.log(`  Website: ${firm.website}`);
    console.log(`  Status: ${firm.status}`);
    console.log('');
  });

  console.log(`\n📊 Summary:`);
  console.log(`  Firms added: ${newFirms.length}`);
  console.log(`  New total rows: ${nextRow + newFirms.length - 1}`);
  console.log(`  Update range: ${updateResponse.data.updates.updatedRange}`);
  
  return { success: true, firmsAdded: newFirms.length, startRow: nextRow };
}

addNewFirms()
  .then(result => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });
