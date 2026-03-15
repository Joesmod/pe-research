const { google } = require('googleapis');
const key = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:K',
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  const headers = rows[0];
  
  const companyIdx = headers.indexOf('Company Name');
  const notebookIdx = headers.indexOf('NotebookLM');
  const contactIdx = headers.indexOf('Contact Name');
  const titleIdx = headers.indexOf('Title');
  const emailIdx = headers.indexOf('Email');
  const websiteIdx = headers.indexOf('Website');
  const linkedinIdx = headers.indexOf('LinkedIn');
  const statusIdx = headers.indexOf('Status');
  
  const targets = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const notebook = row[notebookIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const website = row[websiteIdx] || '';
    const status = row[statusIdx] || '';
    
    const hasGenericEmail = email && (
      email.startsWith('info@') ||
      email.startsWith('sales@') ||
      email.startsWith('ir@') ||
      email.startsWith('contact@') ||
      email.startsWith('investors@')
    );
    
    if ((!contact || hasGenericEmail || !email) && company) {
      targets.push({
        row: i + 1,
        company,
        notebook,
        contact,
        email,
        website,
        status,
        reason: !contact ? 'No contact' : hasGenericEmail ? 'Generic email' : 'No email'
      });
    }
  }
  
  console.log('Top 15 targets for enrichment:\n');
  console.log(JSON.stringify(targets.slice(0, 15), null, 2));
}

main().catch(console.error);
