const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

async function main() {
  console.log('=== PE Research & Enrichment - Focused Run ===');
  console.log('Time:', new Date().toISOString());
  
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: KEY_FILE,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    console.log('\nReading Google Sheet...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:O',
    });

    const rows = response.data.values || [];
    if (rows.length < 2) {
      console.log('No data found.');
      return;
    }

    // Column mapping (from inspection)
    // A: Company Name
    // B: NotebookLM/Website
    // C: Contact Name
    // D: Position/Title
    // E: Email
    // F: Extra data
    // G: LinkedIn URL
    // H: Status field 1
    // I: Notes
    // J: Status
    // K: Last Contacted
    // L: More Notes
    // M: Company Info URL
    // N: Gumbo Score

    const needsEnrichment = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const firm = (row[0] || '').trim();
      const website = (row[1] || '').trim();
      const contact = (row[2] || '').trim();
      const title = (row[3] || '').trim();
      const email = (row[4] || '').trim();
      const status = (row[9] || '').trim(); // Column J

      // Skip if no firm name
      if (!firm) continue;

      // Skip if Dead/Bounced
      if (status === 'Dead' || status === 'Bounced') continue;

      // Check if needs enrichment
      const needsContact = !contact || contact.length === 0;
      const hasGenericEmail = email.includes('info@') || 
                               email.includes('sales@') || 
                               email.includes('ir@') ||
                               email.includes('contact@') ||
                               !email || email.length === 0;

      if (needsContact || hasGenericEmail) {
        needsEnrichment.push({
          rowIndex: i + 1,
          firm,
          website,
          contact: contact || '(empty)',
          title: title || '(empty)',
          email: email || '(empty)',
          status,
        });
      }
    }

    console.log(`\nFound ${needsEnrichment.length} leads needing enrichment`);
    
    if (needsEnrichment.length === 0) {
      console.log('All leads are enriched!');
      return;
    }

    // Select top 12 for this run
    const targets = needsEnrichment.slice(0, 12);
    
    console.log(`\nTargeting ${targets.length} firms:\n`);
    targets.forEach((t, idx) => {
      console.log(`${idx + 1}. ${t.firm} (Row ${t.rowIndex})`);
      console.log(`   Current: ${t.contact} | ${t.email}`);
      console.log(`   Website: ${t.website}\n`);
    });

    // Save for manual review
    const targetFile = path.join(__dirname, 'research-targets-march15-0037am.json');
    fs.writeFileSync(targetFile, JSON.stringify(targets, null, 2));
    console.log(`Targets saved to: ${targetFile}`);
    console.log('\nReady for web research automation.');

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
