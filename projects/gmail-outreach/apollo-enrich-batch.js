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

async function searchApollo(companyName, companyWebsite) {
  try {
    console.log(`  Searching Apollo for: ${companyName}`);
    
    // Try to extract domain from website if provided
    let searchDomain = null;
    if (companyWebsite) {
      try {
        const url = new URL(companyWebsite.startsWith('http') ? companyWebsite : `https://${companyWebsite}`);
        searchDomain = url.hostname.replace('www.', '');
      } catch (e) {}
    }
    
    // Step 1: Find the organization
    const orgParams = {
      page: 1,
      per_page: 1
    };
    
    if (searchDomain) {
      orgParams.q_organization_domains = searchDomain;
    } else {
      orgParams.q_organization_name = companyName;
    }
    
    const orgResponse = await axios.get('https://api.apollo.io/v1/organizations/search', {
      params: orgParams,
      headers: {
        'X-Api-Key': APOLLO_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    const orgs = orgResponse.data.organizations || [];
    if (orgs.length === 0) {
      console.log(`  ❌ No organization found`);
      return [];
    }
    
    const org = orgs[0];
    const domain = org.primary_domain;
    console.log(`  ✅ Found org: ${org.name} (${domain})`);
    
    // Step 2: Search for people at that organization
    const peopleResponse = await axios.post('https://api.apollo.io/v1/mixed_people/search', {
      q_organization_domains: [domain],
      person_titles: [
        'Managing Partner', 'Partner', 'Managing Director', 'Principal', 
        'CEO', 'COO', 'President', 'CTO', 'CFO', 'CMO',
        'General Partner', 'Operating Partner', 'Senior Partner',
        'Director', 'VP', 'Vice President', 'Head of'
      ],
      page: 1,
      per_page: 10
    }, {
      headers: {
        'X-Api-Key': APOLLO_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    const people = peopleResponse.data.people || [];
    console.log(`  Found ${people.length} potential contacts`);
    
    // Filter and sort by seniority
    const validPeople = people.filter(p => {
      if (!p.email) return false;
      const email = p.email.toLowerCase();
      if (email.startsWith('info@') || email.startsWith('sales@') || 
          email.startsWith('contact@') || email.startsWith('ir@') ||
          email.startsWith('admin@') || email.startsWith('support@')) {
        return false;
      }
      return true;
    });
    
    // Prioritize by title
    const seniorityScore = (title) => {
      if (!title) return 0;
      const t = title.toLowerCase();
      if (t.includes('managing partner') || t.includes('ceo') || t.includes('founder')) return 10;
      if (t.includes('partner')) return 9;
      if (t.includes('managing director')) return 8;
      if (t.includes('president')) return 7;
      if (t.includes('principal')) return 6;
      if (t.includes('director')) return 5;
      if (t.includes('vp') || t.includes('vice president')) return 4;
      return 3;
    };
    
    validPeople.sort((a, b) => seniorityScore(b.title) - seniorityScore(a.title));
    
    return validPeople.slice(0, 3); // Return top 3
  } catch (error) {
    if (error.response) {
      console.error(`  Apollo API error ${error.response.status}: ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(`  Error: ${error.message}`);
    }
    return [];
  }
}

async function enrichBatch() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:K'
  });
  
  const rows = res.data.values || [];
  
  // HIGH PRIORITY: Firms that need enrichment
  // These are manually selected firms with missing contacts or generic emails
  const targetFirms = [
    { row: 11, company: 'Juno Capital Partners', website: 'junocapitalpartners.com' },
    { row: 12, company: 'Kline Hill Partners', website: 'klinehill.com' },
    { row: 13, company: 'KSL Capital Partners', website: 'kslcapital.com' },
    { row: 16, company: 'Mangrove Equity Partners', website: 'mangroveequity.com' },
    { row: 17, company: 'McWin Capital Partners', website: 'mcwin.fund' },
    { row: 18, company: 'MiddleGround Capital', website: 'middleground.com' },
    { row: 19, company: 'Monomoy Capital Partners', website: 'mcpfunds.com' },
    { row: 20, company: 'MPE Partners', website: 'mpepartners.com' },
    { row: 21, company: 'New 2ND Capital', website: 'new2ndcapital.com' },
    { row: 22, company: 'Pace Capital', website: 'pacecapital.com' },
    { row: 25, company: 'Quona Capital', website: 'quona.com' },
    { row: 26, company: 'Radian Capital', website: 'radiancapital.com' },
    { row: 27, company: 'RevTek Capital', website: 'revtekcapital.com' },
    { row: 28, company: 'Silas Capital', website: 'silascapital.com' },
    { row: 29, company: 'SK Capital Partners', website: 'skcapitalpartners.com' }
  ];
  
  const updates = [];
  let successCount = 0;
  
  for (const firm of targetFirms) {
    console.log(`\n[${firm.row}] ${firm.company}`);
    
    const contacts = await searchApollo(firm.company, firm.website);
    
    if (contacts.length > 0) {
      const best = contacts[0];
      console.log(`  ✅ FOUND: ${best.name} - ${best.title}`);
      console.log(`     📧 ${best.email}`);
      if (best.linkedin_url) console.log(`     🔗 ${best.linkedin_url}`);
      
      const rowIdx = firm.row - 1;
      const currentRow = rows[rowIdx] || [];
      const newRow = [...currentRow];
      
      // Ensure row has enough columns
      while (newRow.length < 11) newRow.push('');
      
      // Update with new data
      newRow[2] = best.name; // Contact Name
      newRow[3] = best.title || ''; // Title
      newRow[4] = best.email; // Email
      if (best.linkedin_url) newRow[6] = best.linkedin_url; // LinkedIn
      newRow[9] = 'Enriched'; // Status
      newRow[10] = `Apollo API enriched ${new Date().toISOString().split('T')[0]}`; // Notes
      
      updates.push({
        range: `Sheet1!A${firm.row}:K${firm.row}`,
        values: [newRow]
      });
      
      successCount++;
    } else {
      console.log(`  ❌ No valid contacts found`);
    }
    
    // Rate limiting: wait 2 seconds between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Batch update the sheet
  if (updates.length > 0) {
    console.log(`\n\n📊 Updating ${updates.length} rows in sheet...`);
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      resource: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    console.log('✅ Sheet updated successfully');
  }
  
  console.log(`\n\n=== ENRICHMENT SUMMARY ===`);
  console.log(`Total firms processed: ${targetFirms.length}`);
  console.log(`Successfully enriched: ${successCount}`);
  console.log(`Failed: ${targetFirms.length - successCount}`);
}

enrichBatch().catch(console.error);
