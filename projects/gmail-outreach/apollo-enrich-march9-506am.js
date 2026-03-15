// Simple Apollo enrichment using native fetch
const APOLLO_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

const targets = [
  {
    firm: "Bow River Capital",
    contact: "Greg J. Hiatrides",
    title: "Partner, Head of Private Equity",
    domain: "bowrivercapital.com",
    first_name: "Greg",
    last_name: "Hiatrides"
  },
  {
    firm: "Amulet Capital Partners",
    contact: "Avi Uttamchandani",
    title: "Partner",
    domain: "amuletcapital.com",
    first_name: "Avi",
    last_name: "Uttamchandani"
  },
  {
    firm: "Trivest Partners",
    contact: "Reid Callaway",
    title: "Managing Director",
    domain: "trivestpartners.com",
    first_name: "Reid",
    last_name: "Callaway"
  }
];

async function apolloEnrich(target) {
  try {
    const response = await fetch('https://api.apollo.io/v1/people/match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': APOLLO_KEY
      },
      body: JSON.stringify({
        first_name: target.first_name,
        last_name: target.last_name,
        organization_name: target.firm,
        domain: target.domain,
        reveal_personal_emails: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Apollo API error for ${target.contact}: ${response.status} - ${errorText}`);
      return null;
    }

    const data = await response.json();
    
    if (data.person && data.person.email) {
      return {
        email: data.person.email,
        title: data.person.title || target.title,
        linkedin: data.person.linkedin_url || ''
      };
    }
    
    console.log(`ℹ️  No email found in Apollo for ${target.contact}`);
    return null;
  } catch (err) {
    console.error(`❌ Error enriching ${target.contact}:`, err.message);
    return null;
  }
}

async function main() {
  console.log('🔍 Starting Apollo enrichment for 3 PE leads...\n');
  
  const results = [];
  
  for (const target of targets) {
    console.log(`Processing: ${target.contact} at ${target.firm}`);
    
    const result = await apolloEnrich(target);
    
    if (result && result.email) {
      console.log(`✅ Found: ${result.email}\n`);
      results.push({
        ...target,
        foundEmail: result.email,
        foundTitle: result.title,
        foundLinkedIn: result.linkedin,
        status: 'SUCCESS'
      });
    } else {
      console.log(`❌ No email found\n`);
      results.push({
        ...target,
        status: 'NOT_FOUND'
      });
    }
    
    // Rate limit: 1 second between requests
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Enrichment Results:');
  console.log('='.repeat(60));
  console.log(`✅ Found: ${results.filter(r => r.status === 'SUCCESS').length}`);
  console.log(`❌ Not found: ${results.filter(r => r.status === 'NOT_FOUND').length}`);
  console.log('\nDetailed Results:');
  results.forEach(r => {
    if (r.status === 'SUCCESS') {
      console.log(`\n✅ ${r.contact} (${r.firm})`);
      console.log(`   Email: ${r.foundEmail}`);
      console.log(`   Title: ${r.foundTitle}`);
      if (r.foundLinkedIn) console.log(`   LinkedIn: ${r.foundLinkedIn}`);
    } else {
      console.log(`\n❌ ${r.contact} (${r.firm}) - No email found`);
    }
  });
  
  // Save results to file
  const fs = require('fs');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const filename = `apollo-enrichment-march9-${timestamp}.json`;
  fs.writeFileSync(filename, JSON.stringify(results, null, 2));
  console.log(`\n💾 Results saved to: ${filename}`);
  
  return results;
}

main().catch(console.error);
