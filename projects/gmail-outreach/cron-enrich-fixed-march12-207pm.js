const { google } = require('googleapis');
const axios = require('axios');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Target firms to enrich (row numbers from sheet)
const TARGET_FIRMS = [
  { row: 161, company: 'Thomas H. Lee Partners', website: 'thl.com' },
  { row: 220, company: 'WindPoint Partners', website: 'wppartners.com' },
  { row: 223, company: 'Harvest Partners', website: 'harvestpartners.com' },
  { row: 324, company: 'Frontenac Company', website: 'frontenac.com' },
  { row: 456, company: 'Cambridge Capital LLC', website: 'cambridgecap.com' },
  { row: 478, company: 'Palm Beach Capital', website: 'pbc.com' },
  { row: 500, company: 'Aurora Capital Partners', website: 'auroracap.com' },
  { row: 511, company: 'Emerging Capital Partners', website: 'ecpinvestments.com' },
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
      'https://api.apollo.io/api/v1/mixed_people/search',
      {
        q_organization_domains: domain,
        person_titles: [
          'Managing Partner',
          'Managing Director',
          'General Partner',
          'CEO',
          'Chief Executive Officer',
          'President',
          'COO',
          'Chief Operating Officer',
          'CTO',
          'Chief Technology Officer',
          'Partner',
          'Co-Founder',
          'VP Technology',
          'VP Operations',
          'Director of Technology'
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
      const contacts = response.data.people
        .filter(p => p.email && !p.email.includes('@apollo.io'))
        .map(person => ({
          name: person.name || 'Unknown',
          title: person.title || 'Unknown',
          email: person.email,
          linkedin: person.linkedin_url || null
        }));

      console.log(`✓ Found ${contacts.length} contacts with verified emails`);
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

async function updateSheet(row, contact, title, email, linkedin, status) {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Update columns C (Contact), D (Title), E (Email), G (LinkedIn), J (Status)
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      resource: {
        valueInputOption: 'RAW',
        data: [
          { range: `Sheet1!C${row}`, values: [[contact]] },
          { range: `Sheet1!D${row}`, values: [[title]] },
          { range: `Sheet1!E${row}`, values: [[email]] },
          { range: `Sheet1!G${row}`, values: [[linkedin || '']] },
          { range: `Sheet1!J${row}`, values: [[status]] }
        ]
      }
    });

    console.log(`✓ Updated row ${row}: ${contact} | ${email}`);
    return true;
  } catch (error) {
    console.error(`Error updating row ${row}:`, error.message);
    return false;
  }
}

async function enrichFirms() {
  console.log('=== PE Research & Enrichment - Hourly (March 12, 2:07 PM) ===');
  console.log(`Starting enrichment for ${TARGET_FIRMS.length} firms...\n`);
  
  let enriched = 0;
  let failed = 0;
  const results = [];

  for (const firm of TARGET_FIRMS) {
    console.log(`\n[${enriched + failed + 1}/${TARGET_FIRMS.length}] ${firm.company}`);
    
    const contacts = await searchApolloContact(firm.company, firm.website);
    
    if (contacts.length > 0) {
      // Take the first contact with a verified email
      const contact = contacts[0];
      results.push({
        company: firm.company,
        contact: contact.name,
        title: contact.title,
        email: contact.email,
        linkedin: contact.linkedin,
        row: firm.row
      });
      
      const success = await updateSheet(
        firm.row,
        contact.name,
        contact.title,
        contact.email,
        contact.linkedin,
        'Enriched'
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

  console.log('\n\n=== Enrichment Complete ===');
  console.log(`✓ Successfully Enriched: ${enriched}`);
  console.log(`✗ Failed: ${failed}`);
  console.log(`Total Processed: ${enriched + failed}/${TARGET_FIRMS.length}`);
  
  if (results.length > 0) {
    console.log('\n=== Enriched Contacts ===');
    results.forEach((r, i) => {
      console.log(`\n${i + 1}. ${r.company}`);
      console.log(`   Contact: ${r.contact}`);
      console.log(`   Title: ${r.title}`);
      console.log(`   Email: ${r.email}`);
      console.log(`   LinkedIn: ${r.linkedin || 'N/A'}`);
    });
  }
}

enrichFirms().catch(console.error);
