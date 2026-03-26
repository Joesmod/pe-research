const https = require('https');
const API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

function apiCall(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.apollo.io',
      path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': API_KEY }
    }, res => {
      let chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.end(data);
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

const AI_TITLES = [
  'Chief AI Officer', 'VP AI', 'VP Artificial Intelligence',
  'Director of AI', 'Head of AI', 'Chief Data Officer',
  'VP Data Science', 'VP Machine Learning', 'Director of Data Science',
  'Head of Data', 'Chief Digital Officer', 'VP Digital Transformation',
  'Head of Digital Transformation', 'Director of Digital',
  'Chief Technology Officer', 'CTO',
  'Chief Innovation Officer', 'VP Innovation'
];

// Top PE firms to search - focus on larger/known firms
const FIRMS = [
  'Thoma Bravo', 'Vista Equity Partners', 'Insight Partners', 'TPG Capital',
  'Francisco Partners', 'Warburg Pincus', 'General Atlantic', 'Bain Capital',
  'Clearlake Capital', 'Welsh Carson Anderson & Stowe', 'EQT Partners',
  'Hellman & Friedman', 'GTCR', 'New Mountain Capital', 'Genstar Capital',
  'Summit Partners', 'PSG Equity', 'Advent International', 'Veritas Capital',
  'Providence Equity Partners', 'Leonard Green & Partners', 'Permira',
  'H.I.G. Capital', 'Madison Dearborn Partners', 'Apax Partners',
  'GI Partners', 'Hg Capital', 'Cinven', 'Patient Square Capital',
  'Motive Partners', 'TA Associates', 'Alpine Investors',
  'Platinum Equity', 'American Securities', 'Berkshire Partners',
  'Oak HC/FT', 'Roark Capital Group', 'Golden Gate Capital',
  'Silver Lake', 'KKR', 'Blackstone', 'Apollo Global Management',
  'Carlyle Group', 'CVC Capital Partners', 'Ares Management',
  'THL Partners', 'Kelso & Company', 'Harvest Partners',
  'Tailwind Capital', 'LLR Partners'
];

async function searchFirm(firmName) {
  // Step 1: Find org
  const orgRes = await apiCall('/api/v1/mixed_companies/search', {
    q_organization_name: firmName,
    page: 1,
    per_page: 1
  });
  
  if (!orgRes.organizations || !orgRes.organizations.length) return null;
  const org = orgRes.organizations[0];
  
  await sleep(300);
  
  // Step 2: Search for AI-titled people
  const peopleRes = await apiCall('/api/v1/mixed_people/api_search', {
    organization_ids: [org.id],
    person_titles: AI_TITLES,
    page: 1,
    per_page: 10
  });
  
  if (!peopleRes.people || !peopleRes.people.length) return null;
  
  const results = [];
  for (const person of peopleRes.people) {
    await sleep(300);
    const enriched = await apiCall('/api/v1/people/match', { id: person.id });
    if (enriched.person) {
      const p = enriched.person;
      // Only keep if title matches AI/tech/digital/data themes
      const title = (p.title || '').toLowerCase();
      const isAITitle = /\b(ai|artificial intelligence|machine learning|data|digital|technology|innovation|cto|chief technology)\b/i.test(title);
      if (isAITitle && p.email) {
        results.push({
          company: firmName,
          name: p.name,
          title: p.title,
          email: p.email,
          emailStatus: p.email_status,
          linkedin: p.linkedin_url
        });
      }
    }
  }
  return results.length ? results : null;
}

(async () => {
  const allResults = [];
  for (let i = 0; i < FIRMS.length; i++) {
    const firm = FIRMS[i];
    process.stderr.write(`[${i+1}/${FIRMS.length}] ${firm}...`);
    try {
      const results = await searchFirm(firm);
      if (results) {
        allResults.push(...results);
        process.stderr.write(` found ${results.length}\n`);
      } else {
        process.stderr.write(` none\n`);
      }
    } catch(e) {
      process.stderr.write(` error: ${e.message}\n`);
    }
    await sleep(500);
  }
  console.log(JSON.stringify(allResults, null, 2));
  process.stderr.write(`\nTotal AI-titled contacts found: ${allResults.length}\n`);
})();
