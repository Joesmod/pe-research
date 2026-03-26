const { google } = require('googleapis');
const axios = require('axios');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function getExistingFirms() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:A',
  });

  const rows = response.data.values || [];
  return new Set(rows.slice(1).map(r => (r[0] || '').toLowerCase().trim()));
}

async function searchNewPEFirms() {
  console.log('🔍 Searching for new mid-market PE firms...\n');
  
  const existingFirms = await getExistingFirms();
  console.log(`📊 Already have ${existingFirms.size} firms in sheet\n`);
  
  // Search for PE firms
  const searches = [
    { query: 'private equity managing partner', title: 'Managing Partner' },
    { query: 'private equity CEO', title: 'CEO' },
    { query: 'private equity general partner', title: 'General Partner' },
  ];
  
  const newFirms = [];
  
  for (const search of searches) {
    try {
      console.log(`Searching: ${search.query}...`);
      
      const response = await axios.post(
        'https://api.apollo.io/v1/mixed_people/search',
        {
          q_keywords: search.query,
          person_titles: [search.title],
          organization_num_employees_ranges: ['51-200', '201-500', '501-1000', '1001-2000'],
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
      
      if (response.data && response.data.people) {
        for (const person of response.data.people) {
          const orgName = person.organization?.name || '';
          const domain = person.organization?.website_url || '';
          
          if (!orgName || existingFirms.has(orgName.toLowerCase())) continue;
          
          // Only add PE/growth equity firms
          const isPE = orgName.match(/(capital|equity|partners|ventures|investments?)/i);
          if (!isPE) continue;
          
          const email = person.email || '';
          if (email && !email.match(/^(info|sales|contact)@/i)) {
            newFirms.push({
              company: orgName,
              contact: person.name || '',
              title: person.title || '',
              email: email,
              website: domain,
              linkedin: person.linkedin_url || '',
              source: 'Apollo API search'
            });
            
            existingFirms.add(orgName.toLowerCase());
            
            if (newFirms.length >= 5) break;
          }
        }
      }
      
      if (newFirms.length >= 5) break;
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`Error searching ${search.query}:`, error.message);
    }
  }
  
  console.log(`\n✅ Found ${newFirms.length} new firms\n`);
  
  newFirms.forEach((firm, i) => {
    console.log(`${i + 1}. ${firm.company}`);
    console.log(`   Contact: ${firm.contact}`);
    console.log(`   Title: ${firm.title}`);
    console.log(`   Email: ${firm.email}`);
    console.log(`   Website: ${firm.website}\n`);
  });
  
  const fs = require('fs');
  fs.writeFileSync('new-firms-found.json', JSON.stringify(newFirms, null, 2));
  console.log('💾 Saved to new-firms-found.json');
  
  return newFirms;
}

searchNewPEFirms().catch(console.error);
