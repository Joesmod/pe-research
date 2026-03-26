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
    });
  }
  return rows;
}

async function searchByOrgName(companyName) {
  // Use organization enrichment to find the org, then search people
  try {
    // First find the org
    const orgResp = await fetch('https://api.apollo.io/api/v1/mixed_companies/search', {
      method: 'POST',
      headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q_organization_name: companyName,
        per_page: 1,
      })
    });
    const orgData = await orgResp.json();
    
    if (!orgData.organizations || orgData.organizations.length === 0) return null;
    
    const org = orgData.organizations[0];
    const orgId = org.id;
    const domain = org.primary_domain;
    
    // Now search people at this org
    const peopleResp = await fetch('https://api.apollo.io/api/v1/mixed_people/search', {
      method: 'POST',
      headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        organization_ids: [orgId],
        per_page: 10,
        person_seniorities: ['owner', 'founder', 'c_suite', 'partner', 'vp', 'director'],
      })
    });
    const peopleData = await peopleResp.json();
    
    if (!peopleData.people || peopleData.people.length === 0) return null;

    // Prefer BD/IR, then partners, then anyone with email
    const priorities = [
      p => p.email && p.title && /business develop|investor relation|marketing|communications/i.test(p.title),
      p => p.email && p.title && /managing partner|co-founder|ceo|founder/i.test(p.title),
      p => p.email && p.title && /partner|managing director|principal/i.test(p.title),
      p => p.email,
    ];

    for (const pred of priorities) {
      const match = peopleData.people.find(pred);
      if (match) {
        return {
          email: match.email,
          name: `${match.first_name || ''} ${match.last_name || ''}`.trim(),
          title: match.title || '',
          source: 'apollo_org_search',
          domain: domain,
        };
      }
    }
  } catch (e) {
    console.log(`  Error: ${e.message}`);
  }
  return null;
}

async function main() {
  const rows = await getSheet();
  const missing = rows.filter(r => !r.email.trim());
  console.log(`Pass 3 (org search): ${missing.length} rows still missing emails\n`);

  const results = [];
  let found = 0;
  let notFound = 0;

  for (let i = 0; i < missing.length; i++) {
    const row = missing[i];
    
    if (!row.company.trim()) {
      notFound++;
      continue;
    }

    console.log(`[${i+1}/${missing.length}] Org search: ${row.company}...`);
    
    const result = await searchByOrgName(row.company);
    if (result) {
      found++;
      console.log(`  ✓ FOUND: ${result.name} | ${result.title} | ${result.email}`);
      results.push({ ...row, foundEmail: result.email, foundName: result.name, foundTitle: result.title, source: result.source });
    } else {
      notFound++;
      console.log(`  ✗ Not found`);
    }

    // 2 API calls per row, be conservative
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\n=== PASS 3 RESULTS ===`);
  console.log(`Found: ${found} | Not Found: ${notFound}`);
  results.forEach(r => {
    console.log(`Row ${r.rowNum}: ${r.company} | ${r.foundName} | ${r.foundTitle} | ${r.foundEmail}`);
  });

  require('fs').writeFileSync('enrichment-pass3-results.json', JSON.stringify(results, null, 2));
  console.log('\nSaved to enrichment-pass3-results.json');
}

main().catch(console.error);
