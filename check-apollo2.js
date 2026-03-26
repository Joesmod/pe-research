const API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function test() {
  // Try the people search with raw response
  const pResp = await fetch('https://api.apollo.io/api/v1/mixed_people/search', {
    method: 'POST',
    headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      organization_ids: ['54a13c3169702d048647d701'],
      per_page: 5,
    })
  });
  const raw = await pResp.text();
  console.log('Status:', pResp.status);
  console.log('Response:', raw.slice(0, 2000));
}

test().catch(console.error);
