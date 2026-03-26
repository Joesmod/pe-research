const https = require('https');
const KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

function apiCall(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.apollo.io',
      path: path,
      method: 'POST',
      headers: {'Content-Type':'application/json','X-Api-Key':KEY,'Content-Length':Buffer.byteLength(data)}
    }, res => {
      let b=''; res.on('data',c=>b+=c); res.on('end',()=>{try{resolve(JSON.parse(b))}catch(e){resolve(b)}});
    });
    req.on('error', reject);
    req.write(data); req.end();
  });
}

async function main() {
  // 1. Org enrichment - what data do we get?
  console.log('=== Organization Enrichment (Thoma Bravo) ===');
  const orgEnrich = await apiCall('/api/v1/organizations/enrich', { domain: 'thomabravo.com' });
  const o = orgEnrich.organization || {};
  console.log('Name:', o.name);
  console.log('Industry:', o.industry);
  console.log('Keywords:', JSON.stringify((o.keywords || []).slice(0,8)));
  console.log('Founded:', o.founded_year);
  console.log('Revenue:', o.organization_revenue_printed);
  console.log('Headcount:', o.estimated_num_employees);
  console.log('Technologies:', JSON.stringify((o.current_technologies || []).slice(0,10)));
  console.log('Short desc:', (o.short_description || '').slice(0,300));
  console.log('Org ID:', o.id);

  // 2. People search with role filters
  console.log('\n=== People Search (Thoma Bravo partners) ===');
  const people = await apiCall('/api/v1/mixed_people/search', {
    q_organization_name: 'Thoma Bravo',
    person_titles: ['Operating Partner', 'Managing Partner', 'Partner', 'Managing Director'],
    page: 1,
    per_page: 5
  });
  console.log('Total people found:', people.pagination && people.pagination.total_entries);
  (people.people || []).forEach(function(p) {
    console.log('  ' + p.name + ' | ' + p.title + ' | ' + (p.email || 'no email'));
  });

  // 3. Company search with industry filters
  console.log('\n=== Company Search (PE + technology industry focus) ===');
  const techPE = await apiCall('/api/v1/mixed_companies/search', {
    q_organization_keyword_tags: ['private equity'],
    organization_industry_tag_ids: ['5567cd4773696439b10b0000'], // technology
    organization_locations: ['United States'],
    page: 1,
    per_page: 5
  });
  console.log('Total tech-focused PE:', techPE.pagination && techPE.pagination.total_entries);
  (techPE.organizations || []).forEach(function(org) {
    console.log('  ' + org.name + ' | ' + (org.website_url || '') + ' | ' + (org.industry || ''));
  });

  // 4. Search by job postings / hiring signals
  console.log('\n=== People Search (PE firms hiring for tech roles) ===');
  const hiring = await apiCall('/api/v1/mixed_people/search', {
    q_organization_keyword_tags: ['private equity'],
    person_titles: ['Chief Technology Officer', 'VP Technology', 'Head of Digital'],
    organization_locations: ['United States'],
    page: 1,
    per_page: 5
  });
  console.log('PE firms with tech leaders:', hiring.pagination && hiring.pagination.total_entries);
  (hiring.people || []).forEach(function(p) {
    console.log('  ' + p.name + ' | ' + p.title + ' | ' + (p.organization && p.organization.name || ''));
  });

  // 5. Check what filters are available
  console.log('\n=== Available search fields (from error response) ===');
  const testBad = await apiCall('/api/v1/mixed_companies/search', { nonexistent_field: true });
  console.log(JSON.stringify(testBad).slice(0, 500));
}

main().catch(console.error);
