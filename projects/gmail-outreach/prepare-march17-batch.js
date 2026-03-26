const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Load qualified contacts
  const qualified = JSON.parse(fs.readFileSync('qualified-contacts.json', 'utf8'));
  
  // Read Sheet1 to check Last Contacted (col J)
  const sheet1 = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:J',
  });

  const sheet1Rows = sheet1.data.values || [];
  const sheet1Headers = sheet1Rows[0] || [];
  const sheet1Data = sheet1Rows.slice(1);

  const companyIdx = sheet1Headers.indexOf('Company');
  const lastContactedIdx = sheet1Headers.indexOf('Last Contacted');

  console.log(`📊 Sheet1: ${sheet1Data.length} rows`);
  console.log(`   Company column: ${companyIdx}, Last Contacted column: ${lastContactedIdx}`);

  // Build map of companies contacted in last 7 days from Sheet1
  const today = new Date('2026-03-17T08:00:00-06:00');
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const recentlyContacted = new Set();

  sheet1Data.forEach((row) => {
    const company = row[companyIdx] || '';
    const lastContacted = row[lastContactedIdx] || '';
    if (company && lastContacted) {
      const lastContactDate = new Date(lastContacted);
      if (lastContactDate >= sevenDaysAgo) {
        recentlyContacted.add(company);
      }
    }
  });

  console.log(`\n🚫 Companies contacted in last 7 days (Sheet1): ${recentlyContacted.size}`);
  if (recentlyContacted.size > 0 && recentlyContacted.size < 20) {
    console.log(`   ${Array.from(recentlyContacted).slice(0, 10).join(', ')}`);
  }

  // Filter qualified contacts to exclude recently contacted
  const available = qualified.filter(c => !recentlyContacted.has(c.company));

  console.log(`\n✅ Available contacts (after filtering): ${available.length}`);
  console.log(`   Priority contacts: ${available.filter(c => c.isPriority).length}`);

  // Select top 25
  const batch = available.slice(0, 25);

  console.log(`\n📋 Selected 25 contacts for today's batch:\n`);

  batch.forEach((c, i) => {
    console.log(`${i + 1}. ${c.company}`);
    console.log(`   ${c.contact} - ${c.title}`);
    console.log(`   ${c.email} | Score: ${c.gumboScore} ${c.isPriority ? '⭐' : ''}`);
    console.log('');
  });

  // Save batch
  fs.writeFileSync('batch-march17-25.json', JSON.stringify(batch, null, 2));
  console.log(`\n💾 Saved batch to batch-march17-25.json`);
}

main().catch(console.error);
