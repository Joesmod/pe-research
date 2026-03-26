const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const linkedinUpdates = [
  {
    row: 18,
    company: 'Gryphon Investors',
    contact: 'Keith Stimson',
    linkedin: 'https://www.linkedin.com/in/keith-stimson-69a2a81/',
    domain: '@gryphoninvestors.com',
    generalContact: 'businessdevelopment@gryphoninvestors.com',
    phone: '415-217-7400'
  },
  {
    row: 36,
    company: 'Cressey & Company',
    contact: 'Bryan Cressey',
    linkedin: 'https://www.linkedin.com/in/bryan-cressey/',
    domain: '@cresseyco.com',
    generalContact: 'info@cresseyco.com',
    phone: '615-369-8444'
  },
  {
    row: 39,
    company: 'Ampersand Capital Partners',
    contact: 'Herb Hooper',
    linkedin: 'https://www.linkedin.com/in/herb-hooper-465b33152/',
    domain: '@ampersandcapital.com',
    generalContact: 'info@ampersandcapital.com',
    phone: '781-239-0700'
  },
  {
    row: 192,
    company: 'NewSpring Capital',
    contact: 'Michael DiPiano',
    linkedin: 'https://www.linkedin.com/in/michael-dipiano-0308502b/',
    domain: '@newspringcapital.com',
    generalContact: '',
    phone: ''
  }
];

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  console.log('🫡 Updating Sheet with LinkedIn URLs and Research Notes\n');
  console.log('=' .repeat(70) + '\n');
  
  for (const item of linkedinUpdates) {
    console.log(`Row ${item.row}: ${item.company} - ${item.contact}`);
    
    // Update LinkedIn
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Sheet1!G${item.row}`,
      valueInputOption: 'RAW',
      requestBody: { values: [[item.linkedin]] }
    });
    console.log(`  ✓ LinkedIn: ${item.linkedin}`);
    
    // Update Notes
    const notes = `Manual research (2026-03-25 10:46pm): LinkedIn found. Email domain verified: ${item.domain}. ${item.generalContact ? `General contact: ${item.generalContact}.` : ''} ${item.phone ? `Phone: ${item.phone}.` : ''} Direct email not publicly available - recommend LinkedIn outreach or general BD contact.`;
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Sheet1!I${item.row}`,
      valueInputOption: 'RAW',
      requestBody: { values: [[notes]] }
    });
    console.log(`  ✓ Notes updated`);
    console.log('');
    
    await new Promise(r => setTimeout(r, 500));
  }
  
  console.log('=' .repeat(70));
  console.log(`\n✅ Updated ${linkedinUpdates.length} rows with LinkedIn URLs and research notes\n`);
  console.log('Summary:');
  console.log(`- LinkedIn URLs added: ${linkedinUpdates.length}`);
  console.log(`- Email domains verified: ${linkedinUpdates.length}`);
  console.log(`- Direct emails found: 0 (not publicly available)`);
  console.log('\nRecommendation: Use LinkedIn InMail or general BD contacts for outreach.\n');
}

updateSheet().catch(console.error);
