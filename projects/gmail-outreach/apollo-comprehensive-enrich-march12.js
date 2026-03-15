const axios = require('axios');
const fs = require('fs');
const path = require('path');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

const targetFirms = [
  { name: 'Sverica Capital Management', domain: 'sverica.com', sheetRows: [208, 894, 938, 1037, 1046, 1049] },
  { name: 'WindPoint Partners', domain: 'wppartners.com', sheetRows: [220, 842] },
  { name: 'Mercury Fund', domain: 'mercuryfund.com', sheetRows: [763] },
];

async function enrichFirm(firmName, domain) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🔍 Enriching: ${firmName}`);
  console.log(`Domain: ${domain}`);
  console.log('='.repeat(80));
  
  try {
    // Get organization ID
    const orgResponse = await axios.get(
      'https://api.apollo.io/api/v1/organizations/enrich',
      {
        params: { domain },
        headers: { 'X-Api-Key': APOLLO_API_KEY }
      }
    );
    
    const orgId = orgResponse.data.organization?.id;
    if (!orgId) {
      console.log('❌ Organization not found in Apollo');
      return [];
    }
    
    console.log(`✅ Found organization (ID: ${orgId})`);
    
    // Search for senior people
    const searchResponse = await axios.post(
      'https://api.apollo.io/api/v1/mixed_people/api_search',
      {
        organization_ids: [orgId],
        person_seniorities: ['partner', 'c_suite', 'vp', 'director'],
        per_page: 15,
        page: 1
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );
    
    const people = searchResponse.data.people || [];
    console.log(`📋 Found ${people.length} decision-makers`);
    
    if (people.length === 0) return [];
    
    // Enrich top 3-5 people
    const enrichedContacts = [];
    const toEnrich = people.slice(0, 5);
    
    for (const person of toEnrich) {
      try {
        const enrichResponse = await axios.get(
          'https://api.apollo.io/api/v1/people/match',
          {
            params: { id: person.id },
            headers: { 'X-Api-Key': APOLLO_API_KEY }
          }
        );
        
        const enriched = enrichResponse.data.person;
        
        if (enriched && enriched.email) {
          enrichedContacts.push({
            name: `${enriched.first_name} ${enriched.last_name}`,
            title: enriched.title,
            email: enriched.email,
            linkedin: enriched.linkedin_url || '',
            organization: enriched.organization?.name,
            verified: true,
            source: 'Apollo.io'
          });
          
          console.log(`\n  ✅ ${enriched.first_name} ${enriched.last_name}`);
          console.log(`     Title: ${enriched.title}`);
          console.log(`     Email: ${enriched.email}`);
          console.log(`     LinkedIn: ${enriched.linkedin_url || 'N/A'}`);
        }
        
        // Rate limit
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.log(`  ⚠️ Could not enrich ${person.first_name} ${person.last_name_obfuscated}`);
      }
    }
    
    return enrichedContacts;
    
  } catch (error) {
    console.error(`❌ Error enriching ${firmName}:`, error.message);
    if (error.response?.status === 429) {
      console.log('⚠️ Rate limit hit. Waiting 60 seconds...');
      await new Promise(resolve => setTimeout(resolve, 60000));
    }
    return [];
  }
}

async function main() {
  console.log('🚀 PE Research & Enrichment - Comprehensive Run');
  console.log('Date: 2026-03-12');
  console.log('Time: 5:37 PM CST');
  console.log('Source: Apollo.io API\n');
  
  const allResults = {};
  
  for (const firm of targetFirms) {
    const contacts = await enrichFirm(firm.name, firm.domain);
    allResults[firm.name] = {
      domain: firm.domain,
      sheetRows: firm.sheetRows,
      contacts
    };
    
    // Wait between firms to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Save results
  fs.writeFileSync(
    path.join(__dirname, 'apollo-enrichment-results-march12-537pm.json'),
    JSON.stringify(allResults, null, 2)
  );
  
  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 ENRICHMENT SUMMARY');
  console.log('='.repeat(80));
  
  let totalContacts = 0;
  for (const [firmName, data] of Object.entries(allResults)) {
    console.log(`\n${firmName}: ${data.contacts.length} contacts enriched`);
    totalContacts += data.contacts.length;
  }
  
  console.log(`\n✅ Total contacts enriched: ${totalContacts}`);
  console.log('\n💾 Results saved to: apollo-enrichment-results-march12-537pm.json');
  console.log('\nNext step: Update Google Sheet with verified contacts.\n');
}

main().catch(console.error);
