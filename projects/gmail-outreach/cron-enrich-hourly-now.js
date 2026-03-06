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
      }
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
    console.error(`Apollo error for ${contactName} at ${firmName}:`, error.message);
  }
  return null;
}

async function searchApolloByFirm(firmName, titles = ['CEO', 'CTO', 'COO', 'Managing Partner', 'Partner']) {
  try {
    for (const title of titles) {
      const response = await axios.post('https://api.apollo.io/v1/mixed_people/search', {
        organization_name: firmName,
        person_titles: [title],
        per_page: 3
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': APOLLO_API_KEY
        }
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
    }
  } catch (error) {
    console.error(`Apollo search error for ${firmName}:`, error.message);
  }
  return null;
}

async function updateSheet(rowIndex, contact, title, email, linkedin, status, notes) {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Column mapping: A=Firm, B=AUM, C=Contact, D=Title, E=Email, F=LinkedIn, G=Location, H=Website, I=Notes, J=Status, K=Date Added, L=Last Updated
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
  console.log('PE ENRICHMENT CRON - Hourly Run');
  console.log('================================\n');
  console.log(new Date().toLocaleString());
  console.log();

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
    
    // Target firms with contact names but no email, or firms needing research
    const needsWork = (
      (contact && !email && status === 'Researched - No Email') ||
      (!contact && !email && status !== 'Dead Lead - Acquired by Ares Management in 2014' && status !== 'Dead Lead - No website found, likely defunct')
    );
    
    if (needsWork && firmName && firmName !== 'Company Name') {
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
  console.log(`Processing first 10...\n`);

  let enriched = 0;

  for (let i = 0; i < Math.min(10, needEnrichment.length); i++) {
    const target = needEnrichment[i];
    console.log(`\n${i + 1}. ${target.firm} (Row ${target.row})`);
    console.log(`   Current: ${target.contact || '(no contact)'} | ${target.email || '(no email)'}`);

    let result = null;

    // If we have a contact name, try to find their email
    if (target.contact && target.contact !== 'Principal' && !target.contact.startsWith('http')) {
      console.log(`   Searching Apollo for: ${target.contact}...`);
      result = await enrichWithApollo(target.firm, target.contact);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // If no result yet, search for any decision-maker
    if (!result || !result.found) {
      console.log(`   Searching Apollo for any decision-maker at ${target.firm}...`);
      result = await searchApolloByFirm(target.firm);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

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
        'Apollo API - verified email'
      );
      
      enriched++;
    } else {
      console.log(`   ❌ Not found in Apollo`);
    }
  }

  console.log(`\n\nSUMMARY`);
  console.log(`=======`);
  console.log(`Processed: 10 firms`);
  console.log(`Enriched: ${enriched} firms`);
  console.log(`Success rate: ${(enriched / 10 * 100).toFixed(1)}%`);
}

enrichLeads().catch(console.error);
