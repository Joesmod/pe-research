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
        per_page: 5,
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
        id: personId
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
  
  console.log(`\n🔍 Enriching targets using Apollo API\n`);
  
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
  
  const firms = Array.from(uniqueFirms.values()).slice(0, 10); // Limit to 10 firms
  
  for (const [index, target] of firms.entries()) {
    console.log(`\n${index + 1}. ${target.company}`);
    console.log(`   Website: ${target.website || 'Unknown'}`);
    console.log(`   Current Contact: ${target.contact || 'None'}`);
    
    // Search for decision-makers
    const titles = [
      'CEO', 'Chief Executive Officer',
      'Managing Partner', 'General Partner', 'Operating Partner',
      'Managing Director',
      'COO', 'Chief Operating Officer',
      'CTO', 'Chief Technology Officer',
      'Vice President',
      'Director'
    ];
    
    const searchResult = await searchPeople(target.company, titles);
    
    if (searchResult && searchResult.people && searchResult.people.length > 0) {
      console.log(`   ✅ Found ${searchResult.people.length} potential contacts`);
      
      // Get first result and enrich it
      const topPerson = searchResult.people[0];
      
      if (topPerson && topPerson.id) {
        console.log(`\n   Enriching top contact (ID: ${topPerson.id})...`);
        await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit
        
        const enrichedPerson = await enrichPerson(topPerson.id);
        
        if (enrichedPerson) {
          console.log(`   📧 Name: ${enrichedPerson.name || 'Unknown'}`);
          console.log(`   📧 Title: ${enrichedPerson.title || 'Unknown'}`);
          console.log(`   📧 Email: ${enrichedPerson.email || 'Not available'}`);
          console.log(`   📧 LinkedIn: ${enrichedPerson.linkedin_url || 'N/A'}`);
          
          enrichedResults.push({
            rowIndex: target.rowIndex,
            company: target.company,
            website: target.website,
            enrichedContact: {
              name: enrichedPerson.name,
              title: enrichedPerson.title,
              email: enrichedPerson.email,
              linkedin: enrichedPerson.linkedin_url,
              apolloId: enrichedPerson.id
            }
          });
        }
      }
    } else {
      console.log(`   ❌ No results found`);
      enrichedResults.push({
        rowIndex: target.rowIndex,
        company: target.company,
        website: target.website,
        enrichedContact: null
      });
    }
    
    // Rate limit: wait 2 seconds between firms
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Save results
  fs.writeFileSync('apollo-enriched-contacts-march13-737pm.json', JSON.stringify(enrichedResults, null, 2));
  console.log(`\n\n📊 Results saved to apollo-enriched-contacts-march13-737pm.json`);
  console.log(`Enriched ${enrichedResults.length} firms`);
  
  // Print summary
  const withEmails = enrichedResults.filter(r => r.enrichedContact && r.enrichedContact.email);
  console.log(`\n✅ Found verified emails for ${withEmails.length} firms`);
}

enrichTargets();
