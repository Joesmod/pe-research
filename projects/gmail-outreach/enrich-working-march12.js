const axios = require('axios');
const { google } = require('googleapis');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const targets = [
  { row: 176, company: 'Hg Capital', nameHint: 'Nic Humphries' },
  { row: 223, company: 'Harvest Partners', nameHint: 'James Harter' },
  { row: 276, company: 'Harkness Capital Partners', nameHint: 'Ted Dardani' },
  { row: 285, company: 'Sentinel Capital Partners', nameHint: 'Josh Garrett' },
  { row: 305, company: 'Bertram Capital', nameHint: 'Jeff Drazan' },
  { row: 310, company: 'Argonaut Private Equity', nameHint: 'Anil Khatod' },
  { row: 311, company: 'Mill Point Capital', nameHint: 'Aileen Wang' },
  { row: 319, company: 'CIVC Partners', nameHint: 'Wright' },
  { row: 335, company: 'Odyssey Investment Partners', nameHint: 'Brian Kwait' },
  { row: 478, company: 'Palm Beach Capital', nameHint: 'Mike Schmickle' },
  { row: 500, company: 'Aurora Capital Partners', nameHint: 'Andrew Wilson' }
];

async function searchApollo(companyName, nameHint = null) {
  try {
    console.log(`\n🔍 Searching: ${companyName}${nameHint ? ` (hint: ${nameHint})` : ''}`);
    
    // Use the correct api_search endpoint
    const response = await axios.post(
      'https://api.apollo.io/v1/mixed_people/api_search',
      {
        q_organization_name: companyName,
        person_titles: [
          'Managing Partner', 'Managing Director', 'Partner', 'CEO', 'COO', 'CTO',
          'Head of', 'VP', 'Vice President', 'Director', 'Chief Operating Officer',
          'Chief Executive Officer', 'General Partner', 'Operating Partner'
        ],
        per_page: 10,
        page: 1
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );

    const people = response.data.people || [];
    console.log(`   Found ${people.length} candidates`);
    
    if (nameHint) {
      const nameMatch = people.find(p => 
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(nameHint.toLowerCase())
      );
      if (nameMatch && nameMatch.email) {
        console.log(`✅ Hint match: ${nameMatch.first_name} ${nameMatch.last_name}`);
        console.log(`   ${nameMatch.title}`);
        console.log(`   ${nameMatch.email}`);
        return {
          name: `${nameMatch.first_name} ${nameMatch.last_name}`,
          title: nameMatch.title,
          email: nameMatch.email,
          linkedin: nameMatch.linkedin_url || '',
          source: 'Apollo API - Name Match'
        };
      }
    }

    const withEmail = people.filter(p => p.email);
    if (withEmail.length > 0) {
      const person = withEmail[0];
      console.log(`✅ Found: ${person.first_name} ${person.last_name}`);
      console.log(`   ${person.title}`);
      console.log(`   ${person.email}`);
      return {
        name: `${person.first_name} ${person.last_name}`,
        title: person.title,
        email: person.email,
        linkedin: person.linkedin_url || '',
        source: 'Apollo API'
      };
    }

    console.log('⚠️  No contacts with email found');
    return null;
  } catch (error) {
    console.error(`❌ Error: ${companyName}`);
    if (error.response) {
      console.error(`   Status ${error.response.status}:`, error.response.data?.error || JSON.stringify(error.response.data));
    } else {
      console.error(`   ${error.message}`);
    }
    return null;
  }
}

async function updateSheet(updates) {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  for (const update of updates) {
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!C${update.row}:G${update.row}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[update.name, update.title, update.email, '', update.linkedin]]
        }
      });

      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!J${update.row}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [['Enriched']]
        }
      });

      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!L${update.row}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[update.source + ' - ' + new Date().toISOString().split('T')[0]]]
        }
      });

      console.log(`✅ Updated row ${update.row}`);
    } catch (error) {
      console.error(`❌ Failed row ${update.row}:`, error.message);
    }
  }
}

async function main() {
  console.log('🚀 PE Research & Enrichment - March 12, 2026 @ 5:37 AM');
  console.log(`Targets: ${targets.length} firms\n`);

  const updates = [];
  
  for (const target of targets) {
    const result = await searchApollo(target.company, target.nameHint);
    if (result) {
      updates.push({ row: target.row, company: target.company, ...result });
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`\n\n📊 SUMMARY`);
  console.log(`Enriched: ${updates.length}/${targets.length}`);

  if (updates.length > 0) {
    console.log('\n📝 Updating sheet...');
    await updateSheet(updates);
    console.log('\n✅ Done!');
    
    console.log('\n📋 ENRICHED:');
    updates.forEach(u => {
      console.log(`${u.company}: ${u.name} <${u.email}>`);
    });
  }

  console.log('\n🎯 Complete!');
}

main().catch(console.error);
