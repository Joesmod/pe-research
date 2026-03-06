const fetch = require('node-fetch');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

const firmsToEnrich = [
  { name: "Knox Capital", domain: "knox-cap.com", website: "https://knox-cap.com" },
  { name: "Valeas", domain: "valeas.com", website: "https://www.valeas.com" },
  { name: "Harkness Capital", domain: "harknesscapital.com", website: "https://www.harknesscapital.com" },
  { name: "Avante Capital Partners", domain: "avantecap.com", website: "https://www.avantecap.com" },
  { name: "Millpoint Capital", domain: "millpoint.com", website: "https://millpoint.com" },
  { name: "Southfield Capital", domain: "southfieldcapital.com", website: "https://southfieldcapital.com" },
  { name: "Oak HC/FT", domain: "oakhcft.com", website: "https://www.oakhcft.com" },
  { name: "Spellman Capital", domain: "spellcapital.com", website: "https://www.spellcapital.com" },
  { name: "WindRose Health Investors", domain: "windrose.com", website: "https://www.windrose.com" },
  { name: "SEP Funds", domain: "sepfunds.com", website: "https://sepfunds.com" }
];

async function enrichWithApollo(firm) {
  console.log(`\n=== Enriching: ${firm.name} ===`);
  
  try {
    const response = await fetch('https://api.apollo.io/v1/mixed_people/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': APOLLO_API_KEY
      },
      body: JSON.stringify({
        organization_domains: [firm.domain],
        person_titles: [
          "CEO", "CTO", "COO", "CFO", "CMO",
          "Managing Partner", "Managing Director",
          "Partner", "General Partner", "Operating Partner",
          "Director", "Vice President",
          "Head of Technology", "Head of Operations", "Head of Digital"
        ],
        per_page: 5
      })
    });

    if (!response.ok) {
      console.log(`  Apollo API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    
    if (data.people && data.people.length > 0) {
      console.log(`  Found ${data.people.length} contacts:`);
      const contacts = data.people.map(person => ({
        name: person.name,
        title: person.title,
        email: person.email,
        linkedin: person.linkedin_url
      }));
      
      contacts.forEach(contact => {
        console.log(`    - ${contact.name} (${contact.title})`);
        console.log(`      Email: ${contact.email || 'NOT AVAILABLE'}`);
        console.log(`      LinkedIn: ${contact.linkedin || 'N/A'}`);
      });
      
      return {
        firm: firm.name,
        domain: firm.domain,
        website: firm.website,
        contacts: contacts.filter(c => c.email) // Only return contacts with emails
      };
    } else {
      console.log(`  No contacts found`);
      return null;
    }
  } catch (error) {
    console.log(`  Error: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('Starting Apollo enrichment for hourly cron...\n');
  
  const results = [];
  
  for (const firm of firmsToEnrich) {
    const enriched = await enrichWithApollo(firm);
    if (enriched && enriched.contacts.length > 0) {
      results.push(enriched);
    }
    // Rate limit: 1 request per second
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n\n=== ENRICHMENT SUMMARY ===`);
  console.log(`Firms enriched: ${results.length}/${firmsToEnrich.length}`);
  console.log(`Total contacts found: ${results.reduce((sum, r) => sum + r.contacts.length, 0)}`);
  
  // Save results
  const fs = require('fs');
  fs.writeFileSync('apollo-enrichment-536pm.json', JSON.stringify(results, null, 2));
  console.log('\nResults saved to apollo-enrichment-536pm.json');
  
  return results;
}

main().catch(console.error);
