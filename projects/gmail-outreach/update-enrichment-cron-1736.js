#!/usr/bin/env node

const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Enriched leads data
const enrichedLeads = [
  {
    rowIndex: 624,
    company: 'Invictus Growth Partners',
    contact: 'John DeLoche',
    title: 'Co-Founder & Managing Partner',
    email: 'john@invictusgrowth.com',
    linkedin: 'https://www.linkedin.com/in/johndeloche/',
    source: 'ContactOut - publicly disclosed'
  },
  {
    rowIndex: 628,
    company: 'Karmel Capital',
    contact: 'Scott Neuberger',
    title: 'Managing Partner',
    email: 'scott@karmelcap.com',
    linkedin: 'https://www.linkedin.com/in/scottneuberger/',
    source: 'Crunchbase + LinkedIn'
  },
  {
    rowIndex: 633,
    company: 'Livingstone',
    contact: 'Joseph Greenwood',
    title: 'Partner (Chicago)',
    email: 'greenwood@livingstonepartners.com',
    linkedin: 'https://livingstonepartners.com/en-us/team/joseph-greenwood/',
    source: 'Livingstone website - team page'
  }
];

async function updateSheet() {
  console.log('\n=== UPDATING GOOGLE SHEET WITH ENRICHED LEADS ===\n');
  console.log(`Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}`);
  console.log(`Enriched leads: ${enrichedLeads.length}\n`);

  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });

  for (const lead of enrichedLeads) {
    try {
      console.log(`\nUpdating Row ${lead.rowIndex}: ${lead.company}`);
      console.log(`  Contact: ${lead.contact}`);
      console.log(`  Title: ${lead.title}`);
      console.log(`  Email: ${lead.email}`);
      console.log(`  LinkedIn: ${lead.linkedin}`);
      console.log(`  Source: ${lead.source}`);

      const range = `Sheet1!B${lead.rowIndex}:H${lead.rowIndex}`;
      const timestamp = new Date().toISOString().split('T')[0];
      const notes = `Enriched via ${lead.source} - ${timestamp}`;

      const values = [[
        lead.contact,           // Column B: Contact Name
        lead.title,             // Column C: Title
        lead.email,             // Column D: Email
        lead.linkedin,          // Column E: LinkedIn URL
        '',                     // Column F: Subject (empty)
        'Enriched',             // Column G: Status
        notes                   // Column H: Notes
      ]];

      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: range,
        valueInputOption: 'RAW',
        resource: { values }
      });

      console.log(`  ✓ Successfully updated`);

      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`  ✗ Error updating row ${lead.rowIndex}:`, error.message);
    }
  }

  console.log('\n=== UPDATE COMPLETE ===');
  console.log(`\nSuccessfully enriched ${enrichedLeads.length} leads:`);
  enrichedLeads.forEach(l => {
    console.log(`  - ${l.contact} at ${l.company} (${l.email})`);
  });
  console.log('\n🫡\n');
}

updateSheet().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
