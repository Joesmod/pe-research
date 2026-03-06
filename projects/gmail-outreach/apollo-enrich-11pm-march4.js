const axios = require('axios');
const fs = require('fs');

const apiKey = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Read the target firms
const targets = JSON.parse(fs.readFileSync('pe-enrich-targets-11pm.json', 'utf8'));

async function searchPeopleAtFirm(firmName) {
  try {
    // Search for decision-makers: Partners, MDs, VPs, Directors, C-suite
    const response = await axios.post('https://api.apollo.io/v1/mixed_people/search', {
      q_organization_name: firmName,
      person_titles: [
        'CEO', 'CTO', 'COO', 'CMO', 'CFO',
        'Managing Partner', 'General Partner', 'Partner',
        'Managing Director', 'Director',
        'Vice President', 'VP',
        'Head of Technology', 'Head of Operations', 'Head of Digital',
        'Business Development'
      ],
      per_page: 5
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey
      }
    });
    
    if (response.data.people && response.data.people.length > 0) {
      return response.data.people.map(person => ({
        name: person.name,
        title: person.title,
        email: person.email,
        linkedIn: person.linkedin_url
      }));
    }
    return [];
  } catch (err) {
    console.error(`Error searching ${firmName}:`, err.response?.data?.message || err.message);
    return [];
  }
}

async function enrichTargets() {
  console.log(`\n=== Apollo Enrichment Run: ${new Date().toISOString()} ===`);
  console.log(`Processing ${Math.min(15, targets.length)} firms...\n`);
  
  const enrichmentResults = [];
  
  // Process first 15 targets
  for (let i = 0; i < Math.min(15, targets.length); i++) {
    const target = targets[i];
    console.log(`\n[${i + 1}/15] ${target.company}`);
    console.log(`Current: ${target.email || '(none)'}`);
    
    const contacts = await searchPeopleAtFirm(target.company);
    
    if (contacts.length > 0) {
      console.log(`✅ Found ${contacts.length} contacts:`);
      contacts.forEach((contact, idx) => {
        console.log(`  ${idx + 1}. ${contact.name} - ${contact.title}`);
        console.log(`     Email: ${contact.email || 'N/A'}`);
      });
      
      // Use the first contact with a valid email
      const bestContact = contacts.find(c => c.email && !c.email.includes('info@') && !c.email.includes('sales@'));
      
      if (bestContact) {
        enrichmentResults.push({
          rowIndex: target.rowIndex,
          company: target.company,
          contactName: bestContact.name,
          title: bestContact.title,
          email: bestContact.email,
          linkedIn: bestContact.linkedIn,
          source: 'Apollo API',
          allContacts: contacts
        });
      }
    } else {
      console.log(`❌ No contacts found`);
      enrichmentResults.push({
        rowIndex: target.rowIndex,
        company: target.company,
        noContactsFound: true,
        reason: 'Apollo returned no results'
      });
    }
    
    // Rate limiting: wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Save results
  fs.writeFileSync('apollo-enrichment-11pm.json', JSON.stringify(enrichmentResults, null, 2));
  
  console.log(`\n\n=== ENRICHMENT SUMMARY ===`);
  console.log(`Total processed: ${enrichmentResults.length}`);
  const successCount = enrichmentResults.filter(r => r.email).length;
  console.log(`Successfully enriched: ${successCount}`);
  console.log(`Failed to enrich: ${enrichmentResults.length - successCount}`);
  console.log(`\nResults saved to: apollo-enrichment-11pm.json`);
  
  return enrichmentResults;
}

enrichTargets().catch(console.error);
