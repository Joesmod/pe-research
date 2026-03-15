const axios = require('axios');
const { google } = require('googleapis');
const key = require('./service-account.json');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Clean and validate domain
function extractDomain(website) {
  if (!website || website.trim() === '') return null;
  if (website.includes('linkedin.com/in/')) return null;
  
  try {
    let cleaned = website.trim()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0]
      .toLowerCase();
    
    if (cleaned && cleaned.includes('.') && !cleaned.includes(' ')) {
      return cleaned;
    }
  } catch (e) {}
  
  return null;
}

// Search Apollo for organization
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
    console.error(`   Apollo org error: ${error.response?.data?.error || error.message}`);
  }
  
  return null;
}

// Search for people - using correct endpoint
async function searchApolloPeople(domain, companyName) {
  if (!domain) return [];
  
  try {
    const response = await axios.post(
      'https://api.apollo.io/api/v1/people/search',
      {
        q_organization_domains: domain,
        person_titles: [
          'CEO', 'Chief Executive Officer', 'President',
          'Managing Partner', 'Managing Director', 'Partner',
          'General Partner', 'Operating Partner',
          'COO', 'CTO', 'CFO', 'CMO',
          'VP', 'Vice President',
          'Director', 'Head of'
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
    console.error(`   Apollo people error: ${error.response?.data?.error || error.message}`);
  }
  
  return [];
}

async function enrichLeads() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth });

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
  console.log(`Total rows: ${rows.length - 1}\n`);
  
  // Priority 1: Find "new - unresearched" leads
  // Priority 2: Find leads with empty contact names or generic emails (any status)
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = (row[0] || '').trim();
    const contactName = (row[2] || '').trim();
    const email = (row[4] || '').trim();
    const website = (row[5] || '').trim();
    const status = (row[9] || '').trim().toLowerCase();
    
    if (!company) continue;
    
    const isUnresearched = status.includes('unresearched') || status === 'new - unresearched' || status === 'new';
    const hasEmptyContact = !contactName;
    const hasGenericEmail = !email || 
      email.includes('info@') || 
      email.includes('sales@') || 
      email.includes('ir@') ||
      email.includes('contact@') ||
      email.includes('hello@');
    
    // Prioritize unresearched leads, but also include any leads with bad data
    if (isUnresearched || (hasEmptyContact || hasGenericEmail)) {
      needsEnrichment.push({
        rowIndex: i,
        company,
        website,
        currentContact: contactName,
        currentEmail: email,
        status,
        priority: isUnresearched ? 1 : 2
      });
    }
  }

  // Sort by priority (unresearched first)
  needsEnrichment.sort((a, b) => a.priority - b.priority);

  console.log(`=== Found ${needsEnrichment.length} leads needing enrichment ===`);
  console.log(`   Priority 1 (unresearched): ${needsEnrichment.filter(l => l.priority === 1).length}`);
  console.log(`   Priority 2 (empty/generic data): ${needsEnrichment.filter(l => l.priority === 2).length}\n`);

  // Enrich first 12-15
  const toEnrich = needsEnrichment.slice(0, 12);
  const updates = [];
  let successCount = 0;

  for (const lead of toEnrich) {
    console.log(`\n📍 ${lead.company} ${lead.priority === 1 ? '⭐ [UNRESEARCHED]' : ''}`);
    console.log(`   Current: ${lead.currentContact || 'N/A'} | ${lead.currentEmail || 'N/A'}`);
    console.log(`   Website: ${lead.website || 'N/A'}`);
    console.log(`   Status: ${lead.status || 'N/A'}`);
    
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
      console.log(`   ❌ No valid domain found`);
      // Update status to indicate manual research needed
      updates.push({
        range: `Sheet1!L${lead.rowIndex + 1}`,
        values: [['Apollo search attempted - no verified direct email found - manual research needed - 2026-03-09']]
      });
      continue;
    }
    
    console.log(`   🔍 Searching for contacts at ${domain}...`);
    const people = await searchApolloPeople(domain, lead.company);
    
    if (people.length > 0) {
      const bestContact = people[0];
      console.log(`   ✅ Found: ${bestContact.name}`);
      console.log(`      Title: ${bestContact.title}`);
      console.log(`      Email: ${bestContact.email}`);
      console.log(`      LinkedIn: ${bestContact.linkedin || 'N/A'}`);
      
      // Update columns C-G (Contact Name, Title, Email, Website, LinkedIn) + Status
      updates.push({
        range: `Sheet1!C${lead.rowIndex + 1}:J${lead.rowIndex + 1}`,
        values: [[
          bestContact.name,
          bestContact.title || '',
          bestContact.email || '',
          lead.website || (orgData ? `https://${orgData.domain}` : ''),
          bestContact.linkedin || '',
          '', // Sector Focus (H) - keep existing
          '', // Portfolio Companies (I) - keep existing
          'Enriched - 2026-03-09' // Status (J)
        ]]
      });
      
      successCount++;
    } else {
      console.log(`   ❌ No valid contacts found`);
      // Still update notes column
      updates.push({
        range: `Sheet1!L${lead.rowIndex + 1}`,
        values: [['Apollo search attempted - no verified direct email found - manual research needed - 2026-03-09']]
      });
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  // Batch update
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
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🎯 ENRICHMENT SUMMARY`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Total leads needing enrichment: ${needsEnrichment.length}`);
  console.log(`Attempted: ${toEnrich.length}`);
  console.log(`Successfully enriched: ${successCount}`);
  console.log(`Updated in sheet: ${updates.length}`);
  console.log(`Remaining: ${needsEnrichment.length - toEnrich.length}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
}

enrichLeads().catch(console.error);
