const API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function getSheet() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=0`;
  const t = await fetch(url).then(r => r.text());
  const lines = t.trim().split('\n');
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = [];
    const re = /"([^"]*)"/g;
    let m;
    while ((m = re.exec(lines[i])) !== null) cols.push(m[1]);
    rows.push({
      rowNum: i + 1,
      company: cols[0] || '',
      contact: cols[1] || '',
      title: cols[2] || '',
      email: cols[3] || '',
      website: cols[4] || '',
      linkedin: cols[5] || '',
    });
  }
  return rows;
}

function extractDomain(website) {
  if (!website) return null;
  try {
    const u = new URL(website.startsWith('http') ? website : 'https://' + website);
    return u.hostname.replace('www.', '');
  } catch { return null; }
}

async function searchByDomain(domain, company) {
  // Search for senior people at the company
  const titles = [
    'Managing Partner', 'Partner', 'CEO', 'Founder',
    'Managing Director', 'Business Development', 'Principal',
    'Operating Partner', 'Investor Relations', 'Vice President'
  ];

  try {
    const resp = await fetch('https://api.apollo.io/api/v1/mixed_people/search', {
      method: 'POST',
      headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q_organization_domains: domain,
        per_page: 10,
        person_titles: titles,
      })
    });
    const data = await resp.json();
    if (data.people && data.people.length > 0) {
      // Find first person with an email, preferring BD/IR roles
      const bdPerson = data.people.find(p => p.email && p.title && 
        (p.title.toLowerCase().includes('business development') || 
         p.title.toLowerCase().includes('investor relations') ||
         p.title.toLowerCase().includes('marketing')));
      const partnerPerson = data.people.find(p => p.email && p.title &&
        (p.title.toLowerCase().includes('partner') || 
         p.title.toLowerCase().includes('ceo') ||
         p.title.toLowerCase().includes('founder')));
      const anyPerson = data.people.find(p => p.email);
      
      const best = bdPerson || partnerPerson || anyPerson;
      if (best) {
        return {
          email: best.email,
          name: `${best.first_name || ''} ${best.last_name || ''}`.trim(),
          title: best.title || '',
          source: 'apollo_domain_search'
        };
      }
    }
  } catch (e) {
    console.log(`  Error: ${e.message}`);
  }
  return null;
}

async function main() {
  // Re-read sheet (now has pass 1 results)
  const rows = await getSheet();
  const missing = rows.filter(r => !r.email.trim());
  console.log(`Pass 2: ${missing.length} rows still missing emails\n`);

  const results = [];
  let found = 0;
  let notFound = 0;

  for (let i = 0; i < missing.length; i++) {
    const row = missing[i];
    const domain = extractDomain(row.website);
    
    if (!domain) {
      console.log(`[${i+1}/${missing.length}] SKIP ${row.company} - no website`);
      notFound++;
      continue;
    }

    console.log(`[${i+1}/${missing.length}] Domain search: ${row.company} (${domain})...`);
    
    const result = await searchByDomain(domain, row.company);
    if (result) {
      found++;
      console.log(`  ✓ FOUND: ${result.name} | ${result.title} | ${result.email}`);
      results.push({ ...row, foundEmail: result.email, foundName: result.name, foundTitle: result.title, source: result.source });
    } else {
      notFound++;
      console.log(`  ✗ Not found`);
    }

    await new Promise(r => setTimeout(r, 400));
  }

  console.log(`\n=== PASS 2 RESULTS ===`);
  console.log(`Found: ${found} | Not Found: ${notFound}`);
  results.forEach(r => {
    console.log(`Row ${r.rowNum}: ${r.company} | ${r.foundName} | ${r.foundTitle} | ${r.foundEmail}`);
  });

  require('fs').writeFileSync('enrichment-pass2-results.json', JSON.stringify(results, null, 2));
  console.log('\nSaved to enrichment-pass2-results.json');
}

main().catch(console.error);
