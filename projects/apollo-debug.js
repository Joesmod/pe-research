const https = require('https');
const APOLLO_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

function apolloPost(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.apollo.io',
      path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': APOLLO_KEY }
    }, res => {
      let buf = '';
      res.on('data', c => buf += c);
      res.on('end', () => { console.log('Status:', res.statusCode); console.log(buf.substring(0, 1000)); resolve(); });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

(async () => {
  await apolloPost('/api/v1/mixed_companies/search', {
    q_organization_name: 'TPG Capital', page: 1, per_page: 3
  });
})();
