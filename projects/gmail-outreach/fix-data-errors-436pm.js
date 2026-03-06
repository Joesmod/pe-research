const { google } = require('googleapis');

async function fixDataErrors() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Read current data
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:M'
  });
  
  const rows = response.data.values;
  const headers = rows[0];
  
  const idx = {
    companyName: headers.indexOf('Company Name'),
    notebook: headers.indexOf('NotebookLM'),
    contactName: headers.indexOf('Contact Name'),
    title: headers.indexOf('Title'),
    email: headers.indexOf('Email'),
    website: headers.indexOf('Website'),
    linkedin: headers.indexOf('LinkedIn'),
    sectorFocus: headers.indexOf('Sector Focus'),
    portfolio: headers.indexOf('Portfolio Companies'),
    status: headers.indexOf('Status'),
  };
  
  const updates = [];
  let fixedCount = 0;
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const title = row[idx.title] || '';
    const contact = row[idx.contactName] || '';
    const email = row[idx.email] || '';
    const status = row[idx.status] || '';
    
    // Skip dead/sent/replied
    if (['Dead', 'Sent', 'Replied'].includes(status)) continue;
    
    // Case 1: Email is in title column
    if (title.includes('@') && !email.includes('@')) {
      console.log(`Row ${i + 1}: Moving email from Title to Email column`);
      console.log(`  Company: ${row[idx.companyName]}`);
      console.log(`  Current Title: ${title}`);
      console.log(`  Current Email: ${email}`);
      
      // Determine correct title
      let correctTitle = '';
      if (contact.includes('@')) {
        // Contact also has email - title is probably empty
        correctTitle = '';
      } else if (contact && !contact.includes(' ')) {
        // Single word contact might actually be the title
        correctTitle = contact;
      }
      
      updates.push({
        range: `Sheet1!D${i + 1}`,  // Title column
        values: [[correctTitle]]
      });
      updates.push({
        range: `Sheet1!E${i + 1}`,  // Email column
        values: [[title]]  // Move email from title to email field
      });
      
      fixedCount++;
      console.log(`  → Fixed: Title='${correctTitle}', Email='${title}'\n`);
    }
  }
  
  if (updates.length > 0) {
    console.log(`\n=== Applying ${fixedCount} fixes ===`);
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    console.log('✅ Data errors fixed!');
  } else {
    console.log('No data errors to fix.');
  }
}

fixDataErrors().catch(console.error);
