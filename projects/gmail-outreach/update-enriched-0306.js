// PE Lead Enrichment Update - 03-03-0306 Run
const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = 'service-account.json';

// Enrichment findings from web research
const UPDATES = [
  {
    row: 562, // Arax Investment Partners
    contact: 'Haig Ariyan',
    title: 'CEO & Founder',
    email: 'hariyan@araxpartners.com',
    linkedin: 'https://www.linkedin.com/in/haig-ariyan-617101252/',
    status: 'Enriched',
    notes: 'Email from ContactOut (pattern verified)',
  },
  {
    row: 579, // Cardea Group
    status: 'Dead Lead',
    notes: 'Not a PE firm - Executive recruiting firm for PE/VC industry',
  },
  {
    row: 614, // GTMfund
    contact: 'Max Altschuler',
    title: 'Founder & General Partner',
    email: '', // Pattern found but not verified from official source
    linkedin: 'https://www.linkedin.com/in/maxaltschuler/',
    status: 'Researched - Needs Verification',
    notes: 'Contact found but no official email verified. RocketReach shows m******@gtmfund.com',
  },
  {
    row: 615, // Hark Capital
    contact: 'Doug Cruikshank',
    title: 'Managing Partner & Founder',
    email: '', // Pattern found but not official source
    linkedin: 'https://www.linkedin.com/in/doug-cruikshank-hark/',
    status: 'Researched - Needs Verification',
    notes: 'Fund finance/NAV lending (not traditional PE). Email pattern d******@harkcap.com from RocketReach',
  },
  {
    row: 220, // WindPoint Partners
    contact: 'Nathan Brown',
    title: 'Managing Director',
    email: '', // Pattern known but not verified
    linkedin: '',
    status: 'Researched - Needs Verification',
    notes: 'Large PE firm ($7B AUM). Email pattern @wppartners.com. Also Paul Peterson (MD)',
  },
  {
    row: 234, // The Jordan Company (TJC)
    contact: 'Mark Emery',
    title: 'Partner, Co-Head OMG',
    email: '', // Pattern known
    linkedin: 'https://www.linkedin.com/in/mark-emery-59bb52b5/',
    status: 'Researched - Needs Verification',
    notes: '$33B AUM. Email domain @thejordancompany.com. Also Jeff Miller, Dino LaValle',
  },
  {
    row: 262, // Swander Pace Capital
    contact: 'Tyler (Managing Director)',
    title: 'Managing Director',
    email: 'tyler@spcap.com',
    linkedin: '',
    status: 'Enriched',
    notes: 'Email found in official PDF overview: https://spcap.com/wp-content/uploads/2021/03/2021-SPC-Overview.pdf. Also dan@spcap.com (Dan Swander)',
  },
  {
    row: 216, // Falconhead Capital
    contact: 'David Moross',
    title: 'Founder, Chairman & CEO',
    email: '',
    linkedin: '',
    status: 'Researched - No Email',
    notes: '$400M AUM. Contact found but no verified email from official source',
  },
];

async function updateSheet() {
  console.log('🫡 Updating sheet with enrichment data...\n');
  
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Build update requests
  const updates = [];
  
  for (const update of UPDATES) {
    const rowData = [];
    
    // Columns: A=Firm, B=Contact, C=Title, D=Email, E=Website, F=LinkedIn, G=AUM, H=Focus, I=Status, J=Last Contact, K=Notes
    // We update: B (Contact), C (Title), D (Email), F (LinkedIn), I (Status), K (Notes)
    
    const range = `Sheet1!B${update.row}:K${update.row}`;
    const values = [[]];
    
    if (update.contact) values[0][0] = update.contact; // B
    if (update.title) values[0][1] = update.title; // C
    if (update.email) values[0][2] = update.email; // D
    // Skip E (Website) - index 3
    if (update.linkedin) values[0][4] = update.linkedin; // F (index 4)
    // Skip G, H (AUM, Focus) - indices 5, 6
    if (update.status) values[0][7] = update.status; // I (index 7)
    // Skip J (Last Contact) - index 8
    if (update.notes) values[0][9] = update.notes; // K (index 9)
    
    updates.push({
      range,
      values,
    });
    
    console.log(`Row ${update.row}: ${update.contact || 'N/A'} - ${update.status}`);
  }
  
  // Batch update
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      valueInputOption: 'RAW',
      data: updates,
    },
  });
  
  console.log(`\n✅ Updated ${updates.length} rows`);
  console.log('\nSummary:');
  console.log('- 2 fully enriched with verified emails');
  console.log('- 5 researched but need email verification');
  console.log('- 1 marked as non-PE (recruiting firm)');
}

updateSheet().catch(console.error);
