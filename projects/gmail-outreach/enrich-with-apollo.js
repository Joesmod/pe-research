const axios = require('axios');
const fs = require('fs');
const path = require('path');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Load targets
const targetsPath = path.join(__dirname, 'enrichment-targets-march16-1207am.json');
const targets = JSON.parse(fs.readFileSync(targetsPath, 'utf8'));

async function searchPerson(companyName, personName, title) {
  console.log(`\n🔍 Searching for ${personName || 'decision-makers'} at ${companyName}...`);
  
  try {
    const params = {
      api_key: APOLLO_API_KEY,
      q_organization_name: companyName,
      per_page: 10
    };

    // If we have a specific person name, search for them
    if (personName && personName !== 'N/A') {
      params.person_titles = title || undefined;
      // Try to parse first/last name
      const nameParts = personName.split(' ');
      if (nameParts.length >= 2) {
        params.q_person_name = personName;
      }
    } else {
      // Search for decision-makers
      params.person_titles = [
        'CEO', 'CTO', 'COO', 'CFO',
        'Managing Partner', 'Managing Director', 
        'Partner', 'General Partner',
        'VP Technology', 'VP Operations', 'VP Digital',
        'Director Technology', 'Director Operations',
        'Head of Technology', 'Head of Digital'
      ].join(',');
    }

    const response = await axios.post(
      'https://api.apollo.io/v1/mixed_people/search',
      params,
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      }
    );

    if (response.data && response.data.people && response.data.people.length > 0) {
      const people = response.data.people.slice(0, 3); // Top 3 results
      console.log(`   ✅ Found ${people.length} contacts`);
      
      people.forEach((person, idx) => {
        const email = person.email || 'N/A';
        const emailStatus = person.email_status || 'unknown';
        console.log(`   ${idx + 1}. ${person.name} - ${person.title || 'N/A'}`);
        console.log(`      Email: ${email} (${emailStatus})`);
        console.log(`      LinkedIn: ${person.linkedin_url || 'N/A'}`);
      });

      return people;
    } else {
      console.log(`   ❌ No results found`);
      return [];
    }
  } catch (error) {
    console.error(`   ❌ Error: ${error.response?.data?.message || error.message}`);
    return [];
  }
}

async function main() {
  console.log('🔍 Apollo API Enrichment - March 16, 2026\n');
  console.log(`Processing ${targets.length} targets...\n`);

  const results = [];

  for (const target of targets.slice(0, 10)) { // First 10 for this run
    const people = await searchPerson(
      target.company,
      target.contactName,
      null // Let Apollo find titles
    );

    if (people.length > 0) {
      results.push({
        ...target,
        apolloResults: people
      });
    }

    // Rate limit: wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Save results
  const outputPath = path.join(__dirname, 'apollo-enrichment-results-march16.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  console.log(`\n\n💾 Saved ${results.length} enriched leads to: ${outputPath}`);
  console.log('\n✅ Apollo enrichment complete.\n');
}

main().catch(console.error);
