const { google } = require('googleapis');
const axios = require('axios');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

const targetsToEnrich = [
  { row: 222, company: 'Accel-KKR', domain: 'accel-kkr.com', currentContact: 'Tom Barnds' },
  { row: 766, company: 'Newflow Partners', domain: 'newflow.partners', currentContact: 'Jason Levine' },
  { row: 844, company: 'Wind Point Partners', domain: 'windpointpartners.com', currentContact: 'Nathan Brown' },
  { row: 862, company: 'The Riverside Company', domain: 'riversidecompany.com', currentContact: 'Stewart Kohl' },
  { row: 925, company: 'Wynnchurch Capital', domain: 'wynnchurch.com', currentContact: 'John Hatherly' },
  { row: 976, company: 'Trivest Partners', domain: 'trivest.com', currentContact: 'Forest Wester' },
  { row: 993, company: 'Gryphon Investors', domain: 'gryphoninvestors.com', currentContact: 'R. David Andrews' }
];

async function searchApollo(company, domain) {
  try {
    const response = await axios.post('https://api.apollo.io/v1/mixed_people/search', {
      q_organization_domains: domain,
      page: 1,
      per_page: 10,
      person_titles: [
        'CEO', 'CTO', 'COO', 'CMO', 'CFO',
        'Managing Partner', 'Managing Director', 'General Partner', 'Operating Partner',
        'Partner', 'Director', 'VP', 'Vice President',
        'Head of Technology', 'Head of Operations', 'Head of Digital',
        'Chief Digital Officer', 'Chief Technology Officer'
      ]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': APOLLO_API_KEY
      }
    });

    if (response.data && response.data.people && response.data.people.length > 0) {
      return response.data.people.slice(0, 3).map(person => ({
        name: person.name,
        title: person.title,
        email: person.email,
        linkedin: person.linkedin_url,
        source: 'Apollo API'
      }));
    }
    return [];
  } catch (error) {
    console.error(`Apollo search failed for ${company}:`, error.message);
    return [];
  }
}

async function enrichFirms() {
  const results = [];

  for (const target of targetsToEnrich) {
    console.log(`\n=== Researching: ${target.company} ===`);
    console.log(`Domain: ${target.domain}`);
    console.log(`Current contact: ${target.currentContact}`);

    // Try Apollo API
    const apolloResults = await searchApollo(target.company, target.domain);
    
    if (apolloResults.length > 0) {
      console.log(`\n✓ Found ${apolloResults.length} contacts via Apollo:`);
      apolloResults.forEach((contact, idx) => {
        console.log(`  ${idx + 1}. ${contact.name} - ${contact.title}`);
        console.log(`     Email: ${contact.email || 'Not available'}`);
        console.log(`     LinkedIn: ${contact.linkedin || 'Not available'}`);
      });

      results.push({
        row: target.row,
        company: target.company,
        contacts: apolloResults,
        status: 'Found via Apollo'
      });
    } else {
      console.log('✗ No contacts found via Apollo');
      results.push({
        row: target.row,
        company: target.company,
        contacts: [],
        status: 'Needs manual research'
      });
    }

    // Rate limit pause
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Save results
  const fs = require('fs');
  fs.writeFileSync('enrichment-results-march15-cron.json', JSON.stringify(results, null, 2));
  
  console.log('\n\n=== ENRICHMENT SUMMARY ===');
  console.log(`Total firms researched: ${results.length}`);
  const successful = results.filter(r => r.contacts.length > 0).length;
  console.log(`Successfully enriched: ${successful}`);
  console.log(`Needs manual research: ${results.length - successful}`);
  console.log('\nResults saved to enrichment-results-march15-cron.json');
}

enrichFirms().catch(console.error);
