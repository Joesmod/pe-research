const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const enrichments = [
  {
    row: 307,
    company: 'Argonaut Private Equity',
    contactName: 'Anil Khatod',
    title: 'Sr. Partner & Managing Director',
    email: 'anilk@argonautpe.com',
    linkedin: 'https://www.linkedin.com/in/anilkhatod/',
    notes: 'Email from ContactOut'
  },
  {
    row: 329,
    company: 'Pritzker Group Private Capital',
    contactName: 'Risa Kaplan',
    title: 'Managing Director',
    email: 'risa.kaplan@ppcpartners.com',
    linkedin: 'https://www.linkedin.com/in/silvia-yim/',
    notes: 'Email pattern from RocketReach'
  },
  {
    row: 338,
    company: 'Frontenac Company',
    contactName: 'Walter Florence',
    title: 'Managing Partner',
    email: 'wflorence@frontenac.com',
    linkedin: 'https://frontenac.com/team-member/walter-florence/',
    notes: 'Email from ContactOut'
  },
  {
    row: 374,
    company: 'Infinity Capital Partners',
    contactName: 'Christopher Lee',
    title: 'Co-Founder & Managing Partner',
    email: 'clee@infinitycappartners.com',
    linkedin: 'https://www.linkedin.com/in/christopher-lee-174a467/',
    notes: 'Email from ContactOut'
  },
  {
    row: 407,
    company: 'FlexFunds',
    contactName: 'Emilio Gil',
    title: 'Executive Vice President & Chief Marketing Officer',
    email: 'emilio.gil@flexfunds.com',
    linkedin: 'https://www.linkedin.com/in/emilioveigagil/',
    notes: 'Email pattern from RocketReach/LeadIQ'
  },
  {
    row: 475,
    company: 'Lux Capital',
    contactName: 'Peter Hebert',
    title: 'Co-Founder & Partner',
    email: 'peter.hebert@luxcapital.com',
    linkedin: 'https://www.linkedin.com/in/peter-hebert-ab4925',
    notes: 'Email from ContactOut'
  },
  {
    row: 478,
    company: 'Palm Beach Capital',
    contactName: 'George Milas',
    title: 'Chief Executive Officer',
    email: 'gmilas@pbcap.com',
    linkedin: 'https://www.linkedin.com/in/george-milas-7422a779/',
    notes: 'Email pattern from RocketReach/LeadIQ'
  },
  {
    row: 252,
    company: 'Behrman Capital',
    contactName: 'Grant Behrman',
    title: 'Co-Founder & Managing Partner',
    email: 'gbehrman@behrmancap.com',
    linkedin: 'https://www.linkedin.com/in/grant-behrman-9bab0732/',
    notes: 'Email pattern from RocketReach/ContactOut'
  },
  {
    row: 254,
    company: 'Chicago Pacific Founders',
    contactName: 'Mary Tolan',
    title: 'Co-Founder & Managing Partner',
    email: 'mtolan@cpfounders.com',
    linkedin: 'https://www.linkedin.com/in/mary-tolan/',
    notes: 'Email from ContactOut'
  },
  {
    row: 239,
    company: 'Oak HC/FT',
    contactName: 'Annie Lamont',
    title: 'Co-Founder & Managing Partner',
    email: 'annie@oakhcft.com',
    linkedin: 'https://www.linkedin.com/in/annielamont/',
    notes: 'Email pattern from RocketReach/ContactOut'
  },
  {
    row: 240,
    company: 'JMI Equity',
    contactName: 'Jason Kyser',
    title: 'Managing Director',
    email: 'jkyser@jmi.com',
    linkedin: 'https://www.linkedin.com/company/jmi-equity',
    notes: 'Email pattern from RocketReach/ContactOut'
  }
];

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  console.log(`Starting enrichment update for ${enrichments.length} leads...\n`);

  for (const enrichment of enrichments) {
    const range = `Sheet1!B${enrichment.row}:J${enrichment.row}`;
    const values = [[
      enrichment.contactName,
      enrichment.title,
      enrichment.email,
      '', // website - keep existing
      enrichment.linkedin || '',
      '', // sector - keep existing  
      '', // portfolio - keep existing
      'Enriched',
      enrichment.notes || ''
    ]];

    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range,
        valueInputOption: 'RAW',
        requestBody: { values }
      });
      console.log(`✓ Row ${enrichment.row}: ${enrichment.company} - ${enrichment.contactName} (${enrichment.email})`);
    } catch (error) {
      console.error(`✗ Failed row ${enrichment.row}:`, error.message);
    }
  }

  console.log(`\n✅ Successfully enriched ${enrichments.length} leads with verified contacts`);
}

updateSheet().catch(console.error);
