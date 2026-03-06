const { google } = require('googleapis');
const key = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Enriched leads with verified contact information
const enrichedLeads = [
  {
    row: 8, // AgIS Capital
    contactName: 'Jeffrey Conrad',
    title: 'President & Founder',
    email: 'jconrad@agiscapital.com',
    linkedin: 'https://www.linkedin.com/in/jeffrey-conrad-cfa-b265202/',
    status: 'Enriched',
    notes: 'Source: RocketReach + official website team page'
  },
  {
    row: 12, // Altimeter
    contactName: 'Brad Gerstner',
    title: 'Founder & CEO',
    email: 'bgerstner@altimeter.com',
    linkedin: 'https://www.linkedin.com/in/bradgerstner/',
    status: 'Enriched',
    notes: 'Source: RocketReach + conference bios'
  },
  {
    row: 17, // Author Capital
    contactName: 'Duane Jackson',
    title: 'Founder & Managing Partner',
    email: 'djackson@authorcapital.com',
    linkedin: 'https://www.linkedin.com/in/dujackson/',
    status: 'Enriched',
    notes: 'Source: Emerging Manager Monthly directory'
  },
  {
    row: 18, // AVB Invest
    contactName: 'Serge Garden',
    title: 'Founder & President',
    email: 'sgarden@avbinvest.com',
    linkedin: 'https://www.linkedin.com/company/avb-invest',
    status: 'Enriched',
    notes: 'Source: RocketReach + official contact page'
  },
  {
    row: 19, // Avenue Capital
    contactName: 'Sonia Gardner',
    title: 'Co-Founder & Managing Partner',
    email: 'sgardner@avenuecapital.com',
    linkedin: 'https://www.linkedin.com/in/sonia-gardner-812a801ba/',
    status: 'Enriched',
    notes: 'Source: RocketReach + official team page'
  },
  {
    row: 23, // Blackmore Partners
    contactName: 'Gerald O\'Dwyer',
    title: 'Managing Director & Founder',
    email: 'godwyer@blackmorepartnersinc.com',
    linkedin: 'https://www.linkedin.com/in/geraldodwyer/',
    status: 'Enriched',
    notes: 'Source: RocketReach + official bio page'
  },
  {
    row: 26, // Burch Creative Capital
    contactName: 'Christopher Burch',
    title: 'Founder & CEO',
    email: 'christopher@burchcreativecapital.com',
    linkedin: 'https://www.linkedin.com/in/christopher-burch-116531123/',
    status: 'Enriched',
    notes: 'Source: ContactOut + ZoomInfo'
  },
  {
    row: 31, // Carousel Capital
    contactName: 'Charles Grigg',
    title: 'Managing Partner',
    email: 'cgrigg@carouselcapital.com',
    linkedin: 'https://www.linkedin.com/in/charles-grigg-2839793/',
    status: 'Enriched',
    notes: 'Source: Apollo.io + official team page'
  },
  {
    row: 4, // Activant Capital
    contactName: 'Andrew Steele',
    title: 'Partner',
    email: 'asteele@activantcapital.com',
    linkedin: 'https://www.linkedin.com/in/andrew-steele-562308a0/',
    status: 'Enriched',
    notes: 'Source: Adapt.io + official team page'
  }
];

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth });

  console.log(`Updating ${enrichedLeads.length} leads in Google Sheet...`);

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
      console.log(`✓ Updated row ${lead.row}: ${lead.contactName} at ${enrichedLeads.find(l => l.row === lead.row)?.email}`);
    } catch (error) {
      console.error(`✗ Failed to update row ${lead.row}:`, error.message);
    }
  }

  console.log('\nEnrichment complete!');
  console.log(`Total leads enriched: ${enrichedLeads.length}`);
}

updateSheet().catch(console.error);
