const { google } = require('googleapis');
const fs = require('fs');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function enrichWithApollo() {
  const queue = JSON.parse(fs.readFileSync('enrichment-queue.json', 'utf8'));
  
  console.log(`=== ENRICHING ${queue.length} LEADS WITH APOLLO ===\n`);
  
  const results = [];
  
  for (const lead of queue) {
    console.log(`\n--- Enriching Row ${lead.row}: ${lead.company} ---`);
    console.log(`Current: ${lead.contact || '(No Contact)'} | ${lead.email || '(No Email)'}`);
    
    try {
      // Search for people at this organization
      const searchResponse = await fetch('https://api.apollo.io/v1/mixed_people/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': APOLLO_API_KEY
        },
        body: JSON.stringify({
          api_key: APOLLO_API_KEY,
          q_organization_name: lead.company,
          page: 1,
          per_page: 10,
          person_titles: [
            "CEO", "CTO", "COO", "CMO", "CFO", 
            "Managing Partner", "Partner", "Managing Director",
            "VP Technology", "VP Operations", "VP Digital",
            "Head of Technology", "Head of Digital", "Head of Operations",
            "Director Technology", "Director Operations", "Director Digital"
          ]
        })
      });
      
      const searchData = await searchResponse.json();
      
      if (searchData.people && searchData.people.length > 0) {
        console.log(`Found ${searchData.people.length} potential contacts`);
        
        // Try to enrich the first few contacts
        for (let i = 0; i < Math.min(3, searchData.people.length); i++) {
          const person = searchData.people[i];
          console.log(`\n  Candidate ${i+1}: ${person.name} - ${person.title}`);
          
          // Try to enrich this person's email
          const enrichResponse = await fetch('https://api.apollo.io/v1/people/match', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              'X-Api-Key': APOLLO_API_KEY
            },
            body: JSON.stringify({
              api_key: APOLLO_API_KEY,
              first_name: person.first_name,
              last_name: person.last_name,
              organization_name: lead.company,
              domain: lead.website ? lead.website.replace(/^https?:\/\//, '').split('/')[0] : null,
              reveal_personal_emails: true
            })
          });
          
          const enrichData = await enrichResponse.json();
          
          if (enrichData.person && enrichData.person.email) {
            console.log(`  ✓ Found email: ${enrichData.person.email}`);
            console.log(`  LinkedIn: ${enrichData.person.linkedin_url || 'N/A'}`);
            
            results.push({
              row: lead.row,
              company: lead.company,
              old_contact: lead.contact,
              old_email: lead.email,
              new_contact: enrichData.person.name,
              new_title: enrichData.person.title,
              new_email: enrichData.person.email,
              new_linkedin: enrichData.person.linkedin_url,
              source: 'Apollo API verified'
            });
            
            break; // Found one good contact, move to next company
          } else {
            console.log(`  ✗ No email found for this person`);
          }
          
          // Rate limit
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } else {
        console.log(`No contacts found in Apollo for ${lead.company}`);
        
        results.push({
          row: lead.row,
          company: lead.company,
          old_contact: lead.contact,
          old_email: lead.email,
          new_contact: null,
          new_title: null,
          new_email: null,
          new_linkedin: null,
          source: 'Not found in Apollo'
        });
      }
    } catch (error) {
      console.error(`Error enriching ${lead.company}:`, error.message);
      
      results.push({
        row: lead.row,
        company: lead.company,
        old_contact: lead.contact,
        old_email: lead.email,
        new_contact: null,
        new_title: null,
        new_email: null,
        new_linkedin: null,
        source: `Error: ${error.message}`
      });
    }
    
    // Rate limit between companies
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Save results
  fs.writeFileSync('enrichment-results.json', JSON.stringify(results, null, 2));
  
  console.log('\n\n=== ENRICHMENT COMPLETE ===');
  console.log(`Total processed: ${results.length}`);
  console.log(`Successfully enriched: ${results.filter(r => r.new_email).length}`);
  console.log(`\nResults saved to enrichment-results.json`);
  
  // Show summary
  console.log('\n=== SUMMARY ===\n');
  results.forEach(r => {
    if (r.new_email) {
      console.log(`✓ Row ${r.row}: ${r.company}`);
      console.log(`  ${r.new_contact} (${r.new_title})`);
      console.log(`  ${r.new_email}`);
      console.log('');
    } else {
      console.log(`✗ Row ${r.row}: ${r.company} - ${r.source}`);
    }
  });
}

enrichWithApollo().catch(console.error);
