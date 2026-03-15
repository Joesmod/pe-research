const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Read Contacts sheet
  const contacts = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Contacts!A:Z',
  });

  const rows = contacts.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found in Contacts sheet.');
    return;
  }

  const headers = rows[0];
  const data = rows.slice(1);

  console.log('\n📋 Contacts Sheet Headers:', headers.join(' | '));
  console.log(`\n📊 Total contacts: ${data.length}`);

  // Find column indices
  const companyIdx = headers.indexOf('Company');
  const contactIdx = headers.indexOf('Contact Name');
  const titleIdx = headers.indexOf('Title');
  const emailIdx = headers.indexOf('Email');
  const emailStatusIdx = headers.indexOf('Email Status');
  const gumboScoreIdx = headers.indexOf('Gumbo Score');
  const lastContactedIdx = headers.indexOf('Last Contacted');
  const researchNotesIdx = headers.indexOf('Research Notes');

  console.log('\n🔍 Column indices:');
  console.log(`  Company: ${companyIdx}`);
  console.log(`  Contact Name: ${contactIdx}`);
  console.log(`  Title: ${titleIdx}`);
  console.log(`  Email: ${emailIdx}`);
  console.log(`  Email Status: ${emailStatusIdx}`);
  console.log(`  Gumbo Score: ${gumboScoreIdx}`);
  console.log(`  Last Contacted: ${lastContactedIdx}`);

  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const qualified = [];
  const companyContacted = new Set(); // Track companies already contacted

  data.forEach((row, idx) => {
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const title = row[titleIdx] || '';
    const email = row[emailIdx] || '';
    const emailStatus = row[emailStatusIdx] || '';
    const gumboScore = parseFloat(row[gumboScoreIdx]) || 0;
    const lastContacted = row[lastContactedIdx] || '';
    const researchNotes = row[researchNotesIdx] || '';

    // Skip if no email or company
    if (!email || !company) return;

    // Skip if email not verified (accept "Valid" or "Verified")
    if (!emailStatus.match(/valid|verified/i)) return;

    // Skip if Gumbo Score < 8
    if (gumboScore < 8) return;

    // Skip if company was already contacted in last 7 days
    if (lastContacted) {
      const lastContactDate = new Date(lastContacted);
      if (lastContactDate >= sevenDaysAgo) {
        companyContacted.add(company);
        return;
      }
    }

    // Skip if company already in this batch
    if (companyContacted.has(company)) return;

    // Prioritize tech/AI/value creation roles
    const isPriority = title.toLowerCase().match(/(cto|chief.*tech|chief.*ai|chief.*digital|vp.*product|operating.*partner|innovation|platform)/);

    qualified.push({
      rowNum: idx + 2,
      company,
      contact,
      title,
      email,
      gumboScore,
      researchNotes,
      lastContacted,
      isPriority: !!isPriority
    });

    // Mark company as used
    companyContacted.add(company);
  });

  // Sort by priority first, then by Gumbo Score
  qualified.sort((a, b) => {
    if (a.isPriority !== b.isPriority) return b.isPriority - a.isPriority;
    return b.gumboScore - a.gumboScore;
  });

  console.log(`\n✅ Found ${qualified.length} qualified contacts (1 per company)`);
  console.log(`   ${qualified.filter(c => c.isPriority).length} with priority roles (tech/AI/value creation)`);
  console.log('\n📋 Top 30 contacts:\n');

  qualified.slice(0, 30).forEach((c, i) => {
    console.log(`${i + 1}. ${c.company}`);
    console.log(`   ${c.contact} - ${c.title}`);
    console.log(`   ${c.email} | Score: ${c.gumboScore} ${c.isPriority ? '⭐ PRIORITY' : ''}`);
    if (c.researchNotes) console.log(`   Notes: ${c.researchNotes.substring(0, 80)}...`);
    if (c.lastContacted) console.log(`   Last contacted: ${c.lastContacted}`);
    console.log('');
  });

  // Save to file
  const fs = require('fs');
  fs.writeFileSync('qualified-contacts.json', JSON.stringify(qualified, null, 2));
  console.log(`\n💾 Saved ${qualified.length} contacts to qualified-contacts.json`);
}

main().catch(console.error);
