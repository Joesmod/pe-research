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
    // Silently continue on errors
  }
  return null;
}

async function searchApolloByTitle(firmName, title) {
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
  } catch (error) {
    // Silently continue
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
  console.log('PE ENRICHMENT CRON - Batch 2');
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

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const firmName = row[0] || '';
    const contact = row[2] || '';
    const email = row[4] || '';
    const status = row[9] || '';
    
    const needsWork = (
      (contact && !email && status === 'Researched - No Email') ||
      (!contact && !email && !status.includes('Dead Lead'))
    );
    
    if (needsWork && firmName && firmName !== 'Company Name') {
      needEnrichment.push({
        row: i + 1,
        firm: firmName,
        contact: contact || '',
        status: status || ''
      });
    }
  }

  console.log(`Found ${needEnrichment.length} firms needing enrichment`);
  
  // Skip first 10 (already processed), process next 10
  const batch = needEnrichment.slice(10, 20);
  console.log(`Processing batch: rows 11-20\n`);

  let enriched = 0;

  for (let i = 0; i < batch.length; i++) {
    const target = batch[i];
    console.log(`\n${i + 11}. ${target.firm} (Row ${target.row})`);
    console.log(`   Current: ${target.contact || '(no contact)'}`);

    let result = null;

    // If we have a contact name, try to find their email
    if (target.contact && target.contact !== 'Principal' && !target.contact.startsWith('http')) {
      result = await enrichWithApollo(target.firm, target.contact);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    // If no result, try searching by common titles
    if (!result || !result.found) {
      const titles = ['CEO', 'Managing Partner', 'Partner', 'CTO', 'COO'];
      for (const title of titles) {
        result = await searchApolloByTitle(target.firm, title);
        if (result && result.found) break;
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }

    if (result && result.found) {
      console.log(`   ✅ FOUND: ${result.name} | ${result.title}`);
      console.log(`      Email: ${result.email}`);
      
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
      console.log(`   ❌ Not found`);
    }
  }

  console.log(`\n\nSUMMARY`);
  console.log(`=======`);
  console.log(`Processed: ${batch.length} firms`);
  console.log(`Enriched: ${enriched} firms`);
  console.log(`Success rate: ${(enriched / batch.length * 100).toFixed(1)}%`);
}

enrichLeads().catch(console.error);
