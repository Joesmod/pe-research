const axios = require('axios');
const fs = require('fs');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Target companies needing enrichment
const companies = [
  "First Trust Capital Management L.P.",
  "Investment Management Partners",
  "King Street Capital Management",
  "Koinz Capital",
  "Kudu Investment Management, LLC",
  "Left Lane Capital",
  "Lowercarbon Capital",
  "Manulife | Comvest Credit Partners",
  "Mercury Fund",
  "Merit Capital Partners",
  "Millennium Bridge Capital",
  "Newflow Partners",
  "Next Sparc Growth Partners",
  "Notable Capital"
];

async function searchContacts(companyName) {
  try {
    console.log(`\nSearching for contacts at: ${companyName}`);
    
    const response = await axios.post(
      'https://api.apollo.io/api/v1/mixed_people/search',
      {
        q_organization_name: companyName,
        person_titles: [
          "CEO", "Chief Executive Officer",
          "Managing Partner", "General Partner", "Partner",
          "CTO", "Chief Technology Officer",
          "COO", "Chief Operating Officer",
          "Director of Technology", "Technology Director",
          "VP Technology", "VP Operations",
          "Head of Portfolio Operations",
          "Director of Business Development"
        ],
        per_page: 5,
        page: 1
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );
    
    const people = response.data.people || [];
    console.log(`Found ${people.length} potential contacts`);
    
    const results = [];
    
    for (const person of people) {
      const name = person.name || '';
      const title = person.title || '';
      const email = person.email || '';
      const linkedinUrl = person.linkedin_url || '';
      
      if (email && !email.includes('info@') && !email.includes('sales@')) {
        console.log(`  - ${name} (${title}): ${email}`);
        results.push({
          company: companyName,
          name,
          title,
          email,
          linkedinUrl,
          source: 'Apollo API'
        });
      }
    }
    
    return results;
    
  } catch (error) {
    console.error(`Error searching ${companyName}:`, error.response?.data || error.message);
    return [];
  }
}

async function enrichBatch() {
  const allResults = [];
  
  for (const company of companies) {
    const contacts = await searchContacts(company);
    allResults.push(...contacts);
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`\n\nTotal contacts found: ${allResults.length}`);
  
  fs.writeFileSync('apollo-enriched-march6-706am.json', JSON.stringify(allResults, null, 2));
  
  return allResults;
}

enrichBatch().catch(console.error);
