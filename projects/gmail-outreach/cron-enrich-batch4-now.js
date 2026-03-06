const axios = require('axios');
const { google } = require('googleapis');
const path = require('path');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const KEYFILE = path.join(__dirname, 'service-account.json');
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const RANGE = 'Sheet1!A:L';

async function searchApolloGeneral(firmName) {
  const titles = [
    'CEO', 
    'Managing Partner', 
    'Partner',
    'Managing Director',
    'Chief Executive Officer',
    'COO',
    'CTO',
    'Chief Operating Officer'
  ];

  for (const title of titles) {
    try {
      const response = await axios.post('https://api.apollo.io/v1/mixed_people/search', {
        q_organization_name: firmName,
        person_titles: [title],
        per_page: 1
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': APOLLO_API_KEY
        },
        timeout: 10000
      });

      if (response.data && response.data.people && response.data.people.length > 0) {
        const person = response.data.people[0];
        if (person.email) {
          return {
            name: person.name,
            title: person.title || title,
            email: person.email,
            linkedin: person.linkedin_url || '',
            found: true
          };
        }
      }

      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (error) {
      // Continue to next title
    }
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
  console.log('PE ENRICHMENT CRON - Batch 4');
  console.log('=============================\n');

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
  
  const needEnrichment = [];

  // Look for firms with "New - Unresearched" status that already have emails (just need status update)
  // AND firms with empty contacts/emails
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const firmName = row[0] || '';
    const contact = row[2] || '';
    const email = row[4] || '';
    const status = row[9] || '';
    
    // Find firms that need ANY contact info
    const needsContact = (
      (!contact || !email) && 
      firmName && 
      !status.includes('Dead Lead') &&
      status !== 'Enriched'
    );
    
    if (needsContact) {
      needEnrichment.push({
        row: i + 1,
        firm: firmName,
        contact: contact || '',
        email: email || '',
        status: status || ''
      });
    }
  }

  console.log(`Found ${needEnrichment.length} firms needing enrichment`);
  
  // Pick 8 random firms from the list for variety
  const randomFirms = [];
  const indices = new Set();
  
  while (randomFirms.length < 8 && randomFirms.length < needEnrichment.length) {
    const idx = Math.floor(Math.random() * Math.min(50, needEnrichment.length));
    if (!indices.has(idx)) {
      indices.add(idx);
      randomFirms.push(needEnrichment[idx]);
    }
  }
  
  console.log(`Processing 8 random firms\n`);

  let enriched = 0;

  for (let i = 0; i < randomFirms.length; i++) {
    const target = randomFirms[i];
    console.log(`\n${i + 1}. ${target.firm} (Row ${target.row})`);
    console.log(`   Current: ${target.contact || '(none)'} | ${target.email || '(none)'}`);
    console.log(`   Searching Apollo for any decision-maker...`);

    const result = await searchApolloGeneral(target.firm);

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
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n\nSUMMARY`);
  console.log(`=======`);
  console.log(`Processed: ${randomFirms.length} firms`);
  console.log(`Enriched: ${enriched} firms`);
  console.log(`Success rate: ${(enriched / randomFirms.length * 100).toFixed(1)}%`);
}

enrichLeads().catch(console.error);
