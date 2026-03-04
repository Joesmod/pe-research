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
      person_seniorities: ['partner', 'c_suite', 'director'],
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
    console.error(`  ❌ Apollo search error:`, error.response?.data || error.message);
    return [];
  }
}

async function enrichPerson(personId) {
  try {
    const response = await axios.get(`https://api.apollo.io/v1/people/${personId}`, {
      headers: {
        'X-Api-Key': APOLLO_API_KEY
      }
    });
    
    return response.data.person;
  } catch (error) {
    console.error(`  ❌ Apollo enrich error:`, error.response?.data?.message || error.message);
    return null;
  }
}

async function enrichFirm(row, company, website) {
  console.log(`\n=== Enriching: ${company} (Row ${row}) ===`);
  
  const people = await searchApollo(company);
  
  if (people.length === 0) {
    console.log('  ❌ No contacts found via Apollo');
    return null;
  }
  
  // Try to enrich the top 3 people to find one with an email
  for (let i = 0; i < Math.min(3, people.length); i++) {
    const person = people[i];
    console.log(`  Trying to enrich: ${person.name} (${person.title || 'No title'})`);
    
    if (!person.id) {
      console.log(`    ⚠️ No person ID, skipping`);
      continue;
    }
    
    const enriched = await enrichPerson(person.id);
    await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit
    
    if (enriched && enriched.email) {
      console.log(`  ✅ Found email for: ${enriched.name}`);
      console.log(`     Title: ${enriched.title || 'N/A'}`);
      console.log(`     Email: ${enriched.email}`);
      console.log(`     LinkedIn: ${enriched.linkedin_url || 'N/A'}`);
      
      return {
        row,
        company,
        contactName: enriched.name,
        title: enriched.title || '',
        email: enriched.email,
        linkedin: enriched.linkedin_url || '',
        status: 'Enriched - Apollo'
      };
    } else {
      console.log(`    ⚠️ No email found for ${person.name}`);
    }
  }
  
  console.log(`  ❌ Could not find email for any of the top contacts`);
  return null;
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
  console.log('🚀 Starting PE enrichment cron job with Apollo enrichment...\n');
  
  // Start with a few test firms
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
    // Rate limit between firms
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`\n\n📊 SUMMARY`);
  console.log(`   Total enrichments: ${enrichments.length}/${targets.length}`);
  
  if (enrichments.length > 0) {
    console.log('\n💾 Updating Google Sheet...');
    await updateSheet(enrichments);
    console.log('\n✅ Enrichment complete!');
    
    console.log('\n📝 Enriched contacts:');
    enrichments.forEach(e => {
      console.log(`\n${e.company}:`);
      console.log(`  Contact: ${e.contactName}`);
      console.log(`  Title: ${e.title}`);
      console.log(`  Email: ${e.email}`);
    });
  } else {
    console.log('\n⚠️ No enrichments found. May need manual research.');
  }
}

main().catch(console.error);
