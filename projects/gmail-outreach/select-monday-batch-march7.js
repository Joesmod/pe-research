const { google } = require('googleapis');

async function selectMondayBatch() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'sheets-service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A:N'
  });
  
  const rows = res.data.values || [];
  
  console.log('MONDAY BATCH SELECTION - March 7, 2026\n');
  console.log('Criteria:');
  console.log('- Real contact name (not placeholder like "Jacob Zodikoff")');
  console.log('- Verified email');
  console.log('- Gumbo Score >= 7');
  console.log('- Status != "Contacted"');
  console.log('- Status != "Dead Lead"\n');
  
  const placeholders = ['jacob zodikoff', 'placeholder', 'tbd', 'n/a', 'unknown', ''];
  const validContacts = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0];
    const contactName = (row[2] || '').trim();
    const title = row[3] || '';
    const email = (row[4] || '').trim();
    const status = row[9];
    const gumboScore = parseInt(row[13]) || 0;
    
    // Skip if contacted or dead
    if (status === 'Contacted' || status === 'Dead Lead') continue;
    
    // Must have Gumbo Score >= 7
    if (gumboScore < 7) continue;
    
    // Must have real contact name (not placeholder)
    const nameLower = contactName.toLowerCase();
    if (!contactName || placeholders.some(p => nameLower.includes(p))) continue;
    
    // Must have email
    if (!email || !email.includes('@')) continue;
    
    validContacts.push({
      row: i + 1,
      company,
      contactName,
      title,
      email,
      gumboScore,
      status: status || 'New'
    });
  }
  
  // Sort by Gumbo Score descending
  validContacts.sort((a, b) => b.gumboScore - a.gumboScore);
  
  console.log(`Found ${validContacts.length} valid contacts matching criteria\n`);
  
  if (validContacts.length >= 25) {
    console.log('✅ SUCCESS: 25+ contacts available\n');
    console.log('Top 25 for Monday batch:\n');
    validContacts.slice(0, 25).forEach((c, idx) => {
      console.log(`${idx + 1}. ${c.company}`);
      console.log(`   Contact: ${c.contactName} (${c.title})`);
      console.log(`   Email: ${c.email}`);
      console.log(`   Score: ${c.gumboScore} | Status: ${c.status}`);
      console.log('');
    });
  } else {
    console.log(`⚠️ SHORTFALL: Only ${validContacts.length} contacts found\n`);
    console.log('All available contacts:\n');
    validContacts.forEach((c, idx) => {
      console.log(`${idx + 1}. ${c.company} | ${c.contactName} | ${c.email} | Score: ${c.gumboScore}`);
    });
    console.log('\n❌ Need to research additional firms to reach 25');
  }
  
  return validContacts;
}

selectMondayBatch().catch(console.error);
