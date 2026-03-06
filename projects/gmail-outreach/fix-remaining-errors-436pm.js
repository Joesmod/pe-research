const { google } = require('googleapis');

async function fixRemainingErrors() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:M'
  });
  
  const rows = response.data.values;
  const headers = rows[0];
  
  const idx = {
    companyName: headers.indexOf('Company Name'),
    contactName: headers.indexOf('Contact Name'),
    title: headers.indexOf('Title'),
    email: headers.indexOf('Email'),
    website: headers.indexOf('Website'),
    linkedin: headers.indexOf('LinkedIn'),
    status: headers.indexOf('Status'),
  };
  
  const updates = [];
  const problemRows = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[idx.companyName] || '';
    const contact = row[idx.contactName] || '';
    const title = row[idx.title] || '';
    const email = row[idx.email] || '';
    const status = row[idx.status] || '';
    
    // Skip dead firms
    if (status.toLowerCase().includes('dead')) continue;
    if (['Sent', 'Replied'].includes(status)) continue;
    if (!company.trim()) continue;
    
    // Case 1: Title contains @ (email in wrong field)
    if (title.includes('@')) {
      // Extract name from title if contact field has the title
      let correctContact = contact;
      let correctTitle = '';
      let correctEmail = title;
      
      // If contact looks like a title (no spaces, title-like words), it's probably the title
      if (contact && !contact.includes('@') && !contact.includes(' ') && contact.length < 30) {
        correctTitle = contact;
        correctContact = ''; // Will need to find name
      }
      
      updates.push({
        range: `Sheet1!C${i + 1}`,  // Contact Name
        values: [[correctContact]]
      });
      updates.push({
        range: `Sheet1!D${i + 1}`,  // Title
        values: [[correctTitle]]
      });
      updates.push({
        range: `Sheet1!E${i + 1}`,  // Email
        values: [[correctEmail]]
      });
      
      console.log(`Row ${i + 1}: ${company}`);
      console.log(`  Fixed: Contact='${correctContact}', Title='${correctTitle}', Email='${correctEmail}'`);
      
      if (!correctContact) {
        problemRows.push({
          row: i + 1,
          company,
          email: correctEmail,
          issue: 'Missing contact name - has email only'
        });
      }
    }
    // Case 2: Contact name contains @ (email in wrong field)
    else if (contact.includes('@')) {
      let correctEmail = contact;
      let correctContact = title.includes('@') ? '' : title;  // Title might be the name
      let correctTitle = '';
      
      updates.push({
        range: `Sheet1!C${i + 1}`,  // Contact Name
        values: [[correctContact]]
      });
      updates.push({
        range: `Sheet1!D${i + 1}`,  // Title
        values: [[correctTitle]]
      });
      updates.push({
        range: `Sheet1!E${i + 1}`,  // Email
        values: [[correctEmail]]
      });
      
      console.log(`Row ${i + 1}: ${company}`);
      console.log(`  Fixed: Contact='${correctContact}', Title='${correctTitle}', Email='${correctEmail}'`);
      
      if (!correctContact) {
        problemRows.push({
          row: i + 1,
          company,
          email: correctEmail,
          issue: 'Missing contact name - has email only'
        });
      }
    }
  }
  
  if (updates.length > 0) {
    console.log(`\n=== Applying ${updates.length / 3} fixes ===`);
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    console.log('✅ Data errors fixed!');
  }
  
  if (problemRows.length > 0) {
    console.log(`\n=== ${problemRows.length} rows still need contact names ===`);
    console.log(JSON.stringify(problemRows.slice(0, 15), null, 2));
  }
}

fixRemainingErrors().catch(console.error);
