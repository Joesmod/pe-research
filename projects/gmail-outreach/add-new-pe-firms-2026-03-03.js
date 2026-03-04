const { google } = require('googleapis');
const https = require('https');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function apolloSearch(orgName) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      q_organization_name: orgName,
      person_titles: ['Managing Partner', 'Partner', 'Managing Director', 'General Partner'],
      page: 1,
      per_page: 5
    });

    const options = {
      hostname: 'api.apollo.io',
      path: '/api/v1/mixed_people/api_search',
      method: 'POST',
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(responseData));
          } catch (err) {
            reject(new Error(`Parse error: ${err.message}`));
          }
        } else {
          reject(new Error(`Apollo API ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function apolloEnrich(apolloId) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      id: apolloId,
      reveal_personal_emails: false,
      reveal_phone_number: false
    });

    const options = {
      hostname: 'api.apollo.io',
      path: '/api/v1/people/match',
      method: 'POST',
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(responseData));
          } catch (err) {
            reject(new Error(`Parse error: ${err.message}`));
          }
        } else {
          reject(new Error(`Apollo enrich ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('\n=== ADDING NEW PE FIRMS TO SHEET ===\n');
  
  const newFirms = [
    {
      name: 'Edison Partners',
      website: 'https://www.edisonpartners.com',
      sector: 'Lower middle market, Growth equity, Technology, B2B',
      notes: 'Top 50 PE firm for middle market 2026, ~$1B AUM, operational focus'
    },
    {
      name: 'Transom Capital Group',
      website: 'https://transomcap.com',
      sector: 'Lower middle market, Operational focus, Industrial, Consumer',
      notes: '$583M AUM, operational specialists, value creation focus'
    },
    {
      name: 'Shore Capital Partners',
      website: 'https://www.shorecp.com',
      sector: 'Healthcare services, Lower middle market',
      notes: 'Healthcare-focused PE, micro-cap focus, physician-owned clinics'
    }
  ];
  
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const newRows = [];
  
  for (const firm of newFirms) {
    console.log(`\n📋 ${firm.name}`);
    console.log(`   Website: ${firm.website}`);
    
    try {
      // Search Apollo
      const searchResults = await apolloSearch(firm.name);
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      if (searchResults.people && searchResults.people.length > 0) {
        const searchPerson = searchResults.people[0];
        
        console.log(`   Enriching: ${searchPerson.id}`);
        const enriched = await apolloEnrich(searchPerson.id);
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        if (enriched.person) {
          const person = enriched.person;
          const name = person.name || `${person.first_name} ${person.last_name}`.trim();
          const title = person.title || '';
          const email = person.email || '';
          const linkedin = person.linkedin_url || '';
          
          console.log(`   ✅ ${name} (${title})`);
          console.log(`   📧 ${email}`);
          
          newRows.push([
            firm.name,
            name,
            title,
            email,
            firm.website,
            linkedin || '',
            firm.sector,
            '',  // Portfolio Companies
            'Enriched',
            new Date().toISOString(),
            `Apollo-enriched ${new Date().toISOString().split('T')[0]}. ${firm.notes}`
          ]);
        } else {
          console.log(`   ⚠️  Enrichment failed, adding without contact`);
          newRows.push([
            firm.name,
            '',
            '',
            '',
            firm.website,
            '',
            firm.sector,
            '',
            'New - Unresearched',
            '',
            firm.notes
          ]);
        }
      } else {
        console.log(`   ⚠️  No contacts found, adding without contact`);
        newRows.push([
          firm.name,
          '',
          '',
          '',
          firm.website,
          '',
          firm.sector,
          '',
          'New - Unresearched',
          '',
          firm.notes
        ]);
      }
    } catch (err) {
      console.error(`   ❌ Error: ${err.message}`);
      newRows.push([
        firm.name,
        '',
        '',
        '',
        firm.website,
        '',
        firm.sector,
        '',
        'New - Unresearched',
        '',
        firm.notes
      ]);
    }
  }
  
  // Append to sheet
  if (newRows.length > 0) {
    console.log(`\n\n=== APPENDING TO SHEET ===`);
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:K',
      valueInputOption: 'RAW',
      resource: { values: newRows }
    });
    console.log(`✅ Added ${newRows.length} new firms to sheet`);
  }
  
  console.log(`\n✅ COMPLETE\n`);
}

main().catch(console.error);
