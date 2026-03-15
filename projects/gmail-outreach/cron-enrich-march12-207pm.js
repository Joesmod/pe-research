const { google } = require('googleapis');
const axios = require('axios');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Target firms to enrich (row numbers from sheet)
const TARGET_FIRMS = [
  { row: 161, company: 'Thomas H. Lee Partners', website: 'thlpartners.com' },
  { row: 220, company: 'WindPoint Partners', website: 'windpointpartners.com' },
  { row: 223, company: 'Harvest Partners', website: 'harvpart.com' },
  { row: 324, company: 'Frontenac Company', website: 'frontenac.com' },
  { row: 456, company: 'Cambridge Capital LLC', website: 'cambridgecap.com' },
  { row: 478, company: 'Palm Beach Capital', website: 'pbc.com' },
  { row: 500, company: 'Aurora Capital Partners', website: 'auroracap.com' },
  { row: 511, company: 'Emerging Capital Partners - ECP', website: 'ecpinvestments.com' },
  { row: 842, company: 'Wind Point Partners', website: 'windpoint.com' },
  { row: 851, company: 'Wynnchurch Capital', website: 'wynnchurch.com' },
  { row: 864, company: 'Accel-KKR', website: 'accel-kkr.com' },
  { row: 952, company: 'Bow River Capital', website: 'bowrivercapital.com' },
  { row: 953, company: 'Cressey & Company', website: 'cresseyco.com' },
  { row: 1033, company: 'Prospect Capital Management', website: 'prospectstreet.com' },
  { row: 1034, company: 'Palladium Equity Partners', website: 'palladiumequity.com' }
];

async function searchApolloContact(companyName, domain) {
  try {
    console.log(`\nSearching Apollo for ${companyName}...`);
    
    const response = await axios.post(
      'https://api.apollo.io/v1/mixed_people/search',
      {
        api_key: APOLLO_API_KEY,
        q_organization_domains: domain,
        person_titles: [
          'CEO', 'Chief Executive Officer',
          'Managing Partner', 'Managing Director',
          'Partner', 'General Partner',
          'Chief Operating Officer', 'COO',
          'Chief Technology Officer', 'CTO',
          'Head of Technology', 'VP Technology',
          'Director of Technology', 'VP Operations'
        ],
        page: 1,
        per_page: 5
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      }
    );

    if (response.data && response.data.people && response.data.people.length > 0) {
      const contacts = response.data.people.map(person => ({
        name: person.name || 'Unknown',
        title: person.title || 'Unknown',
        email: person.email || null,
        linkedin: person.linkedin_url || null
      })).filter(c => c.email); // Only keep contacts with emails

      console.log(`✓ Found ${contacts.length} contacts with emails`);
      return contacts;
    } else {
      console.log(`✗ No contacts found`);
      return [];
    }
  } catch (error) {
    console.error(`Error searching ${companyName}:`, error.response?.data?.message || error.message);
    return [];
  }
}

async function updateSheet(row, contact, title, email, linkedin, notes) {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Update columns C (Contact), D (Title), E (Email), G (LinkedIn), J (Status)
    const updates = [
      { range: `Sheet1!C${row}`, values: [[contact]] },
      { range: `Sheet1!D${row}`, values: [[title]] },
      { range: `Sheet1!E${row}`, values: [[email]] },
      { range: `Sheet1!G${row}`, values: [[linkedin || '']] },
      { range: `Sheet1!J${row}`, values: [['Enriched']] }
    ];

    for (const update of updates) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: update.range,
        valueInputOption: 'RAW',
        resource: { values: update.values }
      });
    }

    console.log(`✓ Updated row ${row}: ${contact} | ${email}`);
    return true;
  } catch (error) {
    console.error(`Error updating row ${row}:`, error.message);
    return false;
  }
}

async function enrichFirms() {
  console.log('=== PE Research & Enrichment - Hourly ===');
  console.log(`Starting enrichment for ${TARGET_FIRMS.length} firms...\n`);
  
  let enriched = 0;
  let failed = 0;

  for (const firm of TARGET_FIRMS) {
    console.log(`\n[${enriched + failed + 1}/${TARGET_FIRMS.length}] ${firm.company}`);
    
    const contacts = await searchApolloContact(firm.company, firm.website);
    
    if (contacts.length > 0) {
      // Take the first contact with an email
      const contact = contacts[0];
      const success = await updateSheet(
        firm.row,
        contact.name,
        contact.title,
        contact.email,
        contact.linkedin,
        `Apollo enriched ${new Date().toISOString().split('T')[0]}`
      );
      
      if (success) {
        enriched++;
      } else {
        failed++;
      }
    } else {
      console.log(`✗ No contacts found for ${firm.company}`);
      failed++;
    }
    
    // Rate limiting: wait 2 seconds between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n=== Enrichment Complete ===');
  console.log(`✓ Enriched: ${enriched}`);
  console.log(`✗ Failed: ${failed}`);
  console.log(`Total: ${enriched + failed}/${TARGET_FIRMS.length}`);
}

enrichFirms().catch(console.error);
