const axios = require('axios');
const fs = require('fs');
const path = require('path');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const APOLLO_API = 'https://api.apollo.io/v1';

// Read our enrichment targets
const targets = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'enrichment-targets-march15.json'))
);

async function searchContact(company, existingContact) {
  try {
    console.log(`\n🔍 Searching Apollo for: ${company}`);
    if (existingContact) {
      console.log(`   Existing contact: ${existingContact}`);
    }

    // Search for people at the company with decision-maker titles
    const searchPayload = {
      q_organization_name: company,
      person_titles: [
        'CEO', 'CTO', 'COO', 'CMO', 'CFO',
        'Managing Partner', 'General Partner', 'Operating Partner',
        'Director', 'VP', 'Vice President',
        'Head of', 'Chief'
      ],
      per_page: 10
    };

    const response = await axios.post(
      `${APOLLO_API}/mixed_people/api_search`,
      searchPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );

    if (response.data && response.data.people && response.data.people.length > 0) {
      const people = response.data.people.filter(p => p.email && p.email_status === 'verified');
      
      if (people.length > 0) {
        console.log(`   ✅ Found ${people.length} verified contacts`);
        
        // Prioritize based on title
        const sorted = people.sort((a, b) => {
          const priorityA = getTitlePriority(a.title);
          const priorityB = getTitlePriority(b.title);
          return priorityA - priorityB;
        });

        return sorted.slice(0, 3).map(p => ({
          name: p.name,
          title: p.title,
          email: p.email,
          linkedin: p.linkedin_url,
          verified: p.email_status === 'verified'
        }));
      }
    }

    console.log(`   ❌ No verified contacts found`);
    return [];
  } catch (error) {
    console.error(`   ⚠️  Error searching ${company}:`, error.response?.data || error.message);
    return [];
  }
}

function getTitlePriority(title) {
  if (!title) return 999;
  const lower = title.toLowerCase();
  
  if (lower.includes('ceo') || lower.includes('chief executive')) return 1;
  if (lower.includes('managing partner')) return 2;
  if (lower.includes('general partner')) return 3;
  if (lower.includes('operating partner')) return 4;
  if (lower.includes('cto') || lower.includes('chief technology')) return 5;
  if (lower.includes('coo') || lower.includes('chief operating')) return 6;
  if (lower.includes('cfo') || lower.includes('chief financial')) return 7;
  if (lower.includes('cmo') || lower.includes('chief marketing')) return 8;
  if (lower.includes('partner')) return 9;
  if (lower.includes('director')) return 10;
  if (lower.includes('vp') || lower.includes('vice president')) return 11;
  if (lower.includes('head of')) return 12;
  
  return 50;
}

async function main() {
  const results = [];

  // Take first 10 unique companies
  const uniqueCompanies = [...new Set(targets.map(t => t.company))].slice(0, 10);

  for (const company of uniqueCompanies) {
    const target = targets.find(t => t.company === company);
    const contacts = await searchContact(company, target.contact);
    
    results.push({
      company,
      rowIndex: target.rowIndex,
      existingContact: target.contact,
      existingEmail: target.email,
      apolloResults: contacts
    });

    // Rate limit: 1 req/sec
    await new Promise(resolve => setTimeout(resolve, 1100));
  }

  // Save results
  fs.writeFileSync(
    path.join(__dirname, 'apollo-results-march15.json'),
    JSON.stringify(results, null, 2)
  );

  console.log(`\n\n📊 SUMMARY`);
  console.log(`Companies researched: ${results.length}`);
  console.log(`Contacts found: ${results.filter(r => r.apolloResults.length > 0).length}`);
  
  console.log(`\n\n💾 Results saved to apollo-results-march15.json`);
  
  return results;
}

main().catch(console.error);
