const axios = require('axios');
const { google } = require('googleapis');
const path = require('path');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const KEYFILE = path.join(__dirname, 'service-account.json');
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const RANGE = 'Sheet1!A:L';

async function enrichWithApollo(firmName, contactName) {
  try {
    const nameParts = contactName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    const response = await axios.post('https://api.apollo.io/v1/people/match', {
      first_name: firstName,
      last_name: lastName,
      organization_name: firmName
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY
      },
      timeout: 10000
    });

    if (response.data && response.data.person) {
      const person = response.data.person;
      return {
        name: person.name || contactName,
        title: person.title || '',
        email: person.email || '',
        linkedin: person.linkedin_url || '',
        found: !!person.email
      };
    }
  } catch (error) {
    // Continue silently
  }
  return null;
}

async function updateSheet(rowIndex, contact, title, email, linkedin, status, notes) {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const updates = [];
  
  if (contact) updates.push({ range: `Sheet1!C${rowIndex}`, values: [[contact]] });
  if (title) updates.push({ range: `Sheet1!D${rowIndex}`, values: [[title]] });
  if (email) updates.push({ range: `Sheet1!E${rowIndex}`, values: [[email]] });
  if (linkedin) updates.push({ range: `Sheet1!F${rowIndex}`, values: [[linkedin]] });
  if (status) updates.push({ range: `Sheet1!J${rowIndex}`, values: [[status]] });
  if (notes) updates.push({ range: `Sheet1!I${rowIndex}`, values: [[notes]] });
  updates.push({ range: `Sheet1!L${rowIndex}`, values: [[new Date().toISOString().split('T')[0]]] });

  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      resource: {
        data: updates,
        valueInputOption: 'USER_ENTERED'
      }
    });
  }
}

async function enrichLeads() {
  console.log('PE ENRICHMENT CRON - Final Batch');
  console.log('=================================\n');

  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: RANGE
  });

  const rows = response.data.values || [];
  
  const withContacts = [];

  // Target firms with "Researched - No Email" that have real contact names
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const firmName = row[0] || '';
    const contact = row[2] || '';
    const email = row[4] || '';
    const status = row[9] || '';
    
    if (
      contact && 
      !email && 
      status === 'Researched - No Email' &&
      contact !== 'Principal' &&
      !contact.startsWith('http') &&
      contact.split(' ').length >= 2  // Has at least first and last name
    ) {
      withContacts.push({
        row: i + 1,
        firm: firmName,
        contact: contact
      });
    }
  }

  console.log(`Found ${withContacts.length} firms with valid contact names but no emails`);
  
  // Process firms we haven't tried yet (skip rows we already processed)
  const alreadyProcessed = new Set([93, 216, 221, 231, 264, 288, 864, 883, 895]);
  const newTargets = withContacts.filter(f => !alreadyProcessed.has(f.row)).slice(0, 8);
  
  console.log(`Processing 8 new firms with contact names\n`);

  let enriched = 0;

  for (let i = 0; i < newTargets.length; i++) {
    const target = newTargets[i];
    console.log(`\n${i + 1}. ${target.firm} (Row ${target.row})`);
    console.log(`   Searching for: ${target.contact}...`);

    const result = await enrichWithApollo(target.firm, target.contact);
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (result && result.found) {
      console.log(`   ✅ FOUND: ${result.name} | ${result.title}`);
      console.log(`      Email: ${result.email}`);
      console.log(`      LinkedIn: ${result.linkedin || 'N/A'}`);
      
      await updateSheet(
        target.row,
        result.name,
        result.title,
        result.email,
        result.linkedin,
        'Enriched',
        'Apollo API'
      );
      
      enriched++;
    } else {
      console.log(`   ❌ Not found in Apollo`);
    }
  }

  console.log(`\n\nFINAL SUMMARY`);
  console.log(`=============`);
  console.log(`Processed: ${newTargets.length} firms`);
  console.log(`Enriched: ${enriched} firms`);
  console.log(`Success rate: ${(enriched / newTargets.length * 100).toFixed(1)}%`);
  console.log(`\nTotal enriched this session: ${7 + enriched} firms`);
}

enrichLeads().catch(console.error);
