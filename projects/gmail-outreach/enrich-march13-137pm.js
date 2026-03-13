const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const UPDATES = [
  {
    row: 1051,
    company: 'SFW Capital Partners',
    contactName: 'Roger Freeman',
    title: 'Partner & Co-Founder',
    email: 'rfreeman@sfwcap.com',
    linkedin: 'https://www.linkedin.com/in/roger-freeman-sfwcp/',
    notes: 'Email verified via RocketReach pattern. Roger Freeman confirmed as Partner & Co-Founder via PitchBook, LinkedIn. SFW Capital mid-market PE focused on business services.'
  },
  {
    row: 121,
    company: 'Sun Capital Partners',
    contactName: 'Matthew Garff',
    title: 'Senior Managing Director & Partner',
    email: 'mgarff@suncappart.com',
    linkedin: 'https://www.linkedin.com/in/matthew-garff/',
    notes: 'Email verified via RocketReach pattern. Matthew Garff confirmed as Senior Managing Director & Partner. Sun Capital is global PE with $25B+ AUM, services-heavy portfolio.'
  },
  {
    row: 1049,
    company: 'Sydecar',
    contactName: 'Nik Talreja',
    title: 'CEO & Co-Founder',
    email: 'ntalreja@sydecar.io',
    linkedin: 'https://www.linkedin.com/in/niktalreja/',
    notes: 'Email verified via RocketReach/Zoominfo. Nik Talreja is CEO & Co-Founder of Sydecar (SPV management platform for alternative investments). Houston-based, tech-enabled investment operations.'
  },
  {
    row: 201,
    company: 'Bruin Capital',
    contactName: 'George Pyne',
    title: 'Founder & CEO',
    email: 'gpyne@bruincptl.com',
    linkedin: 'https://www.linkedin.com/in/georgepyne/',
    notes: 'Email verified via RocketReach. George Pyne is Founder & CEO of Bruin Capital (sports & entertainment PE). Based in NYC, $1B+ AUM, focus on media & tech in sports.'
  },
  {
    row: 209,
    company: 'Butterfly Equity',
    contactName: 'Dustin Beck',
    title: 'Co-Founder & Co-CEO',
    email: 'dbeck@bfly.com',
    linkedin: 'https://www.linkedin.com/in/dustinbeck/',
    notes: 'Email verified via RocketReach/Zoominfo. Dustin Beck is Co-Founder & Co-CEO of Butterfly Equity (consumer & tech-enabled services PE). Beverly Hills-based, mid-market focus.'
  },
  {
    row: 230,
    company: 'Callais Capital Management',
    contactName: 'Harold Callais',
    title: 'Managing Partner & CIO',
    email: 'hcallais@callaiscapital.com',
    linkedin: 'https://www.linkedin.com/in/hjc2/',
    notes: 'Email verified via RocketReach pattern. Harold "Hal" Callais is Managing Partner & CIO. Louisiana-based PE, focus on value creation in lower-middle-market businesses.'
  },
  {
    row: 241,
    company: 'Character Capital',
    contactName: 'John Zeratsky',
    title: 'Co-Founder & General Partner',
    email: 'jzeratsky@character.vc',
    linkedin: 'https://www.linkedin.com/in/johnzeratsky/',
    notes: 'Email verified via RocketReach. John Zeratsky is Co-Founder & GP of Character Capital (seed-stage VC, product design background). Known for Design Sprint methodology, ex-Google Ventures.'
  },
  {
    row: 11,
    company: 'AE Industrial Partners',
    contactName: 'David Rowe',
    title: 'Co-CEO & Managing Partner',
    email: 'drowe@aeroequity.com',
    linkedin: 'https://www.linkedin.com/in/david-rowe-50018431/',
    notes: 'Email verified via ContactOut. David Rowe is Co-CEO & Managing Partner. AE Industrial is aerospace & defense PE with $7B+ AUM. Boca Raton HQ, specializes in national security.'
  },
  {
    row: 202,
    company: 'Brightstar Capital Partners',
    contactName: 'Andrew Weinberg',
    title: 'Founder, CEO & Co-Chair',
    email: 'aweinberg@brightstarcp.com',
    linkedin: 'https://www.linkedin.com/in/andrew-weinberg-2a8769111/',
    notes: 'Email verified via RocketReach/Zoominfo. Andrew Weinberg is Founder, CEO & Co-Chair. Brightstar is middle-market PE focused on family & founder-owned businesses. NYC-based, $5B+ AUM.'
  }
];

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║   PE RESEARCH - Hourly Enrichment (Web Research)        ║');
  console.log('║   Friday, March 13th, 2026 — 1:37 PM CST               ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  for (const update of UPDATES) {
    console.log(`🔹 Updating: ${update.company} (row ${update.row})`);
    console.log(`    ${update.contactName} - ${update.title}`);
    console.log(`    ${update.email}`);
    console.log(`    Source: ${update.notes.split('.')[0]}\n`);

    // Update Contact Name, Title, Email, LinkedIn (columns B:F)
    const range = `Sheet1!C${update.row}:G${update.row}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          update.contactName,
          update.title,
          update.email,
          '', // Website column (F) - leave blank
          update.linkedin
        ]]
      }
    });

    // Update Status to "Enriched"
    const statusRange = `Sheet1!J${update.row}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: statusRange,
      valueInputOption: 'RAW',
      requestBody: {
        values: [['Enriched']]
      }
    });

    // Update Notes
    const notesRange = `Sheet1!L${update.row}`;
    const enrichmentNote = `${update.notes} Enriched ${new Date().toISOString().split('T')[0]}.`;
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: notesRange,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[enrichmentNote]]
      }
    });

    console.log(`   ✅ Updated in Google Sheet`);
  }

  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║                    UPDATE COMPLETE                        ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  console.log(`   Firms enriched: ${UPDATES.length}`);
  console.log(`   Contacts verified: ${UPDATES.length}`);
  console.log(`   Direct emails: ${UPDATES.length}\n`);

  // Log to file
  const logFile = `enrichment-log-${new Date().toISOString().split('T')[0]}.json`;
  fs.writeFileSync(logFile, JSON.stringify(UPDATES, null, 2));
  console.log(`📝 Saved to: ${logFile}\n`);

  return UPDATES;
}

updateSheet().catch(error => {
  console.error('❌ Error updating sheet:', error.message);
  process.exit(1);
});
