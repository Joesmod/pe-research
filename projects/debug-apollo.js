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
        catch(e) { resolve(Buffer.concat(chunks).toString()); }
      });
    });
    req.on('error', reject);
    req.end(data);
  });
}

(async () => {
  // Test company search
  const res = await apiCall('/api/v1/mixed_companies/search', {
    q_organization_name: 'Thoma Bravo',
    page: 1,
    per_page: 1
  });
  console.log('Company search response:', JSON.stringify(res).substring(0, 500));
  
  // Try alternative: search by domain
  const res2 = await apiCall('/api/v1/mixed_people/api_search', {
    q_organization_name: 'Thoma Bravo',
    person_titles: ['Chief Technology Officer', 'Chief AI Officer', 'VP Technology'],
    page: 1,
    per_page: 5
  });
  console.log('\nPeople search response:', JSON.stringify(res2).substring(0, 1000));
})();
