const path = require('path');
const https = require('https');
const dir = path.join(__dirname, 'gmail-outreach');
const {google} = require(path.join(dir, 'node_modules', 'googleapis'));
const {JWT} = require(path.join(dir, 'node_modules', 'google-auth-library'));
const creds = require(path.join(dir, 'service-account.json'));
const auth = new JWT({email: creds.client_email, key: creds.private_key, scopes: ['https://www.googleapis.com/auth/spreadsheets']});
const sheets = google.sheets({version:'v4', auth});
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

function apolloSearch(body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.apollo.io',
      path: '/api/v1/mixed_companies/search',
      method: 'POST',
      headers: {'Content-Type':'application/json','X-Api-Key':API_KEY,'Content-Length':Buffer.byteLength(data)}
    }, res => {
      let b=''; res.on('data',c=>b+=c); res.on('end',()=>{try{resolve(JSON.parse(b))}catch(e){reject(e)}});
    });
    req.on('error', reject);
    req.write(data); req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const mode = process.argv[2] || 'scan';

  // Get existing firms from CRM
  console.log('Fetching existing CRM firms...');
  const crmRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:A'
  });
  const existing = new Set((crmRes.data.values || []).flat().map(n => n.toLowerCase().trim()));
  console.log(`Found ${existing.size} existing firms in CRM`);

  // Search configs - different keyword combos to maximize coverage
  const searches = [
    { label: 'PE keyword, 51-1000 employees', q_organization_keyword_tags: ['private equity'], organization_num_employees_ranges: ['51,200','201,500','501,1000'], organization_locations: ['United States'] },
    { label: 'PE keyword, 11-50 employees', q_organization_keyword_tags: ['private equity'], organization_num_employees_ranges: ['11,50'], organization_locations: ['United States'] },
    { label: 'Buyout keyword', q_organization_keyword_tags: ['buyout', 'leveraged buyout'], organization_num_employees_ranges: ['11,200','201,1000'], organization_locations: ['United States'] },
    { label: 'Growth equity keyword', q_organization_keyword_tags: ['growth equity'], organization_num_employees_ranges: ['11,500'], organization_locations: ['United States'] },
  ];

  const allNew = new Map(); // name -> org data

  for (const search of searches) {
    const {label, ...params} = search;
    console.log(`\n--- ${label} ---`);

    // Get first page to see total
    const first = await apolloSearch({...params, page: 1, per_page: 100});
    const total = first.pagination.total_entries;
    const pages = Math.min(first.pagination.total_pages, 10); // cap at 10 pages per search
    console.log(`Total results: ${total}, scanning ${pages} pages`);

    const processOrgs = (orgs) => {
      for (const o of (orgs || [])) {
        const name = (o.name || '').trim();
        const nameLower = name.toLowerCase();
        // Skip if already in CRM or already found
        if (existing.has(nameLower) || allNew.has(nameLower)) continue;
        // Basic quality filter - must have website or linkedin
        if (!o.website_url && !o.linkedin_url) continue;
        allNew.set(nameLower, {
          name,
          website: o.website_url || '',
          linkedin: o.linkedin_url || '',
          phone: o.phone || '',
          founded: o.founded_year || '',
          revenue: o.organization_revenue_printed || '',
          headcount_growth_6m: o.organization_headcount_six_month_growth || 0,
        });
      }
    };

    processOrgs(first.organizations);

    for (let p = 2; p <= pages; p++) {
      await sleep(500); // rate limit
      const res = await apolloSearch({...params, page: p, per_page: 100});
      processOrgs(res.organizations);
    }
  }

  console.log(`\n=== Found ${allNew.size} NEW firms not in CRM ===\n`);

  if (mode === 'scan') {
    // Just show results
    const sorted = [...allNew.values()].sort((a,b) => a.name.localeCompare(b.name));
    sorted.slice(0, 50).forEach(o => {
      console.log(`${o.name} | ${o.website} | ${o.linkedin}`);
    });
    if (sorted.length > 50) console.log(`... and ${sorted.length - 50} more`);
  }

  if (mode === 'export') {
    // Export to JSON for further processing
    const sorted = [...allNew.values()].sort((a,b) => a.name.localeCompare(b.name));
    const fs = require('fs');
    fs.writeFileSync(path.join(__dirname, 'apollo-new-firms.json'), JSON.stringify(sorted, null, 2));
    console.log(`Exported ${sorted.length} firms to apollo-new-firms.json`);
  }
}

main().catch(console.error);
