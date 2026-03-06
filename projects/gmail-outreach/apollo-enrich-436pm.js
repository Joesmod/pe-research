const https = require('https');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Search for people at a company
async function searchPeople(companyDomain, titles) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      api_key: APOLLO_API_KEY,
      q_organization_domains: companyDomain,
      person_titles: titles,
      page: 1,
      per_page: 10
    });

    const options = {
      hostname: 'api.apollo.io',
      path: '/v1/mixed_people/search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
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

// Main enrichment function
async function enrichFirm(company, domain) {
  console.log(`\n=== Enriching: ${company} (${domain}) ===`);
  
  const titles = [
    'CEO', 'CTO', 'COO', 'CFO', 'CMO',
    'Managing Partner', 'General Partner', 'Operating Partner',
    'Managing Director', 'Director',
    'VP Technology', 'VP Operations', 'VP Digital',
    'Head of Technology', 'Head of Digital', 'Head of Operations'
  ];
  
  try {
    const result = await searchPeople(domain, titles);
    
    if (result.people && result.people.length > 0) {
      console.log(`Found ${result.people.length} contacts:`);
      result.people.forEach((person, i) => {
        console.log(`\n${i + 1}. ${person.name}`);
        console.log(`   Title: ${person.title || 'N/A'}`);
        console.log(`   Email: ${person.email || 'Not available'}`);
        console.log(`   LinkedIn: ${person.linkedin_url || 'N/A'}`);
      });
      return result.people;
    } else {
      console.log('No contacts found');
      return [];
    }
  } catch (error) {
    console.error('Error:', error.message);
    return [];
  }
}

// Test with a few firms
async function main() {
  const firms = [
    { name: 'Regal Healthcare Capital Partners', domain: 'regalhcp.com' },
    { name: 'Alvarez & Marsal Capital', domain: 'a-mcapital.com' },
    { name: 'Casa Verde Capital', domain: 'casaverdecapital.com' }
  ];
  
  for (const firm of firms) {
    await enrichFirm(firm.name, firm.domain);
    // Small delay between requests
    await new Promise(r => setTimeout(r, 1000));
  }
}

main().catch(console.error);
