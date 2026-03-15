const { google } = require('googleapis');
const axios = require('axios');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Priority targets for enrichment
const PRIORITY_FIRMS = [
  { row: 161, company: 'Thomas H. Lee Partners', domain: 'thl.com' },
  { row: 176, company: 'Hg Capital', domain: 'hgcapital.com' },
  { row: 220, company: 'WindPoint Partners', domain: 'wppartners.com' },
  { row: 223, company: 'Harvest Partners', domain: 'harvpart.com' },
  { row: 234, company: 'The Jordan Company', domain: 'thejordancompany.com' },
  { row: 276, company: 'Harkness Capital Partners', domain: 'harknesscapital.com' },
  { row: 285, company: 'Sentinel Capital Partners', domain: 'sentinelpartners.com' },
  { row: 305, company: 'Bertram Capital', domain: 'bertramcapital.com' },
  { row: 310, company: 'Argonaut Private Equity', domain: 'argonautprivateequity.com' },
  { row: 311, company: 'Mill Point Capital', domain: 'millpoint.com' },
  { row: 319, company: 'CIVC Partners', domain: 'civcpartners.com' },
  { row: 335, company: 'Odyssey Investment Partners', domain: 'odysseyinvestment.com' },
  { row: 456, company: 'Cambridge Capital LLC', domain: 'cambridgecap.com' },
  { row: 478, company: 'Palm Beach Capital', domain: 'palmbeachcapital.com' },
  { row: 500, company: 'Aurora Capital Partners', domain: 'auroracap.com' }
];

async function authenticateGoogleSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  return await auth.getClient();
}

async function searchApolloContacts(companyDomain, companyName) {
  console.log(`\nSearching Apollo for: ${companyName} (${companyDomain})`);
  
  const titles = [
    'Chief Executive Officer', 'CEO', 'President',
    'Chief Operating Officer', 'COO',
    'Chief Technology Officer', 'CTO',
    'Managing Partner', 'Managing Director',
    'Partner', 'General Partner', 'Operating Partner',
    'Vice President Technology', 'VP Technology',
    'Vice President Operations', 'VP Operations',
    'Vice President Digital', 'VP Digital',
    'Director Technology', 'Director Operations',
    'Head of Technology', 'Head of Operations',
    'Head of Value Creation', 'Head of Portfolio Operations'
  ];

  try {
    const response = await axios.post(
      'https://api.apollo.io/api/v1/mixed_people/api_search',
      {
        q_organization_domains: companyDomain,
        person_titles: titles,
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
      const contacts = response.data.people
        .filter(p => p.email && !p.email.includes('info@') && !p.email.includes('contact@'))
        .map(p => ({
          name: p.name,
          title: p.title,
          email: p.email,
          linkedin: p.linkedin_url,
          phone: p.phone_numbers?.[0]?.sanitized_number || ''
        }));

      console.log(`✅ Found ${contacts.length} verified contacts`);
      return contacts;
    }

    console.log(`⚠️ No contacts found`);
    return [];

  } catch (error) {
    console.error(`❌ Apollo API error for ${companyName}:`, error.response?.data || error.message);
    return [];
  }
}

async function updateSheet(authClient, updates) {
  const sheets = google.sheets({ version: 'v4', auth: authClient });
  
  for (const update of updates) {
    try {
      const range = `Sheet1!C${update.row}:G${update.row}`;
      const values = [[
        update.contactName,
        update.title,
        update.email,
        '',  // Website column
        update.linkedin
      ]];

      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range,
        valueInputOption: 'RAW',
        resource: { values }
      });

      console.log(`✅ Updated row ${update.row}: ${update.contactName}`);
      
      // Update Notes column (K) with source
      const notesRange = `Sheet1!K${update.row}`;
      const notesValue = [[`Enriched via Apollo API - ${new Date().toISOString().split('T')[0]} | ${update.source}`]];
      
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: notesRange,
        valueInputOption: 'RAW',
        resource: { values: notesValue }
      });

      // Update Status column (J) to 'Enriched'
      const statusRange = `Sheet1!J${update.row}`;
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: statusRange,
        valueInputOption: 'RAW',
        resource: { values: [['Enriched']] }
      });

    } catch (error) {
      console.error(`❌ Failed to update row ${update.row}:`, error.message);
    }
  }
}

async function main() {
  console.log('🚀 Starting PE Research & Enrichment - March 12, 2026 11:37 AM');
  console.log(`Priority firms: ${PRIORITY_FIRMS.length}`);
  
  const authClient = await authenticateGoogleSheets();
  const updates = [];
  const results = [];

  for (const firm of PRIORITY_FIRMS) {
    const contacts = await searchApolloContacts(firm.domain, firm.company);
    
    if (contacts.length > 0) {
      // Pick the best contact (highest seniority)
      const bestContact = contacts[0];
      
      updates.push({
        row: firm.row,
        contactName: bestContact.name,
        title: bestContact.title,
        email: bestContact.email,
        linkedin: bestContact.linkedin || '',
        source: `Apollo API verified contact`
      });

      results.push({
        company: firm.company,
        contact: bestContact.name,
        title: bestContact.title,
        email: bestContact.email,
        status: 'ENRICHED'
      });
    } else {
      results.push({
        company: firm.company,
        status: 'NOT_FOUND'
      });
    }

    // Rate limit: wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n📊 Summary: ${updates.length}/${PRIORITY_FIRMS.length} firms enriched`);

  if (updates.length > 0) {
    await updateSheet(authClient, updates);
    console.log(`\n✅ Updated ${updates.length} rows in Google Sheet`);
  }

  // Save results
  fs.writeFileSync(
    'enrichment-results-march12-1137am.json',
    JSON.stringify(results, null, 2)
  );

  console.log('\n✅ Enrichment complete!');
  console.log(`Results saved to: enrichment-results-march12-1137am.json`);
}

main().catch(console.error);
