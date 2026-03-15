const axios = require('axios');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Top priority targets from research
const targets = [
  // Warren Equity Partners (Score 9)
  { company: 'Warren Equity Partners', name: 'Steven Wacaster', title: 'Managing Partner' },
  { company: 'Warren Equity Partners', name: 'Scott Bruckmann', title: 'Partner' },
  { company: 'Warren Equity Partners', name: 'Henrik Dahlback', title: 'Partner, CCO' },
  { company: 'Warren Equity Partners', name: 'Carl Johnson', title: 'Partner, Head of Operations' },
  
  // Arsenal Capital Partners (Score 9)
  { company: 'Arsenal Capital Partners', name: 'Terry Mullen', title: 'Managing Partner' },
  { company: 'Arsenal Capital Partners', name: 'Joelle Marquis', title: 'President and Senior Partner' },
  { company: 'Arsenal Capital Partners', name: 'Steve McLean', title: 'Senior Partner' },
  { company: 'Arsenal Capital Partners', name: 'Tim Zappala', title: 'Senior Partner' },
];

async function searchApolloContact(personName, companyName) {
  try {
    const response = await axios.post(
      'https://api.apollo.io/v1/mixed_people/search',
      {
        q_person_name: personName,
        q_organization_name: companyName,
        page: 1,
        per_page: 1
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );

    if (response.data && response.data.people && response.data.people.length > 0) {
      const person = response.data.people[0];
      return {
        name: person.name,
        title: person.title,
        email: person.email,
        organization: person.organization_name,
        linkedin: person.linkedin_url,
        emailStatus: person.email_status,
        source: 'Apollo.io'
      };
    }
    return null;
  } catch (error) {
    console.error(`Error searching for ${personName} at ${companyName}:`, error.message);
    return null;
  }
}

async function searchAll() {
  console.log('Searching Apollo.io for PE contacts...\n');
  
  const results = [];
  
  for (const target of targets) {
    console.log(`Searching: ${target.name} at ${target.company}...`);
    const contact = await searchApolloContact(target.name, target.company);
    
    if (contact && contact.email) {
      console.log(`✓ FOUND: ${contact.email} (${contact.emailStatus})`);
      results.push({
        ...target,
        ...contact
      });
    } else {
      console.log(`✗ No email found`);
      results.push({
        ...target,
        email: null,
        source: 'Apollo.io - not found'
      });
    }
    
    // Rate limit: wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n\nSummary: Found ${results.filter(r => r.email).length} verified emails out of ${targets.length} searches\n`);
  
  // Save results
  const fs = require('fs');
  fs.writeFileSync('apollo-results-march7-736am.json', JSON.stringify(results, null, 2));
  console.log('✓ Saved results to apollo-results-march7-736am.json');
  
  return results;
}

searchAll().catch(console.error);
