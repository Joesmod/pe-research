const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  console.log('📊 Reading sheet...');
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:N',
  });

  const rows = response.data.values;
  const headers = rows[0];

  const companyIdx = 0; // Company Name
  const contactIdx = 2; // Contact Name
  const titleIdx = 3; // Title
  const emailIdx = 4; // Email
  const websiteIdx = 5; // Website
  const linkedinIdx = 6; // LinkedIn
  const statusIdx = 9; // Status
  const notesIdx = 11; // Notes

  const categories = {
    noContact: [],
    genericEmail: [],
    emptyEmail: [],
    needsVerification: []
  };

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const company = (row[companyIdx] || '').trim();
    const contact = (row[contactIdx] || '').trim();
    const email = (row[emailIdx] || '').trim();
    const status = (row[statusIdx] || '').trim();
    const website = (row[websiteIdx] || '').trim();

    if (!company) continue;
    
    // Skip dead/sent firms
    if (status.includes('Dead') || status.includes('Sent') || status === 'Enriched') continue;

    const item = {
      row: i + 1,
      company,
      contact,
      email,
      status,
      website
    };

    if (!contact || contact === '') {
      categories.noContact.push(item);
    } else if (!email || email === '') {
      categories.emptyEmail.push(item);
    } else if (email.match(/^(info|sales|ir|contact|hello|team|admin|support|marketing|general)@/i)) {
      categories.genericEmail.push(item);
    } else if (status.includes('Partial') || status.includes('Unresearched')) {
      categories.needsVerification.push(item);
    }
  }

  console.log('\n📊 Enrichment Opportunities:');
  console.log(`  🔴 No contact name: ${categories.noContact.length}`);
  console.log(`  🟠 Generic email: ${categories.genericEmail.length}`);
  console.log(`  🟡 Empty email: ${categories.emptyEmail.length}`);
  console.log(`  🔵 Needs verification: ${categories.needsVerification.length}`);

  // Prioritize: no contact > generic email > empty email
  const prioritized = [
    ...categories.noContact.slice(0, 5),
    ...categories.genericEmail.slice(0, 5),
    ...categories.emptyEmail.slice(0, 5)
  ].slice(0, 15);

  fs.writeFileSync(
    'priority-enrichment-targets-march11-537pm.json',
    JSON.stringify(prioritized, null, 2)
  );

  console.log(`\n✅ Selected ${prioritized.length} priority targets for enrichment\n`);
  
  prioritized.forEach((target, idx) => {
    console.log(`${idx + 1}. ${target.company} (Row ${target.row})`);
    console.log(`   Status: ${target.status}`);
    console.log(`   Contact: ${target.contact || '❌ EMPTY'}`);
    console.log(`   Email: ${target.email || '❌ EMPTY'}`);
    if (target.website) console.log(`   Website: ${target.website}`);
    console.log('');
  });
}

main().catch(console.error);
