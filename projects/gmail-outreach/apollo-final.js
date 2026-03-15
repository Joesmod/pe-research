const axios = require('axios');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function searchPeopleAtFirm(domain, firmName) {
  try {
    console.log(`\n🔍 Searching ${firmName} (${domain})...`);
    
    const response = await axios.post(
      'https://api.apollo.io/api/v1/mixed_people/search',
      {
        q_organization_domains: domain,
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
    
    const people = response.data.people || [];
    
    if (people.length === 0) {
      console.log(`❌ No contacts found`);
      return null;
    }
    
    console.log(`\n✅ Found ${people.length} contacts:`);
    
    // Prioritize decision-makers
    const priorities = ['partner', 'ceo', 'founder', 'managing', 'president', 'chief', 'director', 'vp'];
    
    const scored = people.map(p => {
      const title = (p.title || '').toLowerCase();
      let score = 0;
      
      for (const keyword of priorities) {
        if (title.includes(keyword)) score += 10;
      }
      
      if (p.email && !p.email.includes('@apollo.io')) score += 5;
      
      return { ...p, score };
    });
    
    scored.sort((a, b) => b.score - a.score);
    
    for (const person of scored.slice(0, 5)) {
      console.log(`\n   ${person.name}`);
      console.log(`   Title: ${person.title || 'N/A'}`);
      console.log(`   Email: ${person.email || 'Not available'}`);
      console.log(`   LinkedIn: ${person.linkedin_url || 'N/A'}`);
    }
    
    const best = scored[0];
    if (best && best.email && !best.email.includes('@apollo.io')) {
      return {
        name: best.name,
        title: best.title,
        email: best.email,
        linkedin: best.linkedin_url
      };
    }
    
    return null;
    
  } catch (error) {
    console.error(`❌ Error:`, error.response?.data?.error || error.message);
    return null;
  }
}

const domain = process.argv[2] || 'aerispartners.com';
const firmName = process.argv[3] || 'Aeris Partners';

searchPeopleAtFirm(domain, firmName).then(result => {
  if (result) {
    console.log(`\n\n📧 BEST CONTACT: ${result.name} (${result.title})`);
    console.log(`   Email: ${result.email}`);
  } else {
    console.log(`\n\n❌ No usable contact found`);
  }
});
