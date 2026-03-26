const { google } = require('googleapis');

// CORRECT column mapping
const COL = {
  COMPANY: 0,
  URL: 1,
  CONTACT: 2,
  TITLE: 3,
  EMAIL: 4,
  EXTRA: 5,
  LINKEDIN: 6,
  STATUS_1: 7,
  NOTES: 8,
  STATUS_2: 9,
  LAST_CONTACTED: 10,
  MORE_NOTES: 11,
  INFO_URL: 12
};

async function readSheet() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A:M',
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found.');
      return;
    }

    console.log('✅ Read', rows.length, 'rows from sheet\n');

    let needsEnrichment = [];

    // Start from row 1 (skip header row 0)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;
      
      const company = row[COL.COMPANY] || '';
      const contact = row[COL.CONTACT] || '';
      const email = row[COL.EMAIL] || '';
      const status1 = row[COL.STATUS_1] || '';
      const status2 = row[COL.STATUS_2] || '';

      // Skip if company is empty
      if (!company.trim()) continue;

      // Skip if explicitly Dead
      if (status1.includes('Dead') || status2.includes('Dead')) continue;

      // Check if needs enrichment
      const hasGenericEmail = email && email.match(/^(info@|sales@|ir@|contact@|admin@|hello@|support@)/i);
      const noContact = !contact || contact.trim() === '';
      const noEmail = !email || email.trim() === '';

      if (noContact || noEmail || hasGenericEmail) {
        needsEnrichment.push({
          row: i + 1,  // 1-indexed for sheet
          rowIndex: i, // 0-indexed for array
          company,
          url: row[COL.URL] || '',
          contact,
          email,
          status1,
          status2,
          notes: row[COL.MORE_NOTES] || '',
          reason: noContact ? 'No contact name' : noEmail ? 'No email' : 'Generic email'
        });
      }
    }

    console.log(`📊 Found ${needsEnrichment.length} leads genuinely needing enrichment\n`);
    
    if (needsEnrichment.length === 0) {
      console.log('✅ All leads have contacts and emails!');
      return;
    }

    // Take first 15 for manual review
    const targets = needsEnrichment.slice(0, 15);
    
    console.log(`=== TOP 15 TO ENRICH NOW ===\n`);
    targets.forEach((lead, idx) => {
      console.log(`${idx + 1}. Row ${lead.row}: ${lead.company}`);
      console.log(`   URL: ${lead.url || '(none)'}`);
      console.log(`   Reason: ${lead.reason}`);
      console.log(`   Current contact: ${lead.contact || '(none)'}`);
      console.log(`   Current email: ${lead.email || '(none)'}`);
      console.log(`   Status: ${lead.status2 || lead.status1 || '(none)'}`);
      if (lead.notes) {
        console.log(`   Notes: ${lead.notes.substring(0, 100)}...`);
      }
      console.log('');
    });

    // Save to file
    const fs = require('fs');
    fs.writeFileSync(
      'enrichment-targets-fixed-march16.json',
      JSON.stringify(targets, null, 2)
    );
    console.log('✅ Saved targets to enrichment-targets-fixed-march16.json');
    console.log(`\n📈 Total needing enrichment: ${needsEnrichment.length}`);
    console.log(`🎯 Ready to research: ${targets.length}`);

  } catch (error) {
    console.error('Error:', error.message);
    if (error.stack) console.error(error.stack);
  }
}

readSheet();
