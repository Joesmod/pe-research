const { google } = require('googleapis');

async function findNeedsResearch() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A1:N1000',
  });

  const rows = response.data.values;
  
  let needsResearch = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const company = (row[0] || '').trim();
    const website = (row[1] || '').trim();
    const contactName = (row[2] || '').trim();
    const title = (row[3] || '').trim();
    const email = (row[4] || '').trim();
    const linkedin = (row[6] || '').trim();
    const status = (row[7] || '').trim();
    const statusAlt = (row[9] || '').trim();
    
    if (!company) continue;
    
    if (status === 'Needs Manual Research' || statusAlt === 'Needs Manual Research') {
      needsResearch.push({
        row: i + 1,
        company,
        website,
        contactName,
        title,
        email,
        linkedin,
        status,
        statusAlt
      });
    }
  }

  console.log(`Found ${needsResearch.length} leads with "Needs Manual Research" status\n`);
  
  needsResearch.forEach(lead => {
    console.log(`Row ${lead.row}: ${lead.company}`);
    console.log(`  Website: ${lead.website || '(none)'}`);
    console.log(`  Contact: ${lead.contactName || '(none)'}`);
    console.log(`  Title: ${lead.title || '(none)'}`);
    console.log(`  Email: ${lead.email || '(none)'}`);
    console.log(`  LinkedIn: ${lead.linkedin || '(none)'}`);
    console.log(`  Status H: ${lead.status}`);
    console.log(`  Status J: ${lead.statusAlt}`);
    console.log('');
  });
}

findNeedsResearch().catch(console.error);
