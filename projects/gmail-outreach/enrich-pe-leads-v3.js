const axios = require('axios');
const { google } = require('googleapis');
const key = require('./service-account.json');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Clean and validate domain
function extractDomain(website) {
  if (!website || website.trim() === '') return null;
  
  // Skip if it's a LinkedIn profile
  if (website.includes('linkedin.com/in/')) return null;
  
  try {
    let cleaned = website.trim()
      .replace(/^https?:\/\//, '')  // Remove protocol
      .replace(/^www\./, '')         // Remove www
      .split('/')[0]                 // Take only domain
      .toLowerCase();
    
    // Validate it's a proper domain
    if (cleaned && cleaned.includes('.') && !cleaned.includes(' ')) {
      return cleaned;
    }
  } catch (e) {
    console.error(`Error extracting domain from ${website}:`, e.message);
  }
  
  return null;
}

// Search Apollo for the organization first to get verified domain
async function searchApolloOrg(companyName) {
  try {
    const response = await axios.post(
      'https://api.apollo.io/api/v1/mixed_companies/search',
      {
        q_organization_name: companyName,
        page: 1,
        per_page: 1
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );

    if (response.data && response.data.organizations && response.data.organizations.length > 0) {
      const org = response.data.organizations[0];
      return {
        name: org.name,
        domain: org.website_url || org.primary_domain,
        linkedin: org.linkedin_url
      };
    }
  } catch (error) {
    console.error(`Apollo org search error for ${companyName}:`, error.response?.data || error.message);
  }
  
  return null;
}

// Search for people at a company by domain using the CORRECT endpoint
async function searchApolloPeople(domain, companyName) {
  if (!domain) return [];
  
  try {
    // Use the new endpoint: /api/v1/people/search
    const response = await axios.post(
      'https://api.apollo.io/api/v1/people/search',
      {
        q_organization_domains: domain,
        person_titles: [
          'CEO', 'Chief Executive Officer', 'President',
          'Managing Partner', 'Managing Director', 'Partner',
          'General Partner', 'Operating Partner',
          'COO', 'Chief Operating Officer',
          'CTO', 'Chief Technology Officer',
          'CMO', 'Chief Marketing Officer',
          'CFO', 'Chief Financial Officer',
          'VP', 'Vice President',
          'Director'
        ],
        page: 1,
        per_page: 10
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );

    if (response.data && response.data.people && response.data.people.length > 0) {
      // Filter for people with verified, non-generic emails
      const validPeople = response.data.people.filter(p => {
        if (!p.email) return false;
        const email = p.email.toLowerCase();
        return !email.includes('info@') && 
               !email.includes('contact@') && 
               !email.includes('sales@') &&
               !email.includes('support@') &&
               !email.includes('hello@');
      });
      
      return validPeople.map(p => ({
        name: p.name,
        title: p.title,
        email: p.email,
        linkedin: p.linkedin_url
      }));
    }
  } catch (error) {
    console.error(`Apollo people search error for ${companyName}:`, error.response?.data || error.message);
  }
  
  return [];
}

async function enrichLeads() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // Read current sheet (extended range to capture all columns)
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Sheet1!A:M'
  });

  const rows = result.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }

  const headers = rows[0];
  console.log('Headers:', headers);
  console.log(`Total rows: ${rows.length - 1}\n`);
  
  // Find leads needing enrichment
  const needsEnrichment = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = (row[0] || '').trim();
    const contactName = (row[2] || '').trim();
    const email = (row[4] || '').trim();
    const website = (row[5] || '').trim();
    const status = (row[9] || '').trim().toLowerCase();  // Status is column J (index 9)
    
    // Skip if not active or already enriched properly
    if (!['active', 'unresearched', ''].includes(status)) continue;
    if (!company) continue;
    
    const hasEmptyContact = !contactName;
    const hasGenericEmail = !email || 
      email.includes('info@') || 
      email.includes('sales@') || 
      email.includes('ir@') ||
      email.includes('contact@') ||
      email.includes('hello@');
    
    if (hasEmptyContact || hasGenericEmail) {
      needsEnrichment.push({
        rowIndex: i,
        company,
        website,
        currentContact: contactName,
        currentEmail: email,
        status
      });
    }
  }

  console.log(`=== Found ${needsEnrichment.length} leads needing enrichment ===\n`);

  // Enrich first 10-15
  const toEnrich = needsEnrichment.slice(0, 12);
  const updates = [];
  let successCount = 0;

  for (const lead of toEnrich) {
    console.log(`\n📍 ${lead.company}`);
    console.log(`   Current: ${lead.currentContact || 'N/A'} | ${lead.currentEmail || 'N/A'}`);
    console.log(`   Website: ${lead.website || 'N/A'}`);
    
    // Step 1: Try to find org in Apollo to get verified domain
    let domain = extractDomain(lead.website);
    let orgData = null;
    
    if (!domain) {
      console.log(`   🔍 Searching Apollo for organization...`);
      orgData = await searchApolloOrg(lead.company);
      if (orgData && orgData.domain) {
        domain = extractDomain(orgData.domain);
        console.log(`   ✓ Found domain: ${domain}`);
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    if (!domain) {
      console.log(`   ❌ No valid domain found, skipping`);
      continue;
    }
    
    // Step 2: Search for people at this domain
    console.log(`   🔍 Searching for contacts at ${domain}...`);
    const people = await searchApolloPeople(domain, lead.company);
    
    if (people.length > 0) {
      const bestContact = people[0]; // Highest ranking
      console.log(`   ✅ Found: ${bestContact.name}`);
      console.log(`      Title: ${bestContact.title}`);
      console.log(`      Email: ${bestContact.email}`);
      console.log(`      LinkedIn: ${bestContact.linkedin || 'N/A'}`);
      
      // Prepare update for columns C, D, E, F, G (Contact Name, Title, Email, Website, LinkedIn)
      updates.push({
        range: `Sheet1!C${lead.rowIndex + 1}:G${lead.rowIndex + 1}`,
        values: [[
          bestContact.name,
          bestContact.title || '',
          bestContact.email || '',
          lead.website || (orgData ? orgData.domain : ''),
          bestContact.linkedin || ''
        ]]
      });
      
      successCount++;
    } else {
      console.log(`   ❌ No valid contacts found`);
    }
    
    // Rate limit: wait 1.5 seconds between requests
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  // Batch update the sheet
  if (updates.length > 0) {
    console.log(`\n\n📝 Updating ${updates.length} rows in Google Sheet...`);
    
    try {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          valueInputOption: 'RAW',
          data: updates
        }
      });
      
      console.log(`✅ Sheet updated successfully!`);
    } catch (error) {
      console.error('Error updating sheet:', error.message);
    }
  } else {
    console.log(`\n\n⚠️  No updates to apply`);
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🎯 ENRICHMENT SUMMARY`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Total leads needing enrichment: ${needsEnrichment.length}`);
  console.log(`Attempted: ${toEnrich.length}`);
  console.log(`Successfully enriched: ${successCount}`);
  console.log(`Updated in sheet: ${updates.length}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
}

enrichLeads().catch(console.error);
