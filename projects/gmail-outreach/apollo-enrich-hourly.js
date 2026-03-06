const axios = require('axios');
const { google } = require('googleapis');
const key = require('./service-account.json');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function searchApolloOrg(companyName, website) {
  try {
    const response = await axios.post(
      'https://api.apollo.io/v1/organizations/search',
      {
        q_organization_name: companyName,
        page: 1,
        per_page: 1
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );

    if (response.data && response.data.organizations && response.data.organizations.length > 0) {
      return response.data.organizations[0];
    }
    return null;
  } catch (error) {
    console.error(`Apollo org search error for ${companyName}:`, error.message);
    return null;
  }
}

async function searchApolloPeople(companyDomain, companyName) {
  try {
    const response = await axios.post(
      'https://api.apollo.io/v1/mixed_people/search',
      {
        q_organization_domains: companyDomain,
        person_titles: [
          'Managing Partner',
          'Managing Director',
          'Partner',
          'CEO',
          'Chief Executive Officer',
          'President',
          'Co-Founder',
          'General Partner',
          'Principal'
        ],
        page: 1,
        per_page: 5
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );

    if (response.data && response.data.people && response.data.people.length > 0) {
      // Filter for verified emails only
      const peopleWithEmail = response.data.people.filter(p => p.email && !p.email.includes('info@') && !p.email.includes('contact@'));
      return peopleWithEmail;
    }
    return [];
  } catch (error) {
    console.error(`Apollo people search error for ${companyName}:`, error.message);
    return [];
  }
}

async function enrichLeads() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // Read current sheet
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Sheet1!A:J'
  });

  const rows = result.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }

  const headers = rows[0];
  console.log('Headers:', headers);
  
  // Find leads needing enrichment
  const needsEnrichment = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contactName = row[2] || '';
    const email = row[4] || '';
    const website = row[5] || '';
    
    const hasEmptyContact = !contactName || contactName.trim() === '';
    const hasGenericEmail = !email || email.includes('info@') || email.includes('sales@') || email.includes('ir@') || email.includes('contact@') || email.trim() === '';
    
    if ((hasEmptyContact || hasGenericEmail) && company && website) {
      needsEnrichment.push({
        rowIndex: i,
        company,
        website,
        contactName,
        email
      });
    }
  }

  console.log(`\n=== Found ${needsEnrichment.length} leads needing enrichment ===\n`);

  // Enrich first 15
  const toEnrich = needsEnrichment.slice(0, 15);
  const updates = [];

  for (const lead of toEnrich) {
    console.log(`\n📍 Enriching: ${lead.company}`);
    console.log(`   Website: ${lead.website}`);
    
    // Extract domain from website
    let domain = lead.website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    
    // Search Apollo for people at this company
    const people = await searchApolloPeople(domain, lead.company);
    
    if (people.length > 0) {
      const bestContact = people[0]; // Get the first (highest ranking) person
      console.log(`   ✅ Found: ${bestContact.name}`);
      console.log(`   Title: ${bestContact.title}`);
      console.log(`   Email: ${bestContact.email}`);
      console.log(`   LinkedIn: ${bestContact.linkedin_url || 'N/A'}`);
      
      updates.push({
        range: `Sheet1!C${lead.rowIndex + 1}:G${lead.rowIndex + 1}`,
        values: [[
          bestContact.name,
          bestContact.title || '',
          bestContact.email || '',
          lead.website,
          bestContact.linkedin_url || ''
        ]]
      });
    } else {
      console.log(`   ❌ No contacts found`);
    }
    
    // Rate limit: wait 500ms between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Batch update the sheet
  if (updates.length > 0) {
    console.log(`\n📝 Updating ${updates.length} rows in sheet...`);
    
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    
    console.log(`✅ Sheet updated successfully!`);
  }

  console.log(`\n🎯 Summary: Enriched ${updates.length} / ${toEnrich.length} leads`);
}

enrichLeads().catch(console.error);
