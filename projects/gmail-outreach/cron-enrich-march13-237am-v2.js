const { google } = require('googleapis');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function getClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function readSheet() {
  const sheets = await getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:P',
  });
  return res.data.values || [];
}

async function updateRow(rowNum, updates) {
  const sheets = await getClient();
  const range = `Sheet1!A${rowNum}:P${rowNum}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [updates] },
  });
}

function needsEnrichment(row, rowNum) {
  if (rowNum === 1) return false; // Skip header
  
  const company = row[0] || '';
  const contact = row[2] || '';
  const email = row[4] || '';
  const status = row[9] || '';
  
  // Skip if status indicates dead/not PE
  if (status.toLowerCase().includes('dead') || 
      status.toLowerCase().includes('not a pe') ||
      status.toLowerCase().includes('remove')) {
    return false;
  }
  
  // Needs enrichment if:
  // 1. No contact name, OR
  // 2. No email, OR
  // 3. Generic email (info@, sales@, ir@, contact@, team@)
  const hasNoContact = !contact || contact.trim() === '';
  const hasNoEmail = !email || email.trim() === '';
  const hasGenericEmail = email && /^(info|sales|ir|contact|team|admin|support|hello|general)@/i.test(email);
  
  return company && (hasNoContact || hasNoEmail || hasGenericEmail);
}

async function searchApolloByDomain(domain) {
  try {
    const cleanDomain = domain.replace('https://', '').replace('http://', '').split('/')[0];
    
    const response = await axios.post(
      'https://api.apollo.io/v1/mixed_people/search',
      {
        api_key: APOLLO_API_KEY,
        q_organization_domains: cleanDomain,
        person_titles: [
          'CEO', 'CTO', 'COO', 'Partner', 'Managing Partner', 
          'General Partner', 'Managing Director', 'Director',
          'VP', 'Head of'
        ],
        page: 1,
        per_page: 10
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      }
    );
    
    if (response.data && response.data.people && response.data.people.length > 0) {
      return response.data.people.filter(p => 
        p.email && 
        p.email_status === 'verified' &&
        !p.email.match(/^(info|sales|ir|contact|team)@/i)
      ).map(p => ({
        name: `${p.first_name} ${p.last_name}`,
        title: p.title || 'N/A',
        email: p.email,
        linkedin: p.linkedin_url || '',
        source: 'Apollo.io (verified)'
      }));
    }
    
    return [];
  } catch (error) {
    console.error(`    ⚠️  Apollo API error: ${error.response?.data?.error || error.message}`);
    return [];
  }
}

async function manualWebResearch(company, domain) {
  console.log(`  🌐 Manual web research: ${company}...`);
  
  // Use web_search to find contacts
  const searchQueries = [
    `${company} managing partner email`,
    `${company} CEO contact`,
    `site:${domain.replace('https://', '').replace('http://', '').split('/')[0]} email`,
    `"${company}" team leadership contact`
  ];
  
  console.log(`  Suggested searches:`);
  searchQueries.forEach(q => console.log(`    - ${q}`));
  
  return {
    suggestion: `Manual research needed. Check team page: ${domain}/team or ${domain}/leadership`,
    queries: searchQueries
  };
}

async function enrichLead(row, rowNum) {
  const company = row[0] || '';
  const website = row[5] || '';
  const currentContact = row[2] || '';
  const currentEmail = row[4] || '';
  const currentNotes = row[11] || '';
  
  console.log(`\n[Row ${rowNum}] ${company}`);
  console.log(`  Current: ${currentContact || '(no contact)'} | ${currentEmail || '(no email)'}`);
  
  if (!website) {
    console.log(`  ⚠️  No website - cannot enrich`);
    return { rowNum, updated: false, row, skipped: true };
  }
  
  // Try Apollo
  console.log(`  🔍 Searching Apollo by domain...`);
  await new Promise(resolve => setTimeout(resolve, 1500)); // Rate limit
  const contacts = await searchApolloByDomain(website);
  
  if (contacts.length > 0) {
    // Pick the best contact
    const best = contacts[0];
    
    console.log(`  ✅ ENRICHED: ${best.name} (${best.title}) - ${best.email}`);
    
    // Update the row
    const updatedRow = [...row];
    while (updatedRow.length < 16) updatedRow.push(''); // Ensure enough columns
    
    updatedRow[2] = best.name; // Contact Name
    updatedRow[3] = best.title; // Title
    updatedRow[4] = best.email; // Email
    updatedRow[6] = best.linkedin || updatedRow[6] || ''; // LinkedIn
    updatedRow[9] = 'Enriched'; // Status
    
    // Add note about enrichment
    const enrichNote = `Apollo-verified: ${best.name} (${best.title}, ${best.email}). ${contacts.length} contact(s) found. [Enriched: 2026-03-13 2:37 AM cron]`;
    updatedRow[11] = enrichNote + (currentNotes ? ` | Previous: ${currentNotes}` : '');
    
    return { rowNum, updated: true, row: updatedRow, contact: best };
  } else {
    // No Apollo results - note for manual research
    const webSuggestion = await manualWebResearch(company, website);
    
    console.log(`  ⚠️  NEEDS MANUAL: ${webSuggestion.suggestion}`);
    
    const updatedRow = [...row];
    while (updatedRow.length < 16) updatedRow.push('');
    
    const manualNote = `Apollo returned no results. ${webSuggestion.suggestion} [Checked: 2026-03-13 2:37 AM cron]`;
    updatedRow[11] = manualNote + (currentNotes ? ` | Previous: ${currentNotes}` : '');
    
    return { rowNum, updated: false, row: updatedRow, needsManual: true };
  }
}

async function main() {
  console.log('=== PE ENRICHMENT CRON - March 13, 2026 2:37 AM (v2) ===\n');
  
  // Read the sheet
  console.log('📊 Reading sheet...');
  const rows = await readSheet();
  console.log(`   ${rows.length} rows total\n`);
  
  // Find rows needing enrichment
  const toEnrich = [];
  for (let i = 0; i < rows.length; i++) {
    const rowNum = i + 1;
    if (needsEnrichment(rows[i], rowNum)) {
      toEnrich.push({ row: rows[i], rowNum });
    }
  }
  
  console.log(`🎯 Found ${toEnrich.length} leads needing enrichment\n`);
  
  if (toEnrich.length === 0) {
    console.log('✓ All leads already enriched!');
    return;
  }
  
  // Enrich up to 15 leads
  const limit = Math.min(15, toEnrich.length);
  console.log(`📝 Enriching ${limit} leads...\n`);
  
  const results = {
    enriched: [],
    needsManual: [],
    skipped: [],
    errors: []
  };
  
  for (let i = 0; i < limit; i++) {
    const { row, rowNum } = toEnrich[i];
    
    try {
      const result = await enrichLead(row, rowNum);
      
      // Update the sheet
      await updateRow(result.rowNum, result.row);
      
      if (result.updated) {
        results.enriched.push(result);
      } else if (result.needsManual) {
        results.needsManual.push(result);
      } else if (result.skipped) {
        results.skipped.push(result);
      }
      
    } catch (error) {
      console.error(`  ❌ ERROR: ${error.message}`);
      results.errors.push({ rowNum, error: error.message });
    }
  }
  
  // Summary
  console.log('\n\n=== ENRICHMENT SUMMARY ===');
  console.log(`✅ Enriched: ${results.enriched.length}`);
  console.log(`⚠️  Needs Manual: ${results.needsManual.length}`);
  console.log(`⏭️  Skipped: ${results.skipped.length}`);
  console.log(`❌ Errors: ${results.errors.length}`);
  
  if (results.enriched.length > 0) {
    console.log('\n📧 NEW VERIFIED CONTACTS:');
    results.enriched.forEach(r => {
      const company = r.row[0];
      const contact = r.contact;
      console.log(`  • ${contact.name} (${contact.title}) at ${company}`);
      console.log(`    📧 ${contact.email}`);
    });
  }
  
  if (results.needsManual.length > 0) {
    console.log('\n🔍 NEEDS MANUAL RESEARCH:');
    results.needsManual.forEach(r => {
      const company = r.row[0];
      const website = r.row[5];
      console.log(`  • ${company} (Row ${r.rowNum})`);
      console.log(`    🌐 ${website}`);
    });
  }
  
  // Save detailed results
  const resultFile = './enrich-results-march13-237am-v2.json';
  fs.writeFileSync(resultFile, JSON.stringify(results, null, 2));
  console.log(`\n💾 Detailed results saved to ${resultFile}`);
  
  console.log('\n✓ Enrichment run complete!');
}

main().catch(error => {
  console.error('FATAL ERROR:', error);
  process.exit(1);
});
