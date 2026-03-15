const axios = require('axios');
const { google } = require('googleapis');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function searchApolloContacts(companyDomain, companyName) {
  try {
    const response = await axios.post(
      'https://api.apollo.io/v1/mixed_people/api_search',
      {
        q_organization_domains: companyDomain,
        page: 1,
        per_page: 5,
        person_titles: [
          'CEO',
          'Managing Partner',
          'Managing Director',
          'Partner',
          'General Partner',
          'Operating Partner',
          'Co-Founder',
          'Founder',
          'Chief Investment Officer',
          'CIO',
          'President'
        ],
        contact_email_status: ['verified', 'guessed', 'unavailable']
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
      // Filter for people with emails
      const withEmails = response.data.people.filter(p => p.email && p.email.trim() !== '');
      if (withEmails.length > 0) {
        const best = withEmails[0];
        return {
          name: best.name,
          title: best.title,
          email: best.email,
          linkedinUrl: best.linkedin_url,
          source: 'Apollo API'
        };
      }
    }
    return null;
  } catch (error) {
    console.error(`Apollo search error for ${companyName}:`, error.response?.data || error.message);
    return null;
  }
}

async function updateSheet(updates) {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  for (const update of updates) {
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Sheet1!C${update.row}:J${update.row}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[
            update.contactName,
            update.title,
            update.email,
            update.website || '',
            update.linkedinUrl || '',
            'Enriched',
            update.source,
            'Enriched - Apollo API 2026-03-08'
          ]]
        }
      });
      console.log(`✅ Updated row ${update.row}: ${update.company} → ${update.contactName}`);
    } catch (error) {
      console.error(`Failed to update row ${update.row}:`, error.message);
    }
  }
}

async function enrichPEFirms() {
  console.log('🔍 Starting Apollo enrichment for PE firms...\n');
  
  // Target firms from the sheet analysis that need enrichment
  const targets = [
    { row: 832, company: 'Anthemis Group', domain: 'anthemis.com' },
    { row: 828, company: 'ALCOR Fund', domain: 'alcorfund.com' },
    { row: 839, company: 'Atlas Private Equity Partners', domain: 'atlaspep.com' },
    { row: 823, company: 'AEC Advisors LLC', domain: 'aecadvisors.com' },
    { row: 824, company: 'Affinity.co', domain: 'affinity.co' },
    { row: 829, company: 'Alkymi', domain: 'alkymi.io' },
    { row: 831, company: 'Allvue Systems', domain: 'allvuesystems.com' }
  ];
  
  const updates = [];
  
  for (const target of targets) {
    console.log(`\n🔎 Searching: ${target.company} (${target.domain})`);
    
    const contact = await searchApolloContacts(target.domain, target.company);
    
    if (contact) {
      console.log(`   ✅ Found: ${contact.name} - ${contact.title}`);
      console.log(`   📧 Email: ${contact.email}`);
      
      updates.push({
        row: target.row,
        company: target.company,
        contactName: contact.name,
        title: contact.title,
        email: contact.email,
        linkedinUrl: contact.linkedinUrl,
        website: `http://www.${target.domain}`,
        source: `Apollo: ${contact.source}`
      });
    } else {
      console.log(`   ❌ No verified contact found`);
    }
    
    // Rate limit: Wait 1.5 seconds between requests
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  console.log(`\n\n=== ENRICHMENT COMPLETE ===`);
  console.log(`Found ${updates.length} contacts to update\n`);
  
  if (updates.length > 0) {
    console.log('📝 Updating Google Sheet...\n');
    await updateSheet(updates);
    console.log(`\n✅ Sheet updated successfully!`);
  }
  
  return updates;
}

enrichPEFirms().catch(console.error);
