const { google } = require('googleapis');
const axios = require('axios');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Smaller/newer PE firms more likely to have accessible contacts
const SMALLER_FIRMS = [
  { row: 942, company: 'Whistler Capital Partners', domain: 'whistlercapital.com' },
  { row: 943, company: 'Tritium Partners', domain: 'tritiumpartners.com' },
  { row: 944, company: 'Primus Capital', domain: 'primuscapital.com' },
  { row: 945, company: 'Monroe Capital', domain: 'monroecap.com' },
  { row: 954, company: 'K1 Investment Management', domain: 'k1.com' },
  { row: 975, company: 'Amulet Capital Partners', domain: 'amuletcapital.com' },
  { row: 976, company: 'Trivest Partners', domain: 'trivestpartners.com' },
  { row: 1016, company: 'Align Capital Partners', domain: 'aligncp.com' },
  { row: 1024, company: 'CORE Industrial Partners', domain: 'coreipfund.com' },
  { row: 1028, company: 'Silver Oak Services Partners', domain: 'silveroaksp.com' }
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
  
  // Cast wider net for smaller firms
  const titles = [
    'Founder', 'Co-Founder',
    'Managing Partner', 'Managing Director', 'Partner',
    'CEO', 'President', 'COO', 'CTO',
    'Vice President', 'VP',
    'Director', 'Head of'
  ];

  try {
    const response = await axios.post(
      'https://api.apollo.io/api/v1/mixed_people/api_search',
      {
        q_organization_domains: companyDomain,
        person_titles: titles,
        page: 1,
        per_page: 10  // Get more results for smaller firms
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
        .filter(p => p.email && 
                     !p.email.includes('info@') && 
                     !p.email.includes('contact@') &&
                     !p.email.includes('sales@') &&
                     !p.email.includes('ir@'))
        .map(p => ({
          name: p.name,
          title: p.title,
          email: p.email,
          linkedin: p.linkedin_url,
          phone: p.phone_numbers?.[0]?.sanitized_number || ''
        }));

      if (contacts.length > 0) {
        console.log(`✅ Found ${contacts.length} verified contacts:`);
        contacts.slice(0, 3).forEach(c => {
          console.log(`   - ${c.name} (${c.title}) - ${c.email}`);
        });
        return contacts;
      }
    }

    console.log(`⚠️ No verified contacts found`);
    return [];

  } catch (error) {
    console.error(`❌ Apollo API error:`, error.response?.data?.error || error.message);
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
  console.log('🚀 PE Research & Enrichment - Smaller Firms Focus');
  console.log('📅 March 12, 2026 11:37 AM\n');
  console.log(`Target firms: ${SMALLER_FIRMS.length}\n`);
  
  const authClient = await authenticateGoogleSheets();
  const updates = [];
  const results = [];

  for (const firm of SMALLER_FIRMS) {
    const contacts = await searchApolloContacts(firm.domain, firm.company);
    
    if (contacts.length > 0) {
      // Pick best contact (prefer Founder > Managing Partner > CEO)
      const bestContact = contacts.find(c => c.title.toLowerCase().includes('founder')) ||
                          contacts.find(c => c.title.toLowerCase().includes('managing partner')) ||
                          contacts.find(c => c.title.toLowerCase().includes('ceo')) ||
                          contacts[0];
      
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

    // Rate limit: wait 1.5 seconds between requests
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  console.log(`\n📊 Summary: ${updates.length}/${SMALLER_FIRMS.length} firms enriched`);

  if (updates.length > 0) {
    console.log('\n✅ Updating Google Sheet...');
    await updateSheet(authClient, updates);
    console.log(`✅ Updated ${updates.length} rows`);
  }

  // Save results
  fs.writeFileSync(
    'enrichment-smaller-firms-results.json',
    JSON.stringify(results, null, 2)
  );

  console.log('\n✅ Enrichment complete!');
  console.log(`Results: enrichment-smaller-firms-results.json`);
  console.log(`\n🎯 ${updates.length} leads enriched with verified contacts`);
}

main().catch(console.error);
