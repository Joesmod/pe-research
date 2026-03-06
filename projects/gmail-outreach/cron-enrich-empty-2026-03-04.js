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

// Search for people at a firm using Apollo
async function searchApolloByFirm(firmName) {
  try {
    // First, try to find the organization
    const orgResponse = await axios.post('https://api.apollo.io/api/v1/mixed_companies/search', {
      q_organization_name: firmName,
      per_page: 1
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY
      }
    });

    if (!orgResponse.data.accounts || orgResponse.data.accounts.length === 0) {
      console.log(`    No organization found for: ${firmName}`);
      return null;
    }

    const orgId = orgResponse.data.accounts[0].id;
    console.log(`    Found org ID: ${orgId}`);

    // Now search for people at this organization
    await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit

    const peopleResponse = await axios.post('https://api.apollo.io/api/v1/mixed_people/search', {
      organization_ids: [orgId],
      person_titles: [
        'Partner', 'Managing Partner', 'Managing Director', 
        'CEO', 'President', 'Founder',
        'Head of Business Development', 'Business Development',
        'COO', 'CFO', 'CTO'
      ],
      per_page: 5
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY
      }
    });

    if (peopleResponse.data.people && peopleResponse.data.people.length > 0) {
      // Filter for direct emails (not generic)
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

    console.log(`    No valid contacts found for: ${firmName}`);
    return null;

  } catch (err) {
    console.error(`    Apollo error for ${firmName}:`, err.response?.data?.message || err.message);
    return null;
  }
}

async function updateSheet(rowIndex, contactName, title, email, linkedIn) {
  const sheets = await getSheetsClient();
  
  const updates = [];
  
  if (contactName) {
    updates.push({ range: `Sheet1!C${rowIndex}`, values: [[contactName]] });
  }
  
  if (title) {
    updates.push({ range: `Sheet1!D${rowIndex}`, values: [[title]] });
  }
  
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
  console.log('PE ENRICHMENT RUN - 2026-03-04 01:10 AM');
  console.log('═══════════════════════════════════════════\n');
  
  const rows = await readSheet();
  
  let enriched = 0;
  let notFound = 0;
  let errors = 0;
  const log = [];
  
  // Target: rows 258-400 (many empty entries)
  const startRow = 258;
  const endRow = Math.min(400, rows.length);
  
  for (let i = startRow - 1; i < endRow && enriched < 15; i++) {
    const row = rows[i];
    const firmName = row[0];
    const contactName = row[2];
    const email = row[4];
    
    if (!firmName || firmName.trim() === '' || firmName === '(empty)') {
      continue;
    }
    
    const needsEnrichment = 
      (!contactName || contactName === '(empty)' || contactName.trim() === '') &&
      (!email || email === '(empty)' || email.trim() === '');
    
    if (!needsEnrichment) {
      continue;
    }
    
    console.log(`\n[${i + 1}] Enriching: ${firmName}`);
    
    try {
      const result = await searchApolloByFirm(firmName);
      
      if (result && result.email) {
        console.log(`    ✅ Found: ${result.name} (${result.title})`);
        console.log(`       Email: ${result.email}`);
        
        await updateSheet(
          i + 1,
          result.name,
          result.title,
          result.email,
          result.linkedin
        );
        
        log.push({
          row: i + 1,
          firm: firmName,
          contact: result.name,
          title: result.title,
          email: result.email,
          status: 'enriched'
        });
        
        enriched++;
      } else {
        console.log(`    ⚠️  No valid contact found`);
        notFound++;
        log.push({
          row: i + 1,
          firm: firmName,
          status: 'not_found'
        });
      }
      
      // Rate limit: 1.5 seconds between requests (2 API calls per firm)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } catch (err) {
      console.error(`    ❌ Error:`, err.message);
      errors++;
      log.push({
        row: i + 1,
        firm: firmName,
        status: 'error',
        error: err.message
      });
    }
  }
  
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  fs.writeFileSync(
    `enrichment-log-${timestamp}.json`,
    JSON.stringify(log, null, 2)
  );
  
  console.log('\n═══════════════════════════════════════════');
  console.log('ENRICHMENT RUN COMPLETE');
  console.log('═══════════════════════════════════════════');
  console.log(`✅ Enriched:   ${enriched}`);
  console.log(`⚠️  Not found:  ${notFound}`);
  console.log(`❌ Errors:     ${errors}`);
  console.log(`📄 Log: enrichment-log-${timestamp}.json`);
  console.log('═══════════════════════════════════════════\n');
}

enrichLeads().catch(console.error);
