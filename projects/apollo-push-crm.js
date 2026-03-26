const fs = require('fs');
const path = require('path');
const dir = path.join('C:\\Users\\aljen\\.openclaw\\workspace-jim\\projects', 'gmail-outreach');
const {google} = require(path.join(dir, 'node_modules', 'googleapis'));
const {JWT} = require(path.join(dir, 'node_modules', 'google-auth-library'));
const creds = require(path.join(dir, 'service-account.json'));
const auth = new JWT({email: creds.client_email, key: creds.private_key, scopes: ['https://www.googleapis.com/auth/spreadsheets']});
const sheets = google.sheets({version:'v4', auth});
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const firms = JSON.parse(fs.readFileSync(path.join(__dirname, 'apollo-top-firms.json'), 'utf8'));
  
  // Headers: Company Name, Contact Name, Title, Email, Website, LinkedIn, Sector Focus, Portfolio Companies, Status, Last Contacted, Notes, Company Info URL, Gumbo Score
  const rows = firms.map(f => {
    const growth = f.headcount_growth_6m ? `${(f.headcount_growth_6m * 100).toFixed(1)}% 6mo growth` : '';
    const founded = f.founded ? `Founded ${f.founded}` : '';
    const rev = f.revenue ? `Rev: ${f.revenue}` : '';
    const notes = [growth, founded, rev, `Apollo score: ${f.score}`].filter(Boolean).join('. ');
    
    return [
      f.name,           // Company Name
      '',               // Contact Name (TBD - Kah will enrich)
      '',               // Title
      '',               // Email
      f.website,        // Website
      f.linkedin,       // LinkedIn
      '',               // Sector Focus (needs research)
      '',               // Portfolio Companies
      'New - Unresearched', // Status
      '',               // Last Contacted
      notes,            // Notes
      '',               // Company Info URL
      '',               // Gumbo Score
    ];
  });

  // Batch append
  const batchSize = 100;
  let total = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:M',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: batch }
    });
    total += batch.length;
    console.log(`Pushed ${total}/${rows.length} rows`);
  }
  
  console.log(`Done! Added ${rows.length} new firms to CRM.`);
}

main().catch(console.error);
