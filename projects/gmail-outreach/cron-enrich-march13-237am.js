const { google } = require('googleapis');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Decision-maker titles to search for (cast a wide net)
const TARGET_TITLES = [
  'CEO', 'CTO', 'COO', 'CMO', 'CFO', 'CIO', 'CSO',
  'Managing Partner', 'General Partner', 'Operating Partner', 'Partner',
  'Managing Director', 'Director',
  'VP Technology', 'VP Operations', 'VP Digital', 'VP Product',
  'Head of Technology', 'Head of Operations', 'Head of Product', 'Head of Digital',
  'Head of Value Creation', 'Head of Portfolio Operations', 'Head of Business Development'
];

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

async function searchApolloContacts(company, domain) {
  console.log(`\n  🔍 Searching Apollo for ${company}...`);
  
  try {
    // First try: search by organization name
    const payload = {
      q_organization_name: company,
      page: 1,
      per_page: 10,
      person_titles: TARGET_TITLES
    };
    
    if (domain) {
      payload.q_organization_domains = domain.replace('https://', '').replace('http://', '').split('/')[0];
    }
    
    const response = await axios.post(
      'https://api.apollo.io/v1/mixed_people/search',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );
    
    if (response.data && response.data.people && response.data.people.length > 0) {
      // Filter to only verified emails
      const verified = response.data.people.filter(p => 
        p.email && 
        p.email_status === 'verified' &&
        p.title &&
        !p.email.match(/^(info|sales|ir|contact|team)@/i)
      );
      
      if (verified.length > 0) {
        console.log(`    ✓ Found ${verified.length} verified contacts`);
        return verified.map(p => ({
          name: `${p.first_name} ${p.last_name}`,
          title: p.title,
          email: p.email,
          linkedin: p.linkedin_url || '',
          source: 'Apollo.io (verified)'
        }));
      }
    }
    
    console.log(`    ✗ No verified contacts found in Apollo`);
    return [];
    
  } catch (error) {
    console.error(`    ⚠️  Apollo API error: ${error.response?.data?.message || error.message}`);
    return [];
  }
}

async function webSearchContact(company, domain) {
  console.log(`  🌐 Web search for ${company}...`);
  
  // Construct team page URLs to suggest
  const teamUrls = [];
  if (domain) {
    const cleanDomain = domain.replace('https://', '').replace('http://', '').split('/')[0];
    teamUrls.push(`https://${cleanDomain}/team`);
    teamUrls.push(`https://${cleanDomain}/about/team`);
    teamUrls.push(`https://${cleanDomain}/leadership`);
  }
  
  return {
    suggestion: `Manual research needed. Check: ${teamUrls.join(', ')}`,
    teamUrls
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
  
  // Search Apollo
  await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit
  const contacts = await searchApolloContacts(company, website);
  
  if (contacts.length > 0) {
    // Pick the best contact (highest-ranking title)
    const best = contacts[0];
    
    console.log(`  ✅ ENRICHED: ${best.name} (${best.title}) - ${best.email}`);
    
    // Update the row
    const updatedRow = [...row];
    updatedRow[2] = best.name; // Contact Name
    updatedRow[3] = best.title; // Title
    updatedRow[4] = best.email; // Email
    updatedRow[6] = best.linkedin || updatedRow[6]; // LinkedIn
    updatedRow[9] = 'Enriched'; // Status
    
    // Add note about enrichment
    const enrichNote = `Apollo-verified: ${best.name} (${best.title}, ${best.email}). ${contacts.length - 1} other contacts available. [Enriched: 2026-03-13 2:37 AM cron]`;
    updatedRow[11] = enrichNote + (currentNotes ? ` | Previous: ${currentNotes}` : '');
    
    return { rowNum, updated: true, row: updatedRow, contact: best };
  } else {
    // No Apollo results - suggest manual research
    const webSuggestion = await webSearchContact(company, website);
    
    console.log(`  ⚠️  NEEDS MANUAL: ${webSuggestion.suggestion}`);
    
    // Add note about needing manual research
    const updatedRow = [...row];
    const manualNote = `NEEDS MANUAL RESEARCH. ${webSuggestion.suggestion} [Checked: 2026-03-13 2:37 AM cron]`;
    updatedRow[11] = manualNote + (currentNotes ? ` | Previous: ${currentNotes}` : '');
    
    return { rowNum, updated: false, row: updatedRow, needsManual: true };
  }
}

async function main() {
  console.log('=== PE ENRICHMENT CRON - March 13, 2026 2:37 AM ===\n');
  
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
  console.log(`❌ Errors: ${results.errors.length}`);
  
  if (results.enriched.length > 0) {
    console.log('\n📧 NEW VERIFIED CONTACTS:');
    results.enriched.forEach(r => {
      const company = r.row[0];
      const contact = r.contact;
      console.log(`  • ${contact.name} (${contact.title}) at ${company}`);
      console.log(`    ${contact.email}`);
    });
  }
  
  if (results.needsManual.length > 0) {
    console.log('\n🔍 NEEDS MANUAL RESEARCH:');
    results.needsManual.forEach(r => {
      const company = r.row[0];
      console.log(`  • ${company} (Row ${r.rowNum})`);
    });
  }
  
  // Save detailed results
  const resultFile = './enrich-results-march13-237am.json';
  fs.writeFileSync(resultFile, JSON.stringify(results, null, 2));
  console.log(`\n💾 Detailed results saved to ${resultFile}`);
  
  console.log('\n✓ Enrichment run complete!');
}

main().catch(error => {
  console.error('FATAL ERROR:', error);
  process.exit(1);
});
