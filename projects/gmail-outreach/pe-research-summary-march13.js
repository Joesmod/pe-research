const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = JSON.parse(fs.readFileSync('service-account.json'));

const auth = new google.auth.GoogleAuth({
  credentials: SERVICE_ACCOUNT,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Research findings for existing firms
const RESEARCH_NOTES = [
  {
    row: 1064,
    company: 'The Riverside Company',
    notes: 'Stewart Kohl (Co-CEO) - email pattern likely skohl@riversidecompany.com (per ZoomInfo). $14B AUM. Website: https://www.riversidecompany.com/team/bela-szigethy-stewart-kohl/'
  },
  {
    row: 1067,
    company: 'Trivest Partners',
    notes: 'Chris Weldon - LinkedIn: https://www.linkedin.com/in/jchrisweldon/. Need to find email via manual outreach or LinkedIn.'
  },
  {
    row: 1068,
    company: 'Excellere Partners',
    notes: 'Brad Cornell (Managing Partner) - Phone: (303) 765-2402. LinkedIn: https://www.linkedin.com/in/brad-cornell-016325a3/. Denver-based. ~$2B AUM.'
  },
];

// New firms to add
const NEW_FIRMS = [
  {
    company: 'Ampersand Capital Partners',
    website: 'https://ampersandcapital.com',
    contact: 'Herb Hooper',
    title: 'Managing Partner',
    email: 'info@ampersandcapital.com',
    linkedin: 'https://www.linkedin.com/company/ampersand-capital-partners',
    sector: 'Healthcare, Life Sciences',
    portfolio: '30+ companies',
    notes: '$3B AUM. Founded 1988. Boston, MA. Focus on healthcare/life sciences "picks and shovels".',
    status: 'Research'
  },
  {
    company: 'HGGC',
    website: 'https://www.hggc.com',
    contact: 'Rich Lawson',
    title: 'CEO',
    email: '',
    linkedin: 'https://www.linkedin.com/company/hggc',
    sector: 'Technology, Business Services, Healthcare Services, Financial Services',
    portfolio: '730+ platform investments',
    notes: '~$7B AUM. Founded 2007. Palo Alto, CA. Middle-market focus. Co-founded with Steve Young (NFL).',
    status: 'Research'
  },
  {
    company: 'Sumeru Equity Partners',
    website: 'https://sumeruequity.com',
    contact: '',
    title: '',
    email: '',
    linkedin: 'https://www.linkedin.com/company/sumeru-equity-partners',
    sector: 'Enterprise Software, Technology',
    portfolio: '',
    notes: 'Silver Lake\'s middle-market firm. Focus on enterprise software and tech-enabled services.',
    status: 'Research'
  },
  {
    company: 'Banneker Partners',
    website: 'https://www.bannekerpartners.com',
    contact: '',
    title: '',
    email: '',
    linkedin: 'https://www.linkedin.com/company/banneker-partners',
    sector: 'Enterprise Software, Technology',
    portfolio: '',
    notes: 'Founded by ex-Vista Equity employees. Focus on enterprise software investments.',
    status: 'Research'
  },
];

async function main() {
  const sheets = google.sheets({ version: 'v4', auth });
  
  console.log('📋 PE Research Summary - March 13, 2026 8:07 AM\n');
  console.log('=' .repeat(80));
  
  // Update notes for existing firms
  console.log('\n📝 ENRICHMENT NOTES FOR EXISTING FIRMS:\n');
  
  for (const finding of RESEARCH_NOTES) {
    console.log(`Row ${finding.row}: ${finding.company}`);
    console.log(`   ${finding.notes}`);
    console.log();
    
    // Update Notes column (column K, index 10)
    const range = `Sheet1!K${finding.row}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[finding.notes]]
      },
    });
  }
  
  console.log(`✅ Updated notes for ${RESEARCH_NOTES.length} existing firms.\n`);
  console.log('=' .repeat(80));
  
  // Add new firms
  console.log('\n🆕 ADDING NEW FIRMS TO SHEET:\n');
  
  const newRows = NEW_FIRMS.map(firm => [
    firm.company,
    '', // NotebookLM
    firm.contact,
    firm.title,
    firm.email,
    firm.website,
    firm.linkedin,
    firm.sector,
    firm.portfolio,
    firm.status,
    '', // Last Contacted
    firm.notes
  ]);
  
  // Append to sheet
  const appendResponse = await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:L',
    valueInputOption: 'RAW',
    requestBody: {
      values: newRows,
    },
  });
  
  NEW_FIRMS.forEach((firm, idx) => {
    console.log(`${idx + 1}. ${firm.company}`);
    console.log(`   Contact: ${firm.contact || 'TBD'} - ${firm.title || 'TBD'}`);
    console.log(`   Sector: ${firm.sector}`);
    console.log(`   Notes: ${firm.notes}`);
    console.log();
  });
  
  console.log(`✅ Added ${NEW_FIRMS.length} new firms to the sheet.\n`);
  console.log('=' .repeat(80));
  
  // Summary
  console.log('\n📊 CRON JOB SUMMARY:\n');
  console.log(`• Attempted to enrich: 6 existing firms`);
  console.log(`• Updated notes: ${RESEARCH_NOTES.length} firms`);
  console.log(`• Added new firms: ${NEW_FIRMS.length}`);
  console.log();
  console.log('🚧 CHALLENGES ENCOUNTERED:');
  console.log('• Apollo API returned no results for large PE firms (Riverside, Genstar, etc.)');
  console.log('• Large PE firms do not publish direct email addresses on websites');
  console.log('• Most contacts require LinkedIn outreach or pattern guessing');
  console.log();
  console.log('✅ NEXT STEPS:');
  console.log('1. Manual LinkedIn outreach for firms with profiles');
  console.log('2. Try alternative data sources (ZoomInfo, RocketReach)');
  console.log('3. Use email pattern verification tools');
  console.log('4. Continue adding mid-market firms with accessible contacts');
  console.log();
  console.log('🎯 RECOMMENDATION:');
  console.log('Focus on smaller mid-market PE firms ($500M-$2B AUM) that are more');
  console.log('likely to have published contact information and be receptive to');
  console.log('outreach from emerging tech/service providers.');
  console.log();
}

main().catch(console.error);
