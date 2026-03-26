const { google } = require('googleapis');

// Research findings for Gryphon Investors
const ROW_NUM = 1234;
const CONTACT_NAME = 'Leigh Abramson';
const TITLE = 'Co-CIO & Deal Partner';
const EMAIL = 'abramson@gryphoninvestors.com';
const LINKEDIN = 'https://www.linkedin.com/in/leigh-abramson';
const STATUS = 'Enriched';
const NOTES = 'ContactOut-published email: abramson@gryphoninvestors.com (Co-CIO & Deal Partner). Alternative contacts: Ann Akichika (COO, akichika@gryphoninvestors.com per ContactOut), David Andrews (Founder & Co-CEO, andrews@gryphoninvestors.com - pattern-inferred 89.7% confidence RocketReach), Nicholas Orum (Co-CEO & Co-CIO, orum@gryphoninvestors.com - pattern-inferred). Email pattern: {last}@gryphoninvestors.com verified by multiple sources. Phone: 415-217-7400. Enriched 2026-03-16 01:10 AM cron.';

async function updateSheet() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

    // Update columns: C (Contact Name), D (Title), E (Email), G (LinkedIn), H (Status), I (Notes)
    const range = `Sheet1!C${ROW_NUM}:I${ROW_NUM}`;
    
    console.log(`Updating row ${ROW_NUM} for Gryphon Investors...`);
    
    const values = [[
      CONTACT_NAME,  // Column C
      TITLE,         // Column D
      EMAIL,         // Column E
      '',            // Column F (Extra - leave blank)
      LINKEDIN,      // Column G
      STATUS,        // Column H (Status_1)
      NOTES          // Column I (Notes)
    ]];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      resource: { values }
    });

    console.log(`✅ Successfully updated Gryphon Investors (Row ${ROW_NUM})`);
    console.log(`   Contact: ${CONTACT_NAME}`);
    console.log(`   Title: ${TITLE}`);
    console.log(`   Email: ${EMAIL}`);
    console.log(`   Status: ${STATUS}`);
    console.log(`\n📊 Research Summary:`);
    console.log(`   - Primary contact: Leigh Abramson (Co-CIO) - published by ContactOut`);
    console.log(`   - Alternative: Ann Akichika (COO) - published by ContactOut`);
    console.log(`   - Alternative: David Andrews (Founder & Co-CEO) - pattern-inferred`);
    console.log(`   - Alternative: Nicholas Orum (Co-CEO) - pattern-inferred`);
    console.log(`   - Email pattern confirmed: {last}@gryphoninvestors.com`);

  } catch (error) {
    console.error('❌ Error updating sheet:', error.message);
    if (error.stack) console.error(error.stack);
  }
}

updateSheet();
