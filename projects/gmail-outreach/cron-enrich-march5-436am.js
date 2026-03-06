const { google } = require('googleapis');
const key = require('./service-account.json');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

const jwtClient = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  ['https://www.googleapis.com/auth/spreadsheets']
);

const sheets = google.sheets({ version: 'v4', auth: jwtClient });

// Service providers that are NOT PE firms (mark as Dead)
const NOT_PE_FIRMS = [
  'Cardea Group',
  'Jensen Partners',
  'Kinect Capital',
  'Wall Street Oasis',
  'Wall Street Prep',
  'Wefunder'
];

async function readSheet() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:J'
  });
  return res.data.values || [];
}

async function updateRow(rowIndex, updates) {
  const row = rowIndex + 1; // 1-indexed
  const updatePromises = [];
  
  if (updates.contactName) {
    updatePromises.push(
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!D${row}`,
        valueInputOption: 'RAW',
        requestBody: { values: [[updates.contactName]] }
      })
    );
  }
  
  if (updates.title) {
    updatePromises.push(
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!E${row}`,
        valueInputOption: 'RAW',
        requestBody: { values: [[updates.title]] }
      })
    );
  }
  
  if (updates.email) {
    updatePromises.push(
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!F${row}`,
        valueInputOption: 'RAW',
        requestBody: { values: [[updates.email]] }
      })
    );
  }
  
  if (updates.linkedin) {
    updatePromises.push(
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!G${row}`,
        valueInputOption: 'RAW',
        requestBody: { values: [[updates.linkedin]] }
      })
    );
  }
  
  if (updates.status) {
    updatePromises.push(
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!H${row}`,
        valueInputOption: 'RAW',
        requestBody: { values: [[updates.status]] }
      })
    );
  }
  
  if (updates.notes) {
    updatePromises.push(
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!I${row}`,
        valueInputOption: 'RAW',
        requestBody: { values: [[updates.notes]] }
      })
    );
  }
  
  await Promise.all(updatePromises);
}

async function searchApollo(company, domain) {
  try {
    const url = 'https://api.apollo.io/v1/mixed_people/search';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY
      },
      body: JSON.stringify({
        organization_domains: [domain],
        person_titles: [
          'Partner',
          'Managing Partner',
          'General Partner',
          'Operating Partner',
          'Principal',
          'Managing Director',
          'CEO',
          'President',
          'COO',
          'CTO',
          'Director',
          'VP',
          'Head of'
        ],
        page: 1,
        per_page: 5
      })
    });
    
    if (!response.ok) {
      console.log(`Apollo API error for ${company}: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    if (data.people && data.people.length > 0) {
      return data.people[0]; // Return first result
    }
    
    return null;
  } catch (error) {
    console.log(`Apollo search failed for ${company}: ${error.message}`);
    return null;
  }
}

async function enrichLead(rowIndex, row) {
  const company = row[1]; // Column B
  const website = row[2]; // Column C
  const contactName = row[3]; // Column D
  const email = row[5]; // Column F
  const status = row[7]; // Column H
  
  // Skip if already enriched or sent
  if (status === 'Enriched' || status === 'Sent' || status === 'Replied') {
    return null;
  }
  
  // Check if this is a non-PE service provider
  if (NOT_PE_FIRMS.includes(company)) {
    console.log(`Marking ${company} as Dead (not a PE firm)`);
    await updateRow(rowIndex, {
      status: 'Dead',
      notes: 'Service provider, not PE firm'
    });
    return { company, action: 'marked_dead' };
  }
  
  // Check if needs enrichment (no contact name or generic/missing email)
  const needsEnrichment = (
    !contactName || 
    contactName === 'Jacob Zodikoff' || 
    !email ||
    email.startsWith('info@') ||
    email.startsWith('sales@') ||
    email.startsWith('ir@') ||
    email.startsWith('contact@')
  );
  
  if (!needsEnrichment) {
    return null;
  }
  
  console.log(`\nEnriching: ${company}`);
  
  // Extract domain from website
  let domain = website;
  if (domain) {
    domain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  }
  
  if (!domain) {
    console.log(`  No domain found, skipping`);
    return null;
  }
  
  // Try Apollo API
  console.log(`  Searching Apollo for ${domain}...`);
  const apolloResult = await searchApollo(company, domain);
  
  if (apolloResult) {
    const updates = {
      contactName: apolloResult.name,
      title: apolloResult.title,
      email: apolloResult.email,
      linkedin: apolloResult.linkedin_url,
      status: 'Enriched',
      notes: 'Enriched via Apollo API'
    };
    
    console.log(`  ✓ Found: ${apolloResult.name} - ${apolloResult.title}`);
    await updateRow(rowIndex, updates);
    
    return {
      company,
      contactName: apolloResult.name,
      title: apolloResult.title,
      email: apolloResult.email,
      source: 'Apollo'
    };
  }
  
  console.log(`  No results from Apollo`);
  return null;
}

async function main() {
  console.log('=== PE Research & Enrichment Cron ===');
  console.log('Time:', new Date().toISOString());
  console.log();
  
  const rows = await readSheet();
  console.log(`Total rows: ${rows.length}`);
  
  // Skip header row
  const dataRows = rows.slice(1);
  
  const enriched = [];
  const failed = [];
  let markedDead = 0;
  
  // Process up to 15 leads
  let processed = 0;
  for (let i = 0; i < dataRows.length && processed < 15; i++) {
    const row = dataRows[i];
    if (!row || row.length < 3) continue;
    
    const result = await enrichLead(i + 1, row); // +1 for header
    if (result) {
      processed++;
      if (result.action === 'marked_dead') {
        markedDead++;
      } else {
        enriched.push(result);
      }
      
      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Save results
  const report = {
    timestamp: new Date().toISOString(),
    totalRows: rows.length,
    processed,
    enriched: enriched.length,
    markedDead,
    details: enriched
  };
  
  fs.writeFileSync(
    'enrichment-log-march5-436am.json',
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n=== Summary ===');
  console.log(`Processed: ${processed}`);
  console.log(`Enriched: ${enriched.length}`);
  console.log(`Marked Dead: ${markedDead}`);
  console.log(`Failed: ${failed.length}`);
  
  if (enriched.length > 0) {
    console.log('\nSuccessfully enriched:');
    enriched.forEach(e => {
      console.log(`  - ${e.company}: ${e.contactName} (${e.title})`);
    });
  }
}

main().catch(console.error);
