// Batch 2: Enrich firms 51-100 with contacts via Apollo
// Uses organizations/enrich + people/match + web search fallback
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

async function apolloOrgEnrich(domain) {
  const data = JSON.stringify({ domain });
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.apollo.io', path: '/api/v1/organizations/enrich', method: 'POST',
      headers: {'Content-Type':'application/json','X-Api-Key':API_KEY,'Content-Length':Buffer.byteLength(data)}
    }, res => { let b=''; res.on('data',c=>b+=c); res.on('end',()=>{try{resolve(JSON.parse(b))}catch(e){resolve(null)}}); });
    req.on('error', reject); req.write(data); req.end();
  });
}

async function apolloPeopleMatch(firstName, lastName, orgName, domain) {
  const body = { first_name: firstName, last_name: lastName, organization_name: orgName };
  if (domain) body.domain = domain;
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.apollo.io', path: '/api/v1/people/match', method: 'POST',
      headers: {'Content-Type':'application/json','X-Api-Key':API_KEY,'Content-Length':Buffer.byteLength(data)}
    }, res => { let b=''; res.on('data',c=>b+=c); res.on('end',()=>{try{resolve(JSON.parse(b))}catch(e){resolve(null)}}); });
    req.on('error', reject); req.write(data); req.end();
  });
}

// Search for people at a company using the new api_search endpoint
// Returns basic info (names may be masked on free plan)
async function apolloPeopleApiSearch(orgName, domain) {
  const body = {
    q_organization_name: orgName,
    person_titles: ['Managing Partner', 'Partner', 'Managing Director', 'Operating Partner', 'Principal', 'CEO', 'Founder'],
    per_page: 10, page: 1
  };
  if (domain) body.q_organization_domains = domain;
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.apollo.io', path: '/api/v1/mixed_people/api_search', method: 'POST',
      headers: {'Content-Type':'application/json','X-Api-Key':API_KEY,'Content-Length':Buffer.byteLength(data)}
    }, res => { let b=''; res.on('data',c=>b+=c); res.on('end',()=>{try{resolve(JSON.parse(b))}catch(e){resolve(null)}}); });
    req.on('error', reject); req.write(data); req.end();
  });
}

async function main() {
  // 1. Read main sheet to get firms
  console.log('Reading CRM...');
  const mainRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID, range: 'Sheet1!A:M'
  });
  const mainRows = mainRes.data.values || [];
  const header = mainRows[0];
  console.log('Header:', header);
  console.log('Total rows:', mainRows.length - 1);

  // Find status column
  const statusIdx = header.findIndex(h => h && h.toLowerCase().includes('status'));
  const websiteIdx = header.findIndex(h => h && h.toLowerCase().includes('website'));
  const nameIdx = 0; // Company Name is always col A
  
  console.log('Status col:', statusIdx, 'Website col:', websiteIdx);

  // 2. Find rows 52-101 (batch 2 = rows after first 50 enriched)
  // Look for rows that don't have contacts yet
  const contactsRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID, range: 'Contacts!A:G'
  });
  const contactRows = contactsRes.data.values || [];
  const enrichedFirms = new Set();
  for (let i = 1; i < contactRows.length; i++) {
    if (contactRows[i][0]) enrichedFirms.add(contactRows[i][0].toLowerCase().trim());
  }
  console.log('Already enriched firms:', enrichedFirms.size);

  // Find next 50 unenriched firms
  const batch = [];
  for (let i = 1; i < mainRows.length && batch.length < 50; i++) {
    const name = (mainRows[i][nameIdx] || '').trim();
    if (!name) continue;
    if (enrichedFirms.has(name.toLowerCase())) continue;
    batch.push({
      rowNum: i + 1,
      name,
      website: mainRows[i][websiteIdx] || '',
      status: mainRows[i][statusIdx] || ''
    });
  }
  console.log('Batch 2: ' + batch.length + ' firms to enrich\n');

  // 3. Enrich each firm
  const allContacts = [];
  let found = 0, notFound = 0;

  for (let i = 0; i < batch.length; i++) {
    const firm = batch[i];
    const domain = extractDomain(firm.website);
    console.log('[' + (i+1) + '/' + batch.length + '] ' + firm.name + ' (' + (domain || 'no domain') + ')');

    const contacts = [];

    // Step 1: Org enrichment to get company info
    if (domain) {
      try {
        const orgData = await apolloOrgEnrich(domain);
        if (orgData && orgData.organization) {
          const org = orgData.organization;
          // Try to find people via api_search
          await sleep(300);
          const peopleRes = await apolloPeopleApiSearch(firm.name, domain);
          if (peopleRes && peopleRes.people) {
            for (const p of peopleRes.people) {
              if (!p.first_name || !p.last_name) continue;
              // Try people/match to get full details + email
              await sleep(300);
              const match = await apolloPeopleMatch(p.first_name, p.last_name, firm.name, domain);
              if (match && match.person && match.person.email) {
                contacts.push({
                  name: match.person.first_name + ' ' + match.person.last_name,
                  title: match.person.title || p.title || '',
                  email: match.person.email,
                  linkedin: match.person.linkedin_url || ''
                });
                if (contacts.length >= 3) break;
              }
            }
          }
        }
      } catch (e) {
        console.log('  Error: ' + e.message);
      }
    }

    // Step 2: If no contacts found, try people/match with common PE titles
    if (contacts.length === 0 && domain) {
      const commonNames = [
        // Try generic title-based searches
      ];
      // Skip - people/match needs actual names
    }

    if (contacts.length > 0) {
      found++;
      contacts.forEach(function(c) {
        console.log('  + ' + c.name + ' | ' + c.title + ' | ' + c.email);
        allContacts.push({
          company: firm.name,
          crmRow: firm.rowNum,
          name: c.name,
          title: c.title,
          email: c.email,
          linkedin: c.linkedin,
          status: 'New'
        });
      });
    } else {
      notFound++;
      console.log('  - No contacts found');
    }

    await sleep(500); // Rate limit
  }

  console.log('\n=== RESULTS ===');
  console.log('Found contacts: ' + found + '/' + batch.length);
  console.log('No contacts: ' + notFound);
  console.log('Total contacts: ' + allContacts.length);

  // 4. Write to Contacts sheet
  if (allContacts.length > 0) {
    const rows = allContacts.map(function(c) {
      return [c.company, String(c.crmRow), c.name, c.title, c.email, c.status, c.linkedin];
    });
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Contacts!A:G',
      valueInputOption: 'RAW',
      requestBody: { values: rows }
    });
    console.log('Wrote ' + rows.length + ' contacts to Contacts sheet');
  }

  // 5. Update main sheet status for enriched firms
  const updates = [];
  for (const contact of allContacts) {
    // Only update first contact per firm
    if (!updates.find(function(u) { return u.crmRow === contact.crmRow; })) {
      updates.push(contact);
    }
  }

  for (const u of updates) {
    if (statusIdx >= 0) {
      const col = String.fromCharCode(65 + statusIdx);
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: 'Sheet1!' + col + u.crmRow,
        valueInputOption: 'RAW',
        requestBody: { values: [['Enriched']] }
      });
    }
  }
  console.log('Updated ' + updates.length + ' firm statuses to Enriched');
}

main().catch(console.error);
