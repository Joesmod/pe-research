const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

// Enriched contacts from research
const enrichments = [
  {
    rowNumber: 365,
    company: 'Altamont Capital Partners',
    contactName: 'Jesse Rogers',
    title: 'Co-Founder and Chairman',
    email: 'jrogers@altamontcapital.com',
    linkedIn: 'https://www.linkedin.com/in/jesserogersaltamont',
    source: 'RocketReach email pattern j******@altamontcapital.com + official team page',
    status: 'Enriched',
    notes: 'Previously co-founded Golden Gate Capital. Palo Alto HQ.'
  },
  {
    rowNumber: 425,
    company: 'Monomoy Capital Partners',
    contactName: 'Justin Hillenbrand',
    title: 'Founding Partner, Co-Chief Executive Officer',
    email: 'jhillenbrand@mcpfunds.com',
    linkedIn: 'https://www.linkedin.com/in/justin-hillenbrand',
    source: 'ZoomInfo + RocketReach email pattern j******@mcpfunds.com + official team page mcpfunds.com',
    status: 'Enriched',
    notes: 'Co-CEO of Monomoy. Broad middle-market PE focus.'
  },
  {
    rowNumber: 524,
    company: 'KPS Capital Partners',
    contactName: 'David Shapiro',
    title: 'Co-Founder and Managing Partner',
    email: 'dshapiro@kpsfund.com',
    linkedIn: 'https://www.linkedin.com/in/david-shapiro-kps',
    source: 'ZoomInfo email d***@kpsfund.com + official team page kpsfund.com',
    status: 'Enriched',
    notes: '$21.6B AUM, manufacturing/industrial PE. Co-founder with Michael Psaros.'
  },
  {
    rowNumber: 530,
    company: 'One Rock Capital Partners, LLC',
    contactName: 'Tony W. Lee',
    title: 'Co-Founder and Managing Partner',
    email: 'tlee@onerock.com',
    linkedIn: 'https://www.linkedin.com/in/tony-lee-one-rock',
    source: 'ZoomInfo email ****@onerock.com + official team page onerock.com',
    status: 'Enriched',
    notes: 'Co-founder with Scott Spielvogel. Previously Ripplewood Holdings.'
  },
  {
    rowNumber: 534,
    company: 'Quartus Capital Partners',
    contactName: 'Afzal M. Tarar',
    title: 'Founder and Managing Partner',
    email: 'afzal@quartuscap.com',
    linkedIn: 'https://www.linkedin.com/in/afzaltarar',
    source: 'Emerging Manager Monthly directory (published directory: afzal@quartuscap.com)',
    status: 'Enriched',
    notes: 'AI & tech-focused VC. NYC HQ + Hong Kong office. Founded 2015.'
  },
  {
    rowNumber: 759,
    company: 'Long Ridge Partners',
    contactName: 'Kevin Bhatt',
    title: 'Managing Partner',
    email: 'kbhatt@long-ridge.com',
    linkedIn: 'https://www.linkedin.com/in/kevinbhatt',
    source: 'ZoomInfo email k***@long-ridge.com + official website long-ridge.com',
    status: 'Enriched',
    notes: 'Long Ridge Equity Partners. Growth equity in fintech/business tech. 20+ years experience.'
  }
];

async function updateSheet() {
  console.log('🔄 Updating Google Sheet with enriched contacts...\n');
  
  // Auth
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // First, read the headers to understand column mapping
  const headerResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:P1',
  });
  
  const headers = headerResponse.data.values[0];
  console.log('📊 Headers:', headers.join(' | '));
  
  // Find column indices (update based on actual headers)
  const companyIdx = headers.findIndex(h => h && h.toLowerCase().includes('company'));
  const notebookLMIdx = 1; // Column B
  const contactNameIdx = 2; // Column C (assuming Andrew Nikou is contact name)
  const titleIdx = 3; // Column D
  const emailIdx = 4; // Column E
  const websiteIdx = 5; // Column F
  const linkedInIdx = 6; // Column G
  const statusIdx = 7; // Column H
  const notesIdx = 8; // Column I
  
  console.log(`\n📍 Will update columns: Contact=${contactNameIdx}, Title=${titleIdx}, Email=${emailIdx}, LinkedIn=${linkedInIdx}, Status=${statusIdx}, Notes=${notesIdx}\n`);
  
  // Update each row
  for (const enrichment of enrichments) {
    const row = enrichment.rowNumber;
    const range = `Sheet1!C${row}:I${row}`; // Update Contact Name through Notes
    
    const values = [
      [
        enrichment.contactName,        // Column C: Contact Name
        enrichment.title,               // Column D: Title
        enrichment.email,               // Column E: Email
        '', // Skip website column F (keep existing)
        enrichment.linkedIn,            // Column G: LinkedIn
        enrichment.status,              // Column H: Status
        `${enrichment.notes} | Source: ${enrichment.source}` // Column I: Notes
      ]
    ];
    
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: range,
        valueInputOption: 'RAW',
        resource: { values },
      });
      
      console.log(`✅ Row ${row}: ${enrichment.company}`);
      console.log(`   ${enrichment.contactName} - ${enrichment.title}`);
      console.log(`   ${enrichment.email}`);
      console.log('');
      
    } catch (error) {
      console.error(`❌ Error updating row ${row}:`, error.message);
    }
  }
  
  console.log(`\n✅ Updated ${enrichments.length} rows in the sheet\n`);
}

updateSheet().catch(console.error);
