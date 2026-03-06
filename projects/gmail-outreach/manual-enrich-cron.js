const { google } = require('googleapis');
const key = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const auth = new google.auth.GoogleAuth({
  credentials: key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

async function findNeedsEnrichment() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:K'
  });
  
  const rows = res.data.values || [];
  const needsWork = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contact = row[2] || '';
    const email = row[4] || '';
    const website = row[5] || '';
    const status = row[9] || '';
    
    if (!company) continue;
    if (status === 'Enriched') continue;
    
    const hasGenericEmail = email && (
      email.startsWith('info@') || 
      email.startsWith('sales@') || 
      email.startsWith('ir@') ||
      email.startsWith('contact@') ||
      email.startsWith('hello@')
    );
    
    const needsEnrichment = !contact || !email || hasGenericEmail;
    
    if (needsEnrichment) {
      needsWork.push({
        row: i + 1,
        company,
        website,
        currentContact: contact || 'N/A',
        currentEmail: email || 'N/A'
      });
    }
  }
  
  // Sort by priority: completely empty first
  needsWork.sort((a, b) => {
    const aEmpty = (a.currentContact === 'N/A' && a.currentEmail === 'N/A') ? 0 : 1;
    const bEmpty = (b.currentContact === 'N/A' && b.currentEmail === 'N/A') ? 0 : 1;
    return aEmpty - bEmpty;
  });
  
  console.log(JSON.stringify(needsWork.slice(0, 15), null, 2));
}

findNeedsEnrichment().catch(console.error);
