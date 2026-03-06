const axios = require('axios');
const { google } = require('googleapis');
const key = require('./service-account.json');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const auth = new google.auth.GoogleAuth({
  credentials: key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

// Manual research results from earlier web searches
const manualFindings = [
  { row: 673, company: 'Silvercrest Asset Management', 
    name: 'Richard R. Hough III', title: 'Chairman & CEO', 
    email: 'rhough@silvercrestgroup.com', 
    linkedin: 'https://www.linkedin.com/company/silvercrest-asset-management-group/',
    source: 'Official IR site' },
  
  { row: 683, company: 'TAU Investment Management',
    name: 'Oliver Niedermaier', title: 'CEO & Founder',
    email: 'info@tau-investment.com',
    linkedin: 'https://www.linkedin.com/in/oliver-niedermaier-26733a232/',
    source: 'Company website' },
  
  { row: 685, company: 'Tola Capital',
    name: 'Sheila Gulati', title: 'Managing Director',
    email: 'sheila@tolacapital.com',
    linkedin: 'https://www.linkedin.com/in/sheilagulati/',
    source: 'ContactOut/Company website' },
  
  { row: 688, company: 'Victory Capital',
    name: 'David C. Brown', title: 'Chairman & CEO',
    email: 'ir@vcm.com',
    linkedin: 'https://www.linkedin.com/company/victory-capital/',
    source: 'Investor Relations site' }
];

async function updateSheet(rowNum, contact) {
  const updates = [
    {
      range: `Sheet1!C${rowNum}`,
      values: [[contact.name]]
    },
    {
      range: `Sheet1!D${rowNum}`,
      values: [[contact.title]]
    },
    {
      range: `Sheet1!E${rowNum}`,
      values: [[contact.email]]
    },
    {
      range: `Sheet1!G${rowNum}`,
      values: [[contact.linkedin]]
    },
    {
      range: `Sheet1!J${rowNum}`,
      values: [['Enriched']]
    },
    {
      range: `Sheet1!L${rowNum}`,
      values: [[`Manual research ${new Date().toISOString().split('T')[0]} - ${contact.source}`]]
    }
  ];
  
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      data: updates,
      valueInputOption: 'RAW'
    }
  });
  
  console.log(`  ✓ Sheet updated (row ${rowNum})`);
}

// Additional firms to research via Apollo org search
const firmsToSearch = [
  { row: 679, company: 'Springboard Enterprises', website: 'sb.co' },
  { row: 682, company: 'TAP Advisors', website: 'tapadvisors.com' },
  { row: 686, company: 'Traction Capital', website: 'tractioncapital.com' },
  { row: 687, company: 'Valiant Capital Management', website: 'valiantcapital.com' },
  { row: 689, company: 'Virtas Partners', website: 'virtaspartners.com' },
  { row: 693, company: 'Yellow Wood Partners', website: 'yellowwoodpartners.com' },
  { row: 694, company: 'Yellowstone Capital Partners', website: 'yellowstonecp.com' },
  { row: 695, company: '3 Rivers Capital', website: '3riverscap.com' }
];

async function searchApolloOrg(companyName) {
  try {
    const response = await axios.post('https://api.apollo.io/v1/organizations/search', {
      q_organization_name: companyName,
      page: 1,
      per_page: 1
    }, {
      headers: {
        'X-Api-Key': APOLLO_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    const orgs = response.data?.organizations || [];
    if (orgs.length > 0) {
      return orgs[0];
    }
    return null;
  } catch (error) {
    console.error(`  Apollo org search error: ${error.message}`);
    return null;
  }
}

async function searchApolloPeople(orgId) {
  try {
    const response = await axios.post('https://api.apollo.io/v1/mixed_people/search', {
      organization_ids: [orgId],
      person_titles: [
        'Managing Partner', 'Partner', 'Managing Director', 'Principal', 
        'CEO', 'COO', 'CTO', 'CFO', 'President', 'Chairman'
      ],
      page: 1,
      per_page: 10
    }, {
      headers: {
        'X-Api-Key': APOLLO_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    const people = response.data?.people || [];
    
    // Filter valid emails
    const validPeople = people.filter(p => {
      return p.email && !p.email.match(/^(info@|sales@|contact@|ir@|admin@|support@)/i);
    });
    
    return validPeople[0] || null;
  } catch (error) {
    console.error(`  Apollo people search error: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('PE Research & Enrichment Cron - March 4, 2026 09:38 AM (v2)');
  console.log('='.repeat(70));
  
  let enriched = 0;
  
  // First, update manual findings
  console.log('\n--- MANUAL RESEARCH RESULTS ---\n');
  for (const finding of manualFindings) {
    console.log(`[${finding.company}]`);
    console.log(`  ${finding.name} - ${finding.title}`);
    console.log(`  Email: ${finding.email}`);
    console.log(`  Source: ${finding.source}`);
    
    await updateSheet(finding.row, finding);
    enriched++;
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Then search Apollo for remaining firms
  console.log('\n--- APOLLO API SEARCH ---\n');
  for (const firm of firmsToSearch) {
    if (enriched >= 15) break;
    
    console.log(`[${firm.company}]`);
    
    const org = await searchApolloOrg(firm.company);
    if (!org) {
      console.log(`  ✗ Organization not found in Apollo`);
      continue;
    }
    
    console.log(`  Found org ID: ${org.id}`);
    
    const person = await searchApolloPeople(org.id);
    if (!person) {
      console.log(`  ✗ No valid contacts found`);
      continue;
    }
    
    console.log(`  ✓ ${person.name} - ${person.title}`);
    console.log(`    Email: ${person.email}`);
    
    await updateSheet(firm.row, {
      name: person.name,
      title: person.title,
      email: person.email,
      linkedin: person.linkedin_url || '',
      source: 'Apollo API'
    });
    
    enriched++;
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n' + '='.repeat(70));
  console.log(`SUMMARY: ${enriched} firms enriched`);
  console.log('='.repeat(70));
}

main().catch(console.error);
