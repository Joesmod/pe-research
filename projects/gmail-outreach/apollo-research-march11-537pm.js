const axios = require('axios');
const fs = require('fs');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

const targets = JSON.parse(fs.readFileSync('priority-enrichment-targets-march11-537pm.json', 'utf8'));

async function searchPerson(companyName) {
  try {
    console.log(`\n🔍 Searching Apollo for: ${companyName}`);
    
    const response = await axios.post(
      'https://api.apollo.io/v1/mixed_people/search',
      {
        q_organization_name: companyName,
        person_titles: [
          'CEO', 'Chief Executive Officer',
          'Managing Partner', 'Managing Director',
          'Partner', 'General Partner', 'Operating Partner',
          'CTO', 'Chief Technology Officer',
          'COO', 'Chief Operating Officer',
          'VP Technology', 'VP Operations', 'VP Portfolio',
          'Director Technology', 'Director Operations', 'Director Digital',
          'Head of Technology', 'Head of Operations', 'Head of Portfolio'
        ],
        page: 1,
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

    const people = response.data.people || [];
    console.log(`  ✅ Found ${people.length} contacts`);

    return people.map(p => ({
      name: p.name,
      title: p.title,
      email: p.email,
      linkedin: p.linkedin_url,
      organization: p.organization?.name
    }));

  } catch (error) {
    console.error(`  ❌ Apollo error: ${error.message}`);
    return [];
  }
}

async function main() {
  const results = [];

  for (const target of targets.slice(0, 10)) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📍 ${target.company} (Row ${target.row})`);
    console.log(`   Current: ${target.contact || 'No contact'} | ${target.email || 'No email'}`);
    
    const contacts = await searchPerson(target.company);
    
    if (contacts.length > 0) {
      console.log(`\n  📋 Found contacts:`);
      contacts.forEach((c, idx) => {
        console.log(`    ${idx + 1}. ${c.name} - ${c.title}`);
        if (c.email) console.log(`       ✉️  ${c.email}`);
        if (c.linkedin) console.log(`       🔗 ${c.linkedin}`);
      });

      results.push({
        ...target,
        apolloContacts: contacts
      });
    } else {
      console.log(`  ⚠️  No contacts found in Apollo`);
      results.push({
        ...target,
        apolloContacts: []
      });
    }

    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  fs.writeFileSync(
    'apollo-research-results-march11-537pm.json',
    JSON.stringify(results, null, 2)
  );

  console.log(`\n\n${'='.repeat(60)}`);
  console.log('✅ Research complete!');
  console.log(`📁 Results saved to: apollo-research-results-march11-537pm.json`);
  
  const withEmails = results.filter(r => 
    r.apolloContacts.some(c => c.email && !c.email.match(/^(info|sales|ir|contact|hello|team)@/i))
  );
  console.log(`\n📊 Summary:`);
  console.log(`   Total researched: ${results.length}`);
  console.log(`   With verified emails: ${withEmails.length}`);
}

main().catch(console.error);
