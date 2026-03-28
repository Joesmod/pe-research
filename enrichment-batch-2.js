// PE Lead Enrichment Batch 2 - 2026-03-13
const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = path.join(__dirname, '..', 'gmail-outreach', 'service-account.json');

async function enrichBatch2() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  const enrichments = [
    {
      firmName: 'Sumeru Equity Partners',
      contactName: 'George Kadifa',
      title: 'Co-Founder & Managing Director',
      email: 'gkadifa@sumeruequity.com',
      linkedin: 'https://www.linkedin.com/in/george-kadifa/',
      website: 'https://sumeruequity.com',
      status: 'Enriched',
      notes: 'Email pattern g******@sumeruequity.com verified via RocketReach. Ex-HP EVP. 30+ years tech sector experience. Software-focused PE.'
    }
  ];
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:K',
  });
  
  const rows = response.data.values || [];
  const header = rows[0];
  
  const colMap = {
    firmName: header.indexOf('Company Name'),
    contactName: header.indexOf('Contact Name'),
    title: header.indexOf('Title'),
    email: header.indexOf('Email'),
    website: header.indexOf('Website'),
    linkedin: header.indexOf('LinkedIn'),
    notes: header.indexOf('Last Contacted'),
    status: header.indexOf('Status')
  };
  
  for (const enrich of enrichments) {
    const rowIndex = rows.findIndex((row, idx) => 
      idx > 0 && row[colMap.firmName] === enrich.firmName
    );
    
    if (rowIndex > -1) {
      const rowNumber = rowIndex + 1;
      console.log(`Found ${enrich.firmName} at row ${rowNumber}`);
      
      const updates = [];
      
      if (enrich.contactName) {
        updates.push({
          range: `Sheet1!${String.fromCharCode(65 + colMap.contactName)}${rowNumber}`,
          values: [[enrich.contactName]]
        });
      }
      
      if (enrich.title) {
        updates.push({
          range: `Sheet1!${String.fromCharCode(65 + colMap.title)}${rowNumber}`,
          values: [[enrich.title]]
        });
      }
      
      if (enrich.email) {
        updates.push({
          range: `Sheet1!${String.fromCharCode(65 + colMap.email)}${rowNumber}`,
          values: [[enrich.email]]
        });
      }
      
      if (enrich.linkedin) {
        updates.push({
          range: `Sheet1!${String.fromCharCode(65 + colMap.linkedin)}${rowNumber}`,
          values: [[enrich.linkedin]]
        });
      }
      
      if (enrich.notes) {
        updates.push({
          range: `Sheet1!${String.fromCharCode(65 + colMap.notes)}${rowNumber}`,
          values: [[enrich.notes]]
        });
      }
      
      if (enrich.status) {
        updates.push({
          range: `Sheet1!${String.fromCharCode(65 + colMap.status)}${rowNumber}`,
          values: [[enrich.status]]
        });
      }
      
      if (updates.length > 0) {
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: SHEET_ID,
          requestBody: {
            data: updates,
            valueInputOption: 'RAW'
          }
        });
        
        console.log(`✅ Updated ${enrich.firmName} - ${enrich.contactName} (${enrich.email})`);
      }
    } else {
      console.log(`⚠️  Could not find ${enrich.firmName} in sheet`);
    }
  }
  
  console.log('\n✅ Batch 2 complete!');
}

enrichBatch2().catch(err => {
  console.error('Batch 2 failed:', err);
  process.exit(1);
});
