// Add new PE firms to the prospect sheet - March 4, 2026
const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = 'service-account.json';

async function getClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const client = await auth.getClient();
  return google.sheets({ version: 'v4', auth: client });
}

async function addFirms() {
  const sheets = await getClient();
  
  // New firms to add - mid-market PE, $500M-$5B AUM, services-heavy
  const newFirms = [
    {
      company: 'Amulet Capital Partners',
      website: 'https://www.amuletcapital.com',
      contact: '',
      title: '',
      email: '',
      linkedin: '',
      status: 'New',
      notes: 'Mid-market PE, business services focus, $1B+ AUM'
    },
    {
      company: 'Carousel Capital',
      website: 'https://www.carouselcapital.com',
      contact: '',
      title: '',
      email: '',
      linkedin: '',
      status: 'New',
      notes: 'Healthcare services, business services, $2B+ AUM'
    },
    {
      company: 'CapStreet',
      website: 'https://www.capstreet.com',
      contact: '',
      title: '',
      email: '',
      linkedin: '',
      status: 'New',
      notes: 'Business services, healthcare IT, $3.5B+ AUM'
    },
    {
      company: 'The Riverside Company',
      website: 'https://www.riversidecompany.com',
      contact: '',
      title: '',
      email: '',
      linkedin: '',
      status: 'New',
      notes: 'Mid-market PE, tech-enabled services, $9B+ AUM'
    },
  ];
  
  // Format as rows (matching sheet structure: Company, Website, Contact, Title, Email, LinkedIn, Status, Notes)
  const rows = newFirms.map(firm => [
    firm.company,
    firm.website,
    firm.contact,
    firm.title,
    firm.email,
    '',  // Phone
    firm.linkedin,
    '',  // AUM
    '',  // Geography
    firm.status,
    firm.notes
  ]);
  
  // Append to sheet
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:K',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: rows },
  });
  
  console.log(`✅ Added ${newFirms.length} new PE firms to the sheet`);
  newFirms.forEach(f => console.log(`  • ${f.company} - ${f.notes}`));
}

addFirms().catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
