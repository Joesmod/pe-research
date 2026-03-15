const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

async function main() {
  const sheets = google.sheets({ version: 'v4', auth });
  
  // First, read existing data
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:L'
  });
  
  const rows = res.data.values || [];
  console.log(`Current sheet has ${rows.length} rows\n`);
  
  // Check specific firms I researched
  const firmsToCheck = [
    'Lightyear Capital',
    'Five Elms Capital',
    'Rockwood Equity Partners',
    'Clearview Capital',
    'Waud Capital Partners',
    'Frazier Healthcare Partners'
  ];
  
  console.log('Checking current data for researched firms:\n');
  
  for (const firmName of firmsToCheck) {
    const idx = rows.findIndex(r => r[0] === firmName);
    if (idx !== -1) {
      const row = rows[idx];
      console.log(`✅ ${firmName} (Row ${idx + 1})`);
      console.log(`   Contact: ${row[2] || '(empty)'}`);
      console.log(`   Email: ${row[4] || '(empty)'}`);
      console.log(`   Status: ${row[7] || '(empty)'}`);
      console.log('');
    }
  }
  
  // Prepare new entries and enrichments
  const newRows = [];
  
  // ADD NEW FIRM: Banner Capital
  newRows.push([
    'Banner Capital',
    'https://bannercap.com',
    'Mark Broadbent',
    'Vice President',
    '', // No verified email
    'https://bannercap.com/team/',
    'https://www.linkedin.com/in/markjbroadbent',
    'Partial',
    'VP at Banner Capital. Based in Lehi, UT. No verified email found. Researched 2026-03-14 cron.',
    '',
    '',
    'Mid-market PE firm focused on founder-led businesses in Intermountain West. $500M+ AUM.'
  ]);
  
  // Get the next available row
  const nextRow = rows.length + 1;
  
  console.log(`\n📝 Adding ${newRows.length} new firm(s)...\n`);
  
  // Append new rows
  if (newRows.length > 0) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:L',
      valueInputOption: 'RAW',
      resource: {
        values: newRows
      }
    });
    
    console.log('✅ Added:');
    newRows.forEach((row, idx) => {
      console.log(`   ${idx + 1}. ${row[0]} - ${row[2]} (${row[3]})`);
    });
  }
  
  // Now check if we can add ADDITIONAL contacts to existing firms
  console.log('\n\n📋 Firms with researched additional contacts:\n');
  
  const additionalContacts = [
    {
      firm: 'Five Elms Capital',
      contacts: [
        { name: 'Ryan Mandl', title: 'Managing Director', email: 'Ryan@fiveelms.com', linkedin: 'https://www.linkedin.com/in/ryanmandl' },
        { name: 'Thomas Kershisnik', title: 'Managing Director', email: 'Thomas@fiveelms.com', linkedin: 'https://www.linkedin.com/in/thomas-kershisnik-1724a923' },
        { name: 'Joe Onofrio', title: 'Managing Director', email: 'Joe@fiveelms.com', linkedin: 'https://www.linkedin.com/in/joeonofrio' }
      ]
    },
    {
      firm: 'Lightyear Capital',
      contacts: [
        { name: 'Mark Vassallo', title: 'Managing Partner', email: '', linkedin: 'https://www.lycap.com/bio/Mark-Vassallo' }
      ]
    },
    {
      firm: 'Rockwood Equity Partners',
      contacts: [
        { name: 'Brett Keith', title: 'Managing Partner', email: '', linkedin: 'https://www.linkedin.com/company/rockwood-equity-partners' },
        { name: 'Joe Merrill', title: 'Managing Partner', email: '', linkedin: 'https://www.rockwoodequity.com/team/joe-merrill' }
      ]
    },
    {
      firm: 'Clearview Capital',
      contacts: [
        { name: 'William Case', title: 'Managing Partner', email: '', linkedin: 'https://www.clearviewcap.com/member/william-f-case-jr/' },
        { name: 'Matthew Blevins', title: 'Managing Partner', email: '', linkedin: 'https://www.clearviewcap.com/member/matthew-w-blevins/' }
      ]
    },
    {
      firm: 'Waud Capital Partners',
      contacts: [
        { name: 'Reeve Waud', title: 'Founder & Managing Partner', email: '', linkedin: 'https://www.linkedin.com/in/reeve-waud-90b77712' }
      ]
    },
    {
      firm: 'Frazier Healthcare Partners',
      contacts: [
        { name: 'Ben Magnano', title: 'Managing Partner', email: '', linkedin: '' },
        { name: 'Patrick Heron', title: 'Managing Partner', email: '', linkedin: '' }
      ]
    }
  ];
  
  additionalContacts.forEach(ac => {
    console.log(`${ac.firm}:`);
    ac.contacts.forEach(c => {
      console.log(`   - ${c.name} (${c.title})${c.email ? ' - ' + c.email : ''}`);
    });
    console.log('');
  });
  
  console.log('\n✅ Enrichment complete!');
  console.log('\nNOTE: Additional contacts listed above can be added as separate rows if needed.');
  console.log('Consider adding multiple contacts per firm to increase outreach success rate.');
}

main().catch(console.error);
