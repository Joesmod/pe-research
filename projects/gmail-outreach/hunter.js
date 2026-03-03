// Hunter.io API integration for email verification and discovery
const https = require('https');

const API_KEY = 'f9f608d7a2a76885122f0e8a2f6d3430d5242313';
const BASE = 'https://api.hunter.io/v2';

function hunterRequest(path) {
  const url = `${BASE}${path}${path.includes('?') ? '&' : '?'}api_key=${API_KEY}`;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`Parse error: ${data.slice(0, 200)}`)); }
      });
    }).on('error', reject);
  });
}

// Verify a single email address
async function verify(email) {
  const res = await hunterRequest(`/email-verifier?email=${encodeURIComponent(email)}`);
  if (res.errors) { console.error('Error:', res.errors); return null; }
  const d = res.data;
  console.log(`${email} → ${d.status} (score: ${d.score})`);
  console.log(`  result: ${d.result}, smtp: ${d.smtp_server ? 'yes' : 'no'}, disposable: ${d.disposable}, webmail: ${d.webmail}`);
  return d;
}

// Find emails at a domain (optionally filter by name)
async function find(domain, firstName, lastName) {
  let path = `/email-finder?domain=${encodeURIComponent(domain)}`;
  if (firstName) path += `&first_name=${encodeURIComponent(firstName)}`;
  if (lastName) path += `&last_name=${encodeURIComponent(lastName)}`;
  const res = await hunterRequest(path);
  if (res.errors) { console.error('Error:', res.errors); return null; }
  const d = res.data;
  console.log(`Found: ${d.email} (confidence: ${d.confidence})`);
  if (d.sources && d.sources.length) {
    console.log(`  Sources: ${d.sources.map(s => s.domain).join(', ')}`);
  }
  return d;
}

// Search all emails at a domain
async function domainSearch(domain, limit = 10) {
  const res = await hunterRequest(`/domain-search?domain=${encodeURIComponent(domain)}&limit=${limit}`);
  if (res.errors) { console.error('Error:', res.errors); return null; }
  const d = res.data;
  console.log(`Domain: ${d.domain} | Pattern: ${d.pattern} | Emails found: ${d.emails.length}`);
  d.emails.forEach(e => {
    console.log(`  ${e.value} — ${e.first_name} ${e.last_name} (${e.position || 'no title'}) confidence: ${e.confidence}`);
  });
  return d;
}

// Check account usage
async function account() {
  const res = await hunterRequest('/account');
  if (res.errors) { console.error('Error:', res.errors); return null; }
  const d = res.data;
  const r = d.requests;
  console.log(`Plan: ${d.plan_name} | Searches: ${r.searches.used}/${r.searches.available} | Verifications: ${r.verifications.used}/${r.verifications.available}`);
  return d;
}

// CLI
const [,, cmd, ...args] = process.argv;
(async () => {
  switch (cmd) {
    case 'verify': await verify(args[0]); break;
    case 'find': await find(args[0], args[1], args[2]); break;
    case 'search': await domainSearch(args[0], args[1] || 10); break;
    case 'account': await account(); break;
    default:
      console.log('Usage:');
      console.log('  node hunter.js verify <email>');
      console.log('  node hunter.js find <domain> [firstName] [lastName]');
      console.log('  node hunter.js search <domain> [limit]');
      console.log('  node hunter.js account');
  }
})();
