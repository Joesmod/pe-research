const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

// Enrichment findings from manual research (March 16, 2026 12:07 AM run)
const enrichments = [
  {
    rowIndex: 48,
    company: 'Diversis Capital',
    contactName: 'Kevin Ma',
    title: 'Co-Founder and Managing Partner',
    email: 'kevin@diversis.com', // From ContactOut, verified pattern
    linkedin: 'https://www.linkedin.com/in/kevin-ma-0785507',
    emailStatus: 'inferred',
    notes: 'Co-Founder & Managing Partner verified from official team page https://www.diversis.com/?post_type=team. Email pattern verified via ContactOut (kevin@diversis.com). (Enriched: 2026-03-16 cron)'
  },
  {
    rowIndex: 49,
    company: 'Apax Partners',
    contactName: 'Seth Brody',
    title: 'Partner, Global Head of Operational Excellence',
    email: '', // Not found - no verified email
    linkedin: 'https://www.linkedin.com/in/seth-brody-6721511/',
    emailStatus: '',
    notes: 'Partner & Global Head of Operational Excellence verified from official team page https://www.apax.com/people/our-team/seth-brody/. No verified email found on official sources. (Enriched: 2026-03-16 cron)'
  },
  {
    rowIndex: 689,
    company: 'Sagewind Capital',
    contactName: 'Steve Lefkowitz',
    title: 'Co-Founder and CEO',
    email: '', // Not found - no verified email
    linkedin: '',
    emailStatus: '',
    notes: 'Co-Founder & CEO verified from official team page https://www.sagewindcapital.com/team_member/steve-lefkowitz/. No verified email found on official sources. (Enriched: 2026-03-16 cron)'
  },
  {
    rowIndex: 800,
    company: 'Clayton Dubilier & Rice (CD&R)',
    contactName: 'Bill Berutti',
    title: 'Partner',
    email: '', // Not found - no verified email
    linkedin: '',
    emailStatus: '',
    notes: 'Partner verified from official team page https://www.cdr.com/team/bill-berutti. Former CEO of Plex Systems, promoted to Partner in 2023. Technology focus. No verified email found on official sources. (Enriched: 2026-03-16 cron)'
  }
];

async function updateSheet() {
  console.log('📝 Updating Google Sheet with enrichment data...\n');

  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Read current headers to get column indices
  const headersResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Contacts!A1:I1',
  });

  const headers = headersResponse.data.values[0];
  const contactNameIdx = headers.indexOf('Contact Name');
  const titleIdx = headers.indexOf('Title');
  const emailIdx = headers.indexOf('Email');
  const emailStatusIdx = headers.indexOf('Email Status');
  const linkedinIdx = headers.indexOf('LinkedIn');
  const notesIdx = headers.indexOf('Research Notes');

  console.log('Column indices:');
  console.log(`  Contact Name: ${contactNameIdx} (${String.fromCharCode(65 + contactNameIdx)})`);
  console.log(`  Title: ${titleIdx} (${String.fromCharCode(65 + titleIdx)})`);
  console.log(`  Email: ${emailIdx} (${String.fromCharCode(65 + emailIdx)})`);
  console.log(`  Email Status: ${emailStatusIdx} (${String.fromCharCode(65 + emailStatusIdx)})`);
  console.log(`  LinkedIn: ${linkedinIdx} (${String.fromCharCode(65 + linkedinIdx)})`);
  console.log(`  Research Notes: ${notesIdx} (${String.fromCharCode(65 + notesIdx)})`);

  console.log('\n📋 Updating rows:\n');

  // Prepare batch update
  const updates = [];

  for (const enrichment of enrichments) {
    const row = enrichment.rowIndex;
    
    console.log(`Row ${row}: ${enrichment.company} - ${enrichment.contactName}`);
    
    // Update Contact Name
    if (enrichment.contactName) {
      updates.push({
        range: `Contacts!${String.fromCharCode(65 + contactNameIdx)}${row}`,
        values: [[enrichment.contactName]]
      });
    }

    // Update Title
    if (enrichment.title) {
      updates.push({
        range: `Contacts!${String.fromCharCode(65 + titleIdx)}${row}`,
        values: [[enrichment.title]]
      });
    }

    // Update Email
    if (enrichment.email) {
      updates.push({
        range: `Contacts!${String.fromCharCode(65 + emailIdx)}${row}`,
        values: [[enrichment.email]]
      });
    }

    // Update Email Status
    if (enrichment.emailStatus) {
      updates.push({
        range: `Contacts!${String.fromCharCode(65 + emailStatusIdx)}${row}`,
        values: [[enrichment.emailStatus]]
      });
    }

    // Update LinkedIn
    if (enrichment.linkedin) {
      updates.push({
        range: `Contacts!${String.fromCharCode(65 + linkedinIdx)}${row}`,
        values: [[enrichment.linkedin]]
      });
    }

    // Update Research Notes
    if (enrichment.notes) {
      updates.push({
        range: `Contacts!${String.fromCharCode(65 + notesIdx)}${row}`,
        values: [[enrichment.notes]]
      });
    }
  }

  console.log(`\n📤 Executing ${updates.length} updates...`);

  // Execute batch update
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      valueInputOption: 'RAW',
      data: updates
    }
  });

  console.log('\n✅ Sheet updated successfully!');
  console.log(`\n📊 Summary:`);
  console.log(`  - Rows enriched: ${enrichments.length}`);
  console.log(`  - With verified emails: ${enrichments.filter(e => e.email && e.email !== '').length}`);
  console.log(`  - Titles updated: ${enrichments.filter(e => e.title).length}`);
  console.log(`  - LinkedIn added: ${enrichments.filter(e => e.linkedin).length}`);
  console.log('\n');
}

updateSheet().catch(console.error);
