const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Read Sheet1
  const sheet1 = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:Z',
  });

  const rows = sheet1.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }

  const headers = rows[0];
  const data = rows.slice(1);

  console.log('\n📋 Headers:', headers.join(' | '));

  // Find column indices
  const companyIdx = headers.indexOf('Company Name');
  const titleIdx = headers.indexOf('Title/Position');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const emailVerifiedIdx = headers.indexOf('Email Verified');
  const gumboScoreIdx = headers.indexOf('Gumbo Score');
  const statusIdx = headers.indexOf('Status');
  const lastContactedIdx = headers.indexOf('Last Contacted');
  const sectorIdx = headers.indexOf('Sector Focus');
  const portfolioIdx = headers.indexOf('Portfolio');
  const notesIdx = headers.indexOf('Notes');

  console.log('\n🔍 Column indices:');
  console.log(`  Company: ${companyIdx}`);
  console.log(`  Title: ${titleIdx}`);
  console.log(`  Contact: ${contactIdx}`);
  console.log(`  Email: ${emailIdx}`);
  console.log(`  Email Verified: ${emailVerifiedIdx}`);
  console.log(`  Gumbo Score: ${gumboScoreIdx}`);
  console.log(`  Status: ${statusIdx}`);
  console.log(`  Last Contacted: ${lastContactedIdx}`);

  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const qualified = [];

  data.forEach((row, idx) => {
    const company = row[companyIdx] || '';
    const title = row[titleIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const emailVerified = row[emailVerifiedIdx] || '';
    const gumboScore = parseFloat(row[gumboScoreIdx]) || 0;
    const status = row[statusIdx] || '';
    const lastContacted = row[lastContactedIdx] || '';
    const sector = row[sectorIdx] || '';
    const portfolio = row[portfolioIdx] || '';

    // Skip if no email or company
    if (!email || !company || email === 'EMPTY') return;

    // Skip if email not verified
    if (emailVerified.toLowerCase() !== 'yes') return;

    // Skip if Gumbo Score < 8
    if (gumboScore < 8) return;

    // Skip if contacted in last 7 days
    if (lastContacted) {
      const lastContactDate = new Date(lastContacted);
      if (lastContactDate >= sevenDaysAgo) return;
    }

    // Skip if status is Dead, Bounced, or Replied
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('dead') || lowerStatus.includes('bounce') || lowerStatus.includes('replied')) return;

    // Prioritize tech/AI/value creation roles
    const isPriority = title.toLowerCase().match(/(cto|chief.*tech|chief.*ai|vp.*product|operating.*partner|digital|innovation)/);

    qualified.push({
      rowNum: idx + 2,
      company,
      title,
      contact,
      email,
      gumboScore,
      sector,
      portfolio,
      lastContacted,
      isPriority: !!isPriority
    });
  });

  // Sort by priority first, then by Gumbo Score
  qualified.sort((a, b) => {
    if (a.isPriority !== b.isPriority) return b.isPriority - a.isPriority;
    return b.gumboScore - a.gumboScore;
  });

  console.log(`\n✅ Found ${qualified.length} qualified contacts`);
  console.log(`   ${qualified.filter(c => c.isPriority).length} with priority roles (tech/AI/value creation)`);
  console.log('\n📋 Top 30 contacts:\n');

  qualified.slice(0, 30).forEach((c, i) => {
    console.log(`${i + 1}. ${c.company}`);
    console.log(`   ${c.contact} - ${c.title}`);
    console.log(`   ${c.email} | Score: ${c.gumboScore} ${c.isPriority ? '⭐ PRIORITY' : ''}`);
    console.log(`   Sector: ${c.sector || 'N/A'}`);
    if (c.lastContacted) console.log(`   Last contacted: ${c.lastContacted}`);
    console.log('');
  });

  // Save to file
  const fs = require('fs');
  fs.writeFileSync('qualified-contacts.json', JSON.stringify(qualified, null, 2));
  console.log(`\n💾 Saved ${qualified.length} contacts to qualified-contacts.json`);
}

main().catch(console.error);
