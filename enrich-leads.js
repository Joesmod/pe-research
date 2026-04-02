#!/usr/bin/env node

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Firms needing enrichment
const firms = [
  { name: 'Bow River Capital', domain: 'bowrivercapital.com' },
  { name: 'Shore Capital Partners', domain: 'shorecp.com' },
  { name: 'Petrichor Healthcare Capital', domain: 'petrichorcap.com' },
  { name: 'Vesey Street Capital Partners', domain: 'vscpllc.com' },
  { name: 'Edison Partners', domain: 'edisonpartners.com' },
  { name: 'Revelstoke Capital Partners', domain: 'revelstokecap.com' }
];

// Target titles - cast wide net
const titles = [
  'CEO', 'Chief Executive Officer',
  'Managing Partner', 'General Partner', 'Partner',
  'Managing Director', 'MD',
  'COO', 'Chief Operating Officer',
  'CTO', 'Chief Technology Officer',
  'VP Operations', 'VP Technology', 'VP Digital',
  'Director Technology', 'Director Operations',
  'Head of Portfolio Operations', 'Head of Value Creation'
];

async function searchContact(firmName, domain) {
  const url = 'https://api.apollo.io/v1/mixed_people/search';
  
  const payload = {
    api_key: APOLLO_API_KEY,
    q_organization_domains: domain,
    person_titles: titles,
    page: 1,
    per_page: 10
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (data.people && data.people.length > 0) {
      console.log(`\n=== ${firmName} ===`);
      data.people.slice(0, 5).forEach(person => {
        console.log(`Name: ${person.name || person.first_name + ' ' + person.last_name}`);
        console.log(`Title: ${person.title}`);
        console.log(`Email: ${person.email || 'Not available'}`);
        console.log(`LinkedIn: ${person.linkedin_url || 'Not available'}`);
        console.log('---');
      });
    } else {
      console.log(`\n=== ${firmName} ===`);
      console.log('No contacts found');
    }
  } catch (error) {
    console.error(`Error searching ${firmName}:`, error.message);
  }
}

async function main() {
  console.log('Searching Apollo for PE firm contacts...\n');
  
  for (const firm of firms) {
    await searchContact(firm.name, firm.domain);
    // Rate limit: wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

main();
