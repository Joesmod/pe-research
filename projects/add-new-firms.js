const {google} = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// New firms to add - all mid-market PE with services focus, $500M-$5B AUM
// Only adding firms I can confirm exist with verifiable info
const NEW_FIRMS = [
  {
    company: 'Arsenal Capital Partners',
    contact: 'Christine Livingston',
    title: 'Director, AI and Data Analytics',
    email: '', // No email found yet - needs Apollo or PR verification
    website: 'https://www.arsenalcapital.com',
    linkedin: 'https://www.linkedin.com/company/arsenal-capital-partners',
    sector: 'Healthcare, Industrial Growth, Specialty Industrials',
    portfolio: 'ADB Companies, AmeriLife, Paradigm, Environmental Solutions Group',
    notes: 'NEW 2026-02-24. NYC. Mid-market PE. Has dedicated AI & Data Analytics team (Christine Livingston, joined 2025 from Protiviti). Jeff Christensen (Dir Product & Digital Innovation). Michael McLean (Dir IT). Joelle Marquis (President/Sr Partner). Terry Mullen (Managing Partner). Steve McLean (Senior Partner). Patricia Grad (Partner, Head of IR). Large team (80+). Healthcare + Industrial Growth verticals. NEEDS EMAIL - no emails published on arsenalcapital.com.',
    score: '9'
  },
  {
    company: 'Centre Partners',
    contact: '',
    title: '',
    email: '', // info@centrepartners.com is generic
    website: 'https://www.centrepartners.com',
    linkedin: 'https://www.linkedin.com/company/centre-partners',
    sector: 'Business Services, Consumer, Industrial',
    portfolio: 'Mid-market services companies',
    notes: 'NEW 2026-02-24. NYC/LA. Mid-market PE. Only generic email (info@centrepartners.com via Cloudflare protection). Has Centre Operating Partners team. NEEDS ENRICHMENT.',
    score: '6'
  },
  {
    company: 'Odyssey Investment Partners',
    contact: '',
    title: '',
    email: '',
    website: 'https://www.odysseyinvestment.com',
    linkedin: 'https://www.linkedin.com/company/odyssey-investment-partners',
    sector: 'Industrial Manufacturing, Industrial Services, Business Services',
    portfolio: '$100M-$1B investments, industrial and business services',
    notes: 'NEW 2026-02-24. Mid-market PE. Sectors: aerospace/defense, building products, human capital mgmt, insurance/benefits services, technology/digital services, pharma/biotech services. $100-300M per investment. EBITDA $20M+. NEEDS ENRICHMENT.',
    score: '7'
  },
  {
    company: 'Leeds Equity Partners',
    contact: 'Jeffrey Leeds',
    title: 'Managing Partner',
    email: 'jeffrey.leeds@leedsequity.com',
    website: 'https://www.leedsequity.com',
    linkedin: 'https://www.linkedin.com/in/jeffrey-leeds-a1187bb/',
    sector: 'Knowledge Industries, Education, Information Services, Professional Services',
    portfolio: 'BBMA, various education/info services cos',
    notes: 'ALREADY IN SHEET ROW 135 - SKIP',
    score: '2'
  },
];

async function run() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'projects/gmail-outreach/service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  
  // Check existing
  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID, range: 'Sheet1!A2:A300'
  });
  const names = new Set((existing.data.values || []).map(r => r[0]?.toLowerCase().trim()));
  
  const toAdd = NEW_FIRMS.filter(f => !names.has(f.company.toLowerCase().trim()) && !f.notes.includes('SKIP'));
  
  if (toAdd.length === 0) {
    console.log('No new firms to add (all duplicates or skipped)');
    return;
  }
  
  const rows = toAdd.map(f => [
    f.company, f.contact, f.title, f.email,
    f.website, f.linkedin, f.sector, f.portfolio,
    f.email ? 'Enriched' : 'Needs Enrichment',
    '', // last contacted
    f.notes,
    '', // company info url
    f.score
  ]);
  
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:M',
    valueInputOption: 'RAW',
    requestBody: { values: rows }
  });
  
  console.log(`Added ${toAdd.length} new firms:`);
  for (const f of toAdd) {
    console.log(`  + ${f.company} | ${f.contact || 'TBD'} | Score: ${f.score}`);
  }
}

run().catch(e => console.error('FATAL:', e.message));
