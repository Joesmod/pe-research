const { google } = require('googleapis');

async function checkScores() {
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
  
  const scores = {};
  let hasScore = 0;
  let noScore = 0;
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const gumboScore = row[13];
    
    if (gumboScore && gumboScore.toString().trim() !== '') {
      const score = parseInt(gumboScore) || 0;
      scores[score] = (scores[score] || 0) + 1;
      hasScore++;
    } else {
      noScore++;
    }
  }
  
  console.log('GUMBO SCORE DISTRIBUTION:\n');
  console.log(`Total rows: ${rows.length - 1}`);
  console.log(`With scores: ${hasScore}`);
  console.log(`No score: ${noScore}\n`);
  
  console.log('Score breakdown:');
  Object.keys(scores).sort((a, b) => b - a).forEach(score => {
    console.log(`  Score ${score}: ${scores[score]} firms`);
  });
}

checkScores().catch(console.error);
