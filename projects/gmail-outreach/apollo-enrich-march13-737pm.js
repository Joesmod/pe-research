const axios = require('axios');
const fs = require('fs');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function searchPeople(organizationName, titles) {
  try {
    const response = await axios.post(
      'https://api.apollo.io/api/v1/mixed_people/api_search',
      {
        q_organization_name: organizationName,
        person_titles: titles,
        per_page: 10,
        page: 1
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error(`Error searching for ${organizationName}:`, error.response?.data || error.message);
    return null;
  }
}

async function enrichPerson(personId) {
  try {
    const response = await axios.post(
      'https://api.apollo.io/api/v1/people/match',
      {
        id: personId,
        reveal_personal_emails: false,
        reveal_phone_number: false
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );
    
    return response.data.person;
  } catch (error) {
    console.error(`Error enriching person ${personId}:`, error.response?.data || error.message);
    return null;
  }
}

async function enrichTargets() {
  // Read targets
  const targets = JSON.parse(fs.readFileSync('enrichment-targets-march13-737pm.json', 'utf8'));
  
  console.log(`\n🔍 Enriching ${targets.length} targets using Apollo API\n`);
  
  const enrichedResults = [];
  
  // Focus on firms that aren't duplicates or dead
  const uniqueFirms = new Map();
  for (const target of targets) {
    if (target.status && target.status.includes('Dead')) {
      continue;
    }
    if (!uniqueFirms.has(target.company)) {
      uniqueFirms.set(target.company, target);
    }
  }
  
  console.log(`Found ${uniqueFirms.size} unique firms to research\n`);
  
  const firms = Array.from(uniqueFirms.values()).slice(0, 10); // Limit to 10 firms for this run
  
  for (const [index, target] of firms.entries()) {
    console.log(`\n${index + 1}. ${target.company}`);
    console.log(`   Status: ${target.status || 'Unknown'}`);
    console.log(`   Current Contact: ${target.contact || 'None'}`);
    console.log(`   Current Email: ${target.email || 'None'}`);
    
    // Search for decision-makers
    const titles = [
      'CEO', 'Chief Executive Officer',
      'Managing Partner', 'General Partner', 'Operating Partner',
      'Managing Director',
      'Chief Operating Officer', 'COO',
      'Chief Technology Officer', 'CTO',
      'Head of Portfolio Operations',
      'Head of Value Creation',
      'Vice President'
    ];
    
    const searchResult = await searchPeople(target.company, titles);
    
    if (searchResult && searchResult.people && searchResult.people.length > 0) {
      console.log(`   ✅ Found ${searchResult.people.length} potential contacts`);
      
      // Get first 3 results
      const topResults = searchResult.people.slice(0, 3);
      
      for (const person of topResults) {
        console.log(`      - ${person.name || 'Unknown'} (${person.title || 'No title'})`);
        console.log(`        LinkedIn: ${person.linkedin_url || 'N/A'}`);
        console.log(`        Email: ${person.email || 'Not available without enrichment'}`);
      }
      
      enrichedResults.push({
        ...target,
        apolloResults: topResults.map(p => ({
          name: p.name,
          title: p.title,
          linkedin: p.linkedin_url,
          email: p.email,
          apolloId: p.id
        }))
      });
    } else {
      console.log(`   ❌ No results found`);
      enrichedResults.push({
        ...target,
        apolloResults: []
      });
    }
    
    // Rate limit: wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Save results
  fs.writeFileSync('apollo-enrichment-results-march13-737pm.json', JSON.stringify(enrichedResults, null, 2));
  console.log(`\n\n📊 Results saved to apollo-enrichment-results-march13-737pm.json`);
  console.log(`Enriched ${enrichedResults.length} firms`);
}

enrichTargets();
