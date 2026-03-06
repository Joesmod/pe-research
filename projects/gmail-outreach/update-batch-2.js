const { google } = require('googleapis');
const key = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Additional enriched leads - Batch 2
const enrichedLeads = [
  {
    row: 20, // Base10 Partners
    contactName: 'Adeyemi Ajao',
    title: 'Managing Partner & Co-Founder',
    email: 'ade@base10.vc',
    linkedin: 'https://www.linkedin.com/in/adeyemiajao/',
    status: 'Enriched',
    notes: 'Source: ContactOut + RocketReach'
  },
  {
    row: 7, // Afore Capital
    contactName: 'Gaurav Jain',
    title: 'Co-Founder & Managing Partner',
    email: 'gjain@afore.vc',
    linkedin: 'https://www.linkedin.com/in/gjainvc/',
    status: 'Enriched',
    notes: 'Source: LinkedIn + VCSheet'
  },
  {
    row: 71, // Quona Capital
    contactName: 'Monica Brand Engel',
    title: 'Co-Founder & Managing Partner',
    email: 'mengel@quona.com',
    linkedin: 'https://www.linkedin.com/in/monicabrandengel/',
    status: 'Enriched',
    notes: 'Source: RocketReach + official team page'
  }
];

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth });

  console.log(`Updating ${enrichedLeads.length} leads in Google Sheet (Batch 2)...`);

  for (const lead of enrichedLeads) {
    const range = `Sheet1!D${lead.row}:J${lead.row}`;
    const values = [[
      lead.contactName,
      lead.title,
      lead.email,
      lead.linkedin,
      lead.status,
      '',  // Date Sent (empty for now)
      lead.notes
    ]];

    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range,
        valueInputOption: 'RAW',
        resource: { values }
      });
      console.log(`✓ Updated row ${lead.row}: ${lead.contactName} at ${lead.email}`);
    } catch (error) {
      console.error(`✗ Failed to update row ${lead.row}:`, error.message);
    }
  }

  console.log('\nBatch 2 enrichment complete!');
}

updateSheet().catch(console.error);
