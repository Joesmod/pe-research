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

// Target firms from find-enrich-targets-full.js results
const targetFirms = [
  { row: 673, company: 'Silvercrest Asset Management', domain: 'silvercrestgroup.com' },
  { row: 679, company: 'Springboard Enterprises', domain: 'sb.co' },
  { row: 682, company: 'TAP Advisors', domain: 'tapadvisors.com' },
  { row: 683, company: 'TAU Investment Management', domain: 'tau-investment.com' },
  { row: 685, company: 'Tola Capital', domain: 'tolacapital.com' },
  { row: 686, company: 'Traction Capital', domain: 'tractioncapital.com' },
  { row: 687, company: 'Valiant Capital Management', domain: 'valiantcapital.com' },
  { row: 688, company: 'Victory Capital', domain: 'vcm.com' },
  { row: 689, company: 'Virtas Partners', domain: 'virtaspartners.com' },
  { row: 690, company: 'Wall Street Oasis', domain: 'wallstreetoasis.com' },
  { row: 691, company: 'Wall Street Prep', domain: 'wallstreetprep.com' },
  { row: 692, company: 'Wefunder', domain: 'wefunder.com' },
  { row: 693, company: 'Yellow Wood Partners', domain: 'yellowwoodpartners.com' },
  { row: 694, company: 'Yellowstone Capital Partners', domain: 'yellowstonecp.com' },
  { row: 695, company: '3 Rivers Capital', domain: '3riverscap.com' }
];

async function searchApollo(companyName, domain) {
  try {
    console.log(`\n[${companyName}]`);
    
    // Search for people at the organization by domain
    const peopleResponse = await axios.get('https://api.apollo.io/v1/mixed_people/search', {
      params: {
        q_organization_domains: domain,
        person_titles: [
          'Managing Partner', 'Partner', 'Managing Director', 'Principal', 
          'CEO', 'COO', 'CTO', 'CFO', 'President', 'Chairman',
          'Director', 'VP', 'Vice President', 'Head of'
        ],
        page: 1,
        per_page: 10
      },
      headers: {
        'X-Api-Key': APOLLO_API_KEY
      }
    });
    
    const people = peopleResponse.data.people || [];
    console.log(`  Found ${people.length} contacts`);
    
    if (people.length === 0) {
      return null;
    }
    
    // Filter and prioritize
    const validPeople = people.filter(p => {
      return p.email && 
             !p.email.match(/^(info@|sales@|contact@|ir@|admin@|support@)/i);
    });
    
    // Sort by title priority
    const titlePriority = {
      'Managing Partner': 1,
      'Partner': 2,
      'CEO': 3,
      'Managing Director': 4,
      'President': 5,
      'COO': 6,
      'CFO': 7,
      'Principal': 8
    };
    
    validPeople.sort((a, b) => {
      const aPriority = titlePriority[a.title] || 99;
      const bPriority = titlePriority[b.title] || 99;
      return aPriority - bPriority;
    });
    
    const best = validPeople[0];
    if (best) {
      console.log(`  ✓ ${best.name} - ${best.title}`);
      console.log(`    Email: ${best.email}`);
      console.log(`    LinkedIn: ${best.linkedin_url || 'N/A'}`);
      return {
        name: best.name,
        title: best.title,
        email: best.email,
        linkedin: best.linkedin_url || ''
      };
    }
    
    return null;
  } catch (error) {
    if (error.response?.status === 429) {
      console.error(`  ⚠ Rate limit hit, waiting 60s...`);
      await new Promise(resolve => setTimeout(resolve, 60000));
      return searchApollo(companyName, domain);
    }
    console.error(`  Error: ${error.message}`);
    return null;
  }
}

async function updateSheet(rowNum, contact) {
  if (!contact) return;
  
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
      values: [[`Apollo enrichment ${new Date().toISOString().split('T')[0]}`]]
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

async function main() {
  console.log('PE Research & Enrichment Cron - March 4, 2026 09:36 AM');
  console.log('='.repeat(60));
  
  let enriched = 0;
  let failed = 0;
  
  for (const firm of targetFirms) {
    const contact = await searchApollo(firm.company, firm.domain);
    
    if (contact) {
      await updateSheet(firm.row, contact);
      enriched++;
    } else {
      failed++;
      console.log(`  ✗ No valid contact found`);
    }
    
    // Rate limiting: wait 2 seconds between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Stop after 15 enrichments
    if (enriched >= 15) {
      console.log('\n✓ Reached 15 enrichments, stopping.');
      break;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`SUMMARY:`);
  console.log(`  Enriched: ${enriched}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Total processed: ${enriched + failed}`);
  console.log('='.repeat(60));
}

main().catch(console.error);
