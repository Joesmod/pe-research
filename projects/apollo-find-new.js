const path = require('path');
const {google} = require(path.join(__dirname, 'gmail-outreach', 'node_modules', 'googleapis'));
const {JWT} = require(path.join(__dirname, 'gmail-outreach', 'node_modules', 'google-auth-library'));
const creds = require(path.join(__dirname, 'gmail-outreach', 'service-account.json'));
const auth = new JWT({email: creds.client_email, key: creds.private_key, scopes: ['https://www.googleapis.com/auth/spreadsheets']});
const sheets = google.sheets({version:'v4', auth});
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const sleep = ms => new Promise(r=>setTimeout(r,ms));

async function apolloPost(p, body) {
  const r = await fetch(`https://api.apollo.io/api/v1${p}`, {
    method:'POST', headers:{'Content-Type':'application/json','X-Api-Key':API_KEY}, body:JSON.stringify(body)
  });
  return r.json();
}

const TITLES = ['CEO','CTO','COO','Managing Partner','Partner','Managing Director','Principal','VP','Director','Operating Partner'];

async function main() {
  const crmRes = await sheets.spreadsheets.values.get({spreadsheetId: SHEET_ID, range: 'Sheet1!A:A'});
  const existing = new Set((crmRes.data.values||[]).flat().map(n=>n.toLowerCase().trim()));

  // Search Apollo for PE firms, page through to find ones NOT in CRM
  // Use different keywords to find niche firms
  const keywords = ['private equity services', 'middle market private equity', 'operational value creation private equity'];
  
  const newFirms = [];
  
  for (const kw of keywords) {
    if (newFirms.length >= 5) break;
    console.log(`\nSearching: "${kw}"`);
    
    for (let page = 1; page <= 5; page++) {
      if (newFirms.length >= 5) break;
      const res = await apolloPost('/mixed_companies/search', {
        q_organization_keyword_tags: [kw],
        organization_num_employees_ranges: ['11,50','51,200'],
        organization_locations: ['United States'],
        page, per_page: 25
      });
      
      const orgs = res.organizations || [];
      if (!orgs.length) break;
      
      for (const org of orgs) {
        if (newFirms.length >= 5) break;
        const name = (org.name||'').trim();
        if (existing.has(name.toLowerCase())) continue;
        // Must look like a PE firm
        if (!name.toLowerCase().includes('capital') && !name.toLowerCase().includes('partner') && !name.toLowerCase().includes('equity') && !name.toLowerCase().includes('investment')) continue;
        
        console.log(`  NEW: ${name} | ${org.website_url}`);
        await sleep(400);
        
        // Find a contact
        const ppl = await apolloPost('/mixed_people/api_search', {organization_ids:[org.id], person_titles:TITLES, page:1, per_page:5});
        let bestContact = null;
        if (ppl.people && ppl.people.length) {
          for (const p of ppl.people.slice(0,3)) {
            await sleep(400);
            const e = await apolloPost('/people/match', {id: p.id});
            const per = e.person || {};
            console.log(`    ${per.first_name} ${per.last_name} | ${per.title} | ${per.email || 'NO EMAIL'}`);
            if (per.email && !bestContact) {
              bestContact = {name: `${per.first_name} ${per.last_name}`, title: per.title, email: per.email, linkedin: per.linkedin_url || ''};
            }
            if (bestContact) break;
          }
        }
        
        newFirms.push({
          firm: name, website: org.website_url||'', linkedin: org.linkedin_url||'',
          sectorFocus: (org.keywords||[]).slice(0,5).join(', '),
          contact: bestContact,
        });
      }
      await sleep(400);
    }
  }

  // Add to sheet
  const newRows = newFirms.map(r => {
    const c = r.contact || {};
    return [r.firm, c.name||'', c.title||'', c.email||'', r.website, c.linkedin||r.linkedin,
      r.sectorFocus, '', c.email ? 'Enriched' : 'Needs Enrichment', '',
      `Added ${new Date().toISOString().split('T')[0]} via Apollo discovery. Contact verified via Apollo.`, '', c.email ? '7' : '5'];
  });

  if (newRows.length) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID, range: 'Sheet1!A:M', valueInputOption: 'RAW',
      requestBody: { values: newRows }
    });
    console.log(`\nAdded ${newRows.length} new firms to CRM`);
  }
  
  console.log('\nRESULTS:', JSON.stringify(newFirms.map(r=>({firm:r.firm, contact:r.contact?.name, email:r.contact?.email})),null,2));
}

main().catch(console.error);
