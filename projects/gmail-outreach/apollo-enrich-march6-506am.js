const fs = require('fs');
const https = require('https');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Read enrichment needs
let rawData = fs.readFileSync('enrichment-needs-march6-506am.json', 'utf8');
if (rawData.charCodeAt(0) === 0xFEFF) {
  rawData = rawData.slice(1);
}
const firms = JSON.parse(rawData);

console.log(`Loaded ${firms.length} firms needing enrichment`);

// Take first 10 for this batch
const batch = firms.slice(0, 10);

const enrichedResults = [];
const failedResults = [];

async function searchApolloOrganization(companyName, domain) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      api_key: APOLLO_API_KEY,
      q_organization_name: companyName,
      page: 1,
      per_page: 1
    });

    const options = {
      hostname: 'api.apollo.io',
      port: 443,
      path: '/v1/organizations/search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Cache-Control': 'no-cache'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function searchApolloContacts(organizationId, companyName) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      api_key: APOLLO_API_KEY,
      q_organization_ids: [organizationId],
      person_titles: [
        'CEO', 'Chief Executive Officer',
        'Managing Partner', 'Managing Director',
        'Partner', 'General Partner',
        'President',
        'COO', 'Chief Operating Officer',
        'VP Business Development',
        'VP Operations',
        'Director Business Development'
      ],
      page: 1,
      per_page: 5
    });

    const options = {
      hostname: 'api.apollo.io',
      port: 443,
      path: '/v1/mixed_people/search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Cache-Control': 'no-cache'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function enrichFirm(firm) {
  console.log(`\nEnriching: ${firm['Company Name']}`);
  
  try {
    // First, find the organization
    const orgSearch = await searchApolloOrganization(firm['Company Name'], firm['Website']);
    
    if (!orgSearch.organizations || orgSearch.organizations.length === 0) {
      console.log(`  ❌ Organization not found in Apollo`);
      failedResults.push({
        firm: firm['Company Name'],
        reason: 'Organization not found',
        row: firm._row
      });
      return;
    }

    const org = orgSearch.organizations[0];
    console.log(`  ✓ Found organization ID: ${org.id}`);

    // Search for contacts
    const contactSearch = await searchApolloContacts(org.id, firm['Company Name']);
    
    if (!contactSearch.people || contactSearch.people.length === 0) {
      console.log(`  ❌ No contacts found`);
      failedResults.push({
        firm: firm['Company Name'],
        reason: 'No contacts found',
        row: firm._row
      });
      return;
    }

    // Get first contact with verified email
    const contact = contactSearch.people.find(p => p.email && !p.email.includes('info@') && !p.email.includes('sales@'));
    
    if (!contact) {
      console.log(`  ❌ No verified direct emails found`);
      failedResults.push({
        firm: firm['Company Name'],
        reason: 'Only generic emails found',
        row: firm._row
      });
      return;
    }

    console.log(`  ✓ Found: ${contact.name} (${contact.title})`);
    console.log(`    Email: ${contact.email}`);
    console.log(`    LinkedIn: ${contact.linkedin_url || 'N/A'}`);

    enrichedResults.push({
      row: firm._row,
      companyName: firm['Company Name'],
      contactName: contact.name,
      title: contact.title,
      email: contact.email,
      linkedIn: contact.linkedin_url || '',
      source: 'Apollo API'
    });

  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    failedResults.push({
      firm: firm['Company Name'],
      reason: error.message,
      row: firm._row
    });
  }
  
  // Rate limiting: wait 2 seconds between requests
  await new Promise(resolve => setTimeout(resolve, 2000));
}

async function run() {
  console.log(`\n=== Starting Apollo enrichment batch ===\n`);
  
  for (const firm of batch) {
    await enrichFirm(firm);
  }

  console.log(`\n=== Enrichment Complete ===`);
  console.log(`Enriched: ${enrichedResults.length}`);
  console.log(`Failed: ${failedResults.length}`);

  // Save results
  fs.writeFileSync(
    'apollo-enriched-march6-506am.json',
    JSON.stringify(enrichedResults, null, 2)
  );
  
  fs.writeFileSync(
    'apollo-failed-march6-506am.json',
    JSON.stringify(failedResults, null, 2)
  );

  console.log(`\nResults saved to:`);
  console.log(`  - apollo-enriched-march6-506am.json`);
  console.log(`  - apollo-failed-march6-506am.json`);
}

run().catch(console.error);
