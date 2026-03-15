const axios = require('axios');
const fs = require('fs');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

const targets = [
  {
    row: 49,
    company: "Apax Partners",
    contact_name: "Seth Brody",
    title: "Partner"
  },
  {
    row: 728,
    company: "Pritzker Group Private Capital",
    contact_name: "Ryan Roberts",
    title: "Investment Partner"
  },
  {
    row: 728,
    company: "Pritzker Group Private Capital",
    contact_name: "Paul Carbone",
    title: "Managing Partner"
  },
  {
    row: 699,
    company: "Kayne Partners",
    contact_name: "Leon Chen",
    title: "Managing Partner"
  },
  {
    row: 560,
    company: "PSG Equity",
    contact_name: "Tom Reardon",
    title: "Managing Director"
  }
];

async function apolloEnrich(target) {
  try {
    const response = await axios.post(
      'https://api.apollo.io/v1/mixed_people/api_search',
      {
        person_titles: [target.title],
        organization_name: target.company,
        person_names: [target.contact_name],
        per_page: 5
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );

    if (response.data.people && response.data.people.length > 0) {
      const person = response.data.people[0];
      return {
        ...target,
        email: person.email || 'Not found',
        linkedin: person.linkedin_url || '',
        phone: person.phone_numbers?.[0]?.raw_number || '',
        apollo_verified: true
      };
    }

    return { ...target, email: 'Not found in Apollo', apollo_verified: false };
  } catch (error) {
    console.error(`Error enriching ${target.contact_name}:`, error.response?.data || error.message);
    return { ...target, email: 'Error', apollo_verified: false, error: error.message };
  }
}

async function enrichAll() {
  console.log(`\n🔍 Enriching ${targets.length} verified contacts with Apollo...\n`);

  const results = [];

  for (const target of targets) {
    console.log(`Searching for: ${target.contact_name} at ${target.company}...`);
    const result = await apolloEnrich(target);
    results.push(result);
    console.log(`  Email: ${result.email}`);
    console.log(`  LinkedIn: ${result.linkedin || 'N/A'}\n`);
    
    // Rate limit: wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  fs.writeFileSync('apollo-enrichment-results-mar12.json', JSON.stringify(results, null, 2));
  console.log(`✅ Saved ${results.length} enrichment results to apollo-enrichment-results-mar12.json`);

  // Summary
  const withEmails = results.filter(r => r.email && r.email !== 'Not found' && r.email !== 'Not found in Apollo' && r.email !== 'Error');
  console.log(`\n📊 Summary:`);
  console.log(`   Found emails: ${withEmails.length}/${targets.length}`);
  console.log(`   Missing: ${targets.length - withEmails.length}`);
}

enrichAll();
