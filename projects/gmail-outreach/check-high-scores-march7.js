const { google } = require('googleapis');

async function checkHighScores() {
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
  
  console.log('HIGH-SCORED FIRMS (Score >= 7) ANALYSIS:\n');
  
  const placeholders = ['jacob zodikoff', 'placeholder', 'tbd', 'n/a', 'unknown'];
  
  let totalHighScore = 0;
  let withRealContact = 0;
  let withEmail = 0;
  let withBoth = 0;
  let contacted = 0;
  let available = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0];
    const contactName = (row[2] || '').trim();
    const email = (row[4] || '').trim();
    const status = row[9];
    const gumboScore = parseInt(row[13]) || 0;
    
    if (gumboScore < 7) continue;
    
    totalHighScore++;
    
    if (status === 'Contacted' || status === 'Dead Lead') {
      contacted++;
      continue;
    }
    
    const nameLower = contactName.toLowerCase();
    const hasRealContact = contactName && !placeholders.some(p => nameLower.includes(p));
    const hasEmail = email && email.includes('@');
    
    if (hasRealContact) withRealContact++;
    if (hasEmail) withEmail++;
    if (hasRealContact && hasEmail) {
      withBoth++;
      available.push({
        row: i + 1,
        company,
        contactName,
        email,
        gumboScore,
        status: status || 'New'
      });
    }
  }
  
  console.log(`Total firms with Score >= 7: ${totalHighScore}`);
  console.log(`Already contacted/dead: ${contacted}`);
  console.log(`Available: ${totalHighScore - contacted}\n`);
  
  console.log('Of available firms:');
  console.log(`  With real contact name: ${withRealContact}`);
  console.log(`  With email: ${withEmail}`);
  console.log(`  With BOTH: ${withBoth}\n`);
  
  if (withBoth > 0) {
    console.log(`✅ ${withBoth} contacts ready for Monday batch:\n`);
    available.sort((a, b) => b.gumboScore - a.gumboScore);
    available.forEach((c, idx) => {
      console.log(`${idx + 1}. ${c.company} | ${c.contactName} | ${c.email} | Score: ${c.gumboScore}`);
    });
  } else {
    console.log('❌ Zero contacts have both real name AND email');
  }
}

checkHighScores().catch(console.error);
