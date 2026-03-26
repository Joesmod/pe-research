const https = require('https');
const API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

function apolloPost(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.apollo.io',
      path: path,
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'X-Api-Key': API_KEY}
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch(e) { resolve({error: d}); } });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

(async () => {
  // Try to match Seth Brody at Apax Partners
  console.log('--- Matching Seth Brody at Apax Partners ---');
  const match = await apolloPost('/api/v1/people/match', {
    first_name: 'Seth',
    last_name: 'Brody',
    organization_name: 'Apax Partners',
    domain: 'apax.com'
  });
  if (match.person) {
    const p = match.person;
    console.log('Name:', p.first_name, p.last_name);
    console.log('Title:', p.title);
    console.log('Email:', p.email);
    console.log('LinkedIn:', p.linkedin_url);
    console.log('Email Status:', p.email_status);
  } else {
    console.log('No match. Raw:', JSON.stringify(match).slice(0, 500));
  }
})();
