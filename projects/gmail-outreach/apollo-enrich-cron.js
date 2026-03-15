const axios = require('axios');
const { google } = require('googleapis');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Read sheet
async function readSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:K'
  });
  
  return response.data.values || [];
}

// Update sheet row
async function updateRow(rowIndex, updates) {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const updatePromises = [];
  
  if (updates.contactName) {
    updatePromises.push(
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!C${rowIndex}`,
        valueInputOption: 'RAW',
        resource: { values: [[updates.contactName]] }
      })
    );
  }
  
  if (updates.title) {
    updatePromises.push(
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!D${rowIndex}`,
        valueInputOption: 'RAW',
        resource: { values: [[updates.title]] }
      })
    );
  }
  
  if (updates.email) {
    updatePromises.push(
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!E${rowIndex}`,
        valueInputOption: 'RAW',
        resource: { values: [[updates.email]] }
      })
    );
  }
  
  if (updates.linkedIn) {
    updatePromises.push(
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!G${rowIndex}`,
        valueInputOption: 'RAW',
        resource: { values: [[updates.linkedIn]] }
      })
    );
  }
  
  if (updates.notes) {
    updatePromises.push(
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!L${rowIndex}`,
        valueInputOption: 'RAW',
        resource: { values: [[updates.notes]] }
      })
    );
  }
  
  if (updates.status) {
    updatePromises.push(
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!J${rowIndex}`,
        valueInputOption: 'RAW',
        resource: { values: [[updates.status]] }
      })
    );
  }
  
  await Promise.all(updatePromises);
  console.log(`✓ Updated row ${rowIndex}`);
}

// Apollo.io people search
async function searchApollo(companyDomain, companyName) {
  try {
    const response = await axios.post('https://api.apollo.io/v1/mixed_people/search', {
      q_organization_domains: companyDomain,
      person_titles: [
        'CEO', 'Chief Executive Officer', 'Founder', 'Co-Founder',
        'Managing Partner', 'Managing Director', 'General Partner',
        'Partner', 'CTO', 'Chief Technology Officer',
        'COO', 'Chief Operating Officer', 'President',
        'Director', 'VP', 'Vice President',
        'Head of Business Development', 'Head of Strategy'
      ],
      page: 1,
      per_page: 10
    }, {
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY
      }
    });
    
    return response.data.people || [];
  } catch (error) {
    console.error(`  Apollo API error: ${error.message}`);
    return [];
  }
}

// Main enrichment logic
async function main() {
  console.log('PE Research & Enrichment - Hourly Cron\n');
  console.log('Reading sheet...');
  
  const rows = await readSheet();
  console.log(`Loaded ${rows.length} rows\n`);
  
  // Find leads needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0];
    const website = row[1];
    const contactName = row[2];
    const email = row[4];
    const status = row[9];
    
    // Skip dead/contacted leads
    if (status && (status.toLowerCase().includes('dead') || 
                  status.toLowerCase().includes('contacted') ||
                  status.toLowerCase().includes('sent'))) {
      continue;
    }
    
    // Check if needs enrichment
    const hasGenericEmail = email && (email.includes('info@') || email.includes('sales@') || 
                                      email.includes('ir@') || email.includes('contact@') ||
                                      email.includes('press@'));
    const hasNoContactName = !contactName || contactName.trim() === '';
    const hasNoEmail = !email || email.trim() === '';
    
    if ((hasGenericEmail || hasNoContactName || hasNoEmail) && website) {
      needsEnrichment.push({
        rowIndex: i + 1,
        company: company,
        website: website,
        contactName: contactName || '',
        email: email || '',
        status: status || ''
      });
    }
  }
  
  console.log(`Found ${needsEnrichment.length} leads needing enrichment`);
  
  // Limit to 10-15 per run
  const toEnrich = needsEnrichment.slice(0, 15);
  console.log(`Will enrich ${toEnrich.length} leads this run\n`);
  
  let enrichedCount = 0;
  const results = [];
  
  for (const lead of toEnrich) {
    console.log(`=== ${lead.company} ===`);
    
    // Extract domain from website
    const domain = lead.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
    
    // Search Apollo
    const people = await searchApollo(domain, lead.company);
    
    if (people.length > 0) {
      // Pick best match (highest seniority, verified email)
      const best = people.find(p => p.email) || people[0];
      
      console.log(`✓ Found: ${best.name} - ${best.title}`);
      console.log(`  Email: ${best.email || 'N/A'}`);
      
      if (best.email) {
        // Update sheet
        await updateRow(lead.rowIndex, {
          contactName: best.name,
          title: best.title,
          email: best.email,
          linkedIn: best.linkedin_url || '',
          notes: `Source: Apollo.io (verified) - ${new Date().toISOString().split('T')[0]}`,
          status: 'Enriched'
        });
        
        enrichedCount++;
        results.push({
          company: lead.company,
          contact: best.name,
          email: best.email
        });
      } else {
        console.log(`  ⚠ No verified email found`);
      }
    } else {
      console.log(`✗ No contacts found`);
    }
    
    // Rate limit: 1 request per second
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n✓ Enrichment complete: ${enrichedCount}/${toEnrich.length} leads`);
  
  if (results.length > 0) {
    console.log('\nEnriched leads:');
    results.forEach(r => {
      console.log(`  • ${r.company}: ${r.contact} (${r.email})`);
    });
  }
  
  // Write completion report
  const report = {
    timestamp: new Date().toISOString(),
    totalNeeds: needsEnrichment.length,
    processed: toEnrich.length,
    enriched: enrichedCount,
    results: results
  };
  
  require('fs').writeFileSync(
    `CRON-PE-ENRICHMENT-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${new Date().getHours().toString().padStart(2, '0')}${new Date().getMinutes().toString().padStart(2, '0')}.json`,
    JSON.stringify(report, null, 2)
  );
  
  console.log('\nReport saved.');
}

main().catch(error => {
  console.error('ERROR:', error.message);
  process.exit(1);
});
