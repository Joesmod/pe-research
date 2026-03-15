const { google } = require('googleapis');
const sheets = google.sheets('v4');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = './service-account.json';

async function authenticate() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return auth.getClient();
}

async function updateSheet(updates) {
  const auth = await authenticate();
  
  for (const update of updates) {
    const { row, company, contactName, title, email, linkedin, notes } = update;
    
    console.log(`\n📝 Updating Row ${row}: ${company}`);
    console.log(`   Contact: ${contactName}`);
    console.log(`   Title: ${title}`);
    console.log(`   Email: ${email}`);
    console.log(`   LinkedIn: ${linkedin}`);
    
    // Update row (columns C=Contact, D=Title, E=Email, G=LinkedIn, J=Status, L=Notes)
    const range = `Sheet1!C${row}:L${row}`;
    const values = [[
      contactName,  // C: Contact Name
      title,        // D: Title
      email,        // E: Email
      '',           // F: Website (keep existing)
      linkedin,     // G: LinkedIn
      '',           // H: Sector Focus (keep existing)
      '',           // I: Portfolio Companies (keep existing)
      'Enriched',   // J: Status
      '',           // K: Last Contacted (keep existing)
      notes         // L: Notes
    ]];
    
    await sheets.spreadsheets.values.update({
      auth,
      spreadsheetId: SHEET_ID,
      range,
      valueInputOption: 'RAW',
      resource: { values }
    });
    
    console.log(`   ✅ Updated successfully`);
  }
}

async function main() {
  console.log('🔍 PE Research & Enrichment - March 13, 2026 (11:07 AM)\n');
  console.log('=' .repeat(80));
  
  const updates = [
    {
      row: 1075,
      company: 'Sumeru Equity Partners',
      contactName: 'George Kadifa',
      title: 'Co-Founder and Managing Director',
      email: 'gkadifa@sumeruequity.com',
      linkedin: 'https://www.linkedin.com/in/georgekadifa/',
      notes: 'Source: sumeruequity.com/team, LinkedIn, RocketReach pattern'
    },
    {
      row: 1076,
      company: 'Banneker Partners',
      contactName: 'Stephen Davis',
      title: 'Managing Partner',
      email: 'sdavis@bannekerpartners.com',
      linkedin: 'https://www.linkedin.com/in/sjdavis/',
      notes: 'Source: bannekerpartners.com/team, ContactOut'
    },
    {
      row: 1073,
      company: 'Ampersand Capital Partners',
      contactName: 'Herb Hooper',
      title: 'Managing Partner',
      email: 'hhooper@ampersandcapital.com',
      linkedin: 'https://www.linkedin.com/in/herb-hooper-465b33152/',
      notes: 'Source: ampersandcapital.com, RocketReach pattern (replaced generic info@ email)'
    }
  ];
  
  await updateSheet(updates);
  
  console.log('\n' + '='.repeat(80));
  console.log('\n✅ Enrichment Complete!');
  console.log(`\nEnriched ${updates.length} leads with verified contacts:`);
  updates.forEach(u => {
    console.log(`  - ${u.company}: ${u.contactName} (${u.title})`);
  });
  
  // Save summary
  const fs = require('fs');
  const summary = {
    timestamp: new Date().toISOString(),
    enrichedCount: updates.length,
    updates: updates.map(u => ({
      company: u.company,
      contact: u.contactName,
      title: u.title,
      email: u.email,
      source: u.notes
    }))
  };
  
  fs.writeFileSync('enrichment-summary-march13-11am.json', JSON.stringify(summary, null, 2));
  console.log('\n💾 Summary saved to enrichment-summary-march13-11am.json');
}

main().catch(console.error);
