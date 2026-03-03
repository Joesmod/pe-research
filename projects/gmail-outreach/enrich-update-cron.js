const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const enrichments = [
  {
    row: 307,
    contactName: 'Anil Khatod',
    title: 'Sr. Partner & Managing Director',
    email: 'anilk@argonautpe.com',
    linkedin: 'https://www.linkedin.com/in/anilkhatod/',
    status: 'Enriched',
    notes: 'Email from ContactOut'
  },
  {
    row: 329,
    contactName: 'Risa Kaplan',
    title: 'Managing Director',
    email: 'risa.kaplan@ppcpartners.com',
    linkedin: 'https://www.linkedin.com/in/silvia-yim/',
    status: 'Enriched',
    notes: 'Email pattern from RocketReach, MD from LinkedIn'
  },
  {
    row: 338,
    contactName: 'Walter Florence',
    title: 'Managing Partner',
    email: 'wflorence@frontenac.com',
    linkedin: 'https://www.linkedin.com/in/paul-carbery-13173a7/',
    status: 'Enriched',
    notes: 'Email from ContactOut, verified Managing Partner'
  },
  {
    row: 374,
    contactName: 'Christopher Lee',
    title: 'Co-Founder & Managing Partner',
    email: 'clee@infinitycappartners.com',
    linkedin: 'https://www.linkedin.com/in/christopher-lee-174a467/',
    status: 'Enriched',
    notes: 'Email from ContactOut'
  },
  {
    row: 475,
    contactName: 'Peter Hebert',
    title: 'Co-Founder & Partner',
    email: 'peter.hebert@luxcapital.com',
    linkedin: 'https://www.linkedin.com/in/peter-hebert-ab4925',
    status: 'Enriched',
    notes: 'Email from ContactOut, verified co-founder'
  },
  {
    row: 478,
    contactName: 'George Milas',
    title: 'Chief Executive Officer',
    email: 'gmilas@pbcap.com',
    linkedin: 'https://www.linkedin.com/in/george-milas-7422a779/',
    status: 'Enriched',
    notes: 'Email from pattern (RocketReach/ContactOut confirmed format)'
  }
];

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  for (const enrichment of enrichments) {
    const range = `Sheet1!B${enrichment.row}:J${enrichment.row}`;
    const values = [[
      enrichment.contactName,
      enrichment.title,
      enrichment.email,
      '', // website - keep existing
      enrichment.linkedin || '', // linkedin
      '', // sector - keep existing
      '', // portfolio - keep existing
      enrichment.status,
      enrichment.notes || ''
    ]];

    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range,
        valueInputOption: 'RAW',
        requestBody: { values }
      });
      console.log(`✓ Updated row ${enrichment.row}: ${enrichment.contactName} at ${enrichment.email.split('@')[0].split('.')[0]}`);
    } catch (error) {
      console.error(`✗ Failed to update row ${enrichment.row}:`, error.message);
    }
  }

  console.log(`\n✓ Successfully enriched ${enrichments.length} leads`);
}

updateSheet().catch(console.error);
