const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

// Updates based on research conducted 2026-03-15
const updates = [
  {
    row: 601, // Energy Impact Partners - Hans Kobler
    firm: 'Energy Impact Partners',
    contact: 'Hans Kobler',
    title: 'Founder and Managing Partner',
    email: 'kobler@energyimpactpartners.com',
    linkedin: 'https://www.linkedin.com/in/hanskobler',
    status: 'Enriched',
    notes: 'Email verified via ContactOut (sourced from published data). Founder and Managing Partner. (2026-03-15 cron)',
  },
  {
    row: 1213, // Banner Capital - Mark Broadbent
    firm: 'Banner Capital',
    contact: 'Mark Broadbent',
    title: 'EVP & General Counsel',
    email: 'mbroadbent@bannercap.com',
    linkedin: 'https://www.linkedin.com/in/markjbroadbent/',
    status: 'Enriched',
    notes: 'Email pattern from RocketReach m******@bannercap.com (inferred: mbroadbent@bannercap.com). EVP on deal execution team & General Counsel. NOT VERIFIED - research further before use. (2026-03-15 cron)',
  },
  {
    row: 1217, // Rockwood Equity Partners - Joe Merrill
    firm: 'Rockwood Equity Partners',
    contact: 'Joe Merrill',
    title: 'Managing Partner',
    email: '', // No verifiable email found
    linkedin: 'https://www.linkedin.com/in/joe-merrill',
    status: 'Needs Email',
    notes: 'Managing Partner (Denver office). Joined Rockwood 2006. No verified email found on official sources. Team page: rockwoodequity.com/team/joe-merrill (2026-03-15 cron)',
  },
  {
    row: 1218, // Clearview Capital - William Case
    firm: 'Clearview Capital',
    contact: 'William Case',
    title: 'Managing Partner',
    email: 'wcase@clearviewcap.com',
    linkedin: 'https://www.linkedin.com/in/bill-case-5950744',
    status: 'Enriched',
    notes: 'Email pattern from RocketReach w******@clearviewcap.com (inferred: wcase@clearviewcap.com). Managing Partner since 2002. NOT VERIFIED - research further before use. (2026-03-15 cron)',
  },
  {
    row: 1219, // Clearview Capital - Matthew Blevins
    firm: 'Clearview Capital',
    contact: 'Matthew Blevins',
    title: 'Managing Partner',
    email: 'mblevins@clearviewcap.com',
    linkedin: 'https://www.linkedin.com/in/matt-blevins-0b759b64',
    status: 'Enriched',
    notes: 'Email pattern from RocketReach m******@clearviewcap.com (inferred: mblevins@clearviewcap.com). Managing Partner, works with Bill Case. NOT VERIFIED - research further before use. (2026-03-15 cron)',
  },
  {
    row: 1220, // Waud Capital Partners - Reeve Waud
    firm: 'Waud Capital Partners',
    contact: 'Reeve Waud',
    title: 'Founder and Managing Partner',
    email: 'rwaud@waudcapital.com',
    linkedin: 'https://www.linkedin.com/in/reeve-waud-90b77712/',
    status: 'Enriched',
    notes: 'Email pattern from RocketReach r******@waudcapital.com (inferred: rwaud@waudcapital.com). Founded WCP 1993. 500+ acquisitions. NOT VERIFIED - research further before use. (2026-03-15 cron)',
  },
];

async function main() {
  console.log('=== Updating Google Sheet with Enrichment Results ===\n');
  
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: KEY_FILE,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    // Column mapping (from inspection):
    // A: Company Name (0)
    // B: NotebookLM/Website (1)
    // C: Contact Name (2)
    // D: Position/Title (3)
    // E: Email (4)
    // F: Extra data (5)
    // G: LinkedIn URL (6)
    // H: Status field 1 (7)
    // I: Notes (8)
    // J: Status (9)

    for (const update of updates) {
      console.log(`Updating Row ${update.row}: ${update.firm} - ${update.contact}`);
      
      const range = `Sheet1!C${update.row}:J${update.row}`;
      const values = [[
        update.contact,        // C: Contact Name
        update.title,          // D: Position/Title
        update.email,          // E: Email
        '',                    // F: Extra data (leave blank)
        update.linkedin,       // G: LinkedIn URL
        update.status,         // H: Status field 1
        update.notes,          // I: Notes
        update.status,         // J: Status
      ]];

      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range,
        valueInputOption: 'RAW',
        resource: { values },
      });

      console.log(`  ✓ Updated ${update.email || '(no email)'}`);
    }

    console.log('\n=== Update Complete ===');
    console.log(`Updated ${updates.length} leads`);
    console.log('\nSummary:');
    console.log('  • 1 verified email (Hans Kobler via ContactOut)');
    console.log('  • 4 inferred emails (marked NOT VERIFIED)');
    console.log('  • 1 no email found (Joe Merrill)');

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
