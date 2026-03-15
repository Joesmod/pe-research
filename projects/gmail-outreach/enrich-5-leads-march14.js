const axios = require('axios');
const { google } = require('googleapis');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

const firms = [
  { row: 1163, name: 'Trivest Partners', domain: 'trivest.com' },
  { row: 1164, name: 'Blackford Capital', domain: 'blackfordcapital.com' },
  { row: 1165, name: 'CenterOak Partners', domain: 'centeroakpartners.com' },
  { row: 1166, name: 'InterMedia Partners', domain: 'intermediapartners.com' },
  { row: 1167, name: 'Resilience Capital Partners', domain: 'resiliencecapital.com' },
];

async function searchApollo(firmName, domain) {
  try {
    const response = await axios.post(
      'https://api.apollo.io/v1/mixed_people/search',
      {
        q_organization_domains: domain,
        person_titles: [
          'CEO', 'Managing Partner', 'Managing Director',
          'Partner', 'General Partner', 'Operating Partner',
          'Co-Founder', 'Founder', 'President',
          'Chief Executive', 'Chief Operating Officer', 'COO',
          'VP Operations', 'VP Portfolio', 'VP Value Creation',
          'Director', 'Vice President'
        ],
        page: 1,
        per_page: 5
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );
    
    if (response.data && response.data.people && response.data.people.length > 0) {
      const people = response.data.people.map(p => ({
        name: p.name,
        title: p.title,
        email: p.email,
        linkedin: p.linkedin_url
      })).filter(p => p.email && p.email.includes('@'));
      
      return people;
    }
    
    return [];
  } catch (error) {
    console.error(`Apollo API error for ${firmName}:`, error.message);
    return [];
  }
}

async function enrichLeads() {
  const results = [];
  
  for (const firm of firms) {
    console.log(`\n🔍 Searching ${firm.name} (${firm.domain})...`);
    
    const contacts = await searchApollo(firm.name, firm.domain);
    
    if (contacts.length > 0) {
      console.log(`   ✅ Found ${contacts.length} contacts:`);
      contacts.forEach(c => {
        console.log(`      - ${c.name} (${c.title})`);
        console.log(`        Email: ${c.email}`);
      });
      
      results.push({
        row: firm.row,
        firm: firm.name,
        domain: firm.domain,
        contacts
      });
    } else {
      console.log(`   ⚠️  No contacts found via Apollo`);
      results.push({
        row: firm.row,
        firm: firm.name,
        domain: firm.domain,
        contacts: []
      });
    }
    
    // Rate limit: Apollo allows 5 requests/second
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  
  return results;
}

async function updateSheet(results) {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  for (const result of results) {
    if (result.contacts.length > 0) {
      const contact = result.contacts[0]; // Use first (highest ranking) contact
      
      // Update row: D = name, E = title, F = email, G = LinkedIn, H = status, I = notes
      const updates = [
        {
          range: `Sheet1!D${result.row}`,
          values: [[contact.name]]
        },
        {
          range: `Sheet1!E${result.row}`,
          values: [[contact.title]]
        },
        {
          range: `Sheet1!F${result.row}`,
          values: [[contact.email]]
        },
        {
          range: `Sheet1!G${result.row}`,
          values: [[contact.linkedin || '']]
        },
        {
          range: `Sheet1!I${result.row}`,
          values: [['Enriched']]
        },
        {
          range: `Sheet1!J${result.row}`,
          values: [[`Apollo API verified ${contact.name} (${contact.title}) with email ${contact.email}. Found ${result.contacts.length} total contacts. Enriched 2026-03-14 5:07 AM cron.`]]
        },
        {
          range: `Sheet1!K${result.row}`,
          values: [['2026-03-14']]
        }
      ];
      
      for (const update of updates) {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: update.range,
          valueInputOption: 'RAW',
          requestBody: {
            values: update.values
          }
        });
      }
      
      console.log(`   ✅ Updated row ${result.row} with ${contact.name}`);
    }
  }
}

enrichLeads()
  .then(async results => {
    console.log(`\n\n=== ENRICHMENT COMPLETE ===`);
    console.log(`Total firms processed: ${results.length}`);
    const enriched = results.filter(r => r.contacts.length > 0);
    console.log(`Successfully enriched: ${enriched.length}`);
    console.log(`Failed to enrich: ${results.length - enriched.length}`);
    
    if (enriched.length > 0) {
      console.log(`\nUpdating Google Sheet...`);
      await updateSheet(results);
      console.log(`\n✅ Sheet updated!`);
    }
    
    return results;
  })
  .catch(console.error);
