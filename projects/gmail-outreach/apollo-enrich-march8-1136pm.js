const axios = require('axios');
const { google } = require('googleapis');
const key = require('./service-account.json');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Targets from the scan
const targets = [
  {rowNum: 459, company: 'Centerview Partners', contactName: 'Blair Effron', domain: 'centerviewpartners.com'},
  {rowNum: 974, company: 'Bow River Capital', contactName: 'Greg J. Hiatrides', domain: 'bowrivercapital.com'},
  {rowNum: 975, company: 'Amulet Capital Partners', contactName: 'Avi Uttamchandani', domain: 'amuletcapital.com'},
  {rowNum: 976, company: 'Trivest Partners', contactName: 'Reid Callaway', domain: 'trivestpartners.com'}
];

async function searchApollo(name, company, domain) {
  try {
    console.log(`\nSearching Apollo for: ${name} at ${company}...`);
    
    // Try people search first
    const searchResponse = await axios.post(
      'https://api.apollo.io/v1/mixed_people/search',
      {
        q_person_name: name,
        q_organization_name: company,
        per_page: 5
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );
    
    const people = searchResponse.data.people || [];
    console.log(`  Found ${people.length} potential matches`);
    
    for (const person of people) {
      if (person.email && person.email_status === 'verified') {
        console.log(`  ✓ Found verified email: ${person.email}`);
        console.log(`    Title: ${person.title || 'N/A'}`);
        console.log(`    LinkedIn: ${person.linkedin_url || 'N/A'}`);
        return {
          name: person.name,
          title: person.title,
          email: person.email,
          linkedin: person.linkedin_url,
          source: 'Apollo API'
        };
      }
    }
    
    // If no verified email, try email finder
    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ');
    
    console.log(`  No verified email in search, trying email finder...`);
    const finderResponse = await axios.post(
      'https://api.apollo.io/v1/email_finder',
      {
        first_name: firstName,
        last_name: lastName,
        domain: domain
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );
    
    if (finderResponse.data.email && finderResponse.data.email_status === 'verified') {
      console.log(`  ✓ Email finder found: ${finderResponse.data.email}`);
      return {
        name: name,
        email: finderResponse.data.email,
        source: 'Apollo Email Finder'
      };
    }
    
    console.log(`  ✗ No verified email found`);
    return null;
    
  } catch (error) {
    console.error(`  ✗ Apollo API error: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

async function updateSheet(rowNum, contactData) {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  const updates = [];
  
  if (contactData.email) {
    updates.push({
      range: `Sheet1!E${rowNum}`,
      values: [[contactData.email]]
    });
  }
  
  if (contactData.title) {
    updates.push({
      range: `Sheet1!D${rowNum}`,
      values: [[contactData.title]]
    });
  }
  
  if (contactData.linkedin) {
    updates.push({
      range: `Sheet1!G${rowNum}`,
      values: [[contactData.linkedin]]
    });
  }
  
  // Update status
  updates.push({
    range: `Sheet1!J${rowNum}`,
    values: [['Enriched']]
  });
  
  // Add note about source
  updates.push({
    range: `Sheet1!L${rowNum}`,
    values: [[`Email found via ${contactData.source} - ${new Date().toISOString().split('T')[0]}`]]
  });
  
  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      resource: {
        valueInputOption: 'USER_ENTERED',
        data: updates
      }
    });
    
    console.log(`  ✓ Updated row ${rowNum} in sheet`);
  }
}

async function main() {
  console.log('=== PE ENRICHMENT RUN - March 8, 2026 11:36 PM ===\n');
  console.log(`Processing ${targets.length} firms...\n`);
  
  const results = [];
  
  for (const target of targets) {
    console.log(`\n[${target.rowNum}] ${target.company} - ${target.contactName}`);
    
    const contactData = await searchApollo(target.contactName, target.company, target.domain);
    
    if (contactData) {
      await updateSheet(target.rowNum, contactData);
      results.push({...target, ...contactData, enriched: true});
    } else {
      results.push({...target, enriched: false});
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  console.log('\n\n=== ENRICHMENT SUMMARY ===');
  console.log(`Total processed: ${results.length}`);
  console.log(`Successfully enriched: ${results.filter(r => r.enriched).length}`);
  console.log(`Still need manual research: ${results.filter(r => !r.enriched).length}\n`);
  
  const stillNeeded = results.filter(r => !r.enriched);
  if (stillNeeded.length > 0) {
    console.log('Firms still needing manual research:');
    stillNeeded.forEach(f => {
      console.log(`  - Row ${f.rowNum}: ${f.company} (${f.contactName})`);
    });
  }
  
  require('fs').writeFileSync('apollo-enrichment-march8-1136pm.json', JSON.stringify(results, null, 2));
}

main().catch(console.error);
