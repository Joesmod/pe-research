const { google } = require('googleapis');

async function findActualNeeds() {
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
  
  let actuallyNeedsEnrichment = [];
  
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
    
    // Skip Dead leads
    if (status.includes('Dead') || statusAlt.includes('Dead')) continue;
    
    // Check if ACTUALLY needs enrichment
    const noContact = !contactName || contactName.length === 0;
    const noEmail = !email || email.length === 0;
    const genericEmail = email && email.match(/^(info@|sales@|ir@|contact@|admin@|hello@|support@)/i);
    const emailIsUrl = email && email.startsWith('http');
    
    if (noContact || noEmail || genericEmail || emailIsUrl) {
      actuallyNeedsEnrichment.push({
        row: i + 1,
        company,
        website,
        contactName,
        title,
        email,
        linkedin,
        status,
        statusAlt,
        issue: noContact ? 'No contact name' : 
               noEmail ? 'No email' :
               emailIsUrl ? 'Email is URL' :
               'Generic email'
      });
    }
  }

  console.log(`Found ${actuallyNeedsEnrichment.length} leads that ACTUALLY need enrichment\n`);
  
  console.log('=== FIRST 20 ===');
  actuallyNeedsEnrichment.slice(0, 20).forEach(lead => {
    console.log(`Row ${lead.row}: ${lead.company}`);
    console.log(`  Issue: ${lead.issue}`);
    console.log(`  Website: ${lead.website || '(none)'}`);
    console.log(`  Contact: ${lead.contactName || '(EMPTY)'}`);
    console.log(`  Email: ${lead.email || '(EMPTY)'}`);
    console.log(`  Status: ${lead.status || lead.statusAlt}`);
    console.log('');
  });

  return actuallyNeedsEnrichment;
}

findActualNeeds().catch(console.error);
