#!/usr/bin/env node
/**
 * Apollo.io enrichment for PE firm contacts
 * Searches for decision-makers with verified emails
 */

const API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const API_BASE = 'https://api.apollo.io/v1';

async function searchPeople(firmName, titles = []) {
  const url = `${API_BASE}/people/search`;
  
  const payload = {
    q_organization_name: firmName,
    person_titles: titles.length > 0 ? titles : [
      'Managing Partner',
      'Managing Director', 
      'Partner',
      'CEO',
      'CIO',
      'Co-Founder',
      'Head of Business Development'
    ],
    page: 1,
    per_page: 5
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'X-Api-Key': API_KEY
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Apollo API error: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return data.people || [];
}

async function enrichFirm(firmName) {
  console.log(`\n🔍 Searching: ${firmName}`);
  
  const people = await searchPeople(firmName);
  
  if (people.length === 0) {
    console.log(`   ⚠️  No contacts found`);
    return [];
  }

  const results = people.map(p => ({
    name: p.name,
    title: p.title,
    email: p.email,
    linkedin: p.linkedin_url,
    verified: p.email_status === 'verified',
    source: 'Apollo.io'
  })).filter(p => p.email && p.email !== 'N/A');

  results.forEach(p => {
    const check = p.verified ? '✅' : '⚠️';
    console.log(`   ${check} ${p.name} | ${p.title} | ${p.email}`);
  });

  return results;
}

// Priority firms needing enrichment
const FIRMS = [
  'HPS Investment Partners',
  'I Squared Capital',
  'Juggernaut Capital Partners',
  'KSL Capital Partners',
  'RCP Advisors',
  'AI Fund',
  'Altimeter',
  'Apogem Capital',
  'AVB Invest',
  'Arctaris Impact Investors',
  'Argentum Capital Partners',
  'Anzu Partners',
  'Arctos Partners',
  'Argand Partners',
  'HealthQuest Capital',
  'Invictus Growth Partners'
];

async function main() {
  console.log('🫡 PE Contact Enrichment via Apollo\n');
  console.log(`Targeting ${FIRMS.length} firms...`);

  const allResults = [];

  for (const firm of FIRMS) {
    try {
      const contacts = await enrichFirm(firm);
      if (contacts.length > 0) {
        allResults.push({ firm, contacts });
      }
      // Rate limit: 1 request per second
      await new Promise(r => setTimeout(r, 1000));
    } catch (err) {
      console.error(`   ❌ Error: ${err.message}`);
    }
  }

  console.log(`\n\n📊 Summary: Found ${allResults.length} firms with verified contacts\n`);
  console.log(JSON.stringify(allResults, null, 2));
}

main().catch(console.error);
