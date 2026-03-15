const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function findEnrichmentNeeds() {
  try {
    const credentials = JSON.parse(fs.readFileSync('service-account.json', 'utf8'));
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1'
    });
    
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found.');
      return;
    }

    // Column structure (0-indexed):
    // 0: Company Name
    // 1: NotebookLM/Website
    // 2: Contact Name
    // 3: Position/Title
    // 4: Email
    // 5: (unknown)
    // 6: LinkedIn
    // 7: (description/notes)
    // 8: Notes
    // 9: Status
    // 10: Last Contacted
    // 11: Notes
    // 12: Company Info URL
    // 13: Gumbo Score

    const targets = [];
    
    // Skip header row (row 0)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const company = row[0] || '';
      const website = row[1] || '';
      const contact = row[2] || '';
      const title = row[3] || '';
      const email = row[4] || '';
      const status = row[9] || '';
      
      // Skip if status is Sent, Bounced, Replied, or Dead
      if (status && ['Sent', 'Bounced', 'Replied', 'Dead', 'Not PE'].includes(status)) {
        continue;
      }
      
      // Check if needs enrichment
      const needsContact = !contact || contact.trim() === '';
      const hasGenericEmail = email && (
        email.toLowerCase().includes('info@') || 
        email.toLowerCase().includes('sales@') || 
        email.toLowerCase().includes('ir@') ||
        email.toLowerCase().includes('contact@') ||
        email.toLowerCase().includes('hello@') ||
        email.toLowerCase().includes('inquiries@') ||
        email.toLowerCase().includes('team@')
      );
      const needsEmail = !email || email.trim() === '' || hasGenericEmail;
      
      if (needsContact || needsEmail) {
        targets.push({
          rowIndex: i + 1, // 1-indexed for Google Sheets
          company,
          website,
          contact,
          title,
          email,
          status,
          needsContact,
          needsEmail,
          reason: needsContact ? 'No contact name' : (hasGenericEmail ? `Generic email: ${email}` : 'No email')
        });
      }
    }

    console.log(`\nFound ${targets.length} leads needing enrichment\n`);
    
    // Limit to 15 for this run
    const batch = targets.slice(0, 15);
    
    console.log('TOP 15 TARGETS FOR ENRICHMENT:\n');
    batch.forEach((t, idx) => {
      console.log(`${idx + 1}. Row ${t.rowIndex}: ${t.company}`);
      console.log(`   Website: ${t.website || '(none)'}`);
      console.log(`   Current Contact: ${t.contact || '(empty)'}`);
      console.log(`   Current Email: ${t.email || '(empty)'}`);
      console.log(`   Status: ${t.status || '(none)'}`);
      console.log(`   Reason: ${t.reason}`);
      console.log('');
    });

    // Save targets
    fs.writeFileSync('enrichment-targets-march13-737pm.json', JSON.stringify(batch, null, 2));
    console.log(`\nSaved ${batch.length} targets to enrichment-targets-march13-737pm.json`);
    console.log(`Total needing enrichment: ${targets.length}`);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

findEnrichmentNeeds();
