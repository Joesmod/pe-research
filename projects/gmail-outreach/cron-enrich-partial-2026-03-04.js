const { google } = require('googleapis');
const axios = require('axios');
const fs = require('fs');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function readSheet() {
  const sheets = await getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:I',
  });
  return response.data.values || [];
}

// Search for a specific person at a firm
async function searchApolloByPerson(personName, firmName) {
  try {
    const response = await axios.post('https://api.apollo.io/api/v1/mixed_people/search', {
      q_keywords: `${personName} ${firmName}`,
      per_page: 5
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY
      }
    });

    if (response.data.people && response.data.people.length > 0) {
      for (const person of response.data.people) {
        // Check if this is the right person at the right firm
        if (person.name && person.name.toLowerCase().includes(personName.toLowerCase().split(' ')[0])) {
          if (person.email && 
              !person.email.startsWith('info@') &&
              !person.email.startsWith('sales@') &&
              !person.email.startsWith('ir@')) {
            return {
              name: person.name,
              title: person.title,
              email: person.email,
              linkedin: person.linkedin_url,
              source: 'Apollo API - person search'
            };
          }
        }
      }
    }

    return null;

  } catch (err) {
    console.error(`    Apollo error:`, err.response?.data?.message || err.message);
    return null;
  }
}

// Try alternate firm name patterns
async function searchApolloByFirmVariations(firmName) {
  const variations = [
    firmName,
    firmName.replace(' Partners', '').replace(' Capital', '').replace(' LLC', '').trim(),
    firmName.split(' ')[0], // First word only
  ];

  for (const variation of variations) {
    try {
      console.log(`    Trying: "${variation}"`);
      
      const orgResponse = await axios.post('https://api.apollo.io/api/v1/mixed_companies/search', {
        q_organization_name: variation,
        per_page: 1
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': APOLLO_API_KEY
        }
      });

      if (orgResponse.data.accounts && orgResponse.data.accounts.length > 0) {
        const orgId = orgResponse.data.accounts[0].id;
        console.log(`    ✓ Found org: ${orgResponse.data.accounts[0].name}`);

        await new Promise(resolve => setTimeout(resolve, 500));

        const peopleResponse = await axios.post('https://api.apollo.io/api/v1/mixed_people/search', {
          organization_ids: [orgId],
          person_titles: [
            'Partner', 'Managing Partner', 'Managing Director',
            'CEO', 'President', 'Founder', 'Principal',
            'Head of Business Development', 'Business Development'
          ],
          per_page: 5
        }, {
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': APOLLO_API_KEY
          }
        });

        if (peopleResponse.data.people && peopleResponse.data.people.length > 0) {
          const validPeople = peopleResponse.data.people.filter(p =>
            p.email &&
            !p.email.startsWith('info@') &&
            !p.email.startsWith('sales@') &&
            !p.email.startsWith('ir@') &&
            !p.email.startsWith('contact@')
          );

          if (validPeople.length > 0) {
            const person = validPeople[0];
            return {
              name: person.name,
              title: person.title,
              email: person.email,
              linkedin: person.linkedin_url,
              source: 'Apollo API'
            };
          }
        }
      }

      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (err) {
      // Continue to next variation
      console.log(`    ✗ ${variation}: ${err.response?.data?.message || err.message}`);
    }
  }

  return null;
}

async function updateSheet(rowIndex, email, linkedIn) {
  const sheets = await getSheetsClient();
  
  const updates = [];
  
  if (email) {
    updates.push({ range: `Sheet1!E${rowIndex}`, values: [[email]] });
  }
  
  if (linkedIn) {
    updates.push({ range: `Sheet1!G${rowIndex}`, values: [[linkedIn]] });
  }
  
  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      resource: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
  }
}

async function enrichLeads() {
  console.log('═══════════════════════════════════════════');
  console.log('PE ENRICHMENT - PARTIAL RECORDS');
  console.log('Target: Firms with names but missing emails');
  console.log('═══════════════════════════════════════════\n');
  
  const rows = await readSheet();
  
  // Target specific rows with partial info
  const targetRows = [
    { row: 93, firm: 'Apax Partners', contact: 'Mark Beith' },
    { row: 117, firm: 'Keltic Financial Partners', contact: 'Not identified' },
    { row: 216, firm: 'Falconhead Capital', contact: 'Principal' },
    { row: 231, firm: 'Clayton Dubilier & Rice (CD&R)', contact: 'Vindi Banga' },
    { row: 625, firm: 'Jensen Partners', contact: 'Sasha Jensen' },
    { row: 631, firm: 'Lead Edge Capital', contact: 'Mitchell Green' },
  ];
  
  let enriched = 0;
  let notFound = 0;
  const log = [];
  
  for (const target of targetRows) {
    if (enriched >= 15) break;
    
    console.log(`\n[Row ${target.row}] ${target.firm} - ${target.contact}`);
    
    try {
      let result = null;
      
      // If we have a specific contact name, search for that person
      if (target.contact && 
          target.contact !== 'Not identified' && 
          target.contact !== 'Principal' &&
          target.contact !== '(empty)') {
        console.log(`  Searching for: ${target.contact}`);
        result = await searchApolloByPerson(target.contact, target.firm);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // If person search failed, try firm search with variations
      if (!result) {
        console.log(`  Searching firm variations...`);
        result = await searchApolloByFirmVariations(target.firm);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      if (result && result.email) {
        console.log(`  ✅ FOUND: ${result.name} (${result.title})`);
        console.log(`     Email: ${result.email}`);
        
        await updateSheet(target.row, result.email, result.linkedin);
        
        log.push({
          row: target.row,
          firm: target.firm,
          contact: result.name,
          title: result.title,
          email: result.email,
          status: 'enriched'
        });
        
        enriched++;
      } else {
        console.log(`  ⚠️  Not found`);
        notFound++;
        log.push({
          row: target.row,
          firm: target.firm,
          status: 'not_found'
        });
      }
      
    } catch (err) {
      console.error(`  ❌ Error:`, err.message);
      log.push({
        row: target.row,
        firm: target.firm,
        status: 'error',
        error: err.message
      });
    }
  }
  
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  fs.writeFileSync(
    `enrichment-log-partial-${timestamp}.json`,
    JSON.stringify(log, null, 2)
  );
  
  console.log('\n═══════════════════════════════════════════');
  console.log('ENRICHMENT COMPLETE');
  console.log('═══════════════════════════════════════════');
  console.log(`✅ Enriched:   ${enriched}`);
  console.log(`⚠️  Not found:  ${notFound}`);
  console.log(`📄 Log: enrichment-log-partial-${timestamp}.json`);
  console.log('═══════════════════════════════════════════\n');
  
  return { enriched, notFound };
}

enrichLeads().catch(console.error);
