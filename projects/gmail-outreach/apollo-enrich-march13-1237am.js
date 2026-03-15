const axios = require('axios');
const fs = require('fs');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

const targets = [
  {
    rowNum: 11,
    company: 'Blue Star Innovation Partners',
    contact: 'Hurley Doddy',
    title: 'Founder & CEO',
    linkedin: 'https://www.linkedin.com/in/hurleydoddy'
  },
  {
    rowNum: 25,
    company: 'Huron Capital',
    contact: 'Fabio Sattin',
    title: 'Founder & Managing Partner',
    linkedin: 'https://www.linkedin.com/in/fabiosattin'
  },
  {
    rowNum: 240,
    company: 'JMI Equity',
    contact: 'Harry Gruner',
    title: 'Co-Founder & Managing Partner',
    website: 'https://www.jmi.com',
    linkedin: 'https://www.linkedin.com/in/harry-gruner'
  },
  {
    rowNum: 561,
    company: 'Aquiline',
    contact: 'Vincenzo La Ruffa',
    title: 'Managing Partner',
    website: 'https://aquiline.com'
  },
  {
    rowNum: 1058,
    company: 'Kinzie Capital Partners',
    contact: 'Suzanne Yoon',
    title: 'Founder & Managing Partner',
    website: 'https://www.kinziecp.com',
    linkedin: 'https://www.linkedin.com/in/suzanneyoon/'
  }
];

async function enrichContact(target) {
  console.log(`\n--- Enriching: ${target.contact} at ${target.company} ---`);
  
  try {
    const payload = {
      first_name: target.contact.split(' ')[0],
      last_name: target.contact.split(' ').slice(1).join(' '),
      organization_name: target.company
    };

    if (target.website) {
      payload.domain = target.website.replace('https://', '').replace('http://', '').split('/')[0];
    }

    console.log('Payload:', JSON.stringify(payload, null, 2));

    const response = await axios.post(
      'https://api.apollo.io/v1/people/match',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );

    if (response.data && response.data.person) {
      const person = response.data.person;
      const result = {
        rowNum: target.rowNum,
        company: target.company,
        contact: `${person.first_name} ${person.last_name}`,
        title: person.title || target.title,
        email: person.email,
        emailStatus: person.email_status,
        phone: person.phone_numbers?.[0]?.sanitized_number || '',
        linkedin: person.linkedin_url || target.linkedin,
        found: true
      };

      console.log(`✓ Found: ${result.email} (${result.emailStatus})`);
      return result;
    } else {
      console.log('✗ Not found in Apollo');
      return {
        rowNum: target.rowNum,
        company: target.company,
        contact: target.contact,
        title: target.title,
        email: '',
        linkedin: target.linkedin || '',
        found: false
      };
    }
  } catch (error) {
    console.error(`Error enriching ${target.contact}:`, error.response?.data || error.message);
    return {
      rowNum: target.rowNum,
      company: target.company,
      contact: target.contact,
      title: target.title,
      email: '',
      linkedin: target.linkedin || '',
      found: false,
      error: error.response?.data?.message || error.message
    };
  }
}

async function main() {
  console.log('=== APOLLO ENRICHMENT - MARCH 13 12:37 AM ===');
  
  const results = [];
  
  for (const target of targets) {
    const result = await enrichContact(target);
    results.push(result);
    
    // Rate limiting: wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n\n=== ENRICHMENT RESULTS ===\n');
  
  const found = results.filter(r => r.found && r.email);
  const notFound = results.filter(r => !r.found || !r.email);

  console.log(`Found: ${found.length}`);
  console.log(`Not Found: ${notFound.length}\n`);

  if (found.length > 0) {
    console.log('VERIFIED CONTACTS:');
    found.forEach(r => {
      console.log(`  ${r.contact} (${r.company}): ${r.email}`);
    });
  }

  if (notFound.length > 0) {
    console.log('\nNEED MANUAL RESEARCH:');
    notFound.forEach(r => {
      console.log(`  ${r.contact} (${r.company})`);
    });
  }

  fs.writeFileSync(
    './apollo-enrichment-results-march13-1237am.json',
    JSON.stringify(results, null, 2)
  );

  console.log('\n✓ Results saved to apollo-enrichment-results-march13-1237am.json');
}

main().catch(console.error);
