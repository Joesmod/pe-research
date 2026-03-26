const {google} = require('googleapis');
const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

async function run() {
  const sheets = google.sheets({version:'v4', auth: await auth.getClient()});
  const id = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  const [s1, contacts] = await Promise.all([
    sheets.spreadsheets.values.get({spreadsheetId:id, range:'Sheet1!A1:Z500'}),
    sheets.spreadsheets.values.get({spreadsheetId:id, range:'Contacts!A1:Z500'})
  ]);
  
  const now = Date.now();
  const sevenDays = 7*24*60*60*1000;
  const s1Rows = s1.data.values;
  const cRows = contacts.data.values;
  
  // S1: 0=Company Name, 6=Sector Focus, 7=Portfolio Companies, 8=Status, 9=Last Contacted, 12=Gumbo Score
  // C:  0=Company, 1=Gumbo Score, 2=Contact Name, 3=Title, 4=Email, 5=Email Status, 6=LinkedIn, 7=Research Notes, 8=Last Contacted
  
  const companyLastContacted = {};
  s1Rows.slice(1).forEach(r => {
    const name = r[0];
    const lastC = r[9];
    if (lastC) companyLastContacted[name] = new Date(lastC).getTime();
  });
  
  const eligible = [];
  cRows.slice(1).forEach((r, i) => {
    const co = r[0];
    const name = r[2];
    const title = r[3];
    const email = r[4];
    const emailStatus = r[5];
    const lastC = r[8];
    const coLastC = companyLastContacted[co];
    const contactRecent = lastC && (now - new Date(lastC).getTime() < sevenDays);
    const coRecent = coLastC && (now - coLastC < sevenDays);
    
    if (email && !contactRecent && !coRecent) {
      const companyRow = s1Rows.slice(1).find(sr => sr[0] === co);
      const score = companyRow ? parseInt(companyRow[12] || '0') : parseInt(r[1] || '0');
      const sector = companyRow ? (companyRow[6] || '') : '';
      const portfolio = companyRow ? (companyRow[7] || '') : '';
      const status = companyRow ? (companyRow[8] || '') : '';
      const s1Idx = s1Rows.findIndex(sr => sr[0] === co);
      eligible.push({co, name, title, email, score, sector, portfolio, status, cRowIdx: i+2, s1RowIdx: s1Idx+1});
    }
  });
  
  eligible.sort((a, b) => b.score - a.score);
  
  const techTitles = /cto|chief.*ai|chief.*tech|vp.*prod|vp.*tech|operating.*exec|value.creation|chief.*digital|chief.*innovation|strategic/i;
  const tech = eligible.filter(e => techTitles.test(e.title));
  const others = eligible.filter(e => !techTitles.test(e.title));
  
  const picked = [];
  const usedCos = new Set();
  for (const e of [...tech, ...others]) {
    if (picked.length >= 10) break;
    if (usedCos.has(e.co)) continue;
    if (e.score < 6) continue;
    usedCos.add(e.co);
    picked.push(e);
  }
  
  console.log('=== PICKED 10 CONTACTS ===');
  picked.forEach(p => console.log(JSON.stringify(p)));
}

run().catch(e => console.error(e));
