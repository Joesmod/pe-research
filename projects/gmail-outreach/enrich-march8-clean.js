const { google } = require('googleapis');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function enrichWithApollo(company, domain) {
  const searchUrl = 'https://api.apollo.io/v1/mixed_people/search';
  
  const searchBody = {
    api_key: APOLLO_API_KEY,
    q_organization_domains: domain || `${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
    person_titles: [
      'CEO', 'CTO', 'COO', 'CFO', 'CMO',
      'Managing Partner', 'Operating Partner', 'General Partner', 'Partner',
      'Managing Director', 'Operating Director',
      'Director', 'VP', 'Head of'
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

async function run() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read sheet
  console.log('Reading sheet...');
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:H'
  });
  
  const rows = res.data.values || [];
  console.log(`Found ${rows.length} total rows`);
  
  // Skip header
  const dataRows = rows.slice(1);
  
  // Find leads needing enrichment
  const needsEnrichment = [];
  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const company = row[0];
    const domain = row[1];
    const contactName = row[2];
    const email = row[3];
    
    if (!company) continue;
    
    const genericPrefixes = ['info@', 'sales@', 'ir@', 'contact@', 'admin@', 'hello@', 'support@'];
    const hasGenericEmail = email && genericPrefixes.some(prefix => email.toLowerCase().startsWith(prefix));
    
    if (!contactName || !email || hasGenericEmail) {
      needsEnrichment.push({ company, domain, rowIndex: i + 2 }); // +2 for 1-indexed + header
    }
  }
  
  console.log(`Found ${needsEnrichment.length} leads needing enrichment`);
  
  // Take first 15
  const toEnrich = needsEnrichment.slice(0, 15);
  const enriched = [];
  
  for (let i = 0; i < toEnrich.length; i++) {
    const { company, domain, rowIndex } = toEnrich[i];
    
    console.log(`[${i+1}/${toEnrich.length}] Enriching: ${company}...`);
    
    const contact = await enrichWithApollo(company, domain);
    
    if (contact && contact.email) {
      console.log(`  ✓ Found: ${contact.name} <${contact.email}>`);
      
      // Update sheet
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!C${rowIndex}:G${rowIndex}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[contact.name, contact.email, contact.title || '', contact.linkedinUrl || '', 'Enriched']]
        }
      });
      
      enriched.push({ company, contact });
    } else {
      console.log(`  ✗ No contact found`);
    }
    
    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n=== ENRICHMENT COMPLETE ===`);
  console.log(`Enriched ${enriched.length}/${toEnrich.length} leads`);
  if (enriched.length > 0) {
    console.log('\nEnriched firms:');
    enriched.forEach(e => console.log(`  - ${e.company}: ${e.contact.name} <${e.contact.email}>`));
  }
}

run().catch(console.error);
