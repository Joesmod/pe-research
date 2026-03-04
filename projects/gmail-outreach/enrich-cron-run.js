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

async function searchApollo(companyName, title) {
  try {
    const response = await axios.post('https://api.apollo.io/v1/mixed_people/search', {
      api_key: APOLLO_API_KEY,
      q_organization_name: companyName,
      person_titles: title ? [title] : ['CEO', 'Managing Partner', 'Partner', 'CTO', 'COO', 'CMO'],
      page: 1,
      per_page: 5
    });
    
    return response.data.people || [];
  } catch (error) {
    console.error(`Apollo API error for ${companyName}:`, error.message);
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
  
  // Find the best contact (prefer Partner/Managing Partner/CEO)
  const bestContact = people.find(p => 
    p.title && (
      p.title.toLowerCase().includes('managing partner') ||
      p.title.toLowerCase().includes('ceo') ||
      p.title.toLowerCase().includes('chief executive')
    )
  ) || people[0];
  
  if (bestContact.email) {
    console.log(`  ✅ Found: ${bestContact.name}`);
    console.log(`     Title: ${bestContact.title}`);
    console.log(`     Email: ${bestContact.email}`);
    console.log(`     LinkedIn: ${bestContact.linkedin_url || 'N/A'}`);
    
    return {
      row,
      company,
      contactName: bestContact.name,
      title: bestContact.title,
      email: bestContact.email,
      linkedin: bestContact.linkedin_url || '',
      status: 'Enriched - Apollo'
    };
  } else {
    console.log(`  ⚠️ Found ${bestContact.name} but no email`);
    return null;
  }
}

async function updateSheet(enrichments) {
  if (enrichments.length === 0) {
    console.log('\n❌ No enrichments to update');
    return;
  }
  
  const sheets = await getSheets();
  
  for (const enrich of enrichments) {
    const range = `Sheet1!B${enrich.row}:F${enrich.row}`;
    const values = [[
      enrich.contactName,
      enrich.title,
      enrich.email,
      '', // Website (keep existing)
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
    
    console.log(`  ✅ Updated row ${enrich.row}`);
  }
}

async function main() {
  console.log('🚀 Starting enrichment cron job...\n');
  
  // Firms to enrich (from our analysis)
  const targets = [
    { row: 500, company: 'Aurora Capital Partners', website: 'http://www.auroracap.com' },
    { row: 525, company: 'Levine Leichtman Capital Partners, LLC', website: 'http://www.llcp.com' },
  ];
  
  const enrichments = [];
  
  for (const target of targets) {
    const result = await enrichFirm(target.row, target.company, target.website);
    if (result) {
      enrichments.push(result);
    }
    // Rate limit: wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n\n📊 SUMMARY: Found ${enrichments.length} enrichments`);
  
  if (enrichments.length > 0) {
    console.log('\nUpdating sheet...');
    await updateSheet(enrichments);
    console.log('\n✅ Sheet updated successfully!');
  }
}

main().catch(console.error);
