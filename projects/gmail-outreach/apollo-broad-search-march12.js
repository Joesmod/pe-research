const axios = require('axios');
const { google } = require('googleapis');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Firms from the sheet that need ANY decision-maker contact
// Targeting rows with empty/generic emails identified earlier
const firmsNeedingContacts = [
  { row: 954, company: 'K1 Investment Management', domain: 'k1.com' },
  { row: 974, company: 'Bow River Capital', domain: 'bowrivercapital.com' },
  { row: 976, company: 'Silver Oak Services Partners', domain: 'silveroaksp.com' },
  { row: 977, company: 'Ridgemont Equity Partners', domain: 'ridgemontep.com' },
  { row: 978, company: 'Bregal Sagemount', domain: 'bregal.com' },
  { row: 1015, company: 'Irving Place Capital', domain: 'irvingplacecapital.com' },
  { row: 1016, company: 'Court Square Capital Partners', domain: 'courtsquarecapital.com' },
  { row: 1017, company: 'HGGC', domain: 'hggc.com' },
  { row: 1018, company: 'Genstar Capital', domain: 'gencap.com' },
  { row: 1019, company: 'The Riverside Company', domain: 'riversidecompany.com' },
  { row: 1022, company: 'Bow River Capital', domain: 'bowrivercapital.com' }, // duplicate but different row
  { row: 1055, company: 'Bow River Capital', domain: 'bowrivercapital.com' } // another duplicate
];

async function searchApollo(companyDomain) {
  try {
    // Search for decision-makers at the firm
    const response = await axios.post(
      'https://api.apollo.io/api/v1/mixed_people/api_search',
      {
        q_organization_domains: companyDomain,
        person_titles: [
          'Managing Partner',
          'Managing Director',
          'Partner',
          'General Partner',
          'Operating Partner',
          'CEO',
          'President',
          'COO',
          'Vice President',
          'Principal',
          'Director'
        ],
        page: 1,
        per_page: 10
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error(`Error searching ${companyDomain}:`, error.response?.data || error.message);
    return null;
  }
}

async function enrichFirms() {
  console.log('Apollo Broad Search - March 12, 2026 1:20 PM\n');
  console.log('Searching for ANY decision-maker contacts at firms needing enrichment...\n');
  
  const results = [];
  
  for (const firm of firmsNeedingContacts) {
    console.log(`\nSearching: ${firm.company} (${firm.domain})`);
    
    const data = await searchApollo(firm.domain);
    
    if (data && data.people && data.people.length > 0) {
      // Filter for people with verified emails
      const validPeople = data.people.filter(p => 
        p.email && 
        !p.email.includes('@apollo.io') &&
        !p.email.includes('info@') &&
        !p.email.includes('sales@') &&
        !p.email.includes('ir@') &&
        !p.email.includes('contact@')
      );
      
      if (validPeople.length > 0) {
        // Take the highest-ranking title
        const bestContact = validPeople[0];
        
        console.log(`  ✓ ${bestContact.name} - ${bestContact.title}`);
        console.log(`    Email: ${bestContact.email}`);
        console.log(`    LinkedIn: ${bestContact.linkedin_url || 'N/A'}`);
        
        results.push({
          row: firm.row,
          company: firm.company,
          name: bestContact.name,
          title: bestContact.title,
          email: bestContact.email,
          linkedin: bestContact.linkedin_url || '',
          notes: `Contact found via Apollo.io | Title: ${bestContact.title} | Source: Apollo database`
        });
      } else {
        console.log(`  ✗ No valid emails found (${data.people.length} contacts in database)`);
      }
    } else {
      console.log(`  ✗ No contacts found`);
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  console.log('\n\n=== ENRICHMENT RESULTS ===\n');
  console.log(`Total firms searched: ${firmsNeedingContacts.length}`);
  console.log(`Contacts with verified emails found: ${results.length}`);
  
  return results;
}

async function updateSheet(results) {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  console.log('\n\nUpdating Google Sheet with Apollo results...\n');
  
  for (const result of results) {
    const range = `Sheet1!C${result.row}:L${result.row}`;
    
    console.log(`Row ${result.row}: ${result.company}`);
    console.log(`  → ${result.name} (${result.title})`);
    console.log(`  → Email: ${result.email}`);
    
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        resource: {
          values: [[
            result.name, // Contact Name (C)
            result.title, // Title (D)
            result.email, // Email (E)
            '', // Website (F) - preserve
            result.linkedin, // LinkedIn (G)
            '', // Sector Focus (H) - preserve
            '', // Portfolio Companies (I) - preserve
            'Enriched', // Status (J)
            '', // Last Contacted (K) - preserve
            result.notes // Notes (L)
          ]]
        }
      });
      
      console.log(`  ✓ Updated\n`);
    } catch (error) {
      console.error(`  ✗ Error: ${error.message}\n`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('✓ Sheet update complete!\n');
}

async function main() {
  const results = await enrichFirms();
  
  if (results.length > 0) {
    await updateSheet(results);
  } else {
    console.log('\nNo contacts found to update.');
  }
}

main().catch(console.error);
