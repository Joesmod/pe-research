const { google } = require('googleapis');

const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function addNewFirms() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Get current row count to append after existing data
  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:A'
  });
  
  const nextRow = existing.data.values ? existing.data.values.length + 1 : 2;
  
  console.log(`📊 Current last row: ${nextRow - 1}`);
  console.log(`📝 Adding new firms starting at row ${nextRow}\n`);
  
  // Prepare new firm data
  // Columns: Company Name, NotebookLM, Contact Name, Title, Email, Website, LinkedIn, Sector Focus, Portfolio Companies, Status, Last Contacted, Notes, Company Info URL, Gumbo Score
  const newFirms = [
    [
      'Bow River Capital', // A: Company Name
      '', // B: NotebookLM
      'Greg Hiatrides', // C: Contact Name
      'Managing Director, Private Equity', // D: Title
      'ghiatrides@bowrivercapital.com', // E: Email
      'https://www.bowrivercapital.com', // F: Website
      'N/A', // G: LinkedIn
      'Healthcare services, industrials, software', // H: Sector Focus
      'Lower middle market PE, real estate, software growth equity', // I: Portfolio Companies
      'Enriched', // J: Status
      '', // K: Last Contacted
      'Research added 2026-03-11. ~$2.5B AUM. Denver-based. Email pattern inferred: [first][last]@bowrivercapital.com (NOT VERIFIED). Also: John Raeder (Software), Matt Warta (Software), Ben Schnakenberg (PE).', // L: Notes
      '', // M: Company Info URL
      '4' // N: Gumbo Score
    ],
    [
      'Littlejohn & Co.',
      '',
      'Michael Klein',
      'Managing Partner & CEO',
      'mklein@littlejohnllc.com',
      'https://littlejohnllc.com',
      'https://littlejohnllc.com/team/michael-klein/',
      'Industrial, services, special situations',
      'Mid-market PE, complex situations, transformational growth',
      'Enriched',
      '',
      'Research added 2026-03-11. Co-founded 1996. 25+ years experience. Email pattern inferred: [first initial][last]@littlejohnllc.com (NOT VERIFIED). Also: Steven Raich (MP), Antonio Miranda (MP).',
      '',
      '5'
    ],
    [
      'CORE Industrial Partners',
      '',
      'John May',
      'Founder and Managing Partner',
      'john@coreipfund.com',
      'https://coreipfund.com',
      'N/A',
      'Manufacturing, industrial technology, industrial services',
      'Lower middle-market industrial businesses',
      'Enriched',
      '',
      'Research added 2026-03-11. $1.58B+ AUM. Offices: Chicago, Austin, Cleveland. Email pattern: [first]@coreipfund.com (from LeadIQ). Also: Ronald Rascia (MD).',
      '',
      '5'
    ]
  ];
  
  // Append the new firms
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `Sheet1!A${nextRow}`,
    valueInputOption: 'RAW',
    resource: {
      values: newFirms
    }
  });
  
  console.log('✅ Added 3 new PE firms:\n');
  console.log('1. Bow River Capital');
  console.log('   Contact: Greg Hiatrides, Managing Director, Private Equity');
  console.log('   Email: ghiatrides@bowrivercapital.com (inferred, not verified)');
  console.log('   AUM: ~$2.5B\n');
  
  console.log('2. Littlejohn & Co.');
  console.log('   Contact: Michael Klein, Managing Partner & CEO');
  console.log('   Email: mklein@littlejohnllc.com (inferred, not verified)');
  console.log('   Founded: 1996\n');
  
  console.log('3. CORE Industrial Partners');
  console.log('   Contact: John May, Founder and Managing Partner');
  console.log('   Email: john@coreipfund.com (pattern from LeadIQ)');
  console.log('   AUM: $1.58B+\n');
  
  console.log('⚠️ Email addresses are inferred from patterns - verify before sending!');
  console.log('📊 All firms focused on mid-market services/industrial sectors');
}

addNewFirms().catch(console.error);
