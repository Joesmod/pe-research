const fs = require('fs');
const https = require('https');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

function apolloRequest(endpoint, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'api.apollo.io',
      path: endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error(`Failed to parse response: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function enrichFirm(company, website) {
  try {
    // Step 1: Find organization ID
    const companySearch = await apolloRequest('/api/v1/mixed_companies/search', {
      q_organization_name: company,
      page: 1,
      per_page: 1
    });

    if (!companySearch.organizations || companySearch.organizations.length === 0) {
      return { company, status: 'not_found', contacts: [] };
    }

    const orgId = companySearch.organizations[0].id;

    // Step 2: Search for people at organization with senior titles
    const peopleSearch = await apolloRequest('/api/v1/mixed_people/api_search', {
      organization_ids: [orgId],
      person_titles: [
        'Managing Partner', 'Partner', 'Managing Director', 'Principal',
        'Founder', 'CEO', 'President', 'VP', 'CTO', 'CIO', 'COO',
        'Chief Technology Officer', 'Chief Information Officer',
        'Operating Partner', 'Portfolio Operations'
      ],
      page: 1,
      per_page: 10
    });

    if (!peopleSearch.people || peopleSearch.people.length === 0) {
      return { company, status: 'no_people', contacts: [] };
    }

    // Step 3: Enrich each person to get verified emails
    const verifiedContacts = [];
    for (const person of peopleSearch.people) {
      try {
        await new Promise(resolve => setTimeout(resolve, 350)); // Rate limit
        
        const enriched = await apolloRequest('/api/v1/people/match', {
          id: person.id
        });

        if (enriched.person && enriched.person.email && enriched.person.email_status === 'verified') {
          verifiedContacts.push({
            name: enriched.person.name,
            title: enriched.person.title,
            email: enriched.person.email,
            linkedin: enriched.person.linkedin_url
          });
        }
      } catch (enrichErr) {
        console.error(`  Enrich error for ${person.id}:`, enrichErr.message);
      }
    }

    return {
      company,
      status: verifiedContacts.length > 0 ? 'success' : 'no_verified',
      contacts: verifiedContacts
    };

  } catch (err) {
    return { company, status: 'error', error: err.message, contacts: [] };
  }
}

async function main() {
  const firms = JSON.parse(fs.readFileSync('firms-for-additional-contacts.json', 'utf8'));
  
  console.log(`Starting Apollo verified-only enrichment for ${firms.length} firms...`);
  console.log('Filtering to VERIFIED emails only (no pattern-matched or likely).\n');

  const results = [];
  let successCount = 0;
  let verifiedEmailCount = 0;

  // Process in batches of 10 to avoid overwhelming the API
  for (let i = 0; i < Math.min(50, firms.length); i++) {
    const firm = firms[i];
    console.log(`[${i + 1}/50] Enriching ${firm.company}...`);
    
    const result = await enrichFirm(firm.company, firm.website);
    results.push(result);

    if (result.status === 'success') {
      successCount++;
      verifiedEmailCount += result.contacts.length;
      console.log(`  ✅ Found ${result.contacts.length} verified contacts`);
    } else {
      console.log(`  ❌ ${result.status}`);
    }
  }

  console.log(`\n=== RESULTS (First 50 firms) ===`);
  console.log(`Firms processed: 50`);
  console.log(`Firms with verified contacts: ${successCount}`);
  console.log(`Total verified emails found: ${verifiedEmailCount}`);
  console.log(`Hit rate: ${((successCount / 50) * 100).toFixed(1)}%`);
  console.log(`Avg contacts per successful firm: ${successCount > 0 ? (verifiedEmailCount / successCount).toFixed(1) : 0}`);

  fs.writeFileSync('apollo-verified-results.json', JSON.stringify(results, null, 2));
  console.log(`\nResults saved to apollo-verified-results.json`);
}

main().catch(console.error);
