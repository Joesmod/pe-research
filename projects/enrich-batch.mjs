import https from 'https';

const API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const delay = ms => new Promise(r=>setTimeout(r,ms));

function post(apiPath, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.apollo.io', path: apiPath, method: 'POST',
      headers: {'Content-Type':'application/json','X-Api-Key':API_KEY,'Content-Length':Buffer.byteLength(data)}
    }, res => {
      let b=''; res.on('data',c=>b+=c); res.on('end',()=>{try{resolve(JSON.parse(b))}catch(e){resolve({raw:b.slice(0,500)})}});
    });
    req.on('error', reject);
    req.write(data); req.end();
  });
}

async function enrichFirm(name) {
  // Find org
  let data = await post('/api/v1/mixed_companies/search', {q_organization_name: name, page:1, per_page:1});
  const org = (data.organizations||[])[0];
  if(!org) return {firm:name, error:'org not found', keys: Object.keys(data).slice(0,5)};
  await delay(400);

  // Search people  
  data = await post('/api/v1/mixed_people/api_search', {
    organization_ids:[org.id],
    person_titles:['CEO','CTO','COO','CFO','Managing Partner','Partner','Managing Director','Principal','VP','Director','Head of Value Creation','Head of Portfolio Operations'],
    page:1, per_page:5
  });
  const people = data.people || [];
  await delay(400);

  // Enrich
  let results = [];
  for(const p of people.slice(0,5)) {
    data = await post('/api/v1/people/match', {id: p.id, reveal_personal_emails: false});
    const person = data.person || {};
    results.push({
      name: person.name || person.first_name + ' ' + person.last_name,
      title: person.title,
      email: person.email || null,
      linkedin: person.linkedin_url || null
    });
    await delay(400);
  }
  return {firm:name, orgName: org.name, peopleFound:people.length, results};
}

const firms = ['Apax Partners','Keltic Financial Partners','GI Partners','TPG Capital','Vance Street Capital','Valeas Capital Partners'];

for(const f of firms) {
  const r = await enrichFirm(f);
  console.log(JSON.stringify(r));
  await delay(500);
}
