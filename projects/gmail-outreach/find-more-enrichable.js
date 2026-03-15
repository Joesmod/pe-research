const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:N',
  });

  const rows = response.data.values;
  const candidates = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const company = (row[0] || '').trim();
    const contact = (row[2] || '').trim();
    const title = (row[3] || '').trim();
    const email = (row[4] || '').trim();
    const status = (row[9] || '').trim();

    if (!company) continue;
    
    // Look for firms with contact but no email, or unverified status
    const hasContactNoEmail = contact && (!email || email === '');
    const partialStatus = status.includes('Partial') || status.includes('Unresearched') || status.includes('Unverified');
    
    if ((hasContactNoEmail || partialStatus) && !status.includes('Dead') && !status.includes('Sent')) {
      candidates.push({
        row: i + 1,
        company,
        contact,
        title,
        email,
        status,
        reason: hasContactNoEmail ? 'Has contact, missing email' : 'Needs verification'
      });
    }
  }

  console.log(`\n📋 Found ${candidates.length} additional enrichment candidates\n`);
  
  candidates.slice(0, 15).forEach((c, idx) => {
    console.log(`${idx + 1}. ${c.company} (Row ${c.row}) - ${c.reason}`);
    console.log(`   Contact: ${c.contact || 'N/A'}`);
    console.log(`   Status: ${c.status}\n`);
  });

  fs.writeFileSync(
    'additional-enrichment-candidates-march11.json',
    JSON.stringify(candidates.slice(0, 15), null, 2)
  );
}

main().catch(console.error);
