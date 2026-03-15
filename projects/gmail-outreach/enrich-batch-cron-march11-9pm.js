const axios = require('axios');

const targets = [
  'Sentinel Capital Partners',
  'Bertram Capital',
  'Quartus Capital Partners',
  '360 Equipment Finance',
  'Kinect Capital',
  'Apercen Partners',
  'Essex Investment Management'
];

async function searchApollo() {
  const results = [];
  
  for (const company of targets) {
    try {
      const response = await axios.post('https://api.apollo.io/v1/mixed_people/search', {
        api_key: 'Fx6RpQS0PKxfVgnxWOPWuw',
        q_organization_name: company,
        page: 1,
        per_page: 5,
        person_titles: ['Managing Director', 'Partner', 'CEO', 'COO', 'CTO', 'CMO', 'VP', 'Vice President', 'Head']
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.data && response.data.people && response.data.people.length > 0) {
        const person = response.data.people[0];
        const result = {
          company,
          name: `${person.first_name} ${person.last_name}`,
          title: person.title || 'N/A',
          email: person.email || 'NOT FOUND',
          linkedin: person.linkedin_url || 'N/A'
        };
        results.push(result);
        console.log(`\n✅ ${company}:`);
        console.log(`   Name: ${result.name}`);
        console.log(`   Title: ${result.title}`);
        console.log(`   Email: ${result.email}`);
      } else {
        console.log(`\n❌ ${company}: No contacts found`);
        results.push({ company, name: 'NOT FOUND', email: 'NOT FOUND' });
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      console.log(`\n❌ ${company}: Error - ${err.message}`);
      results.push({ company, name: 'ERROR', email: 'ERROR' });
    }
  }
  
  return results;
}

searchApollo().then(results => {
  require('fs').writeFileSync(
    'apollo-enrichment-march11-9pm.json',
    JSON.stringify(results, null, 2)
  );
  console.log('\n\n✅ Saved results to apollo-enrichment-march11-9pm.json');
}).catch(console.error);
