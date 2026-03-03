const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const APOLLO_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = path.join(__dirname, 'service-account.json');

const TITLES = [
  'Managing Director', 'Partner', 'Managing Partner', 'Principal',
  'Vice President', 'Director', 'Operating Partner', 'Senior Partner',
  'Founder', 'CEO', 'COO', 'CTO', 'CIO', 'Chief Technology Officer',
  'Chief Digital Officer', 'Head of Technology', 'Head of Operations'
];

const FIRMS = [
  'Ampersand Capital Partners', 'Havencrest Capital Management', 'TA Associates',
  'IK Partners', 'Francisco Partners', 'Genstar Capital',
  'BPOC (Beecken Petty OKeefe)', 'Frazier Healthcare Partners',
  'Water Street Healthcare Partners', 'Argosy Private Equity',
  'Revelar Capital', 'Hidden Harbor Capital Partners',
  'Graham Partners', 'Sleeping Giant Capital', 'Court Square Capital Partners',
  'PennSpring Capital', 'Hellman & Friedman', 'O2 Investment Partners',
  'Sound Growth Partners', 'Broadwing Capital', 'RFE Investment Partners',
  'Tonka Bay Equity Partners', 'Centerbridge Partners', 'Platinum Equity',
  'Vector Capital', 'Kinderhook Industries', 'Pharos Capital Group',
  'Stellex Capital Management', 'Spire Capital Partners', 'MidOcean Partners',
  'Leeds Equity Partners', 'Topspin Partners', 'Oak Hill Capital',
  'Blue Wolf Capital Partners', 'Highlander Partners', 'Arcline Investment Management',
  'TowerBrook Capital Partners', 'H.I.G. Capital', 'Searchlight Capital Partners',
  'SRM Equity Partners', 'Investcorp', 'Warburg Pincus', 'Thoma Bravo',
  'Insight Partners', 'TPG Capital', 'Onex Corporation', 'EQT Partners',
  'Leonard Green & Partners', 'Bain Capital Private Equity', 'Cinven'
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const HDRS = { 'Content-Type': 'application/json', 'X-Api-Key': APOLLO_KEY };

async function apolloSearch(firmName) {
  const resp = await fetch('https://api.apollo.io/api/v1/mixed_people/api_search', {
    method: 'POST', headers: HDRS,
    body: JSON.stringify({ q_organization_name: firmName, person_titles: TITLES, page: 1, per_page: 25 })
  });
  if (!resp.ok) { console.error(`  Search failed ${firmName}: ${resp.status} ${await resp.text()}`); return []; }
  const data = await resp.json();
  return data.people || [];
}

async function apolloReveal(personId) {
  const resp = await fetch('https://api.apollo.io/api/v1/people/match', {
    method: 'POST', headers: HDRS,
    body: JSON.stringify({ id: personId })
  });
  if (!resp.ok) return null;
  const data = await resp.json();
  return data.person || null;
}

async function getSheets() {
  const creds = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT));
  const auth = new google.auth.GoogleAuth({ credentials: creds, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
  return google.sheets({ version: 'v4', auth });
}

async function appendRows(sheets, rows) {
  if (!rows.length) return;
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID, range: 'Contacts!A:F',
    valueInputOption: 'USER_ENTERED', requestBody: { values: rows }
  });
}

async function main() {
  const sheets = await getSheets();
  let totalContacts = 0, totalWithEmail = 0, totalFirms = 0;
  let batchRows = [];

  for (let i = 0; i < FIRMS.length; i++) {
    const firm = FIRMS[i];
    console.log(`[${i+1}/${FIRMS.length}] ${firm}`);

    try {
      const people = await apolloSearch(firm);
      console.log(`  Found ${people.length} raw results`);
      await sleep(500);

      // Reveal up to 10 contacts per firm (to conserve credits)
      const toReveal = people.filter(p => p.has_email).slice(0, 10);
      let revealed = 0;

      for (const p of toReveal) {
        const full = await apolloReveal(p.id);
        if (full) {
          const name = [full.first_name, full.last_name].filter(Boolean).join(' ');
          const title = full.title || '';
          const email = full.email || '';
          const linkedin = full.linkedin_url || '';
          batchRows.push([firm, name, title, email, linkedin, 'Apollo']);
          totalContacts++;
          if (email) totalWithEmail++;
          revealed++;
        }
        await sleep(300);
      }
      console.log(`  Revealed ${revealed} contacts (${toReveal.length} had email flag)`);
      totalFirms++;
    } catch (e) {
      console.error(`  Error: ${e.message}`);
    }

    // Write every 5 firms
    if ((i + 1) % 5 === 0 || i === FIRMS.length - 1) {
      if (batchRows.length > 0) {
        console.log(`  >> Writing ${batchRows.length} rows to sheet...`);
        try { await appendRows(sheets, batchRows); console.log(`  >> Done`); }
        catch (e) { console.error(`  >> Sheet error: ${e.message}`); }
        batchRows = [];
      }
    }
    await sleep(800);
  }

  console.log('\n=== SUMMARY ===');
  console.log(`Firms processed: ${totalFirms}`);
  console.log(`Total contacts revealed: ${totalContacts}`);
  console.log(`With email: ${totalWithEmail}`);
  console.log(`Without email: ${totalContacts - totalWithEmail}`);
}

main().catch(e => console.error('Fatal:', e));
