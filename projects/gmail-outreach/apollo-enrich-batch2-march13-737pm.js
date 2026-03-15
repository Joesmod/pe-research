const axios = require('axios');
const fs = require('fs');
const { google } = require('googleapis');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function searchAndEnrichPerson(organizationName) {
  try {
    // Search
    const searchResponse = await axios.post(
      'https://api.apollo.io/api/v1/mixed_people/api_search',
      {
        q_organization_name: organizationName,
        person_titles: [
          'CEO', 'Chief Executive Officer',
          'Managing Partner', 'General Partner', 'Operating Partner',
          'Managing Director',
          'COO', 'Chief Operating Officer',
          'CTO', 'Chief Technology Officer',
          'Vice President',
          'Director'
        ],
        per_page: 5,
        page: 1
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );
    
    if (!searchResponse.data.people || searchResponse.data.people.length === 0) {
      return null;
    }
    
    const topPerson = searchResponse.data.people[0];
    
    // Wait for rate limit
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Enrich
    const enrichResponse = await axios.post(
      'https://api.apollo.io/api/v1/people/match',
      {
        id: topPerson.id
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );
    
    return enrichResponse.data.person;
  } catch (error) {
    console.error(`Error for ${organizationName}:`, error.response?.data || error.message);
    return null;
  }
}

async function getNextBatch() {
  const credentials = JSON.parse(fs.readFileSync('service-account.json', 'utf8'));
  
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1'
  });
  
  const rows = response.data.values;
  const targets = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const website = row[1] || '';
    const contact = row[2] || '';
    const email = row[4] || '';
    const status = row[9] || '';
    
    // Skip if already enriched/sent/dead
    if (status && ['Sent', 'Bounced', 'Replied', 'Dead', 'Not PE', 'Enriched'].includes(status)) {
      continue;
    }
    
    const hasGenericEmail = email && (
      email.toLowerCase().includes('info@') || 
      email.toLowerCase().includes('sales@') || 
      email.toLowerCase().includes('ir@') ||
      email.toLowerCase().includes('contact@') ||
      email.toLowerCase().includes('inquiries@')
    );
    
    const needsEnrichment = !contact || !email || hasGenericEmail;
    
    if (needsEnrichment && company) {
      targets.push({
        rowIndex: i + 1,
        company,
        website,
        contact,
        email,
        status
      });
    }
  }
  
  return targets;
}

async function enrichBatch2() {
  console.log('\n🔍 Getting next batch of firms needing enrichment...\n');
  
  const targets = await getNextBatch();
  
  console.log(`Found ${targets.length} firms needing enrichment`);
  
  // Get unique firms (skip duplicates)
  const uniqueFirms = new Map();
  for (const target of targets) {
    if (!uniqueFirms.has(target.company)) {
      uniqueFirms.set(target.company, target);
    }
  }
  
  const firms = Array.from(uniqueFirms.values()).slice(0, 10);
  
  console.log(`\nEnriching ${firms.length} unique firms:\n`);
  
  const enrichedResults = [];
  
  for (const [index, target] of firms.entries()) {
    console.log(`${index + 1}. ${target.company}`);
    console.log(`   Current: ${target.contact || 'No contact'} | ${target.email || 'No email'}`);
    
    const enriched = await searchAndEnrichPerson(target.company);
    
    if (enriched && enriched.email) {
      console.log(`   ✅ ${enriched.name} - ${enriched.title}`);
      console.log(`   📧 ${enriched.email}\n`);
      
      enrichedResults.push({
        rowIndex: target.rowIndex,
        company: target.company,
        website: target.website,
        contact: {
          name: enriched.name,
          title: enriched.title,
          email: enriched.email,
          linkedin: enriched.linkedin_url
        }
      });
    } else {
      console.log(`   ❌ No email found\n`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`\n📊 Enriched ${enrichedResults.length} firms with verified emails`);
  
  // Update sheet
  if (enrichedResults.length > 0) {
    console.log('\n🚀 Updating Google Sheet...\n');
    
    const credentials = JSON.parse(fs.readFileSync('service-account.json', 'utf8'));
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    const sheetsClient = google.sheets({ version: 'v4', auth: await auth.getClient() });
    
    const updates = enrichedResults.map(result => ({
      range: `Sheet1!C${result.rowIndex}:J${result.rowIndex}`,
      values: [[
        result.contact.name,
        result.contact.title,
        result.contact.email,
        '',
        result.contact.linkedin || '',
        '',
        `Apollo API enrichment 2026-03-13`,
        'Enriched'
      ]]
    }));
    
    await sheetsClient.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    
    console.log(`✅ Updated ${updates.length} rows in Google Sheet`);
  }
}

enrichBatch2();
