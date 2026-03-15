const { google } = require('googleapis');
const fs = require('fs');

async function verify() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'sheets-service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Contacts!A2:I1000'
  });

  const rows = response.data.values || [];
  
  // Companies in today's batch
  const batchCompanies = [
    'One Rock Capital Partners',
    'Littlejohn & Co.',
    'Union Capital Associates',
    'Siris Capital Group',
    'BV Investment Partners',
    'Marlin Equity Partners',
    'Golden Gate Capital',
    'Cortec Group',
    'CID Capital',
    'Pine Brook Partners',
    'Accel-KKR',
    'WindPoint Partners',
    'Clairvest Group',
    'Platte River Equity',
    'Mountaingate Capital',
    'General Atlantic',
    'Rhône Group',
    'Midwest Growth Partners',
    'Kainos Capital',
    'Brentwood Associates',
    'Resurgens Technology Partners',
    'Thomas H. Lee Partners',
    'Warburg Pincus',
    'Searchlight Capital Partners',
    'Highlander Partners'
  ];

  // Build set of contacted companies
  const contactedCompanies = new Set();
  rows.forEach(r => {
    if (r[8]) { // Has "Last Contacted" timestamp
      contactedCompanies.add(r[0]);
    }
  });

  console.log(`Companies in batch: ${batchCompanies.length}`);
  console.log(`Total companies with prior contact: ${contactedCompanies.size}\n`);

  const issues = [];
  batchCompanies.forEach(company => {
    if (contactedCompanies.has(company)) {
      const lastContact = rows.find(r => r[0] === company && r[8]);
      issues.push({
        company,
        lastContacted: lastContact[8],
        contact: lastContact[2],
        email: lastContact[4]
      });
    }
  });

  if (issues.length === 0) {
    console.log('✅ ALL CLEAR - No companies in batch have been contacted before');
  } else {
    console.log(`⚠️ FOUND ${issues.length} PREVIOUSLY CONTACTED COMPANIES:\n`);
    issues.forEach((issue, i) => {
      console.log(`${i + 1}. ${issue.company}`);
      console.log(`   Last contacted: ${issue.lastContacted}`);
      console.log(`   Previous contact: ${issue.contact} (${issue.email})\n`);
    });
  }
}

verify().catch(console.error);
