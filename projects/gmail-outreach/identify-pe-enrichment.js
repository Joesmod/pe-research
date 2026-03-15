const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const creds = JSON.parse(fs.readFileSync('service-account.json'));

async function identifyPEEnrichment() {
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });

  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Contacts!A:K'
  });

  const rows = res.data.values;
  const nonPEKeywords = [
    'search partners', 'recruiter', 'recruiting', 'ilpa', 'association', 
    'girls who invest', 'allocators', 'henkel', 'odyssey search'
  ];

  const targets = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = (row[0] || '').trim();
    const contactName = (row[2] || '').trim();
    const email = (row[4] || '').trim();
    const status = (row[9] || '').trim();

    // Skip non-PE firms
    if (nonPEKeywords.some(kw => company.toLowerCase().includes(kw))) continue;

    // Skip already "Sent" or "Dead" status
    if (status === 'Sent' || status === 'Dead') continue;

    // Needs enrichment if:
    // 1. No contact name OR contact is "Jacob Zodikoff" (placeholder)
    // 2. No email OR generic email (info@, sales@, ir@)
    const hasContact = contactName && contactName !== 'Jacob Zodikoff' && 
                       !contactName.includes('undefined');
    const hasValidEmail = email && 
                          !email.startsWith('info@') && 
                          !email.startsWith('sales@') &&
                          !email.startsWith('ir@') &&
                          email !== 'EMPTY';

    if (!hasContact || !hasValidEmail) {
      targets.push({
        row: i + 1,
        company,
        contactName: contactName || 'EMPTY',
        email: email || 'EMPTY',
        status
      });
    }
  }

  console.log(`\n🎯 ${targets.length} PE firms need enrichment\n`);
  
  // Show first 15
  targets.slice(0, 15).forEach((t, idx) => {
    console.log(`${idx + 1}. Row ${t.row}: ${t.company}`);
    console.log(`   Contact: ${t.contactName} | Email: ${t.email}`);
    console.log(`   Status: ${t.status || 'Active'}\n`);
  });

  fs.writeFileSync('pe-enrichment-targets.json', JSON.stringify(targets, null, 2));
  console.log(`✅ Saved to pe-enrichment-targets.json`);
}

identifyPEEnrichment();
