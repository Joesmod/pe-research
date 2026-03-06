const axios = require('axios');
const fs = require('fs');
const { google } = require('googleapis');
const key = require('./service-account.json');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function searchPeopleAtOrg(domain, orgName) {
  try {
    const response = await axios.post(
      'https://api.apollo.io/api/v1/mixed_people/api_search',
      {
        q_organization_domains: domain,
        page: 1,
        per_page: 10,
        person_titles: [
          'CEO', 'Chief Executive Officer',
          'Managing Director', 'Managing Partner',
          'Partner', 'General Partner', 'Operating Partner',
          'President', 'COO', 'Chief Operating Officer',
          'Director', 'VP'
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );

    if (response.data && response.data.people && response.data.people.length > 0) {
      // Return top result with valid email
      const people = response.data.people.filter(p => 
        p.email && 
        !p.email.includes('info@') && 
        !p.email.includes('contact@') &&
        !p.email.includes('sales@')
      );
      
      return people.slice(0, 3).map(p => ({
        name: p.name,
        title: p.title,
        email: p.email,
        linkedin: p.linkedin_url,
        organization: p.organization?.name
      }));
    }
    
    return [];
  } catch (error) {
    console.error(`Apollo error for ${domain}:`, error.response?.data || error.message);
    return [];
  }
}

async function updateSheet(rowIndex, updates) {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth });

  const range = `Sheet1!C${rowIndex}:J${rowIndex}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range,
    valueInputOption: 'RAW',
    resource: {
      values: [[
        updates.contactName || '',
        updates.title || '',
        updates.email || '',
        updates.website || '',
        updates.linkedin || '',
        '', '', // Sector Focus, Portfolio Companies (preserve existing)
        updates.status || 'Enriched - Apollo'
      ]]
    }
  });
}

async function main() {
  // Read targets
  const targets = JSON.parse(fs.readFileSync('enrichment-targets-8pm.json', 'utf8'));
  
  // Filter for legitimate PE firms (exclude search partners, training sites, etc.)
  const peFilters = [
    'search partners', 'wall street', 'wefunder', 'advisors', 'oasis', 'prep',
    'henkel', 'odyssey', 'jensen partners', 'loeb.nyc', 'rcp advisors',
    'scaleview', 'tap advisors', 'tau investment', 'victory capital'
  ];
  
  const legitPE = targets.filter(t => {
    const name = t.companyName.toLowerCase();
    return !peFilters.some(filter => name.includes(filter)) && 
           t.website && 
           t.website.startsWith('http');
  });

  console.log(`\n=== ENRICHING ${Math.min(15, legitPE.length)} LEGITIMATE PE FIRMS ===\n`);

  const enriched = [];
  const failed = [];

  for (let i = 0; i < Math.min(15, legitPE.length); i++) {
    const lead = legitPE[i];
    console.log(`\n[${i + 1}/15] ${lead.companyName}`);
    
    // Extract domain from website
    let domain = '';
    try {
      const url = new URL(lead.website);
      domain = url.hostname.replace('www.', '');
    } catch (e) {
      console.log(`  ❌ Invalid website URL`);
      failed.push({ ...lead, reason: 'Invalid URL' });
      continue;
    }

    console.log(`  Domain: ${domain}`);
    
    // Search Apollo
    const people = await searchPeopleAtOrg(domain, lead.companyName);
    
    if (people.length > 0) {
      const topPerson = people[0];
      console.log(`  ✅ Found: ${topPerson.name} - ${topPerson.title}`);
      console.log(`     Email: ${topPerson.email}`);
      
      // Update sheet
      await updateSheet(lead.rowIndex, {
        contactName: topPerson.name,
        title: topPerson.title,
        email: topPerson.email,
        website: lead.website,
        linkedin: topPerson.linkedin || lead.linkedin,
        status: 'Enriched - Apollo'
      });
      
      enriched.push({
        ...lead,
        ...topPerson
      });
      
      // Rate limit: wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else {
      console.log(`  ⚠️ No decision-makers found`);
      failed.push({ ...lead, reason: 'No contacts found in Apollo' });
    }
  }

  console.log(`\n\n=== ENRICHMENT SUMMARY ===`);
  console.log(`✅ Successfully enriched: ${enriched.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  
  // Save results
  fs.writeFileSync('enrichment-results-8pm.json', JSON.stringify({
    enriched,
    failed,
    timestamp: new Date().toISOString()
  }, null, 2));
  
  console.log(`\nResults saved to enrichment-results-8pm.json`);
}

main().catch(console.error);
