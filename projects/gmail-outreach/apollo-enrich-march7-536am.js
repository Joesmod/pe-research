const axios = require('axios');
const fs = require('fs');
const { google } = require('googleapis');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const targets = require('./enrich-targets-march7-536am.json');

async function searchPeople(company) {
  try {
    const response = await axios.post(
      'https://api.apollo.io/v1/mixed_people/search',
      {
        organization_name: company,
        person_titles: ['CEO', 'CTO', 'COO', 'CFO', 'Managing Partner', 'Managing Director', 'Partner', 'VP Technology', 'VP Operations', 'Director Technology', 'Director Operations', 'Head of Technology', 'Head of Portfolio Operations'],
        page: 1,
        per_page: 10
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
      return response.data.people;
    }
    return [];
  } catch (error) {
    console.error(`Error searching ${company}:`, error.message);
    return [];
  }
}

async function enrichLeads() {
  const enriched = [];
  
  for (const target of targets.slice(0, 10)) {
    console.log(`\nEnriching: ${target.company} (Row ${target.row})`);
    
    const people = await searchPeople(target.company);
    
    if (people.length > 0) {
      const person = people[0]; // Take the first/best match
      
      const email = person.email || '';
      const name = person.name || '';
      const title = person.title || '';
      const linkedin = person.linkedin_url || '';
      
      if (email && !email.match(/^(info@|sales@|ir@|contact@|support@)/i)) {
        console.log(`  ✓ Found: ${name} - ${title}`);
        console.log(`    Email: ${email}`);
        console.log(`    LinkedIn: ${linkedin}`);
        
        enriched.push({
          row: target.row,
          company: target.company,
          name,
          title,
          email,
          linkedin
        });
      } else {
        console.log(`  ✗ No valid email found`);
      }
    } else {
      console.log(`  ✗ No contacts found`);
    }
    
    // Rate limit: wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n\n=== ENRICHMENT SUMMARY ===`);
  console.log(`Total enriched: ${enriched.length} / ${targets.slice(0, 10).length}`);
  
  // Save results
  fs.writeFileSync('apollo-enrichment-march7-536am.json', JSON.stringify(enriched, null, 2));
  console.log(`\nSaved results to apollo-enrichment-march7-536am.json`);
  
  return enriched;
}

async function updateSheet(enriched) {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  for (const lead of enriched) {
    const updates = [
      {
        range: `Sheet1!C${lead.row}`, // Contact Name
        values: [[lead.name]]
      },
      {
        range: `Sheet1!D${lead.row}`, // Title
        values: [[lead.title]]
      },
      {
        range: `Sheet1!E${lead.row}`, // Email
        values: [[lead.email]]
      },
      {
        range: `Sheet1!G${lead.row}`, // LinkedIn
        values: [[lead.linkedin]]
      },
      {
        range: `Sheet1!J${lead.row}`, // Status
        values: [['Enriched']]
      }
    ];
    
    for (const update of updates) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: update.range,
        valueInputOption: 'RAW',
        resource: { values: update.values }
      });
    }
    
    console.log(`Updated row ${lead.row}: ${lead.company} -> ${lead.name}`);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n✓ Updated ${enriched.length} rows in Google Sheet`);
}

async function main() {
  console.log('=== PE ENRICHMENT RUN - March 7, 5:36 AM ===\n');
  
  const enriched = await enrichLeads();
  
  if (enriched.length > 0) {
    console.log(`\nUpdating Google Sheet...`);
    await updateSheet(enriched);
  }
  
  console.log(`\n=== COMPLETE ===`);
}

main().catch(console.error);
