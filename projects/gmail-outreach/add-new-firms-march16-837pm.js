/**
 * Add New Mid-Market PE Firms
 * March 16, 2026 8:37 PM
 * Target: $500M-$5B AUM, services-heavy focus
 */

const { google } = require('googleapis');
const path = require('path');
const fetch = require('node-fetch');

const CRM_SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

const NEW_FIRMS = [
  { name: 'Excellere Partners', website: 'https://www.excellerepartners.com', focus: 'Healthcare services, $2.5B AUM' },
  { name: 'Cressey & Company', website: 'https://www.cressey.com', focus: 'Healthcare services, $3B AUM' },
  { name: 'NewSpring Capital', website: 'https://www.newspringcapital.com', focus: 'Tech-enabled services, $2B AUM' },
  { name: 'Pamlico Capital', website: 'https://www.pamlicocapital.com', focus: 'Business services, $1B AUM' },
  { name: 'Charlesbank Capital Partners', website: 'https://www.charlesbank.com', focus: 'Services, tech, $4B fund' },
];

async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function apolloSearch(domain, companyName) {
  console.log(`  🔍 Apollo search: ${companyName} (${domain})`);
  
  const body = {
    api_key: APOLLO_API_KEY,
    q_organization_domains: [domain],
    person_titles: [
      'CEO', 'CTO', 'Chief Technology Officer',
      'Managing Partner', 'Operating Partner', 'General Partner',
      'Director of Technology', 'Director of Digital', 'VP Technology',
      'Head of Value Creation', 'Head of Digital'
    ],
    page: 1,
    per_page: 5,
  };
  
  const res = await fetch('https://api.apollo.io/v1/mixed_people/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  
  if (!res.ok) {
    console.log(`    ❌ Apollo error ${res.status}`);
    return null;
  }
  
  const data = await res.json();
  const people = data.people || [];
  
  if (people.length === 0) {
    console.log(`    ⚠️  No results`);
    return null;
  }
  
  const person = people.find(p => p.email && !/^(info|contact|sales|ir)@/i.test(p.email)) || people[0];
  
  if (!person.email) {
    console.log(`    ⚠️  Found people but no emails`);
    return null;
  }
  
  console.log(`    ✅ Found: ${person.name} (${person.title}) - ${person.email}`);
  
  return {
    name: person.name,
    title: person.title,
    email: person.email,
    linkedin: person.linkedin_url || '',
  };
}

async function addNewFirms() {
  const sheets = await getSheets();
  
  console.log(`🆕 Adding ${NEW_FIRMS.length} new mid-market PE firms\n`);
  
  const newRows = [];
  
  for (const firm of NEW_FIRMS) {
    console.log(`\n🏢 ${firm.name}`);
    console.log(`  Website: ${firm.website}`);
    console.log(`  Focus: ${firm.focus}`);
    
    try {
      const domain = firm.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0].toLowerCase();
      
      const contact = await apolloSearch(domain, firm.name);
      
      if (contact) {
        const row = [
          firm.name,                    // A: Company Name
          firm.website,                 // B: Website
          contact.name,                 // C: Contact Name
          contact.title,                // D: Title
          contact.email,                // E: Email
          '',                           // F
          contact.linkedin,             // G: LinkedIn
          'Enriched',                   // H: Status
          `Added 2026-03-16. ${firm.focus}. Enriched via Apollo API.`, // I: Notes
          'New',                        // J: Status
          '',                           // K: Last Contacted
          '',                           // L: Notes
          firm.website,                 // M: Company Info URL
          '6',                          // N: Gumbo Score (default mid score)
        ];
        
        newRows.push(row);
        console.log(`  ✅ Ready to add: ${contact.name} - ${contact.email}`);
      } else {
        console.log(`  ⏭️  Skipping (no contact found)`);
      }
      
      await new Promise(r => setTimeout(r, 1500));
      
    } catch (err) {
      console.error(`  ❌ Error: ${err.message}`);
    }
  }
  
  if (newRows.length > 0) {
    console.log(`\n💾 Adding ${newRows.length} new firms to sheet...`);
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: CRM_SHEET_ID,
      range: 'Sheet1!A:N',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: newRows,
      },
    });
    
    console.log(`✅ Successfully added ${newRows.length} new firms!`);
  } else {
    console.log(`\n⚠️  No firms added (none found contacts)`);
  }
  
  console.log(`\n📊 SUMMARY`);
  console.log(`  Firms attempted: ${NEW_FIRMS.length}`);
  console.log(`  Successfully added: ${newRows.length}`);
  console.log(`  Failed: ${NEW_FIRMS.length - newRows.length}`);
}

addNewFirms().catch(err => {
  console.error('FATAL ERROR:', err);
  process.exit(1);
});
