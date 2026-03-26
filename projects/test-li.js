const https = require('https');
const url = 'https://www.linkedin.com/in/rajbhavsar';
const req = https.get(url, {headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'},timeout:8000}, res => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', JSON.stringify(res.headers).slice(0,300));
  let b=''; res.on('data', c => b+=c);
  res.on('end', () => {
    console.log('Body length:', b.length);
    console.log('Has authwall:', b.includes('authwall'));
    console.log('Has sign-in:', b.includes('sign-in'));
    console.log('First 500:', b.slice(0,500));
  });
});
req.on('error', e => console.error(e));
