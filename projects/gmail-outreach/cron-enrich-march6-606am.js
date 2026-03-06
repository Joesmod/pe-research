const axios = require('axios');
const { google } = require('googleapis');
const fs = require('fs');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = JSON.parse(fs.readFileSync('service-account.json', 'utf8'));

const auth = new google.auth.GoogleAuth({
  credentials: SERVICE_ACCOUNT,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

// Load active leads from previous analysis
const activeLeads = JSON.parse(fs.readFileSync('active-leads-to-enrich.json', 'utf8'));

// Cast wide net for decision-maker titles
const TITLES = [
  'Managing Partner', 'Partner', 'General Partner', 'Operating Partner',
  'CEO', 'Chief Executive Officer', 'President',
  'Managing Director', 'Director',
  'CFO', 'Chief Financial Officer',
  'COO', 'Chief Operating Officer',
  'CTO', 'Chief Technology Officer',
  'VP', 'Vice President',
  'Head of Value Creation', 'Head of Portfolio Operations',
  'Head of Business Development'
];

async function searchApollo(firmName) {
  try {
    console.log(`  Searching Apollo for: ${firmName}...`);
    
    const response = await axios.post('https://api.apollo.io/api/v1/mixed_people/api_search', {
      q_organization_name: firmName,
      person_titles: TITLES,
      page: 1,
      per_page: 10,
      email_status: ['verified', 'guessed']
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': APOLLO_API_KEY
      }
    });
    
    if (response.data && response.data.people) {
      // Filter for people with emails
      const withEmails = response.data.people.filter(p => p.email && p.email.length > 0);
      
      if (withEmails.length > 0) {
        const person = withEmails[0]; // Take first match with email
        return {
          name: `${person.first_name} ${person.last_name}`.trim(),
          title: person.title || '',
          email: person.email,
          linkedin: person.linkedin_url || '',
          source: 'Apollo.io (aggregated public data)'
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error(`  Apollo error for ${firmName}:`, error.response?.data?.message || error.message);
    return null;
  }
}

async function updateSheet(rowIndex, contact) {
  const sheets = google.sheets({ version: 'v4', auth });
  
  try {
    // Update columns C, D, E, G, J
    // C=Contact Name, D=Title, E=Email, G=LinkedIn, J=Status
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Sheet1!C${rowIndex}:E${rowIndex}`,
      valueInputOption: 'RAW',
      resource: {
        values: [[contact.name, contact.title, contact.email]]
      }
    });
    
    // Update LinkedIn
    if (contact.linkedin) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!G${rowIndex}`,
        valueInputOption: 'RAW',
        resource: {
          values: [[contact.linkedin]]
        }
      });
    }
    
    // Update Status to 'Enriched'
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Sheet1!J${rowIndex}`,
      valueInputOption: 'RAW',
      resource: {
        values: [['Enriched']]
      }
    });
    
    // Add source note to column I (Portfolio Companies/Notes)
    const note = `Source: ${contact.source} [Enriched: ${new Date().toISOString().split('T')[0]} cron]`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Sheet1!I${rowIndex}`,
      valueInputOption: 'RAW',
      resource: {
        values: [[note]]
      }
    });
    
    console.log(`  ✓ Updated sheet row ${rowIndex}`);
    return true;
  } catch (error) {
    console.error(`  ✗ Sheet update error for row ${rowIndex}:`, error.message);
    return false;
  }
}

(async () => {
  console.log('🔍 PE RESEARCH & ENRICHMENT - March 6, 2026 6:06 AM\n');
  console.log(`Processing ${activeLeads.length} active leads...\n`);
  
  const results = {
    enriched: [],
    failed: [],
    skipped: []
  };
  
  // Process first 15 leads
  const toProcess = activeLeads.slice(0, 15);
  
  for (const lead of toProcess) {
    console.log(`\n${lead.company} (Row ${lead.rowIndex})`);
    console.log(`  Website: ${lead.website}`);
    
    // Skip if already has good data
    if (lead.status === 'Enriched' && lead.contactName && lead.email && !lead.email.startsWith('info@') && !lead.email.startsWith('contact@')) {
      console.log(`  ⏭ Already enriched, skipping`);
      results.skipped.push({ company: lead.company, reason: 'Already enriched' });
      continue;
    }
    
    // Search Apollo
    const contact = await searchApollo(lead.company);
    
    if (contact) {
      console.log(`  ✓ Found: ${contact.name} (${contact.title})`);
      console.log(`  Email: ${contact.email}`);
      
      // Update sheet
      const updated = await updateSheet(lead.rowIndex, contact);
      
      if (updated) {
        results.enriched.push({
          company: lead.company,
          contact: contact.name,
          title: contact.title,
          email: contact.email,
          rowIndex: lead.rowIndex
        });
      } else {
        results.failed.push({ company: lead.company, reason: 'Sheet update failed' });
      }
    } else {
      console.log(`  ✗ No contact found in Apollo`);
      results.failed.push({ company: lead.company, reason: 'No Apollo match' });
    }
    
    // Rate limit: 1 request per second
    await new Promise(resolve => setTimeout(resolve, 1200));
  }
  
  // Save results
  fs.writeFileSync('cron-enrichment-march6-606am.json', JSON.stringify(results, null, 2));
  
  console.log('\n\n📊 ENRICHMENT SUMMARY:');
  console.log(`✓ Enriched: ${results.enriched.length}`);
  console.log(`✗ Failed: ${results.failed.length}`);
  console.log(`⏭ Skipped: ${results.skipped.length}`);
  
  if (results.enriched.length > 0) {
    console.log('\nENRICHED LEADS:');
    results.enriched.forEach(r => {
      console.log(`  - ${r.company}: ${r.contact} (${r.title}) ${r.email}`);
    });
  }
  
  if (results.failed.length > 0) {
    console.log('\nFAILED/NOT FOUND:');
    results.failed.forEach(r => {
      console.log(`  - ${r.company}: ${r.reason}`);
    });
  }
  
  console.log('\n✅ Enrichment run complete!');
})();
