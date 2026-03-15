const { google } = require('googleapis');
const axios = require('axios');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const APOLLO_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Try different search strategy: search for organization first, then people
async function searchContact(firmName, website) {
  try {
    // First try to find the organization
    const orgSearch = await axios.post('https://api.apollo.io/v1/organizations/search', {
      q_organization_name: firmName,
      page: 1,
      per_page: 1
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_KEY
      }
    });

    const orgs = orgSearch.data.organizations || [];
    if (orgs.length === 0) return null;

    const orgId = orgs[0].id;
    console.log(`  Found org ID: ${orgId}`);

    // Now search for people at that organization
    const peopleSearch = await axios.post('https://api.apollo.io/v1/mixed_people/search', {
      organization_ids: [orgId],
      person_titles: ['Partner', 'Managing Partner', 'CEO', 'Managing Director', 'Director'],
      page: 1,
      per_page: 5
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_KEY
      }
    });

    const people = peopleSearch.data.people || [];
    if (people.length === 0) return null;

    // Find first person with email
    const contact = people.find(p => p.email) || people[0];
    return contact;

  } catch (error) {
    console.error(`  API Error: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

async function main() {
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  
  // Read the full sheet first to understand structure
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A1:K1200'
  });

  const rows = res.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }

  // Print first row to see structure
  console.log('Column headers:', rows[0]);
  console.log('');

  // Auto-detect column indices
  const headers = rows[0];
  const getColIdx = (name) => headers.findIndex(h => h && h.toLowerCase().includes(name.toLowerCase()));
  
  const companyIdx = getColIdx('company');
  const contactIdx = getColIdx('contact');
  const titleIdx = getColIdx('title') >= 0 && !getColIdx('title').toString().includes('contact') ? getColIdx('title') : getColIdx('position');
  const emailIdx = getColIdx('email');
  const linkedinIdx = getColIdx('linkedin');
  const statusIdx = getColIdx('status');
  const notesIdx = getColIdx('notes');
  const websiteIdx = getColIdx('website');

  console.log('Column mapping:', { companyIdx, contactIdx, titleIdx, emailIdx, linkedinIdx, statusIdx, notesIdx, websiteIdx });
  console.log('');

  // Find firms needing enrichment
  const needsEnrich = [];
  for (let i = 1; i < rows.length && needsEnrich.length < 20; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';

    if (!company) continue;
    if (status.toLowerCase().includes('dead')) continue;

    // Needs enrichment if no contact or no email or generic email
    const genericEmail = email && /^(info|team|contact|sales|ir|investors)@/.test(email);
    
    if (!contact || !email || genericEmail) {
      needsEnrich.push({
        rowIndex: i + 1,
        company,
        website: row[websiteIdx] || '',
        contact,
        email,
        status
      });
    }
  }

  console.log(`Found ${needsEnrich.length} firms needing enrichment\n`);
  
  const batch = needsEnrich.slice(0, 12);
  console.log(`Enriching ${batch.length} firms:\n`);

  const updates = [];
  
  for (const firm of batch) {
    console.log(`${firm.company}:`);
    
    const contact = await searchContact(firm.company, firm.website);
    
    if (contact && contact.email) {
      console.log(`  ✓ ${contact.name} - ${contact.title || 'N/A'}`);
      console.log(`    ${contact.email}\n`);
      
      updates.push({
        rowIndex: firm.rowIndex,
        contact: contact.name || '',
        title: contact.title || '',
        email: contact.email || '',
        linkedin: contact.linkedin_url || ''
      });
    } else {
      console.log(`  ✗ No contact found\n`);
    }

    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  // Update sheet
  if (updates.length > 0) {
    console.log(`\nUpdating ${updates.length} rows...`);
    
    for (const u of updates) {
      // Update all contact fields in one call
      const range = `Sheet1!${String.fromCharCode(65 + contactIdx)}${u.rowIndex}:${String.fromCharCode(65 + linkedinIdx)}${u.rowIndex}`;
      
      const values = [];
      for (let col = contactIdx; col <= linkedinIdx; col++) {
        if (col === contactIdx) values.push(u.contact);
        else if (col === titleIdx) values.push(u.title);
        else if (col === emailIdx) values.push(u.email);
        else if (col === linkedinIdx) values.push(u.linkedin);
        else values.push('');
      }
      
      await sheets.spreadsheets.values.update({
        spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
        range,
        valueInputOption: 'RAW',
        resource: { values: [values] }
      });

      // Update status
      if (statusIdx >= 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
          range: `Sheet1!${String.fromCharCode(65 + statusIdx)}${u.rowIndex}`,
          valueInputOption: 'RAW',
          resource: { values: [['Enriched - Apollo ' + new Date().toISOString().split('T')[0]]] }
        });
      }

      console.log(`  ✓ Row ${u.rowIndex}: ${u.contact}`);
    }
  }

  console.log(`\n✓ Enriched ${updates.length} of ${batch.length} attempted`);
}

main().catch(console.error);
