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
      rowNum: i + 1, // 1-indexed, header is row 1
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

async function searchApollo(name, company, domain) {
  // Try people/match first (exact match by name + domain)
  if (name && domain) {
    const nameParts = name.split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];
    
    try {
      const resp = await fetch('https://api.apollo.io/api/v1/people/match', {
        method: 'POST',
        headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          organization_name: company,
          domain: domain,
        })
      });
      const data = await resp.json();
      if (data.person && data.person.email) {
        return { email: data.person.email, source: 'apollo_match', name: `${data.person.first_name} ${data.person.last_name}`, title: data.person.title };
      }
    } catch (e) {}
  }

  // Fallback: search by company domain for any contact
  if (domain) {
    try {
      const resp = await fetch('https://api.apollo.io/api/v1/mixed_people/search', {
        method: 'POST',
        headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q_organization_domains: domain,
          per_page: 5,
          person_titles: ['Managing Partner', 'CEO', 'Founder', 'Partner', 'Managing Director', 'Business Development', 'Operating Partner', 'Investor Relations'],
        })
      });
      const data = await resp.json();
      if (data.people && data.people.length > 0) {
        for (const p of data.people) {
          if (p.email) {
            return { email: p.email, source: 'apollo_search', name: `${p.first_name} ${p.last_name}`, title: p.title };
          }
        }
      }
    } catch (e) {}
  }

  return null;
}

function extractDomain(website) {
  if (!website) return null;
  try {
    const u = new URL(website.startsWith('http') ? website : 'https://' + website);
    return u.hostname.replace('www.', '');
  } catch { return null; }
}

async function main() {
  const rows = await getSheet();
  const missing = rows.filter(r => !r.email.trim());
  console.log(`Found ${missing.length} rows missing emails. Starting Apollo enrichment...\n`);

  const results = [];
  let found = 0;
  let notFound = 0;
  let errors = 0;

  for (let i = 0; i < missing.length; i++) {
    const row = missing[i];
    const domain = extractDomain(row.website);
    
    // Skip rows with no contact name AND no website
    if (!row.contact.trim() && !domain) {
      console.log(`[${i+1}/${missing.length}] SKIP ${row.company} - no contact or website`);
      notFound++;
      continue;
    }

    // Handle multiple contacts (separated by /)
    const names = row.contact.split('/').map(s => s.trim()).filter(Boolean);
    const primaryName = names[0] || '';

    console.log(`[${i+1}/${missing.length}] Searching: ${primaryName || '(any)'} @ ${row.company} (${domain || 'no domain'})...`);
    
    try {
      const result = await searchApollo(primaryName, row.company, domain);
      if (result) {
        found++;
        console.log(`  ✓ FOUND: ${result.email} (${result.name}, ${result.title}) via ${result.source}`);
        results.push({ ...row, foundEmail: result.email, foundName: result.name, foundTitle: result.title, source: result.source });
      } else {
        notFound++;
        console.log(`  ✗ Not found`);
      }
    } catch (e) {
      errors++;
      console.log(`  ✗ Error: ${e.message}`);
    }

    // Rate limit - Apollo allows ~5 req/sec on free tier
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\n=== RESULTS ===`);
  console.log(`Found: ${found} | Not Found: ${notFound} | Errors: ${errors}`);
  console.log(`\nEmails found:`);
  results.forEach(r => {
    console.log(`Row ${r.rowNum}: ${r.company} | ${r.foundName} | ${r.foundTitle} | ${r.foundEmail} | ${r.source}`);
  });

  // Save results to file
  const fs = require('fs');
  fs.writeFileSync('enrichment-results.json', JSON.stringify(results, null, 2));
  console.log('\nResults saved to enrichment-results.json');
}

main().catch(console.error);
