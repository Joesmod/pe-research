const { google } = require('googleapis');
const key = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// New firms to add - mid-market PE with services focus
const newFirms = [
  {
    company: 'Renovus Capital Partners',
    website: 'https://renovuscapital.com',
    sector: 'Knowledge & Talent: Education, Healthcare Services, Technology Services, Professional Services',
    aum: '$2B+ AUM',
    portfolio: '30+ companies',
    status: 'New - Unresearched',
    notes: 'Lower middle market PE. Founded 2010. Philadelphia area. Specializes in education/training, healthcare services, tech services, professional services. Target EBITDA $3M+, EV $10-200M. Often first institutional capital. 2026-03-09 added'
  },
  {
    company: 'Linsalata Capital Partners',
    website: 'https://www.linsalatacapital.com',
    sector: 'Broad middle market',
    aum: '',
    portfolio: '',
    status: 'New - Unresearched',
    notes: 'Middle-market buyout firm. Cleveland-based. Targets $15-50M equity investments, companies with $5M+ EBITDA. Broad industry focus. 2026-03-09 added'
  },
  {
    company: 'High Road Capital Partners',
    website: 'https://highroadcapital.com',
    sector: 'Business Services, Healthcare Services',
    aum: '$1B+ AUM',
    portfolio: '',
    status: 'New - Unresearched',
    notes: 'Lower middle market PE. New York-based. Focus on business services, healthcare services. Platform-driven growth strategy. Target EBITDA $3-15M. 2026-03-09 added'
  },
  {
    company: 'Pharos Capital Group',
    website: 'https://www.pharosfunds.com',
    sector: 'Healthcare, Business Services, Industrials',
    aum: '$3B+ AUM',
    portfolio: '50+ companies',
    status: 'New - Unresearched',
    notes: 'Middle market PE. Nashville-based. Healthcare, business services, industrials. Focus on founder-owned and family businesses. EBITDA $5-20M. Strong Southeast presence. 2026-03-09 added'
  },
  {
    company: 'Shoreview Capital',
    website: 'https://shoreviewcapital.com',
    sector: 'Business Services, Healthcare',
    aum: '$2B+ AUM',
    portfolio: '',
    status: 'New - Unresearched',
    notes: 'Middle market PE. Minneapolis-based. Focus on business services and healthcare. Control investments in companies with $10-50M revenue. Add-on acquisition focus. 2026-03-09 added'
  }
];

async function main() {
  console.log('=== Adding New PE Firms to Sheet ===\n');
  console.log(`Adding ${newFirms.length} mid-market PE firms...\n`);
  
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  
  // Read current sheet to find the next available row
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:M'
  });
  
  const rows = res.data.values || [];
  const nextRow = rows.length + 1;
  
  console.log(`Current rows: ${rows.length}`);
  console.log(`Starting at row: ${nextRow}\n`);
  
  // Prepare data for batch append
  const newRows = newFirms.map(firm => {
    return [
      firm.company,              // A: Company Name
      '',                        // B: NotebookLM
      '',                        // C: Contact Name
      '',                        // D: Title
      '',                        // E: Email
      firm.website,              // F: Website
      '',                        // G: LinkedIn
      firm.sector,               // H: Sector Focus
      firm.portfolio,            // I: Portfolio Companies
      firm.status,               // J: Status
      '',                        // K: Last Contacted
      firm.notes,                // L: Notes
      ''                         // M: Company Info URL
    ];
  });
  
  // Append new rows
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:M',
    valueInputOption: 'RAW',
    resource: {
      values: newRows
    }
  });
  
  console.log('✅ Successfully added:\n');
  newFirms.forEach((firm, i) => {
    console.log(`${i + 1}. ${firm.company}`);
    console.log(`   Website: ${firm.website}`);
    console.log(`   Sector: ${firm.sector}`);
    console.log(`   Notes: ${firm.aum || 'Mid-market'}\n`);
  });
  
  console.log(`\n📊 Sheet now contains ${rows.length + newFirms.length} total firms`);
  console.log('\n⏭️  Next step: Research these firms to find decision-maker contacts');
}

main().catch(console.error);
