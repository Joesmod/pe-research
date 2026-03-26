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
  // New endpoint
  const res = await apiCall('/api/v1/mixed_people/api_search', {
    q_organization_name: 'Thoma Bravo',
    person_titles: ['Partner', 'Managing Partner', 'Operating Partner'],
    page: 1,
    per_page: 5
  });
  console.log('Keys:', Object.keys(res));
  console.log('Pagination:', JSON.stringify(res.pagination));
  if (res.people) {
    res.people.forEach(function(p) {
      console.log('  ' + p.name + ' | ' + p.title + ' | ' + (p.email || 'no email') + ' | ' + (p.linkedin_url || ''));
    });
  }
  if (res.error) console.log('Error:', JSON.stringify(res.error));

  // Also test company api_search
  console.log('\n=== Company api_search ===');
  const res2 = await apiCall('/api/v1/mixed_companies/api_search', {
    q_organization_keyword_tags: ['private equity'],
    organization_locations: ['United States'],
    page: 1,
    per_page: 3
  });
  console.log('Keys:', Object.keys(res2));
  if (res2.error) console.log('Error:', JSON.stringify(res2.error));
  if (res2.organizations) {
    console.log('Total:', res2.pagination && res2.pagination.total_entries);
    res2.organizations.forEach(function(o) {
      console.log('  ' + o.name + ' | ' + (o.website_url || ''));
    });
  }
}

main().catch(console.error);
