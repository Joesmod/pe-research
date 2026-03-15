const { google } = require('googleapis');
const fs = require('fs');

// Apollo API key
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Load sheet data
const sheetData = JSON.parse(fs.readFileSync('sheet-data.json', 'utf8'));

// Find leads needing enrichment
const needsEnrichment = sheetData.filter(row => {
  const company = row[0];
  const contactName = row[2];
  const email = row[3];
  
  if (!company || company === 'Company') return false;
  
  // Needs enrichment if:
  // 1. No contact name
  // 2. No email
  // 3. Generic email (info@, sales@, ir@, contact@, admin@)
  const genericPrefixes = ['info@', 'sales@', 'ir@', 'contact@', 'admin@', 'hello@', 'support@'];
  const hasGenericEmail = email && genericPrefixes.some(prefix => email.toLowerCase().startsWith(prefix));
  
  return !contactName || !email || hasGenericEmail;
});

console.log(`Found ${needsEnrichment.length} leads needing enrichment`);

// Take first 15
const toEnrich = needsEnrichment.slice(0, 15);

async function enrichWithApollo(company, domain) {
  // Search for people at this organization
  const searchUrl = 'https://api.apollo.io/v1/mixed_people/search';
  
  const searchBody = {
    api_key: APOLLO_API_KEY,
    q_organization_domains: domain || `${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
    person_titles: [
      'CEO', 'CTO', 'COO', 'CFO', 'CMO',
      'Managing Partner', 'Operating Partner', 'General Partner', 'Partner',
      'Managing Director', 'Operating Director',
      'Director of Technology', 'Director of Product', 'Director of Operations',
      'VP Technology', 'VP Operations', 'VP Digital', 'VP Portfolio',
      'Head of Value Creation', 'Head of Portfolio Operations', 'Head of Business Development'
    ],
    page: 1,
    per_page: 5
  };
  
  try {
    const response = await fetch(searchUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(searchBody)
    });
    
    const data = await response.json();
    
    if (data.people && data.people.length > 0) {
      // Return best match (first result)
      const person = data.people[0];
      return {
        name: person.name,
        title: person.title,
        email: person.email,
        linkedinUrl: person.linkedin_url
      };
    }
  } catch (error) {
    console.error(`Apollo error for ${company}:`, error.message);
  }
  
  return null;
}

async function updateSheet(updates) {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  for (const update of updates) {
    const range = `Sheet1!C${update.row}:G${update.row}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[update.name, update.email, update.title, update.linkedinUrl, update.status]]
      }
    });
  }
}

async function run() {
  const enriched = [];
  const results = [];
  
  for (let i = 0; i < toEnrich.length; i++) {
    const row = toEnrich[i];
    const company = row[0];
    const domain = row[1];
    const rowIndex = sheetData.indexOf(row) + 1; // 1-indexed
    
    console.log(`[${i+1}/${toEnrich.length}] Enriching: ${company}...`);
    
    const contact = await enrichWithApollo(company, domain);
    
    if (contact && contact.email) {
      console.log(`  ✓ Found: ${contact.name} <${contact.email}>`);
      results.push({
        row: rowIndex,
        name: contact.name,
        email: contact.email,
        title: contact.title || '',
        linkedinUrl: contact.linkedinUrl || '',
        status: 'Enriched'
      });
      enriched.push(company);
    } else {
      console.log(`  ✗ No contact found`);
    }
    
    // Rate limit: 1 request per second
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n=== ENRICHMENT COMPLETE ===`);
  console.log(`Enriched: ${enriched.length}/${toEnrich.length}`);
  console.log(`Firms: ${enriched.join(', ')}`);
  
  if (results.length > 0) {
    console.log(`\nUpdating sheet...`);
    await updateSheet(results);
    console.log(`✓ Sheet updated with ${results.length} contacts`);
  }
  
  // Save results
  fs.writeFileSync('enrichment-results-march8-706am.json', JSON.stringify(results, null, 2));
  console.log(`\n✓ Results saved to enrichment-results-march8-706am.json`);
}

run().catch(console.error);
