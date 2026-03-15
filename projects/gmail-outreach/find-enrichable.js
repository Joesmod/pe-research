const { google } = require('googleapis');

async function findEnrichable() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:J',
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  console.log('Finding PE firms that need enrichment (not Dead, missing contacts or have generic emails):\n');
  
  let enrichable = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const website = row[1] || '';
    const contactName = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    const status = row[9] || '';
    
    // Skip if marked as Dead or already Enriched with good data
    if (status.includes('Dead') || status.includes('Not PE')) continue;
    if (status === 'Enriched' && contactName && email && !email.includes('@') === false && !email.match(/^(info@|sales@|ir@|contact@|hello@)/i)) continue;
    
    // Need enrichment if: no contact name, no email, or generic email
    const hasGenericEmail = email && email.match(/^(info@|sales@|ir@|contact@|hello@)/i);
    const needsWork = !contactName || !email || hasGenericEmail || !email.includes('@');
    
    if (needsWork && company) {
      enrichable.push({
        row: i + 1,
        company,
        website,
        contactName,
        title,
        email,
        status
      });
    }
  }
  
  console.log(`Found ${enrichable.length} PE firms needing enrichment.\n`);
  console.log('Top 15 to work on:\n');
  
  enrichable.slice(0, 15).forEach((lead, idx) => {
    console.log(`${idx + 1}. Row ${lead.row}: ${lead.company}`);
    console.log(`   Website: ${lead.website}`);
    console.log(`   Current Contact: ${lead.contactName || '(none)'}`);
    console.log(`   Current Title: ${lead.title || '(none)'}`);
    console.log(`   Current Email: ${lead.email || '(none)'}`);
    console.log(`   Status: ${lead.status}`);
    console.log('');
  });
}

findEnrichable().catch(console.error);
