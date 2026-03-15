const { google } = require('googleapis');
const https = require('https');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// New firms to add
const newFirms = [
  {
    firm: 'Bow River Capital',
    website: 'https://www.bowrivercapital.com',
    sector: 'Healthcare services, Industrials, Software Growth Equity',
    aum: '$2.5B',
    notes: 'Mid-market PE with software growth equity focus. Denver-based.',
    searchName: 'Greg Hiatrides', // Partner, Head of Private Equity
    searchTitle: 'Partner',
    searchDomain: 'bowrivercapital.com'
  },
  {
    firm: 'The Vistria Group',
    website: 'https://www.vistria.com',
    sector: 'Healthcare, Education, Financial Services',
    aum: '$12.9B',
    notes: 'Impact-oriented PE, essential industries focus. Chicago-based.',
    searchName: 'Kip Kirkpatrick',
    searchTitle: 'Co-Founder',
    searchDomain: 'vistria.com'
  },
  {
    firm: 'New Mountain Capital',
    website: 'https://www.newmountaincapital.com',
    sector: 'Healthcare IT, Software, Business Services',
    aum: '$15B+ (Healthcare Tech Fund)',
    notes: 'Defensive growth sectors, large healthcare tech fund.',
    searchName: 'Steve Klinsky',
    searchTitle: 'Founder',
    searchDomain: 'newmountaincapital.com'
  }
];

function apolloSearch(orgName, domain) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      api_key: APOLLO_API_KEY,
      organization_domain: domain,
      page: 1,
      per_page: 5,
      person_titles: ['partner', 'managing director', 'managing partner', 'ceo', 'president', 'head of']
    });

    const options = {
      hostname: 'api.apollo.io',
      path: '/v1/mixed_people/search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Cache-Control': 'no-cache'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function enrichNewFirms() {
  console.log('🔍 Enriching new mid-market PE firms...\n');
  
  const enriched = [];
  
  for (const firm of newFirms) {
    console.log(`\n📌 ${firm.firm}`);
    console.log(`   Domain: ${firm.searchDomain}`);
    
    try {
      const apolloResult = await apolloSearch(firm.firm, firm.searchDomain);
      
      if (apolloResult.people && apolloResult.people.length > 0) {
        const contact = apolloResult.people[0];
        const email = contact.email || (contact.organization_name ? 
          `${contact.first_name.toLowerCase()}.${contact.last_name.toLowerCase()}@${firm.searchDomain}` : 
          '');
        
        enriched.push({
          firm: firm.firm,
          contact: `${contact.first_name} ${contact.last_name}`,
          title: contact.title || 'Partner',
          email: email,
          linkedin: contact.linkedin_url || '',
          website: firm.website,
          sector: firm.sector,
          status: 'Enriched',
          notes: `Apollo-verified. ${firm.notes}`
        });
        
        console.log(`   ✅ Found: ${contact.first_name} ${contact.last_name} (${contact.title})`);
        console.log(`      Email: ${email}`);
      } else {
        // Fallback to manual research data
        enriched.push({
          firm: firm.firm,
          contact: firm.searchName,
          title: firm.searchTitle,
          email: '', // Will need manual verification
          linkedin: '',
          website: firm.website,
          sector: firm.sector,
          status: 'Needs Email Verification',
          notes: `${firm.notes} - Apollo search returned no results. Manual research needed.`
        });
        
        console.log(`   ⚠️  Apollo returned no results. Using fallback contact: ${firm.searchName}`);
      }
      
      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      enriched.push({
        firm: firm.firm,
        contact: firm.searchName,
        title: firm.searchTitle,
        email: '',
        linkedin: '',
        website: firm.website,
        sector: firm.sector,
        status: 'Research Needed',
        notes: `${firm.notes} - Apollo API error: ${error.message}`
      });
    }
  }
  
  // Now append to Google Sheet
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Read current sheet to find next empty row
  const readRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:A'
  });
  
  const nextRow = readRes.data.values ? readRes.data.values.length + 1 : 2;
  
  // Prepare rows to append
  const rows = enriched.map(e => [
    e.firm,
    e.website,
    e.contact,
    e.title,
    e.email,
    e.website,
    e.linkedin,
    e.sector,
    '',  // Portfolio Companies
    e.status,
    '',  // Last Contacted
    e.notes,
    '',  // Company Info URL
    ''   // Gumbo Score
  ]);
  
  // Append to sheet
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `Sheet1!A${nextRow}`,
    valueInputOption: 'RAW',
    resource: {
      values: rows
    }
  });
  
  console.log(`\n\n✅ Added ${enriched.length} new firms to the sheet (starting at row ${nextRow})`);
  console.log('\n📋 Summary:');
  enriched.forEach(e => {
    console.log(`\n${e.firm}`);
    console.log(`  Contact: ${e.contact} (${e.title})`);
    console.log(`  Email: ${e.email || 'NEEDS VERIFICATION'}`);
    console.log(`  Status: ${e.status}`);
  });
}

enrichNewFirms().catch(console.error);
