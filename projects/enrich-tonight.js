const https = require('https');
const { google } = require('googleapis');

const APOLLO_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

function apolloPost(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.apollo.io', path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': APOLLO_KEY }
    }, res => {
      let chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch(e) { reject(new Error(Buffer.concat(chunks).toString())); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function enrichFirm(firmName, domain) {
  console.log(`\n=== ${firmName} (${domain}) ===`);
  
  try {
    // Search for organization
    const orgRes = await apolloPost('/api/v1/mixed_companies/search', {
      q_organization_domains: domain, page: 1, per_page: 1
    });
    
    let orgId = null;
    if (orgRes.organizations?.length) orgId = orgRes.organizations[0].id;
    else if (orgRes.accounts?.length) orgId = orgRes.accounts[0].id;
    
    if (!orgId) {
      console.log(`  ❌ No org found for ${domain}`);
      return null;
    }
    
    console.log(`  ✓ Found org ID: ${orgId}`);
    await sleep(400);
    
    // Search for decision-makers
    const peopleRes = await apolloPost('/api/v1/mixed_people/search', {
      organization_ids: [orgId],
      person_titles: [
        'CEO', 'CTO', 'COO', 'CFO', 
        'Partner', 'Managing Partner', 'Managing Director',
        'VP', 'Vice President', 'Director',
        'Head', 'Principal', 'President', 'Founder'
      ],
      page: 1, per_page: 15
    });
    
    const people = peopleRes.people || [];
    if (!people.length) {
      console.log(`  ❌ No people found`);
      return null;
    }
    
    console.log(`  Found ${people.length} potential contacts`);
    
    // Enrich top 3 with emails
    const results = [];
    for (const person of people.slice(0, 5)) {
      await sleep(400);
      try {
        const enrichRes = await apolloPost('/api/v1/people/match', { id: person.id });
        const p = enrichRes.person;
        if (p && p.email && p.email_status === 'verified') {
          console.log(`    ✓ ${p.name} - ${p.title} - ${p.email}`);
          results.push({
            name: p.name || `${p.first_name} ${p.last_name}`,
            title: p.title,
            email: p.email,
            linkedin: p.linkedin_url
          });
        }
      } catch(e) { 
        console.log(`    ⚠ Enrichment failed for ${person.name}`);
      }
      if (results.length >= 2) break; // Get top 2 verified contacts
    }
    
    return results.length ? results[0] : null;
  } catch(e) {
    console.log(`  ❌ Error: ${e.message}`);
    return null;
  }
}

async function updateSheet(firmName, contact) {
  const auth = new google.auth.GoogleAuth({
    keyFile: './service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read sheet to find row
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:N'
  });
  
  const rows = res.data.values;
  const firmIndex = rows.findIndex(r => r[0] === firmName);
  
  if (firmIndex === -1) {
    console.log(`  ⚠ Firm "${firmName}" not found in sheet`);
    return;
  }
  
  const rowNum = firmIndex + 1;
  
  // Update Contact Name (C), Title (D), Email (E), LinkedIn (F)
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `Sheet1!C${rowNum}:F${rowNum}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        contact.name,
        contact.title,
        contact.email,
        contact.linkedin || ''
      ]]
    }
  });
  
  // Update status to "Enriched"
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `Sheet1!N${rowNum}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [['Enriched']] }
  });
  
  console.log(`  ✅ Updated sheet row ${rowNum}`);
}

async function main() {
  const targets = [
    { name: 'Nexa Equity', domain: 'nexaequity.com' },
    { name: 'PartnerOne', domain: 'partnerone.com' },
    { name: 'Pearl Energy Investments', domain: 'pearl-energy.com' },
    { name: 'Perella Weinberg', domain: 'pwpartners.com' },
    { name: 'PineBridge Investments', domain: 'pinebridge.com' },
    { name: 'Pioneer Fund', domain: 'pioneerfund.com' },
    { name: 'Reach Capital', domain: 'reachcapital.com' },
    { name: 'Ribbit Capital', domain: 'ribbitcap.com' },
    { name: 'RCP Advisors', domain: 'rcpadvisors.com' },
  ];
  
  let enriched = 0;
  for (const target of targets) {
    const contact = await enrichFirm(target.name, target.domain);
    if (contact) {
      try {
        await updateSheet(target.name, contact);
        enriched++;
      } catch(e) {
        console.log(`  ❌ Sheet update failed: ${e.message}`);
      }
    }
    await sleep(1000); // Rate limit between firms
    
    if (enriched >= 12) {
      console.log(`\n✅ Enriched ${enriched} firms - stopping`);
      break;
    }
  }
  
  console.log(`\n\n=== SUMMARY ===`);
  console.log(`Total enriched: ${enriched}`);
}

main().catch(console.error);
