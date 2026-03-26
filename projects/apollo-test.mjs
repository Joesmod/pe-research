import https from 'https';
const API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
function post(apiPath, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.apollo.io', path: apiPath, method: 'POST',
      headers: {'Content-Type':'application/json','X-Api-Key':API_KEY,'Content-Length':Buffer.byteLength(data)}
    }, res => {
      let b=''; res.on('data',c=>b+=c); res.on('end',()=>console.log('STATUS:',res.statusCode,'BODY:',b.slice(0,1000)));
    });
    req.on('error', reject);
    req.write(data); req.end();
  });
}
await post('/api/v1/mixed_companies/search', {q_organization_name: 'TPG Capital', page:1, per_page:1});
