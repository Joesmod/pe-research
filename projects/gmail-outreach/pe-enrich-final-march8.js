const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const credentials = JSON.parse(fs.readFileSync('service-account.json'));

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

// Final research findings from manual web research + Apollo attempts
const enrichments = [
  {
    row: 388,
    company: 'Aeris Partners',
    contactName: 'David Joncas',
    title: 'Co-Founder & Managing Director',
    email: 'dwj@aerispartners.com',
    linkedin: 'https://www.linkedin.com/in/david-joncas-206a0424/',
    notes: 'M&A advisory firm (not PE investor). Verified email from ContactOut. Tech-focused investment banking.',
    status: 'Enriched'
  },
  {
    row: 682,
    company: 'TAP Advisors',
    contactName: 'Karim Tabet',
    title: 'Founding Partner',
    email: 'ktabet@tapadvisors.com',
    linkedin: 'https://www.linkedin.com/in/karim-tabet-75352823/',
    notes: 'M&A advisory firm. TMT sector focus. Verified email from ContactOut. Phone: (212) 909-9010',
    status: 'Enriched'
  },
  {
    row: 724,
    company: 'Carmel Capital Partners',
    contactName: 'Russell Silberstein',
    title: 'Founder & Principal',
    email: '',
    linkedin: 'https://www.linkedin.com/in/russell-silberstein-8b5a667/',
    notes: 'Wealth management/RIA firm (not traditional PE). Phone: (858) 457-7544. Email domain likely @carmelcap.com but not publicly verified.',
    status: 'Partial'
  },
  {
    row: 708,
    company: 'ArrowMark Partners',
    contactName: 'Sanjai Bhonsle',
    title: 'Partner & Portfolio Manager',
    email: '',
    linkedin: 'https://www.linkedin.com/in/sanjai-bhonsle/',
    notes: 'Asset management firm, ~$24B AUM. Alternative credit & equity strategies. Founding partners: Corkins & Reidy. CEO info available on website.',
    status: 'Partial'
  },
  {
    row: 741,
    company: 'Essex Investment Management',
    contactName: 'Nancy Prial',
    title: 'Co-CEO',
    email: '',
    linkedin: 'https://www.linkedin.com/in/nancyprialcfa/',
    notes: 'Growth equity investment manager (public markets). Phone: (617) 342-3200. Stephen Cutler is President.',
    status: 'Partial'
  }
];

// Mark non-PE firms to skip
const nonPEFirms = [
  { row: 621, company: 'HSP - Henkel Search Partners', notes: 'Executive search firm, not PE' },
  { row: 654, company: 'Odyssey Search Partners', notes: 'Executive search firm, not PE' },
  { row: 737, company: 'Dynamics Search Partners', notes: 'Executive search firm, not PE' },
  { row: 630, company: 'Kinect Capital', notes: '501(c)(3) nonprofit accelerator, not PE' },
  { row: 704, company: 'Apercen Partners', notes: 'Tax consulting/wealth management firm, not PE' }
];

(async () => {
  console.log('=== PE ENRICHMENT CRON - FINAL UPDATE - March 8, 3:06 PM ===\n');
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  let updates = [];
  
  console.log('--- ENRICHED FIRMS (with verified emails) ---\n');
  
  for (const enrich of enrichments.filter(e => e.email)) {
    console.log(`Row ${enrich.row}: ${enrich.company}`);
    console.log(`  Contact: ${enrich.contactName}`);
    console.log(`  Title: ${enrich.title}`);
    console.log(`  Email: ${enrich.email}`);
    console.log(`  LinkedIn: ${enrich.linkedin}`);
    console.log(`  Notes: ${enrich.notes}\n`);
    
    // Column mapping: C=Contact, D=Title, E=Email, G=LinkedIn, J=Status
    updates.push({ range: `C${enrich.row}`, values: [[enrich.contactName]] });
    updates.push({ range: `D${enrich.row}`, values: [[enrich.title]] });
    updates.push({ range: `E${enrich.row}`, values: [[enrich.email]] });
    updates.push({ range: `G${enrich.row}`, values: [[enrich.linkedin]] });
    updates.push({ range: `J${enrich.row}`, values: [[enrich.status]] });
  }
  
  console.log('\n--- PARTIAL ENRICHMENTS (contact identified, no verified email) ---\n');
  
  for (const enrich of enrichments.filter(e => !e.email)) {
    console.log(`Row ${enrich.row}: ${enrich.company}`);
    console.log(`  Contact: ${enrich.contactName}`);
    console.log(`  Title: ${enrich.title}`);
    console.log(`  LinkedIn: ${enrich.linkedin}`);
    console.log(`  Notes: ${enrich.notes}\n`);
    
    updates.push({ range: `C${enrich.row}`, values: [[enrich.contactName]] });
    updates.push({ range: `D${enrich.row}`, values: [[enrich.title]] });
    updates.push({ range: `G${enrich.row}`, values: [[enrich.linkedin]] });
    updates.push({ range: `J${enrich.row}`, values: [[enrich.status]] });
  }
  
  console.log('\n--- NON-PE FIRMS (flagged for removal/re-evaluation) ---\n');
  
  for (const firm of nonPEFirms) {
    console.log(`Row ${firm.row}: ${firm.company}`);
    console.log(`  Note: ${firm.notes}\n`);
    
    updates.push({ range: `J${firm.row}`, values: [['Not PE - Review']] });
  }
  
  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    
    console.log(`\n✓ Applied ${updates.length} cell updates to Google Sheet`);
  }
  
  // Summary
  console.log('\n=== ENRICHMENT SUMMARY ===');
  console.log(`Total firms researched: ${enrichments.length + nonPEFirms.length}`);
  console.log(`Fully enriched (verified email): ${enrichments.filter(e => e.email).length}`);
  console.log(`Partially enriched (no email): ${enrichments.filter(e => !e.email).length}`);
  console.log(`Non-PE firms flagged: ${nonPEFirms.length}`);
  console.log('\nChallenges encountered:');
  console.log('- Many firms have no publicly published email addresses');
  console.log('- Apollo API requires credits to enrich/reveal contact data');
  console.log('- Several firms in sheet are not PE (search firms, accelerators, service providers)');
  console.log('\nRecommendations:');
  console.log('1. Consider upgrading Apollo API access for verified email enrichment');
  console.log('2. Clean sheet to remove non-PE firms');
  console.log('3. Focus outreach on fully enriched contacts first');
  console.log('4. For partial enrichments, attempt LinkedIn outreach or phone calls');
  
})().catch(console.error);
