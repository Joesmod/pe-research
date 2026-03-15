#!/usr/bin/env node
const fs = require('fs');
const https = require('https');
const {google} = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SERVICE_ACCOUNT_FILE = 'service-account.json';

// Setup Google Sheets
const auth = new google.auth.GoogleAuth({
  keyFile: SERVICE_ACCOUNT_FILE,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

async function apolloRequest(endpoint, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'api.apollo.io',
      path: endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error(`Failed to parse: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function readSheet() {
  const client = await auth.getClient();
  const sheets = google.sheets({version: 'v4', auth: client});
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:K'
  });
  
  return res.data.values || [];
}

async function updateSheet(updates) {
  if (updates.length === 0) return;
  
  const client = await auth.getClient();
  const sheets = google.sheets({version: 'v4', auth: client});
  
  // Batch updates by row to reduce API calls
  const updatesByRow = {};
  for (const update of updates) {
    const match = update.range.match(/^([A-Z]+)(\d+)$/);
    if (match) {
      const [, col, row] = match;
      if (!updatesByRow[row]) updatesByRow[row] = {};
      updatesByRow[row][col] = update.value;
    }
  }
  
  // Use batchUpdate to update multiple cells at once
  const data = [];
  for (const row of Object.keys(updatesByRow)) {
    const rowUpdates = updatesByRow[row];
    for (const col of Object.keys(rowUpdates)) {
      data.push({
        range: `Sheet1!${col}${row}`,
        values: [[rowUpdates[col]]]
      });
    }
  }
  
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    resource: {
      valueInputOption: 'USER_ENTERED',
      data: data
    }
  });
}

function isGenericEmail(email) {
  if (!email) return true;
  const generic = ['info@', 'sales@', 'ir@', 'contact@', 'invest@', 'deals@'];
  return generic.some(g => email.toLowerCase().includes(g));
}

function needsEnrichment(row) {
  const [company, contact, title, email, website, linkedin, sector, focus, status, lastContacted] = row;
  
  // Skip if no company name
  if (!company || company.trim() === '') return false;
  
  // Skip if already contacted
  if (status === 'Contacted' || status === 'Meeting Scheduled') return false;
  
  // Need enrichment if no contact name OR generic email
  return !contact || contact.trim() === '' || isGenericEmail(email);
}

async function enrichFirm(company, website) {
  try {
    console.log(`  Searching Apollo for: ${company}`);
    
    // Step 1: Find organization
    const companySearch = await apolloRequest('/api/v1/mixed_companies/search', {
      q_organization_name: company,
      page: 1,
      per_page: 1
    });

    if (!companySearch.organizations || companySearch.organizations.length === 0) {
      console.log(`  ❌ Company not found in Apollo`);
      return null;
    }

    const orgId = companySearch.organizations[0].id;
    console.log(`  Found org ID: ${orgId}`);

    // Step 2: Search for senior decision-makers
    await new Promise(r => setTimeout(r, 300));
    const peopleSearch = await apolloRequest('/api/v1/mixed_people/api_search', {
      organization_ids: [orgId],
      person_titles: [
        'Managing Partner', 'Partner', 'Managing Director', 'Principal',
        'Founder', 'CEO', 'President', 'VP', 'CTO', 'CIO', 'COO',
        'Chief Technology Officer', 'Chief Information Officer',
        'Operating Partner', 'General Partner', 'Director'
      ],
      page: 1,
      per_page: 5
    });

    if (!peopleSearch.people || peopleSearch.people.length === 0) {
      console.log(`  ❌ No people found`);
      return null;
    }

    // Step 3: Get first person with verified email
    for (const person of peopleSearch.people) {
      await new Promise(r => setTimeout(r, 300));
      
      try {
        const enriched = await apolloRequest('/api/v1/people/match', {
          id: person.id
        });

        if (enriched.person && enriched.person.email && enriched.person.email_status === 'verified') {
          console.log(`  ✅ Found: ${enriched.person.name} (${enriched.person.title})`);
          return {
            name: enriched.person.name,
            title: enriched.person.title,
            email: enriched.person.email,
            linkedin: enriched.person.linkedin_url || ''
          };
        }
      } catch (enrichErr) {
        console.log(`  ⚠️  Enrich error for ${person.name}`);
      }
    }

    console.log(`  ❌ No verified emails found`);
    return null;
  } catch (err) {
    console.log(`  ❌ Error: ${err.message}`);
    return null;
  }
}

async function main() {
  console.log('=== PE Research & Enrichment Cron ===');
  console.log('Time:', new Date().toISOString());
  console.log('');
  
  // Step 1: Read sheet
  console.log('📊 Reading Google Sheet...');
  const rows = await readSheet();
  console.log(`Found ${rows.length} total rows`);
  
  // Skip header row
  const dataRows = rows.slice(1);
  
  // Step 2: Identify leads needing enrichment
  const needsEnrich = [];
  dataRows.forEach((row, idx) => {
    if (needsEnrichment(row)) {
      needsEnrich.push({ row, rowIndex: idx + 2 }); // +2 for header + 0-indexed
    }
  });
  
  console.log(`\n🔍 Found ${needsEnrich.length} leads needing enrichment`);
  console.log('');
  
  if (needsEnrich.length === 0) {
    console.log('✅ No enrichment needed. All leads have contacts and direct emails.');
    return;
  }
  
  // Step 3: Enrich up to 15 leads
  const enrichLimit = Math.min(15, needsEnrich.length);
  console.log(`Enriching ${enrichLimit} leads...\n`);
  
  const updates = [];
  const enriched = [];
  
  for (let i = 0; i < enrichLimit; i++) {
    const {row, rowIndex} = needsEnrich[i];
    const [company, , , , website] = row;
    
    console.log(`[${i + 1}/${enrichLimit}] ${company}`);
    
    const result = await enrichFirm(company, website);
    
    if (result) {
      // Update Contact Name (column B)
      updates.push({
        range: `B${rowIndex}`,
        value: result.name
      });
      
      // Update Title (column C)
      updates.push({
        range: `C${rowIndex}`,
        value: result.title
      });
      
      // Update Email (column D)
      updates.push({
        range: `D${rowIndex}`,
        value: result.email
      });
      
      // Update LinkedIn (column F)
      if (result.linkedin) {
        updates.push({
          range: `F${rowIndex}`,
          value: result.linkedin
        });
      }
      
      // Update Status (column I)
      updates.push({
        range: `I${rowIndex}`,
        value: 'Enriched'
      });
      
      enriched.push({
        company,
        ...result,
        source: 'Apollo'
      });
    }
    
    console.log('');
  }
  
  // Step 4: Write updates to sheet
  if (updates.length > 0) {
    console.log(`\n📝 Updating ${updates.length} cells in Google Sheet...`);
    await updateSheet(updates);
    console.log('✅ Sheet updated');
  }
  
  // Step 5: Save summary
  const summary = {
    timestamp: new Date().toISOString(),
    totalRows: rows.length,
    needingEnrichment: needsEnrich.length,
    processed: enrichLimit,
    enriched: enriched.length,
    successRate: enriched.length > 0 ? ((enriched.length / enrichLimit) * 100).toFixed(1) + '%' : '0%',
    contacts: enriched
  };
  
  fs.writeFileSync('enrichment-log-march9-836am.json', JSON.stringify(summary, null, 2));
  
  // Step 6: Print summary
  console.log('\n=== SUMMARY ===');
  console.log(`Total rows in sheet: ${summary.totalRows}`);
  console.log(`Leads needing enrichment: ${summary.needingEnrichment}`);
  console.log(`Leads processed: ${summary.processed}`);
  console.log(`Successfully enriched: ${summary.enriched}`);
  console.log(`Success rate: ${summary.successRate}`);
  console.log('');
  
  if (enriched.length > 0) {
    console.log('✅ Successfully enriched:');
    enriched.forEach((e, i) => {
      console.log(`  ${i + 1}. ${e.company} → ${e.name} (${e.title})`);
      console.log(`     ${e.email}`);
    });
  }
  
  console.log('\n✅ Enrichment complete');
  console.log(`📄 Full log saved to enrichment-log-march9-836am.json`);
  
  // GitHub update note
  console.log('\n📝 TODO: Update GitHub dossiers manually for enriched firms');
  console.log('   Repository: https://github.com/Joesmod/pe-research');
  console.log('   Location: PE-firms/');
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
