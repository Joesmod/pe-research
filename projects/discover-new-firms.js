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

// Search for PE firms we don't have yet
const searchTerms = [
  'private equity business services mid-market',
  'private equity healthcare services lower middle market',
  'private equity technology services portfolio operations',
];

async function searchOrgs(query) {
  const res = await apolloPost('/api/v1/mixed_companies/search', {
    q_organization_name: query,
    organization_num_employees_ranges: ['11,50', '51,200'],
    q_organization_keyword_tags: ['private equity'],
    page: 1,
    per_page: 10
  });
  return res.organizations || [];
}

// Known firms to exclude
const known = new Set([
  'audax', 'shore capital', 'vistria', 'linden', 'olympus', 'kelso', 'gauge', 'harvest',
  'tailwind', 'thl', 'new mountain', 'baymark', 'shoreview', 'jll partners', 'greater sum',
  'knox', 'gryphon', 'palladium', 'charlesbank', 'trilantic', 'gemspring', 'hggc', 'align',
  'huron', 'incline', 'roark', 'seidler', 'compass group', 'sentinel', 'abry', 'parthenon',
  'nautic', 'gtcr', 'lee equity', 'cressey', 'amulet', 'vesey', 'ampersand', 'aldrich',
  'sterling partners', 'mbf', 'havencrest', 'ta associates', 'ik partners', 'motive',
  'greylion', 'riverside', 'francisco', 'llr', 'genstar', 'summit partners', 'new harbor',
  'svoboda', 'clearview', 'windrose', 'trivest', 'quad-c', 'kohlberg', 'psg equity',
  'bpoc', 'advent', 'serent', 'american securities', 'frazier', 'water street', 'bow river',
  'endeavour', 'renovus', 'pamlico', 'berkshire', 'argosy', 'transom', 'gennx', 'blue point',
  'revelar', 'wellspring', 'stephens group', 'lightyear', 'caltius', 'hidden harbor',
  'graham partners', 'source capital', 'portrait', 'plexus', 'sterling group', 'lfm',
  'nextgen growth', 'diversis', 'sleeping giant', 'edison', 'court square', 'webster',
  'pennspring', 'heritage holding', 'waud', 'excellere', 'metamora', 'performant',
  'hellman', 'littlejohn', 'stellus', 'spell', 'prospect partners', 'frontenac',
  'quad partners', 'ci capital', 'trive', 'sun capital', 'comvest', 'levine leichtman',
  'pfingsten', 'capstreet', 'alpine', 'o2 investment', 'angeles equity', 'cm equity',
  'sound growth', 'broadwing', 'rfe', 'tonka bay', 'centerbridge', 'platinum equity',
  'vector capital', 'crestview', 'kinderhook', 'pharos', 'blackford', 'stellex',
  'spire capital', 'midocean', 'truarc', 'snow phipps', 'leeds equity', 'veritas',
  'bertram', 'calera', 'topspin', 'primus', 'gi partners', 'oak hill', 'blue wolf',
  'highlander', 'arcline', 'brockway moran', 'towerbrook', 'h.i.g.', 'searchlight',
  'crescendo', 'srm equity', 'investcorp', 'warburg', 'thoma bravo', 'insight partners',
  'tpg', 'onex', 'welsh carson', 'eqt', 'leonard green', 'bain capital', 'cinven',
  'permira', 'providence equity', 'cerberus', 'pritzker', 'clearlake', 'madison dearborn',
  'jc flowers', 'braemont', 'psp partners', 'nordic capital', 'one equity', 'oakley',
  'hg capital', 'everstone', 'goldentree', 'consonance', 'revelstoke', 'kkr',
  'carlyle', 'summit park', 'gridiron', 'thompson street', 'mill point', 'great hill',
  'vestar', 'norwest', 'hci equity', 'flexpoint', 'newspring', 'sagewind', 'cip capital',
  'vance street', 'patient square', 'guardian capital', 'valeas', 'rlj equity',
  'resurgens', 'brentwood', 'kainos', 'ascend partners', 'midwest growth', 'rhone',
  'general atlantic', 'tzp group', 'sverica', 'ridgemont', 'kian capital', 'boathouse',
  'long point', 'mountaingate', 'platte river', 'centerfield', 'clairvest', 'torquest',
  'windpoint', 'wicks', 'accel-kkr', 'pine brook', 'cid capital', 'lovell minnick',
  'cortec', 'golden gate', 'marlin equity', 'bv investment', 'cd&r', 'sheridan',
  'siris', 'jordan company', 'aea investors', 'colville', 'ffl partners', 'aquiline',
  'oak hc', 'jmi equity', 'coltala', 'cranemere', 'staple street', 'valor equity',
  'auxo', 'stone point', 'bc partners', 'bregal sagemount', 'tenex', 'atlantic street',
  'vista equity', 'behrman', 'housatonic', 'chicago pacific', 'belhealth', 'oak investment',
  'latticework', 'bindley', 'bayboston', 'msd partners', 'roundtable', 'swander pace',
  'petra fund', 'morgan stanley', 'paladin capital', 'rockwood', 'lorient', 'broad sky',
  'osceola', 'stone-goff', 'harkness', 'ronin equity', 'mainsail', 'banneker',
  'industrial opportunity', 'kayne', 'highvista', 'bregal partners', 'blue sage',
  'centeroak', 'aterian', 'baird capital', 'dynamic core', 'union capital', 'coral tree',
  'avante', 'chicago capital', 'sterling investment', 'apax'
]);

function isKnown(name) {
  const lower = name.toLowerCase();
  for (const k of known) {
    if (lower.includes(k)) return true;
  }
  return false;
}

async function main() {
  // Try Apollo org search for PE firms
  console.log('Searching for new PE firms via Apollo...');
  
  const queries = [
    'Grain Management private equity',
    'MiddleGround Capital',
    'Gauge Capital Partners',
    'Altamont Capital Partners',
    'Sentinel Capital',
    'Kelso Private Equity',
    'Olympus Growth Fund',
    'TorQuest Capital',
  ];

  // Actually, let me just search for mid-market PE firms by industry tags
  const orgSearch = await apolloPost('/api/v1/mixed_companies/search', {
    q_organization_keyword_tags: ['private equity', 'business services'],
    organization_num_employees_ranges: ['11,50', '51,200'],
    page: 1,
    per_page: 25
  });
  
  if (orgSearch.organizations) {
    console.log(`Found ${orgSearch.organizations.length} orgs`);
    for (const org of orgSearch.organizations) {
      const isNew = !isKnown(org.name);
      if (isNew) {
        console.log(`NEW: ${org.name} | ${org.website_url || 'no website'} | ${org.industry || 'no industry'} | ${org.estimated_num_employees || '?'} employees`);
      }
    }
  }
  
  await sleep(500);
  
  // Search specifically for firms we might want
  const specificFirms = [
    'Altamont Capital Partners',
    'Grain Management',
    'MiddleGround Capital',
    'Godspeed Capital',
    'Greenbriar Equity Group',
    'L Catterton',
    'Peak Rock Capital',
  ];
  
  console.log('\n--- Specific firm lookups ---');
  for (const name of specificFirms) {
    if (isKnown(name)) { console.log(`SKIP (known): ${name}`); continue; }
    const res = await apolloPost('/api/v1/mixed_companies/search', {
      q_organization_name: name, page: 1, per_page: 1
    });
    await sleep(300);
    if (res.organizations && res.organizations[0]) {
      const o = res.organizations[0];
      console.log(`${o.name} | ${o.website_url} | ${o.industry} | ${o.estimated_num_employees} emp`);
      
      // Get a key person
      const pplRes = await apolloPost('/api/v1/mixed_people/api_search', {
        organization_ids: [o.id],
        person_titles: ['CTO', 'CEO', 'Managing Director', 'Partner', 'VP Technology', 'Head of Business Development'],
        page: 1, per_page: 3
      });
      await sleep(300);
      
      if (pplRes.people && pplRes.people.length > 0) {
        for (const p of pplRes.people.slice(0, 2)) {
          const enriched = await apolloPost('/api/v1/people/match', { id: p.id });
          await sleep(300);
          if (enriched.person) {
            const ep = enriched.person;
            console.log(`  -> ${ep.name} | ${ep.title} | ${ep.email || 'no email'} | ${ep.linkedin_url || ''}`);
          }
        }
      }
    } else {
      console.log(`${name}: not found`);
    }
  }
}

main().catch(console.error);
