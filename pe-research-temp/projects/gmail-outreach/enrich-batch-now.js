const axios = require('axios');
const { google } = require('googleapis');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Companies needing enrichment (from my analysis)
const targets = [
  { company: 'The Wicks Group', domain: 'wicksgroup.com', row: 221 },
  { company: 'Pine Brook Partners', domain: 'pinebrookpartners.com', row: 224 },
  { company: 'Marlin Equity Partners', domain: 'marlinequity.com', row: 229 },
  { company: 'AEA Investors', domain: 'aeainvestors.com', row: 235 },
  { company: 'Apax Partners', domain: 'apax.com', row: 93 },
  { company: 'Falconhead Capital', domain: 'falconheadcapital.com', row: 216 },
];

async function enrichWithApollo(company, domain) {
  try {
    // Search for people at the company
    const response = await axios.post('https://api.apollo.io/api/v1/mixed_people/api_search', {
      organization_domains: [domain],
      person_titles: [
        'Partner', 'Managing Partner', 'CEO', 'President', 'Managing Director',
        'COO', 'CTO', 'CFO', 'VP Business Development', 'Director'
      ],
      per_page: 5
    }, {
      headers: {
        'X-Api-Key': APOLLO_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (response.data && response.data.people && response.data.people.length > 0) {
      const people = response.data.people.filter(p => p.email && !p.email.match(/^(info@|sales@|ir@)/i));
      return people.map(person => ({
        name: person.name,
        title: person.title,
        email: person.email,
        linkedin: person.linkedin_url,
        source: 'Apollo.io verified'
      }));
    }
  } catch (error) {
    console.error(`Apollo error for ${company}:`, error.response?.data || error.message);
  }
  return [];
}

async function updateSheet(updates) {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  for (const update of updates) {
    const range = `Sheet1!B${update.row}:K${update.row}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range,
      valueInputOption: 'RAW',
      resource: {
        values: [[
          update.contact,
          update.title,
          update.email,
          update.website || '',
          update.linkedin || '',
          '', // Sector
          '', // Portfolio
          'Enriched - Apollo',
          new Date().toISOString(),
          update.notes
        ]]
      }
    });
    console.log(`✓ Updated row ${update.row}: ${update.contact} (${update.email})`);
  }
}

async function main() {
  const enrichmentLog = [];
  const updates = [];

  for (const target of targets) {
    console.log(`\nEnriching: ${target.company} (${target.domain})`);
    const contacts = await enrichWithApollo(target.company, target.domain);
    
    if (contacts.length > 0) {
      const best = contacts[0]; // Take the first (usually highest ranking)
      updates.push({
        row: target.row,
        contact: best.name,
        title: best.title,
        email: best.email,
        linkedin: best.linkedin,
        notes: `Apollo verified: ${best.email}. ${contacts.length} contacts found. Source: Apollo.io - ${new Date().toISOString().split('T')[0]}`
      });
      enrichmentLog.push({
        company: target.company,
        contact: best.name,
        title: best.title,
        email: best.email,
        status: 'enriched'
      });
      console.log(`  → Found: ${best.name} (${best.title}) - ${best.email}`);
    } else {
      enrichmentLog.push({
        company: target.company,
        status: 'not found'
      });
      console.log(`  → No contacts found`);
    }
    
    // Rate limit: 1 request per second
    await new Promise(resolve => setTimeout(resolve, 1100));
  }

  if (updates.length > 0) {
    console.log(`\n--- Updating sheet with ${updates.length} enrichments ---`);
    await updateSheet(updates);
  }

  console.log('\n--- Enrichment Summary ---');
  console.log(JSON.stringify(enrichmentLog, null, 2));
}

main().catch(console.error);
