const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

// Enriched contact data - ONLY INCLUDE VERIFIED EMAILS FROM OFFICIAL SOURCES
const enrichments = [
  {
    company: 'Tenex Capital Management',
    contact: 'Stephens Johnson',
    title: 'Partner',
    email: 'sjohnson@tenexcm.com',
    linkedin: 'https://www.linkedin.com/company/tenex-capital',
    status: 'Enriched',
    notes: 'Email verified from official Tenex PDF tearsheet (June 2024)'
  },
  {
    company: 'Tenex Capital Management',
    contact: 'Kevin Doyle',
    title: 'Partner',
    email: 'kdoyle@tenexcm.com',
    linkedin: 'https://www.linkedin.com/company/tenex-capital',
    status: 'Enriched',
    notes: 'Email verified from official Tenex PDF tearsheet (June 2024)'
  },
  // Contacts found with strong LinkedIn presence - NO EMAIL (per strict instructions)
  {
    company: 'PSG',
    contact: 'Mark Hastings',
    title: 'CEO & Co-Founder',
    email: '',
    linkedin: 'https://www.linkedin.com/in/mark-hastings-482b2816',
    status: 'Needs Email',
    notes: 'Contact verified via LinkedIn & company website. Email pattern identified but not from official source.'
  },
  {
    company: 'Charlesbank Capital Partners',
    contact: 'Michael Choe',
    title: 'Managing Partner, CEO, Co-Head Flagship',
    email: '',
    linkedin: 'https://www.linkedin.com/in/michael-choe-220b128',
    status: 'Needs Email',
    notes: 'Contact verified via LinkedIn & Charlesbank website. Email pattern identified but not from official source.'
  },
  {
    company: 'New Water Capital',
    contact: 'Jason Neimark',
    title: 'Partner & Founder',
    email: '',
    linkedin: 'https://www.linkedin.com/in/jason-neimark',
    status: 'Needs Email',
    notes: 'Contact verified via company website & LinkedIn. Email pattern identified but not from official source.'
  },
  {
    company: 'Clearview Capital',
    contact: 'Bill Case',
    title: 'Managing Partner',
    email: '',
    linkedin: 'https://www.linkedin.com/company/clearview-capital',
    status: 'Needs Email',
    notes: 'Contact verified via Bloomberg & LinkedIn. Email pattern identified but not from official source.'
  },
  {
    company: 'Ronin Equity Partners',
    contact: 'David Feierstein',
    title: 'Co-Founder & Managing Partner',
    email: '',
    linkedin: 'https://www.linkedin.com/in/david-feierstein',
    status: 'Needs Email',
    notes: 'Contact verified via company website & LinkedIn. Email pattern identified but not from official source.'
  },
  {
    company: 'Soundcore Capital Partners',
    contact: 'Jarrett Turner',
    title: 'Founder & Managing Partner',
    email: '',
    linkedin: 'https://www.linkedin.com/in/jarrett-turner',
    status: 'Needs Email',
    notes: 'Contact verified via company website & LinkedIn. Email pattern identified but not from official source.'
  },
  {
    company: 'NewSpring Capital',
    contact: 'Michael DiPiano',
    title: 'Managing General Partner & Co-Founder',
    email: '',
    linkedin: 'https://www.linkedin.com/in/michael-dipiano',
    status: 'Needs Email',
    notes: 'Contact verified via company website & LinkedIn. Email pattern identified but not from official source.'
  },
  {
    company: 'Excellere Partners',
    contact: 'Brad Cornell',
    title: 'Managing Partner',
    email: '',
    linkedin: 'https://www.linkedin.com/in/brad-cornell-016325a3',
    status: 'Needs Email',
    notes: 'Contact verified via company website press releases. Email pattern identified but not from official source.'
  },
  {
    company: 'Platte River Equity',
    contact: 'Peter Calamari',
    title: 'Managing Director',
    email: '',
    linkedin: 'https://www.linkedin.com/in/peter-calamari',
    status: 'Needs Email',
    notes: 'Contact verified via company website. Email pattern identified but not from official source.'
  },
  {
    company: 'Bregal Sagemount',
    contact: 'Gene Yoon',
    title: 'Managing Partner & Co-Founder',
    email: '',
    linkedin: 'https://www.linkedin.com/in/gene-yoon',
    status: 'Needs Email',
    notes: 'Contact verified via company website & Wikipedia. Email pattern identified but not from official source.'
  },
  {
    company: 'Arsenal Capital Partners',
    contact: 'Joelle Marquis',
    title: 'President & Senior Partner',
    email: '',
    linkedin: 'https://www.linkedin.com/in/joelle-marquis',
    status: 'Needs Email',
    notes: 'Contact verified via company website. Email pattern identified but not from official source.'
  },
  {
    company: 'Cove Hill Partners',
    contact: 'Andrew Balson',
    title: 'Founder & Managing Partner',
    email: '',
    linkedin: 'https://www.linkedin.com/in/andrew-balson-246299b7',
    status: 'Needs Email',
    notes: 'Contact verified via company website & LinkedIn. Email pattern identified but not from official source.'
  }
];

async function getClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function batchEnrich() {
  const sheets = await getClient();
  
  // Read all data first
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1',
  });
  
  const rows = res.data.values || [];
  const header = rows[0];
  
  // Find column indices
  const companyIdx = header.indexOf('Company');
  const contactIdx = header.indexOf('Contact Name');
  const titleIdx = header.indexOf('Position/Title');
  const emailIdx = header.indexOf('Email');
  const linkedinIdx = header.indexOf('LinkedIn');
  const statusIdx = header.indexOf('Status');
  const notesIdx = header.indexOf('Notes');
  
  console.log('Column mapping:', { companyIdx, contactIdx, titleIdx, emailIdx, linkedinIdx, statusIdx, notesIdx });
  
  const updates = [];
  
  // Match enrichments to rows
  for (const enrich of enrichments) {
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rowCompany = row[companyIdx] || '';
      
      // Match company name (flexible matching)
      if (rowCompany.toLowerCase().includes(enrich.company.toLowerCase()) ||
          enrich.company.toLowerCase().includes(rowCompany.toLowerCase())) {
        
        const rowNum = i + 1; // 1-indexed for Sheets
        
        // Prepare update data
        const updateData = [...row]; // Copy existing row
        updateData[contactIdx] = enrich.contact;
        updateData[titleIdx] = enrich.title;
        updateData[emailIdx] = enrich.email;
        updateData[linkedinIdx] = enrich.linkedin;
        updateData[statusIdx] = enrich.status;
        updateData[notesIdx] = enrich.notes;
        
        updates.push({
          range: `Sheet1!A${rowNum}:${String.fromCharCode(65 + header.length - 1)}${rowNum}`,
          values: [updateData]
        });
        
        console.log(`Matched: ${enrich.company} -> Row ${rowNum}`);
        break; // Move to next enrichment after first match
      }
    }
  }
  
  console.log(`\nPrepared ${updates.length} updates`);
  
  if (updates.length > 0) {
    // Batch update
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: updates
      }
    });
    
    console.log('✅ Successfully enriched leads in Google Sheet');
  } else {
    console.log('⚠️  No matches found');
  }
}

batchEnrich().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
