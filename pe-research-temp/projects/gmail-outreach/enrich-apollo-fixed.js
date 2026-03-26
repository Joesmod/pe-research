const axios = require('axios');
const { google } = require('googleapis');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function searchApollo(companyName) {
  try {
    console.log(`  Searching Apollo for: ${companyName}`);
    const response = await axios.post('https://api.apollo.io/v1/mixed_people/api_search', {
      q_organization_name: companyName,
      person_seniorities: ['partner', 'c_suite'],
      page: 1,
      per_page: 10
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY
      }
    });
    
    console.log(`  Found ${response.data.people?.length || 0} people`);
    return response.data.people || [];
  } catch (error) {
    console.error(`  ❌ Apollo API error:`, error.response?.data || error.message);
    return [];
  }
}

async function enrichFirm(row, company, website) {
  console.log(`\n=== Enriching: ${company} (Row ${row}) ===`);
  
  const people = await searchApollo(company);
  
  if (people.length === 0) {
    console.log('  ❌ No contacts found via Apollo');
    return null;
  }
  
  // Find the best contact with email
  const contactsWithEmail = people.filter(p => p.email);
  
  if (contactsWithEmail.length === 0) {
    console.log(`  ⚠️ Found ${people.length} people but none have emails`);
    return null;
  }
  
  // Prefer Managing Partner, then CEO, then other C-level
  const bestContact = contactsWithEmail.find(p => 
    p.title && p.title.toLowerCase().includes('managing partner')
  ) || contactsWithEmail.find(p =>
    p.title && (p.title.toLowerCase().includes('ceo') || p.title.toLowerCase().includes('chief executive'))
  ) || contactsWithEmail.find(p =>
    p.title && (p.title.toLowerCase().includes('coo') || p.title.toLowerCase().includes('cto'))
  ) || contactsWithEmail[0];
  
  console.log(`  ✅ Found: ${bestContact.name}`);
  console.log(`     Title: ${bestContact.title || 'N/A'}`);
  console.log(`     Email: ${bestContact.email}`);
  console.log(`     LinkedIn: ${bestContact.linkedin_url || 'N/A'}`);
  
  return {
    row,
    company,
    contactName: bestContact.name,
    title: bestContact.title || '',
    email: bestContact.email,
    linkedin: bestContact.linkedin_url || '',
    status: 'Enriched - Apollo'
  };
}

async function updateSheet(enrichments) {
  if (enrichments.length === 0) {
    console.log('\n❌ No enrichments to update');
    return;
  }
  
  const sheets = await getSheets();
  
  for (const enrich of enrichments) {
    // Update contact details
    const range = `Sheet1!B${enrich.row}:F${enrich.row}`;
    const values = [[
      enrich.contactName,
      enrich.title,
      enrich.email,
      '', // Keep existing website
      enrich.linkedin
    ]];
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values }
    });
    
    // Update status
    const statusRange = `Sheet1!I${enrich.row}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: statusRange,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[enrich.status]] }
    });
    
    console.log(`  ✅ Updated sheet row ${enrich.row}`);
  }
}

async function main() {
  console.log('🚀 Starting PE enrichment cron job...\n');
  
  // Test with a few firms first
  const targets = [
    { row: 500, company: 'Aurora Capital Partners', website: 'http://www.auroracap.com' },
    { row: 525, company: 'Levine Leichtman Capital Partners', website: 'http://www.llcp.com' },
  ];
  
  const enrichments = [];
  
  for (const target of targets) {
    const result = await enrichFirm(target.row, target.company, target.website);
    if (result) {
      enrichments.push(result);
    }
    // Rate limit: wait 2 seconds between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`\n\n📊 SUMMARY`);
  console.log(`   Total enrichments: ${enrichments.length}/${targets.length}`);
  
  if (enrichments.length > 0) {
    console.log('\n💾 Updating Google Sheet...');
    await updateSheet(enrichments);
    console.log('\n✅ Enrichment complete!');
    
    enrichments.forEach(e => {
      console.log(`\n${e.company}:`);
      console.log(`  Contact: ${e.contactName}`);
      console.log(`  Title: ${e.title}`);
      console.log(`  Email: ${e.email}`);
    });
  }
}

main().catch(console.error);
