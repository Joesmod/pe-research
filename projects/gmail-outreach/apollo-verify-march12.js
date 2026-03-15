const axios = require('axios');
const { google } = require('googleapis');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Contacts found during manual research that need email verification
const contactsToVerify = [
  { 
    row: 1058, 
    company: 'Kinzie Capital Partners', 
    domain: 'kinziecp.com',
    name: 'Suzanne Yoon',
    title: 'Founder & Managing Partner'
  },
  {
    row: 1034,
    company: 'Palladium Equity Partners',
    domain: 'palladiumequity.com',
    name: 'Daniel Ilundain',
    title: 'President'
  },
  {
    row: 842,
    company: 'Wind Point Partners',
    domain: 'wppartners.com',
    name: 'Nathan Brown',
    title: 'Managing Director'
  },
  {
    row: 952,
    company: 'Bow River Capital',
    domain: 'bowrivercapital.com',
    name: 'Blair E. Richardson',
    title: 'CEO'
  },
  {
    row: 953,
    company: 'Cressey & Company',
    domain: 'cresseyco.com',
    name: 'Bryan Cressey',
    title: 'Managing Partner'
  },
  {
    row: 324,
    company: 'Frontenac Company',
    domain: 'frontenac.com',
    name: 'Paul Carbery',
    title: 'Managing Partner'
  },
  {
    row: 851,
    company: 'Wynnchurch Capital',
    domain: 'wynnchurch.com',
    name: 'Greg B. Gleason',
    title: 'Managing Partner'
  }
];

async function searchApolloByName(name, companyDomain, title) {
  try {
    const response = await axios.post(
      'https://api.apollo.io/api/v1/mixed_people/api_search',
      {
        q_organization_domains: companyDomain,
        person_titles: [title],
        q_keywords: name,
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
    
    return response.data;
  } catch (error) {
    console.error(`Error searching ${name} at ${companyDomain}:`, error.response?.data || error.message);
    return null;
  }
}

async function verifyContacts() {
  console.log('Apollo Email Verification - March 12, 2026 1:15 PM\n');
  console.log('Searching for verified emails for manually researched contacts...\n');
  
  const results = [];
  
  for (const contact of contactsToVerify) {
    console.log(`\nSearching: ${contact.name} at ${contact.company}`);
    console.log(`  Domain: ${contact.domain}`);
    console.log(`  Title: ${contact.title}`);
    
    const data = await searchApolloByName(contact.name, contact.domain, contact.title);
    
    if (data && data.people && data.people.length > 0) {
      const person = data.people[0]; // Take best match
      
      if (person.email && !person.email.includes('@apollo.io')) {
        console.log(`  ✓ FOUND: ${person.email}`);
        console.log(`    LinkedIn: ${person.linkedin_url || 'N/A'}`);
        console.log(`    Status: ${person.email_status || 'unknown'}`);
        
        results.push({
          row: contact.row,
          company: contact.company,
          name: person.name,
          title: person.title,
          email: person.email,
          linkedin: person.linkedin_url || '',
          emailStatus: person.email_status,
          notes: `Email verified via Apollo.io | Match confidence: ${data.people.length > 1 ? 'High' : 'Exact'}`
        });
      } else {
        console.log(`  ✗ No verified email found`);
        results.push({
          row: contact.row,
          company: contact.company,
          name: contact.name,
          title: contact.title,
          email: '',
          linkedin: person.linkedin_url || '',
          emailStatus: 'not_found',
          notes: `Contact confirmed via Apollo but no verified email available`
        });
      }
    } else {
      console.log(`  ✗ Not found in Apollo database`);
      results.push({
        row: contact.row,
        company: contact.company,
        name: contact.name,
        title: contact.title,
        email: '',
        linkedin: '',
        emailStatus: 'not_in_apollo',
        notes: `Manual research only - not found in Apollo.io`
      });
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  console.log('\n\n=== ENRICHMENT RESULTS ===\n');
  console.log(`Total contacts searched: ${contactsToVerify.length}`);
  console.log(`Verified emails found: ${results.filter(r => r.email).length}`);
  console.log(`Contacts confirmed but no email: ${results.filter(r => !r.email && r.emailStatus !== 'not_in_apollo').length}`);
  console.log(`Not found in Apollo: ${results.filter(r => r.emailStatus === 'not_in_apollo').length}`);
  
  return results;
}

async function updateSheet(results) {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  console.log('\n\nUpdating Google Sheet with Apollo verification results...\n');
  
  for (const result of results) {
    const range = `Sheet1!C${result.row}:L${result.row}`;
    
    console.log(`Row ${result.row}: ${result.company}`);
    console.log(`  → ${result.name} (${result.title})`);
    console.log(`  → Email: ${result.email || 'NOT FOUND'}`);
    
    try {
      const status = result.email ? 'Enriched' : 'Researched - Contact Found';
      
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        resource: {
          values: [[
            result.name, // Contact Name (C)
            result.title, // Title (D)
            result.email, // Email (E)
            '', // Website (F) - preserve
            result.linkedin, // LinkedIn (G)
            '', // Sector Focus (H) - preserve
            '', // Portfolio Companies (I) - preserve
            status, // Status (J)
            '', // Last Contacted (K) - preserve
            result.notes // Notes (L)
          ]]
        }
      });
      
      console.log(`  ✓ Updated\n`);
    } catch (error) {
      console.error(`  ✗ Error: ${error.message}\n`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('✓ Sheet update complete!\n');
}

async function main() {
  const results = await verifyContacts();
  await updateSheet(results);
}

main().catch(console.error);
