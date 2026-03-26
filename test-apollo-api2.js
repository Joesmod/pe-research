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
  // People search - check full response structure
  console.log('=== People Search ===');
  const res = await apiCall('/api/v1/mixed_people/search', {
    q_organization_name: 'Thoma Bravo',
    person_titles: ['Partner'],
    page: 1,
    per_page: 3
  });
  console.log('Top-level keys:', Object.keys(res));
  console.log('Pagination:', JSON.stringify(res.pagination));
  if (res.people && res.people.length > 0) {
    const p = res.people[0];
    console.log('Person keys:', Object.keys(p));
    console.log('Sample:', p.name, '|', p.title, '|', p.email, '|', p.linkedin_url);
  }
  if (res.contacts && res.contacts.length > 0) {
    console.log('Contacts found:', res.contacts.length);
    const c = res.contacts[0];
    console.log('Contact:', c.name, '|', c.title, '|', c.email);
  }

  // Intent signals - buyer intent
  console.log('\n=== Organization search with intent topics ===');
  const intent = await apiCall('/api/v1/mixed_companies/search', {
    q_organization_keyword_tags: ['private equity'],
    organization_locations: ['United States'],
    q_organization_search_list_id: null,
    // Try intent/buying signal params
    organization_num_employees_ranges: ['51,500'],
    page: 1,
    per_page: 3
  });
  if (intent.organizations && intent.organizations[0]) {
    const org = intent.organizations[0];
    console.log('Org keys:', Object.keys(org));
    // Check for intent/signal fields
    console.log('Intent data:', org.intent_strength, org.buying_intent);
    console.log('Tech stack:', JSON.stringify((org.current_technologies || []).slice(0,5)));
    console.log('Headcount growth:', org.organization_headcount_six_month_growth);
  }

  // People search - directly finding decision makers at PE portfolio companies
  console.log('\n=== People at PE portfolio cos looking for AI ===');
  const portfolio = await apiCall('/api/v1/mixed_people/search', {
    person_titles: ['Chief Technology Officer', 'VP Engineering', 'Head of AI'],
    q_organization_keyword_tags: ['private equity backed'],
    organization_locations: ['United States'],
    page: 1,
    per_page: 5
  });
  console.log('Pagination:', JSON.stringify(portfolio.pagination));
  (portfolio.people || portfolio.contacts || []).slice(0,5).forEach(function(p) {
    var org = p.organization || {};
    console.log('  ' + p.name + ' | ' + p.title + ' | ' + org.name + ' | ' + (p.email || 'no email'));
  });
}

main().catch(console.error);
