const axios = require('axios');
const { google } = require('googleapis');
const key = require('./service-account.json');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const auth = new google.auth.GoogleAuth({
  credentials: key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

async function searchApollo(companyName) {
  try {
    // Step 1: Find the organization
    const orgResponse = await axios.get('https://api.apollo.io/v1/organizations/search', {
      params: {
        q_organization_name: companyName,
        page: 1,
        per_page: 1
      },
      headers: {
        'X-Api-Key': APOLLO_API_KEY
      }
    });
    
    const orgs = orgResponse.data.organizations || [];
    if (orgs.length === 0) {
      console.log(`  No organization found for: ${companyName}`);
      return [];
    }
    
    const org = orgs[0];
    const domain = org.primary_domain;
    console.log(`  Found org: ${org.name} (${domain})`);
    
    // Step 2: Search for people at that organization
    const peopleResponse = await axios.get('https://api.apollo.io/v1/mixed_people/search', {
      params: {
        q_organization_domains: domain,
        person_titles: ['Managing Partner', 'Partner', 'Managing Director', 'Principal', 'CEO', 'COO', 'President'],
        page: 1,
        per_page: 5
      },
      headers: {
        'X-Api-Key': APOLLO_API_KEY
      }
    });
    
    const people = peopleResponse.data.people || [];
    console.log(`  Found ${people.length} contacts`);
    
    // Filter and sort
    const validPeople = people.filter(p => {
      return p.email && 
             !p.email.startsWith('info@') && 
             !p.email.startsWith('sales@') &&
             !p.email.startsWith('contact@') &&
             !p.email.startsWith('ir@');
    });
    
    return validPeople.slice(0, 2);
  } catch (error) {
    if (error.response) {
      console.error(`  Apollo API error ${error.response.status}: ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(`  Error: ${error.message}`);
    }
    return [];
  }
}

async function enrichFromSheet() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:J'
  });
  
  const rows = res.data.values || [];
  
  // Target specific high-priority firms
  const targetFirms = [
    { row: 231, company: 'Clayton Dubilier & Rice', abbr: 'CD&R' },
    { row: 671, company: 'Seacoast Capital' },
    { row: 747, company: 'Gridiron Capital' },
    { row: 772, company: 'Palladium Equity Partners' },
    { row: 787, company: 'Roark Capital' },
    { row: 790, company: 'Sageview Capital' },
    { row: 793, company: 'Seaside Equity Partners' },
    { row: 794, company: 'Silver Oak Services Partners' },
    { row: 867, company: 'Peak Rock Capital' },
    { row: 880, company: 'Arsenal Capital Partners' },
    { row: 889, company: 'Arsenal Capital Partners' },
    { row: 891, company: 'Odyssey Investment Partners' },
    { row: 906, company: 'Great Range Capital' },
    { row: 935, company: 'Carousel Capital' },
    { row: 936, company: 'CapStreet' }
  ];
  
  const updates = [];
  
  for (const firm of targetFirms) {
    console.log(`\n[${firm.row}] ${firm.company}`);
    
    const searchName = firm.abbr || firm.company;
    const contacts = await searchApollo(searchName);
    
    if (contacts.length > 0) {
      const best = contacts[0];
      console.log(`  ✅ ${best.name} - ${best.title}`);
      console.log(`     ${best.email}`);
      
      const rowIdx = firm.row - 1;
      const currentRow = rows[rowIdx] || [];
      const newRow = [...currentRow];
      
      while (newRow.length < 11) newRow.push('');
      
      newRow[2] = best.name;
      newRow[3] = best.title || '';
      newRow[4] = best.email;
      if (best.linkedin_url) newRow[6] = best.linkedin_url;
      newRow[9] = 'Enriched';
      newRow[10] = `Apollo: ${best.email_status || 'found'} | ${new Date().toISOString().split('T')[0]}`;
      
      updates.push({
        range: `Sheet1!A${firm.row}:K${firm.row}`,
        values: [newRow]
      });
    } else {
      console.log(`  ❌ No contacts found`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  if (updates.length > 0) {
    console.log(`\n\nUpdating ${updates.length} rows...`);
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      resource: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    console.log('✅ Sheet updated');
  }
  
  console.log(`\n📊 ${updates.length} / ${targetFirms.length} enriched`);
}

enrichFromSheet().catch(console.error);
