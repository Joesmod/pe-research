const { google } = require('googleapis');

async function readSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A:J',
  });
  
  return response.data.values || [];
}

async function main() {
  const rows = await readSheet();
  const headers = rows[0];
  
  console.log('Sheet columns:', headers);
  console.log('Total rows:', rows.length - 1);
  
  // Track firms by company name
  const firmContacts = {};
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contactName = row[2] || '';
    const email = row[4] || '';
    const website = row[5] || '';
    const status = row[9] || '';
    
    // Skip Dead leads
    if (status && status.toLowerCase().includes('dead')) continue;
    if (!company || !website) continue;
    
    if (!firmContacts[company]) {
      firmContacts[company] = {
        company,
        website,
        contacts: [],
        status,
        firstRow: i
      };
    }
    
    if (contactName) {
      firmContacts[company].contacts.push({
        name: contactName,
        email,
        row: i
      });
    }
  }
  
  // Find firms with 0 or 1 contact that could use more
  const needsMoreContacts = [];
  for (const [company, data] of Object.entries(firmContacts)) {
    if (data.contacts.length <= 1) {
      needsMoreContacts.push(data);
    }
  }
  
  console.log('\n=== Firms That Could Use Additional Contacts ===');
  console.log(`Found ${needsMoreContacts.length} firms with 0-1 contacts\n`);
  
  // Sort by status (prioritize Enriched, then others)
  needsMoreContacts.sort((a, b) => {
    const aScore = a.status.includes('Enriched') ? 2 : (a.contacts.length === 0 ? 1 : 0);
    const bScore = b.status.includes('Enriched') ? 2 : (b.contacts.length === 0 ? 1 : 0);
    return bScore - aScore;
  });
  
  // Show first 15
  const toEnrich = needsMoreContacts.slice(0, 15);
  toEnrich.forEach((firm, idx) => {
    console.log(`${idx + 1}. ${firm.company}`);
    console.log(`   Website: ${firm.website}`);
    console.log(`   Current Contacts: ${firm.contacts.length}`);
    if (firm.contacts.length > 0) {
      firm.contacts.forEach(c => {
        console.log(`   - ${c.name} (${c.email || 'no email'})`);
      });
    }
    console.log(`   Status: ${firm.status || 'EMPTY'}`);
    console.log(`   Row: ${firm.firstRow + 1}`);
    console.log('');
  });
  
  // Save for next step
  const fs = require('fs');
  fs.writeFileSync('firms-for-additional-contacts.json', JSON.stringify(toEnrich, null, 2));
  console.log('Saved list to firms-for-additional-contacts.json');
}

main().catch(console.error);
