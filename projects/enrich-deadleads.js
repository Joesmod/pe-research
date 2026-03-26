const https = require('https');
const API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

function apolloPost(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.apollo.io', path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': API_KEY }
    }, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch(e) { reject(new Error(d.slice(0,500))); }
      });
    });
    req.on('error', reject);
    req.write(data); req.end();
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Dead Lead firms with identified people but no emails
const targets = [
  { firm: 'Tenex Capital Management', person: 'Stephens Johnson', title: 'Managing Director' },
  { firm: 'Tenex Capital Management', person: 'Mike Green', title: 'CEO' },
  { firm: 'JMI Equity', person: 'Jason Kyser', title: 'Managing Director' },
  { firm: 'Atlantic Street Capital', person: 'Andrew Wilkins', title: 'Co-CEO' },
  { firm: 'RoundTable Healthcare Partners', person: 'R. Craig Collister', title: 'Managing Partner' },
  { firm: 'Kayne Partners', person: 'Nishita Cummings', title: 'Managing Partner' },
  { firm: 'Avante Capital Partners', person: 'Suni Harman', title: 'Founder' },
  { firm: 'Colville Group', person: 'Patrick Mealy', title: 'Partner' },
  { firm: 'Cranemere Group', person: 'Kamil Salame', title: 'CEO' },
  { firm: 'Behrman Capital', person: 'Nick Matzke', title: 'Director of Business Development' },
  { firm: 'Valeas Capital Partners', person: 'Rob Little', title: 'Managing Partner' },
  { firm: 'Vance Street Capital', person: 'Natalie Yates', title: 'Head of Business Development' },
];

async function enrichTarget(t) {
  console.log(`\n--- ${t.firm} / ${t.person} ---`);
  
  // Try people/match with name + org
  try {
    const match = await apolloPost('/api/v1/people/match', {
      name: t.person,
      organization_name: t.firm
    });
    await sleep(400);
    
    if (match.person && match.person.email) {
      console.log(`FOUND: ${match.person.name} | ${match.person.title} | ${match.person.email} | ${match.person.linkedin_url || 'no LI'}`);
      return match.person;
    } else if (match.person) {
      console.log(`Match found but no email: ${match.person.name} | ${match.person.title}`);
    } else {
      console.log('No match found');
    }
  } catch(e) {
    console.log('Match error:', e.message?.slice(0,200));
  }
  
  // Try org search then people search
  try {
    const orgRes = await apolloPost('/api/v1/mixed_companies/search', {
      q_organization_name: t.firm, page: 1, per_page: 1
    });
    await sleep(400);
    
    if (orgRes.organizations && orgRes.organizations.length > 0) {
      const orgId = orgRes.organizations[0].id;
      console.log(`Org found: ${orgRes.organizations[0].name} (${orgId})`);
      
      const pplRes = await apolloPost('/api/v1/mixed_people/api_search', {
        organization_ids: [orgId],
        person_titles: ['Managing Director', 'Partner', 'CEO', 'CTO', 'COO', 'VP', 'Principal', 'Head of Business Development', 'Director'],
        page: 1, per_page: 5
      });
      await sleep(400);
      
      if (pplRes.people && pplRes.people.length > 0) {
        for (const p of pplRes.people.slice(0, 3)) {
          const enriched = await apolloPost('/api/v1/people/match', { id: p.id });
          await sleep(400);
          if (enriched.person && enriched.person.email) {
            console.log(`ALT FOUND: ${enriched.person.name} | ${enriched.person.title} | ${enriched.person.email} | ${enriched.person.linkedin_url || 'no LI'}`);
            return enriched.person;
          }
        }
        console.log(`Found ${pplRes.people.length} people but none had emails`);
      } else {
        console.log('No people found at org');
      }
    } else {
      console.log('Org not found in Apollo');
    }
  } catch(e) {
    console.log('Org search error:', e.message?.slice(0,200));
  }
  
  return null;
}

async function main() {
  const results = [];
  for (const t of targets) {
    const person = await enrichTarget(t);
    if (person) {
      results.push({ firm: t.firm, name: person.name, title: person.title, email: person.email, linkedin: person.linkedin_url });
    }
  }
  console.log('\n\n=== SUMMARY ===');
  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);
