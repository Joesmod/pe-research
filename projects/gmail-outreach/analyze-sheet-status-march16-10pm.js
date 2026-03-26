const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:K',
  });

  const rows = response.data.values || [];
  console.log(`📊 Total rows: ${rows.length}\n`);

  const statusCounts = {};
  const enrichedNeedsVerification = [];
  const researched = [];
  const active = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = (row[0] || '').trim();
    if (!company) continue;

    const website = (row[1] || '').trim();
    const contactName = (row[2] || '').trim();
    const title = (row[3] || '').trim();
    const email = (row[4] || '').trim();
    const status = (row[7] || '').trim();

    statusCounts[status] = (statusCounts[status] || 0) + 1;

    // Track firms that might benefit from additional contacts
    if (status === 'Enriched - Needs Email Verification') {
      enrichedNeedsVerification.push({ rowIndex: i, company, website, contactName, email });
    } else if (status === 'Researched') {
      researched.push({ rowIndex: i, company, website, contactName, email });
    } else if (status === 'Active' || status === '' || (status && status.toLowerCase().includes('active'))) {
      active.push({ rowIndex: i, company, website, contactName, email, status });
    }
  }

  console.log('📈 Status breakdown:\n');
  Object.entries(statusCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([status, count]) => {
      console.log(`   ${status || '(empty)'}: ${count}`);
    });

  console.log(`\n\n🔍 Enrichment opportunities:\n`);
  console.log(`   Enriched - Needs Email Verification: ${enrichedNeedsVerification.length}`);
  console.log(`   Researched: ${researched.length}`);
  console.log(`   Active/Unprocessed: ${active.length}`);

  if (enrichedNeedsVerification.length > 0) {
    console.log(`\n\n📧 Firms needing email verification (first 10):\n`);
    enrichedNeedsVerification.slice(0, 10).forEach((firm, idx) => {
      console.log(`${idx + 1}. ${firm.company}`);
      console.log(`   Contact: ${firm.contactName || 'N/A'}`);
      console.log(`   Email: ${firm.email || 'N/A'}`);
      console.log(`   Row: ${firm.rowIndex + 1}\n`);
    });
  }

  if (researched.length > 0) {
    console.log(`\n📝 "Researched" status firms (first 10):\n`);
    researched.slice(0, 10).forEach((firm, idx) => {
      console.log(`${idx + 1}. ${firm.company}`);
      console.log(`   Contact: ${firm.contactName || 'N/A'}`);
      console.log(`   Email: ${firm.email || 'N/A'}`);
      console.log(`   Row: ${firm.rowIndex + 1}\n`);
    });
  }

  if (active.length > 0) {
    console.log(`\n⚡ Active/Unprocessed firms (first 10):\n`);
    active.slice(0, 10).forEach((firm, idx) => {
      console.log(`${idx + 1}. ${firm.company}`);
      console.log(`   Status: ${firm.status || '(empty)'}`);
      console.log(`   Contact: ${firm.contactName || 'N/A'}`);
      console.log(`   Email: ${firm.email || 'N/A'}`);
      console.log(`   Row: ${firm.rowIndex + 1}\n`);
    });
  }

  console.log('\n💡 Recommendation:');
  if (enrichedNeedsVerification.length > 0) {
    console.log('   Focus on verifying emails for "Enriched - Needs Email Verification" firms');
  } else if (active.length > 0) {
    console.log('   Process "Active" firms');
  } else {
    console.log('   All firms appear to be enriched. Consider:');
    console.log('   1. Adding new firms from PE databases');
    console.log('   2. Finding additional contacts at enriched firms');
    console.log('   3. Re-checking "Researched" firms for better contacts');
  }
}

main().catch(console.error);
