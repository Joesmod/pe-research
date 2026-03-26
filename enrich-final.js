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

function extractDomain(website) {
  if (!website) return null;
  try {
    const u = new URL(website.startsWith('http') ? website : 'https://' + website);
    return u.hostname.replace('www.', '');
  } catch { return null; }
}

async function findAndMatch(companyName, domain) {
  // Step 1: Search for people at org (new endpoint, no emails revealed)
  try {
    const body = { per_page: 10, person_seniorities: ['owner', 'founder', 'c_suite', 'partner', 'vp', 'director'] };
    if (domain) body.q_organization_domains = domain;
    else body.q_organization_name = companyName;

    const resp = await fetch('https://api.apollo.io/api/v1/mixed_people/api_search', {
      method: 'POST',
      headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await resp.json();
    
    if (!data.people || data.people.length === 0) return null;

    // Step 2: For each person found, try people/match to reveal email
    for (const p of data.people) {
      if (!p.first_name || !p.last_name) continue;
      
      await new Promise(r => setTimeout(r, 200));
      
      const matchResp = await fetch('https://api.apollo.io/api/v1/people/match', {
        method: 'POST',
        headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: p.first_name,
          last_name: p.last_name,
          organization_name: companyName,
          domain: domain || undefined,
        })
      });
      const matchData = await matchResp.json();
      
      if (matchData.person && matchData.person.email) {
        return {
          email: matchData.person.email,
          name: `${matchData.person.first_name} ${matchData.person.last_name}`,
          title: matchData.person.title || p.title || '',
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
  console.log(`Final pass (search + match): ${missing.length} rows\n`);

  const results = [];
  let found = 0;
  let notFound = 0;

  for (let i = 0; i < missing.length; i++) {
    const row = missing[i];
    const domain = extractDomain(row.website);
    if (!row.company.trim() && !domain) { notFound++; continue; }

    console.log(`[${i+1}/${missing.length}] ${row.company}...`);
    
    const result = await findAndMatch(row.company, domain);
    if (result) {
      found++;
      console.log(`  ✓ ${result.name} | ${result.title} | ${result.email}`);
      results.push({ ...row, foundEmail: result.email, foundName: result.name, foundTitle: result.title });
    } else {
      notFound++;
      console.log(`  ✗ Not found`);
    }

    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\n=== FINAL RESULTS ===`);
  console.log(`Found: ${found} | Not Found: ${notFound}`);
  results.forEach(r => {
    console.log(`Row ${r.rowNum}: ${r.company} | ${r.foundName} | ${r.foundTitle} | ${r.foundEmail}`);
  });

  require('fs').writeFileSync('enrichment-final-results.json', JSON.stringify(results, null, 2));
  console.log('\nSaved to enrichment-final-results.json');
}

main().catch(console.error);
