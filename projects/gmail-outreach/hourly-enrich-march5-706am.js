const { google } = require('googleapis');
const axios = require('axios');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Firms to enrich this run - first 10 from the active targets
const firms = [
  { row: 626, company: 'Jett Capital Advisors', website: 'http://www.jettcapital.com' },
  { row: 666, company: 'RCP Advisors', website: '', email: 'info@ribbitcap.com' },
  { row: 696, company: '3G Capital', website: 'http://www.3g-capital.com' },
  { row: 699, company: 'Alta Park Capital, LP', website: 'http://www.altaparkcapital.com' },
  { row: 702, company: 'Ancor Capital Partners', website: 'http://www.ancorcapital.com' },
  { row: 706, company: 'Arctaris Impact Investors', website: 'http://www.arctaris.com' },
  { row: 710, company: 'Atlanta Capital Management Co., LLC', website: 'http://www.atlcap.com' },
  { row: 711, company: 'Atlantic Street Capital Advisors, Inc.', website: 'http://www.atlanticstreetcapital.com' },
  { row: 714, company: 'BDT & MSD Partners', website: 'http://www.bdtmsd.com' },
  { row: 716, company: 'Bloom Equity Partners', website: 'http://www.bloomequitypartners.com' },
];

async function searchApollo(company, website) {
  try {
    const response = await axios.post(
      'https://api.apollo.io/v1/mixed_people/search',
      {
        organization_name: company,
        person_titles: [
          'Partner', 'Managing Partner', 'Operating Partner',
          'CEO', 'President', 'COO', 'CTO', 'CMO',
          'Director', 'VP', 'Vice President',
          'Principal', 'Managing Director'
        ],
        page: 1,
        per_page: 5,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': APOLLO_API_KEY,
        },
      }
    );

    if (response.data?.people && response.data.people.length > 0) {
      // Find best contact - prefer Partners, then C-level, then Directors
      const people = response.data.people;
      const partner = people.find(p => p.title?.toLowerCase().includes('partner'));
      const cLevel = people.find(p => /\b(ceo|president|coo|cto|cmo)\b/i.test(p.title));
      const director = people.find(p => p.title?.toLowerCase().includes('director'));
      
      const best = partner || cLevel || director || people[0];
      
      if (best.email) {
        return {
          name: best.name,
          title: best.title,
          email: best.email,
          linkedin: best.linkedin_url || '',
          source: 'Apollo API'
        };
      }
    }
  } catch (error) {
    console.error(`Apollo error for ${company}:`, error.response?.data || error.message);
  }
  return null;
}

async function updateSheet(updates) {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  for (const update of updates) {
    const { row, contactName, title, email, linkedin, status, notes } = update;
    
    // Update columns: D=ContactName, E=Title, F=Email, J=LinkedIn, K=Status, L=Notes
    const range = `Sheet1!D${row}:L${row}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range,
      valueInputOption: 'RAW',
      resource: {
        values: [[contactName, title, email, '', '', '', linkedin, status, notes]],
      },
    });
    console.log(`✓ Updated row ${row}: ${contactName} at ${update.company}`);
  }
}

async function main() {
  console.log('🔍 PE Enrichment - Hourly Run - March 5, 7:06 AM\n');
  
  const updates = [];
  const findings = [];
  
  // Mark Keltic as dead (acquired by Ares)
  updates.push({
    row: 117,
    company: 'Keltic Financial Partners',
    contactName: '',
    title: '',
    email: '',
    linkedin: '',
    status: 'Dead',
    notes: 'Acquired by Ares Management ~2014'
  });
  findings.push('❌ Keltic Financial Partners: Acquired by Ares Management (Dead)');
  
  for (const firm of firms) {
    console.log(`\nSearching: ${firm.company}...`);
    
    const result = await searchApollo(firm.company, firm.website);
    
    if (result) {
      updates.push({
        row: firm.row,
        company: firm.company,
        contactName: result.name,
        title: result.title,
        email: result.email,
        linkedin: result.linkedin,
        status: 'Enriched',
        notes: `Found via ${result.source}`
      });
      findings.push(`✅ ${firm.company}: ${result.name} (${result.title}) - ${result.email}`);
    } else {
      findings.push(`⚠️  ${firm.company}: No verified contact found`);
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('ENRICHMENT RESULTS');
  console.log('='.repeat(60));
  findings.forEach(f => console.log(f));
  
  if (updates.length > 0) {
    console.log(`\n📝 Updating ${updates.length} rows in Google Sheet...`);
    await updateSheet(updates);
    console.log('✅ Sheet updated successfully!');
  }
  
  console.log(`\n📊 Summary: ${updates.filter(u => u.status === 'Enriched').length} enriched, 1 marked dead, ${firms.length - updates.length + 1} need manual research`);
}

main().catch(console.error);
