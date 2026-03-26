const { google } = require('googleapis');

const enrichments = [
  {
    company: 'Satori Capital',
    contactName: 'Chad Cook',
    title: 'Director of Business Development',
    email: 'ccook@satoricapital.com',
    linkedin: 'https://www.linkedin.com/in/chadbcook/',
    status: 'Enriched',
    notes: 'RocketReach verified. Business development contact for mid-market PE firm.'
  },
  {
    company: 'HealthQuest Capital',
    contactName: 'Garheng Kong',
    title: 'Founder and Managing Partner',
    email: 'gkong@hqcap.com',
    linkedin: 'https://www.linkedin.com/in/garhengkong/',
    status: 'Enriched',
    notes: 'ContactOut verified. Top 25 Healthcare Investor (GrowthCap 2024).'
  },
  {
    company: 'HOF Capital',
    contactName: 'Hisham Elhaddad',
    title: 'Co-Founder and Managing Partner',
    email: 'helhaddad@hofvc.com',
    linkedin: '',
    status: 'Enriched',
    notes: 'RocketReach verified (h******@hofvc.com). Global VC with PE characteristics.'
  },
  {
    company: 'Hildred Capital',
    contactName: 'David Solomon',
    title: 'Co-Founder and Managing Partner',
    email: 'dsolomon@hildredcapital.com',
    linkedin: 'https://www.linkedin.com/in/david-solomon-6b679a93/',
    status: 'Enriched',
    notes: 'RocketReach + firm bio verified. Healthcare-focused PE, ~$500M AUM.'
  },
  {
    company: 'Hark Capital',
    contactName: 'Doug Cruikshank',
    title: 'Founder and Managing Partner',
    email: 'dcruikshank@harkcap.com',
    linkedin: 'https://www.linkedin.com/in/doug-cruikshank-hark/',
    status: 'Enriched',
    notes: 'RocketReach + firm website verified. NAV financing specialist, $2B+ deployed since 2013.'
  },
  {
    company: 'FirstMark',
    contactName: 'Rick Heitzmann',
    title: 'Co-Founder and Partner',
    email: 'rick@firstmarkcap.com',
    linkedin: 'https://www.linkedin.com/in/rickheitzmann/',
    status: 'Enriched',
    notes: 'ContactOut verified. Network-driven VC founded 2008, disruptive consumer/enterprise focus.'
  },
  {
    company: 'American Industrial Partners',
    contactName: 'Kim Marvin',
    title: 'General Partner',
    email: '',
    linkedin: 'https://americanindustrial.com/team/kim-marvin',
    status: 'Needs Email',
    notes: 'GP identified from firm team page. $7B+ AUM, industrial-focused PE.'
  },
  {
    company: 'Peak Rock Capital',
    contactName: 'Anthony DiSimone',
    title: 'Chief Executive Officer',
    email: '',
    linkedin: '',
    status: 'Needs Email',
    notes: 'CEO identified from team page. Middle-market PE, growth & performance improvement focus.'
  },
  {
    company: 'Salt Creek Capital',
    contactName: 'Eric Ragland',
    title: 'President',
    email: '',
    linkedin: '',
    status: 'Needs Email',
    notes: 'President identified, RocketReach shows only personal Gmail (unsuitable).'
  },
  {
    company: 'Warren Equity Partners',
    contactName: 'Dr. David K. Park',
    title: 'Managing Director, Head of AI & Strategy',
    email: '',
    linkedin: 'https://www.linkedin.com/in/davidchungpark/',
    status: 'Needs Email',
    notes: 'MD AI & Strategy identified. Also: Michael Synn (MD & CTO). Needs email verification.'
  }
];

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // First, read the current sheet to find row numbers
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:L',
  });
  
  const rows = result.data.values || [];
  const headers = rows[0];
  
  // Column indices (0-based)
  const companyCol = 0;    // A
  const contactCol = 2;     // C (Contact Name)
  const titleCol = 3;       // D (Title)
  const emailCol = 4;       // E (Email)
  const websiteCol = 5;     // F (Website)
  const linkedInCol = 6;    // G (LinkedIn)
  const statusCol = 9;      // J (Status)
  const notesCol = 11;      // L (Notes)
  
  const updates = [];
  
  for (const enrichment of enrichments) {
    // Find the row for this company
    const rowIndex = rows.findIndex((row, idx) => 
      idx > 0 && row[companyCol] === enrichment.company
    );
    
    if (rowIndex === -1) {
      console.log(`Company not found: ${enrichment.company}`);
      continue;
    }
    
    const rowNum = rowIndex + 1; // 1-based for Sheets API
    const existingRow = rows[rowIndex];
    
    // Only update if contact name is empty or matches
    if (!existingRow[contactCol] || existingRow[contactCol] === 'Not identified' || 
        existingRow[contactCol] === enrichment.contactName) {
      
      // Prepare update data
      const updateData = [
        existingRow[1] || '',          // B: NotebookLM (preserve)
        enrichment.contactName,        // C: Contact Name
        enrichment.title,              // D: Title
        enrichment.email,              // E: Email
        existingRow[5] || '',          // F: Website (preserve)
        enrichment.linkedin,           // G: LinkedIn
        existingRow[7] || '',          // H: Sector Focus (preserve)
        existingRow[8] || '',          // I: Portfolio Companies (preserve)
        enrichment.status,             // J: Status
        new Date().toISOString(),      // K: Last Contacted
        `${new Date().toISOString().split('T')[0]} enrichment: ${enrichment.notes}` // L: Notes
      ];
      
      updates.push({
        range: `Sheet1!B${rowNum}:L${rowNum}`,
        values: [updateData]
      });
      
      console.log(`✓ Prepared update for: ${enrichment.company} → ${enrichment.contactName}`);
    } else {
      console.log(`⊘ Skipping ${enrichment.company} - different contact already exists: ${existingRow[contactCol]}`);
    }
  }
  
  if (updates.length === 0) {
    console.log('No updates to apply.');
    return;
  }
  
  // Batch update
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    resource: {
      valueInputOption: 'RAW',
      data: updates
    }
  });
  
  console.log(`\n✅ Successfully updated ${updates.length} rows in the Google Sheet!`);
}

updateSheet().catch(err => {
  console.error('Error updating sheet:', err);
  process.exit(1);
});
