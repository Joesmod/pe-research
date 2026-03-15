const fs = require('fs');
const {google} = require('googleapis');

const creds = JSON.parse(fs.readFileSync('credentials.json'));
const auth = new google.auth.GoogleAuth({
  credentials: creds.installed || creds,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
});

(async () => {
  const client = await auth.getClient();
  const sheets = google.sheets({version: 'v4', auth: client});
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A2:R'
  });
  
  const rows = res.data.values || [];
  
  // Filter for:
  // - Not contacted
  // - Not dead
  // - Gumbo Score >= 8
  // - Has verified email
  const uncontacted = rows.filter(r => 
    r[8] !== 'Contacted' && 
    r[8] !== 'Dead' && 
    parseInt(r[11] || 0) >= 8 && 
    r[4] && 
    r[4].includes('@') && 
    !r[4].toLowerCase().includes('pattern') && 
    !r[4].toLowerCase().includes('inferred') &&
    r[4].toLowerCase().includes('.com')
  );
  
  console.log('Top 5 uncontacted firms (Score >= 8, verified emails):\n');
  uncontacted.slice(0, 5).forEach((r, i) => {
    console.log(`${i+1}. ${r[0]} - ${r[2]} (${r[3]}) - ${r[4]} - Score: ${r[11]}`);
  });
})().catch(e => console.error(e.message));
