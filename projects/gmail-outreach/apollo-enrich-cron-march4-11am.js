const axios = require('axios');
const { google } = require('googleapis');
const fs = require('fs');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Firms to enrich (from our targets list)
const targets = [
  { company: 'Keltic Financial Partners', website: 'kelticfp.com', rowIndex: 117 },
  { company: 'Bindley Capital Partners', website: 'bindleycapital.com', rowIndex: 258 },
  { company: 'HRCap, Inc.', website: 'hrcap.com', rowIndex: 620 },
  { company: 'Jett Capital Advisors', website: 'jettcapital.com', rowIndex: 626 },
  { company: 'Kinect Capital', website: 'kinectcapital.org', rowIndex: 630 },
  { company: 'Odyssey Search Partners', website: 'odysseysearchpartners.com', rowIndex: 654 },
];

async function apolloOrgSearch(company, website) {
  try {
    const response = await axios.post(
      'https://api.apollo.io/v1/organizations/enrich',
      { domain: website },
      { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache', 'X-Api-Key': APOLLO_API_KEY } }
    );
    
    if (response.data && response.data.organization) {
      return response.data.organization;
    }
    return null;
  } catch (error) {
    console.error(`Apollo org search error for ${company}:`, error.response?.data?.message || error.message);
    return null;
  }
}

async function apolloPeopleSearch(domain, titles) {
  try {
    const response = await axios.post(
      'https://api.apollo.io/v1/mixed_people/search',
      {
        organization_domains: [domain],
        person_titles: titles,
        page: 1,
        per_page: 5
      },
      { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache', 'X-Api-Key': APOLLO_API_KEY } }
    );
    
    if (response.data && response.data.people) {
      return response.data.people;
    }
    return [];
  } catch (error) {
    console.error(`Apollo people search error for ${domain}:`, error.response?.data?.message || error.message);
    return [];
  }
}

async function enrichFirm(target) {
  console.log(`\n=== Enriching: ${target.company} ===`);
  console.log(`Website: ${target.website}`);
  
  // Step 1: Get organization info
  const org = await apolloOrgSearch(target.company, target.website);
  if (!org) {
    console.log('  ❌ Organization not found in Apollo');
    return null;
  }
  
  console.log(`  ✓ Found org: ${org.name}`);
  
  // Step 2: Search for decision-makers - cast a wide net
  const titles = [
    'CEO', 'Chief Executive Officer', 'President',
    'Managing Partner', 'Managing Director', 'General Partner',
    'Partner', 'Principal', 'Founder',
    'COO', 'Chief Operating Officer',
    'CTO', 'Chief Technology Officer',
    'Head of Business Development', 'VP Business Development',
    'Director', 'Vice President'
  ];
  
  const people = await apolloPeopleSearch(target.website, titles);
  
  if (people.length === 0) {
    console.log('  ❌ No contacts found');
    return null;
  }
  
  console.log(`  ✓ Found ${people.length} contacts`);
  
  // Pick the best contact (highest level title)
  const best = people[0];
  console.log(`  → Best: ${best.name} - ${best.title}`);
  console.log(`     Email: ${best.email || 'N/A'}`);
  console.log(`     LinkedIn: ${best.linkedin_url || 'N/A'}`);
  
  return {
    ...target,
    contactName: best.name,
    title: best.title,
    email: best.email,
    linkedIn: best.linkedin_url,
    source: 'Apollo API'
  };
}

async function updateSheet(enrichments) {
  if (enrichments.length === 0) {
    console.log('\n⚠️  No enrichments to update');
    return;
  }
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  for (const enrichment of enrichments) {
    if (!enrichment.email) continue; // Skip if no email found
    
    const row = enrichment.rowIndex;
    const updates = [
      { range: `Sheet1!C${row}`, values: [[enrichment.contactName]] },
      { range: `Sheet1!D${row}`, values: [[enrichment.title]] },
      { range: `Sheet1!E${row}`, values: [[enrichment.email]] },
      { range: `Sheet1!G${row}`, values: [[enrichment.linkedIn || '']] },
      { range: `Sheet1!I${row}`, values: [[`Enriched via ${enrichment.source} - ${new Date().toISOString().split('T')[0]}`]] }
    ];
    
    for (const update of updates) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: update.range,
        valueInputOption: 'RAW',
        resource: { values: update.values }
      });
    }
    
    console.log(`  ✓ Updated row ${row}: ${enrichment.contactName}`);
  }
}

(async () => {
  const enrichments = [];
  
  for (const target of targets) {
    const result = await enrichFirm(target);
    if (result && result.email) {
      enrichments.push(result);
    }
    // Rate limiting: wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Total targets: ${targets.length}`);
  console.log(`Successfully enriched: ${enrichments.length}`);
  
  if (enrichments.length > 0) {
    console.log('\n=== Updating Google Sheet ===');
    await updateSheet(enrichments);
    
    // Save log
    fs.writeFileSync(
      'enrichment-log-march4-11am.json',
      JSON.stringify(enrichments, null, 2)
    );
    console.log('\nSaved enrichment log to enrichment-log-march4-11am.json');
  }
  
  console.log('\n✅ Done!');
})();
