const { google } = require('googleapis');
const axios = require('axios');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

const NEW_FIRMS = [
  {
    company: 'Frontenac Company',
    website: 'https://frontenac.com/',
    location: 'Chicago, IL',
    aum: '$1B+',
    focus: 'Services, Industrial, Consumer'
  },
  {
    company: 'High Road Capital Partners',
    website: 'https://www.highroadcap.com/',
    location: 'Greenwich, CT',
    aum: '$1B+',
    focus: 'Middle Market, Manufacturing, Services'
  },
  {
    company: 'Sverica Capital Management',
    website: 'https://sverica.com/',
    location: 'Boston, MA',
    aum: '$2B',
    focus: 'Software, Healthcare Services, Business Services'
  }
];

let auth, sheets;

async function initialize() {
  auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  sheets = google.sheets({ version: 'v4', auth });
}

function extractDomain(website) {
  if (!website || !website.startsWith('http')) return '';
  return website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
}

async function searchApollo(firmName, website) {
  try {
    console.log(`  🔎 Searching Apollo for ${firmName}...`);
    
    const domain = extractDomain(website);
    
    const titleSets = [
      ['CEO', 'CTO', 'COO', 'Managing Partner', 'General Partner'],
      ['Partner', 'Operating Partner', 'Managing Director', 'Principal'],
      ['VP Operations', 'VP Technology', 'VP Digital'],
      ['Director of Technology', 'Director of Operations']
    ];
    
    for (const titles of titleSets) {
      const searchPayload = {
        person_titles: titles,
        per_page: 3
      };
      
      if (domain) {
        searchPayload.q_organization_domains = domain;
      } else {
        searchPayload.q_organization_name = firmName;
      }
      
      const searchResponse = await axios.post(
        'https://api.apollo.io/api/v1/mixed_people/search',
        searchPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': APOLLO_API_KEY
          }
        }
      );
      
      if (searchResponse.data.people && searchResponse.data.people.length > 0) {
        for (const person of searchResponse.data.people) {
          try {
            const enrichResponse = await axios.post(
              'https://api.apollo.io/v1/people/match',
              { id: person.id },
              {
                headers: {
                  'Content-Type': 'application/json',
                  'X-Api-Key': APOLLO_API_KEY
                }
              }
            );
            
            const enrichedPerson = enrichResponse.data.person;
            
            if (enrichedPerson && enrichedPerson.email) {
              const isGeneric = enrichedPerson.email && (
                enrichedPerson.email.toLowerCase().includes('info@') ||
                enrichedPerson.email.toLowerCase().includes('sales@') ||
                enrichedPerson.email.toLowerCase().includes('ir@')
              );
              
              if (!isGeneric) {
                return {
                  name: enrichedPerson.name,
                  title: enrichedPerson.title,
                  email: enrichedPerson.email,
                  linkedin: enrichedPerson.linkedin_url || '',
                  source: `Apollo API - ${titles[0]}`
                };
              }
            }
          } catch (enrichErr) {
            console.log(`    Enrich failed, trying next...`);
          }
          
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return null;
  } catch (error) {
    console.error(`  ❌ Apollo error:`, error.response?.data?.message || error.message);
    return null;
  }
}

async function getNextRow() {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:A'
  });
  
  const rows = response.data.values || [];
  return rows.length + 1; // Next empty row
}

async function addFirmToSheet(firmData, contact, rowNum) {
  try {
    const row = [
      firmData.company,                      // A: Company Name
      firmData.website,                      // B: Website
      contact ? contact.name : '',           // C: Contact Name
      contact ? contact.title : '',          // D: Position/Title
      contact ? contact.email : '',          // E: Email
      firmData.aum,                          // F: AUM
      contact ? contact.linkedin : '',       // G: LinkedIn URL
      contact ? 'Enriched' : 'Needs Research', // H: Status
      contact ? `${contact.source}. Added ${new Date().toISOString().split('T')[0]}.` : 
                `New firm added ${new Date().toISOString().split('T')[0]}. Focus: ${firmData.focus}. Location: ${firmData.location}.` // I: Notes
    ];
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:I',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row]
      }
    });
    
    console.log(`  ✅ Added to row ${rowNum}`);
    return true;
  } catch (error) {
    console.error(`  ❌ Failed to add firm:`, error.message);
    return false;
  }
}

async function run() {
  console.log('🚀 ADDING NEW PE FIRMS TO PIPELINE');
  console.log('Time:', new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));
  console.log(`Target: ${NEW_FIRMS.length} new mid-market PE firms\n`);
  console.log('='.repeat(80));
  
  await initialize();
  
  let nextRow = await getNextRow();
  let added = 0;
  let enriched = 0;
  const results = [];
  
  for (const firm of NEW_FIRMS) {
    console.log(`\n[${added + 1}/${NEW_FIRMS.length}] ${firm.company}`);
    console.log(`  Website: ${firm.website}`);
    console.log(`  Location: ${firm.location}`);
    console.log(`  AUM: ${firm.aum}`);
    console.log(`  Focus: ${firm.focus}`);
    
    const contact = await searchApollo(firm.company, firm.website);
    
    if (contact) {
      console.log(`  ✨ FOUND CONTACT: ${contact.name} - ${contact.title}`);
      console.log(`  📧 Email: ${contact.email}`);
      enriched++;
    } else {
      console.log(`  ⚠️  No contact found - will need manual research`);
    }
    
    const success = await addFirmToSheet(firm, contact, nextRow);
    
    if (success) {
      added++;
      results.push({
        company: firm.company,
        contact: contact ? contact.name : '(needs research)',
        email: contact ? contact.email : '(none)',
        row: nextRow
      });
      nextRow++;
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 NEW FIRMS SUMMARY');
  console.log('='.repeat(80));
  console.log(`✅ Firms added: ${added}`);
  console.log(`✨ With verified contacts: ${enriched}`);
  console.log(`⚠️  Needing manual research: ${added - enriched}`);
  console.log(`📝 Total attempted: ${NEW_FIRMS.length}`);
  
  if (added > 0) {
    console.log('\n📋 Added firms:');
    results.forEach(r => {
      console.log(`  • Row ${r.row}: ${r.company}`);
      console.log(`    Contact: ${r.contact}`);
      console.log(`    Email: ${r.email}`);
    });
  }
  
  return { added, enriched, results };
}

run().then(results => {
  console.log('\n🎉 New firms added successfully!');
  process.exit(0);
}).catch(err => {
  console.error('\n💥 Failed to add firms:', err.message);
  console.error(err.stack);
  process.exit(1);
});
