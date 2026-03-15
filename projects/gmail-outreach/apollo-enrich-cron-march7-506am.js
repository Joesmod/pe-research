const { google } = require('googleapis');
const axios = require('axios');
const key = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function searchApolloContact(companyName, website) {
  try {
    const response = await axios.post(
      'https://api.apollo.io/v1/mixed_people/search',
      {
        q_organization_name: companyName,
        person_seniorities: ['owner', 'founder', 'c_suite', 'partner', 'vp', 'director', 'manager'],
        person_titles: ['CEO', 'CTO', 'COO', 'CFO', 'Managing Partner', 'General Partner', 'Operating Partner', 'Partner', 'VP Technology', 'VP Operations', 'Director Technology', 'Director Operations', 'Head of Technology', 'Head of Operations'],
        per_page: 5,
        page: 1
      },
      {
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );

    if (response.data && response.data.people && response.data.people.length > 0) {
      // Get the first valid contact with email
      for (const person of response.data.people) {
        if (person.email && !person.email.startsWith('info@') && !person.email.startsWith('sales@')) {
          return {
            name: person.name,
            title: person.title,
            email: person.email,
            linkedin: person.linkedin_url || '',
            source: 'Apollo.io'
          };
        }
      }
    }
    return null;
  } catch (error) {
    console.error(`Apollo API error for ${companyName}:`, error.message);
    return null;
  }
}

async function main() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read the sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:K',
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  const headers = rows[0];
  const companyIdx = headers.indexOf('Company Name');
  const contactIdx = headers.indexOf('Contact Name');
  const titleIdx = headers.indexOf('Title');
  const emailIdx = headers.indexOf('Email');
  const websiteIdx = headers.indexOf('Website');
  const linkedinIdx = headers.indexOf('LinkedIn');
  const statusIdx = headers.indexOf('Status');
  
  const updates = [];
  let enrichedCount = 0;
  
  for (let i = 1; i < rows.length && enrichedCount < 12; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const website = row[websiteIdx] || '';
    const status = row[statusIdx] || '';
    
    // Skip Dead/Sent/Reply leads
    if (status.toLowerCase().includes('dead') || 
        status.toLowerCase().includes('sent') ||
        status.toLowerCase().includes('reply')) {
      continue;
    }
    
    const hasGenericEmail = email && (
      email.startsWith('info@') ||
      email.startsWith('sales@') ||
      email.startsWith('ir@') ||
      email.startsWith('contact@') ||
      email.startsWith('investors@')
    );
    
    if ((!contact || hasGenericEmail || !email) && company) {
      console.log(`\nEnriching ${company}...`);
      
      const apolloContact = await searchApolloContact(company, website);
      
      if (apolloContact) {
        console.log(`✓ Found: ${apolloContact.name} - ${apolloContact.title} - ${apolloContact.email}`);
        
        updates.push({
          range: `Sheet1!C${i + 1}:G${i + 1}`,
          values: [[
            apolloContact.name,
            apolloContact.title,
            apolloContact.email,
            row[websiteIdx] || '',
            apolloContact.linkedin
          ]]
        });
        
        // Update status to Enriched
        updates.push({
          range: `Sheet1!J${i + 1}`,
          values: [['Enriched']]
        });
        
        enrichedCount++;
      } else {
        console.log(`✗ No contact found via Apollo`);
      }
      
      // Rate limit: wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Apply all updates
  if (updates.length > 0) {
    console.log(`\nApplying ${updates.length / 2} enrichments to sheet...`);
    
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    
    console.log(`✓ Successfully enriched ${enrichedCount} leads`);
  } else {
    console.log('\nNo leads enriched this run');
  }
}

main().catch(console.error);
