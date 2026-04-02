const APOLLO_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

const firms = [
  'Riverside Partners',
  'One Equity Partners',
  'H.I.G. Growth Partners',
  'Greenbriar Equity Group',
  'Altaris Capital Partners'
];

async function searchFirm(firmName) {
  console.log(`\n🔍 Searching: ${firmName}`);
  
  try {
    const response = await fetch('https://api.apollo.io/v1/mixed_people/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        api_key: APOLLO_KEY,
        q_organization_name: firmName,
        page: 1,
        per_page: 5,
        person_titles: [
          'CEO', 'Managing Partner', 'Partner', 
          'Managing Director', 'Vice President',
          'Founder', 'Co-Founder'
        ]
      })
    });
    
    const data = await response.json();
    
    if (data.people && data.people.length > 0) {
      // Sort by seniority
      const prioritized = data.people.sort((a, b) => {
        const titleA = (a.title || '').toLowerCase();
        const titleB = (b.title || '').toLowerCase();
        
        const scoreA = 
          (titleA.includes('ceo') || titleA.includes('founder')) ? 100 :
          (titleA.includes('managing partner') || titleA.includes('partner')) ? 90 :
          titleA.includes('managing director') ? 80 :
          titleA.includes('director') ? 70 :
          (titleA.includes('vp') || titleA.includes('vice president')) ? 60 : 50;
        
        const scoreB = 
          (titleB.includes('ceo') || titleB.includes('founder')) ? 100 :
          (titleB.includes('managing partner') || titleB.includes('partner')) ? 90 :
          titleB.includes('managing director') ? 80 :
          titleB.includes('director') ? 70 :
          (titleB.includes('vp') || titleB.includes('vice president')) ? 60 : 50;
        
        return scoreB - scoreA;
      });
      
      const person = prioritized[0];
      
      console.log(`  ✅ Found: ${person.name}`);
      console.log(`  Title: ${person.title || 'N/A'}`);
      console.log(`  Email: ${person.email || 'N/A'}`);
      console.log(`  LinkedIn: ${person.linkedin_url || 'N/A'}`);
      
      return {
        firm: firmName,
        name: person.name || '',
        title: person.title || '',
        email: person.email || '',
        linkedin: person.linkedin_url || '',
        found: true
      };
    } else {
      console.log(`  ❌ No results found`);
      return { firm: firmName, found: false };
    }
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return { firm: firmName, found: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 Apollo PE Firm Contact Search\n');
  
  const results = [];
  
  for (const firm of firms) {
    const result = await searchFirm(firm);
    results.push(result);
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  console.log('\n\n📊 SUMMARY');
  console.log('=' .repeat(60));
  
  const found = results.filter(r => r.found);
  console.log(`\nFound contacts for ${found.length}/${results.length} firms:\n`);
  
  found.forEach(r => {
    console.log(`${r.firm}`);
    console.log(`  ${r.name} - ${r.title}`);
    console.log(`  ${r.email}`);
    console.log('');
  });
  
  // Save to JSON
  require('fs').writeFileSync(
    `apollo-results-${Date.now()}.json`,
    JSON.stringify(results, null, 2)
  );
}

main().catch(console.error);
