// Batch 2: Enrich next 50 firms using Apollo api_search + website team pages + people/match
const path = require('path');
const https = require('https');
const dir = path.join(__dirname, 'projects', 'gmail-outreach');
const {google} = require(path.join(dir, 'node_modules', 'googleapis'));
const {JWT} = require(path.join(dir, 'node_modules', 'google-auth-library'));
const creds = require(path.join(dir, 'service-account.json'));
const auth = new JWT({email: creds.client_email, key: creds.private_key, scopes: ['https://www.googleapis.com/auth/spreadsheets']});
const sheets = google.sheets({version:'v4', auth});
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function extractDomain(website) {
  if (!website) return null;
  try {
    const u = new URL(website.startsWith('http') ? website : 'https://' + website);
    return u.hostname.replace('www.', '');
  } catch { return null; }
}

function apolloPost(apiPath, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.apollo.io', path: apiPath, method: 'POST',
      headers: {'Content-Type':'application/json','X-Api-Key':API_KEY,'Content-Length':Buffer.byteLength(data)}
    }, res => { let b=''; res.on('data',c=>b+=c); res.on('end',()=>{try{resolve(JSON.parse(b))}catch(e){resolve(null)}}); });
    req.on('error', reject); req.write(data); req.end();
  });
}

// Fetch a URL and return text
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : require('http');
    const req = proto.get(url, {headers: {'User-Agent': 'Mozilla/5.0'}}, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      let b = ''; res.on('data', c => b += c); res.on('end', () => resolve(b));
    });
    req.on('error', () => resolve('')); 
    req.setTimeout(10000, () => { req.destroy(); resolve(''); });
  });
}

// Extract names from a team page HTML
function extractNamesFromHtml(html, firstNames) {
  const names = [];
  // Look for patterns like "First Last" near title keywords
  for (const firstName of firstNames) {
    // Regex: firstName followed by a capitalized word (last name)
    const re = new RegExp(firstName + '\\s+([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)?)', 'g');
    let m;
    while ((m = re.exec(html)) !== null) {
      const fullName = firstName + ' ' + m[1];
      if (!names.includes(fullName)) names.push(fullName);
    }
  }
  return names;
}

async function main() {
  console.log('Reading CRM...');
  const mainRes = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Sheet1!A:M' });
  const mainRows = mainRes.data.values || [];
  const header = mainRows[0];
  const statusIdx = header.findIndex(h => h && h.toLowerCase().includes('status'));
  const websiteIdx = header.findIndex(h => h && h.toLowerCase().includes('website'));

  // Get already enriched firms
  const contactsRes = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Contacts!A:G' });
  const contactRows = contactsRes.data.values || [];
  const enrichedFirms = new Set();
  for (let i = 1; i < contactRows.length; i++) {
    if (contactRows[i][0]) enrichedFirms.add(contactRows[i][0].toLowerCase().trim());
  }
  console.log('Already enriched:', enrichedFirms.size);

  // Find next 50 unenriched
  const batch = [];
  for (let i = 1; i < mainRows.length && batch.length < 50; i++) {
    const name = (mainRows[i][0] || '').trim();
    if (!name || enrichedFirms.has(name.toLowerCase())) continue;
    batch.push({ rowNum: i+1, name, website: mainRows[i][websiteIdx] || '' });
  }
  console.log('Batch: ' + batch.length + ' firms\n');

  const allContacts = [];
  let foundCount = 0;

  for (let i = 0; i < batch.length; i++) {
    const firm = batch[i];
    const domain = extractDomain(firm.website);
    process.stdout.write('[' + (i+1) + '/' + batch.length + '] ' + firm.name);

    const contacts = [];

    if (!domain) { console.log(' - no domain, skip'); continue; }

    // Step 1: Get first names from api_search
    try {
      const searchRes = await apolloPost('/api/v1/mixed_people/api_search', {
        q_organization_name: firm.name,
        person_titles: ['Managing Partner', 'Partner', 'Managing Director', 'Operating Partner', 'Principal', 'CEO', 'Founder'],
        per_page: 10, page: 1
      });
      
      const people = (searchRes && searchRes.people) || [];
      const firstNames = people.filter(function(p) { return p.first_name; }).map(function(p) { return p.first_name; });
      const partialLastNames = people.filter(function(p) { return p.last_name_obfuscated; }).map(function(p) { return p.last_name_obfuscated; });
      
      if (firstNames.length === 0) {
        console.log(' - no people in Apollo');
        await sleep(500);
        continue;
      }

      // Step 2: Try to get full names from company team page
      await sleep(300);
      const teamUrls = [
        'https://www.' + domain + '/team',
        'https://www.' + domain + '/about',
        'https://www.' + domain + '/people',
        'https://www.' + domain + '/our-team',
        'https://www.' + domain + '/leadership',
        'https://' + domain + '/team',
        'https://' + domain + '/about',
        'https://' + domain + '/people',
      ];

      let teamHtml = '';
      for (const url of teamUrls) {
        const html = await fetchUrl(url);
        if (html.length > 1000 && (html.toLowerCase().includes('partner') || html.toLowerCase().includes('director') || html.toLowerCase().includes('team'))) {
          teamHtml = html;
          break;
        }
      }

      // Step 3: Match first names to full names from website
      let fullNames = [];
      if (teamHtml) {
        fullNames = extractNamesFromHtml(teamHtml, firstNames);
      }

      // If we couldn't get full names from website, try using partial last names
      // Some obfuscated patterns like "Ag***l" can be deduced if we have context
      
      // Step 4: Use people/match for each full name we found
      const tried = new Set();
      for (const fullName of fullNames.slice(0, 5)) {
        if (tried.has(fullName)) continue;
        tried.add(fullName);
        const parts = fullName.split(' ');
        const first = parts[0];
        const last = parts[parts.length - 1];
        
        await sleep(300);
        const matchRes = await apolloPost('/api/v1/people/match', {
          first_name: first, last_name: last, organization_name: firm.name, domain: domain
        });
        
        if (matchRes && matchRes.person && matchRes.person.email) {
          const p = matchRes.person;
          contacts.push({
            name: (p.first_name || first) + ' ' + (p.last_name || last),
            title: p.title || '',
            email: p.email,
            linkedin: p.linkedin_url || ''
          });
          if (contacts.length >= 3) break;
        }
      }

      // If website didn't help but we have first names, try people/match with just first name + org
      if (contacts.length === 0) {
        for (let j = 0; j < Math.min(firstNames.length, 3); j++) {
          await sleep(300);
          // Try with just first name - Apollo might find them
          const matchRes = await apolloPost('/api/v1/people/match', {
            first_name: firstNames[j], organization_name: firm.name, domain: domain
          });
          if (matchRes && matchRes.person && matchRes.person.email) {
            const p = matchRes.person;
            contacts.push({
              name: p.first_name + ' ' + p.last_name,
              title: p.title || '',
              email: p.email,
              linkedin: p.linkedin_url || ''
            });
            if (contacts.length >= 3) break;
          }
        }
      }

    } catch (e) {
      console.log(' ERROR: ' + e.message);
    }

    if (contacts.length > 0) {
      foundCount++;
      console.log(' ✓ ' + contacts.length + ' contacts');
      contacts.forEach(function(c) {
        console.log('    ' + c.name + ' | ' + c.title + ' | ' + c.email);
        allContacts.push({
          company: firm.name, crmRow: firm.rowNum,
          name: c.name, title: c.title, email: c.email, linkedin: c.linkedin, status: 'New'
        });
      });
    } else {
      console.log(' - no contacts');
    }
    await sleep(500);
  }

  console.log('\n=== RESULTS ===');
  console.log('Firms with contacts: ' + foundCount + '/' + batch.length);
  console.log('Total contacts: ' + allContacts.length);

  // Write to Contacts sheet
  if (allContacts.length > 0) {
    const rows = allContacts.map(function(c) {
      return [c.company, String(c.crmRow), c.name, c.title, c.email, c.status, c.linkedin];
    });
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID, range: 'Contacts!A:G', valueInputOption: 'RAW',
      requestBody: { values: rows }
    });
    console.log('Wrote ' + rows.length + ' contacts to Contacts sheet');

    // Update main sheet status
    const updated = new Set();
    for (const c of allContacts) {
      if (updated.has(c.crmRow)) continue;
      updated.add(c.crmRow);
      const col = String.fromCharCode(65 + statusIdx);
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID, range: 'Sheet1!' + col + c.crmRow,
        valueInputOption: 'RAW', requestBody: { values: [['Enriched']] }
      });
    }
    console.log('Updated ' + updated.size + ' firm statuses');
  }
}

main().catch(console.error);
