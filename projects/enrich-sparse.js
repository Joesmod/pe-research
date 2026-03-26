const https = require('https');
const {google} = require('googleapis');

const APOLLO_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

function apolloPost(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.apollo.io',
      path,
      method: 'POST',
      headers: {'Content-Type':'application/json','X-Api-Key':APOLLO_KEY,'Content-Length':Buffer.byteLength(data)}
    }, res => {
      let chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const firms = [
  {name: 'Roark Capital Group', domain: 'roarkcapital.com'},
  {name: 'Kohlberg & Company', domain: 'kohlberg.com'},
  {name: 'Diversis Capital', domain: 'diversis.com'},
  {name: 'Baymark Partners', domain: 'baymarkpartners.com'},
  {name: 'Parthenon Capital Partners', domain: 'parthenoncapital.com'},
  {name: 'Endeavour Capital', domain: 'endeavour.com'},
  {name: 'Metamora Growth Partners', domain: 'metamoragrowth.com'},
];

const titles = [
  'CEO','CTO','COO','CFO','CMO',
  'Managing Partner','Partner','Managing Director','Principal',
  'VP','Director','Head'
];

(async () => {
  const auth = new google.auth.GoogleAuth({keyFile:'projects/gmail-outreach/service-account.json', scopes:['https://www.googleapis.com/auth/spreadsheets']});
  const sheets = google.sheets({version:'v4', auth: await auth.getClient()});
  
  // Get existing contacts to avoid dupes
  const cRes = await sheets.spreadsheets.values.get({spreadsheetId:SHEET_ID, range:'Contacts!E2:E700'});
  const existingEmails = new Set((cRes.data.values||[]).map(r => (r[0]||'').toLowerCase().trim()));
  
  let allNewContacts = [];
  
  for (const firm of firms) {
    console.log(`\n--- ${firm.name} ---`);
    
    // Step 1: Find org
    await sleep(300);
    const orgRes = await apolloPost('/api/v1/mixed_companies/search', {
      q_organization_name: firm.name,
      page: 1,
      per_page: 3
    });
    
    const org = (orgRes.organizations||[]).find(o => 
      (o.primary_domain||'').includes(firm.domain) || (o.name||'').toLowerCase().includes(firm.name.split(' ')[0].toLowerCase())
    );
    
    if (!org) {
      console.log('  Org not found in Apollo');
      continue;
    }
    console.log(`  Found org: ${org.name} (${org.id})`);
    
    // Step 2: Search people
    await sleep(300);
    const peopleRes = await apolloPost('/api/v1/mixed_people/api_search', {
      organization_ids: [org.id],
      person_titles: titles,
      page: 1,
      per_page: 10
    });
    
    const people = peopleRes.people || [];
    console.log(`  Found ${people.length} people`);
    
    // Step 3: Enrich each person
    for (const person of people.slice(0, 5)) {
      await sleep(300);
      const enriched = await apolloPost('/api/v1/people/match', {id: person.id});
      const p = enriched.person;
      if (!p) continue;
      
      const email = p.email;
      if (!email || existingEmails.has(email.toLowerCase())) {
        console.log(`  Skip: ${p.first_name} ${p.last_name} (no email or dupe)`);
        continue;
      }
      
      existingEmails.add(email.toLowerCase());
      const contact = [
        firm.name,
        '',  // Gumbo Score (will fill from sheet)
        `${p.first_name} ${p.last_name}`,
        p.title || '',
        email,
        'verified',
        p.linkedin_url || '',
        `Apollo enrichment. Source: apollo.io`,
        ''  // Last Contacted
      ];
      allNewContacts.push(contact);
      console.log(`  + ${p.first_name} ${p.last_name} | ${p.title} | ${email}`);
    }
  }
  
  // Write to Contacts sheet
  if (allNewContacts.length > 0) {
    // Get scores from Sheet1
    const sRes = await sheets.spreadsheets.values.get({spreadsheetId:SHEET_ID, range:'Sheet1!A2:M200'});
    const scoreMap = {};
    (sRes.data.values||[]).forEach(r => { scoreMap[(r[0]||'').trim()] = r[12]||''; });
    
    allNewContacts.forEach(c => { c[1] = scoreMap[c[0]] || ''; });
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Contacts!A:I',
      valueInputOption: 'RAW',
      requestBody: { values: allNewContacts }
    });
    console.log(`\nAdded ${allNewContacts.length} new contacts to Contacts sheet`);
  } else {
    console.log('\nNo new contacts found');
  }
})();
