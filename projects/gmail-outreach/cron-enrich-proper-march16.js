/**
 * Proper enrichment script - March 16, 2026 8:37 AM
 * Columns: A=Company, B=Website(?), C=Contact, D=Title, E=Email, F=Website2, G=LinkedIn, H=Status1, I=Notes1, J=Status, K=LastContacted, L=Notes, M=GitHubURL, N=GumboScore
 */

const { google } = require('googleapis');
const path = require('path');
const fetch = require('node-fetch');

const CRM_SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

const GENERIC_PATTERNS = /^(info|contact|sales|ir|investor\.relations|hello|support|admin|general|inquiries)@/i;

async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function apolloSearch(companyDomain, companyName) {
  console.log(`  🔍 Apollo: ${companyName} (${companyDomain})`);
  
  const body = {
    api_key: APOLLO_API_KEY,
    q_organization_domains: [companyDomain],
    person_titles: [
      'Managing Partner', 'Operating Partner', 'General Partner', 'Partner',
      'CTO', 'CIO', 'Chief Technology Officer', 'Chief Information Officer',
      'Director of Technology', 'Director of Digital', 'Director of Operations', 'Director of Business Development',
      'VP Technology', 'VP Digital', 'VP Operations', 'VP of Portfolio Operations',
      'Head of Value Creation', 'Head of Portfolio Operations', 'Head of Technology', 'Head of Business Development'
    ],
    page: 1,
    per_page: 10,
  };
  
  try {
    const res = await fetch('https://api.apollo.io/v1/mixed_people/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    if (!res.ok) {
      const text = await res.text();
      console.log(`    ❌ Apollo API error ${res.status}: ${text}`);
      return null;
    }
    
    const data = await res.json();
    const people = data.people || [];
    
    if (people.length === 0) {
      console.log(`    ⚠️  No results from Apollo`);
      return null;
    }
    
    // Find first person with valid, non-generic email
    for (const person of people) {
      if (person.email && person.email.includes('@') && !GENERIC_PATTERNS.test(person.email)) {
        console.log(`    ✅ ${person.name} (${person.title}) - ${person.email}`);
        return {
          name: person.name,
          title: person.title,
          email: person.email,
          linkedin: person.linkedin_url || '',
          source: 'Apollo API',
        };
      }
    }
    
    console.log(`    ⚠️  Found ${people.length} people but no valid emails`);
    return null;
    
  } catch (err) {
    console.log(`    ❌ Apollo error: ${err.message}`);
    return null;
  }
}

async function enrichLeads() {
  const sheets = await getSheets();
  
  // Read all rows
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: CRM_SHEET_ID,
    range: 'Sheet1!A:N',
  });
  
  const rows = res.data.values || [];
  
  console.log(`📊 Total rows: ${rows.length}\n`);
  
  // Skip header row (row 0)
  const dataRows = rows.slice(1);
  
  // Find leads needing enrichment
  const needsEnrichment = [];
  
  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i] || [];
    const rowNum = i + 2; // +2 because: +1 for header, +1 for zero-index
    
    const company = (row[0] || '').trim();  // Column A
    const website1 = (row[1] || '').trim();  // Column B
    const contact = (row[2] || '').trim();   // Column C
    const title = (row[3] || '').trim();     // Column D
    const email = (row[4] || '').trim();     // Column E
    const website2 = (row[5] || '').trim();  // Column F
    const linkedin = (row[6] || '').trim();  // Column G
    const status = (row[9] || '').trim().toLowerCase();  // Column J
    
    // Skip if company is empty or status is "Dead" or "Sent"
    if (!company || status === 'dead' || status === 'sent') continue;
    
    // Determine website to use
    let website = '';
    if (website1 && website1.startsWith('http')) website = website1;
    else if (website2 && website2.startsWith('http')) website = website2;
    
    // Check if needs enrichment:
    // 1. No contact name, OR
    // 2. No email, OR
    // 3. Generic email (info@, sales@, etc.)
    const needsEnrich = (
      !contact ||
      !email ||
      GENERIC_PATTERNS.test(email)
    );
    
    if (needsEnrich && website) {
      needsEnrichment.push({
        rowNum,
        company,
        contact,
        title,
        email,
        website,
        status,
        row,
      });
    }
  }
  
  console.log(`🎯 Found ${needsEnrichment.length} firms needing enrichment\n`);
  
  if (needsEnrichment.length === 0) {
    console.log('✅ All leads are enriched! No work needed.');
    return { successCount: 0, totalAttempted: 0 };
  }
  
  // Show first 5 examples
  console.log('📋 Examples needing enrichment:');
  needsEnrichment.slice(0, 5).forEach(lead => {
    console.log(`  ${lead.company}: Contact="${lead.contact}" Email="${lead.email}"`);
  });
  console.log('');
  
  // Limit to 10-12 leads per run
  const toEnrich = needsEnrichment.slice(0, 12);
  
  console.log(`📝 Enriching ${toEnrich.length} leads...\n`);
  
  const updates = [];
  let successCount = 0;
  
  for (const lead of toEnrich) {
    console.log(`\n🏢 ${lead.company} (Row ${lead.rowNum})`);
    console.log(`  Current: Contact="${lead.contact}" Email="${lead.email}"`);
    console.log(`  Website: ${lead.website}`);
    
    try {
      // Extract domain from website
      let domain = lead.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0].trim();
      
      // Try Apollo
      const result = await apolloSearch(domain, lead.company);
      
      if (result) {
        // Build updated row
        const updatedRow = [...lead.row];
        
        // Update columns: C=Contact, D=Title, E=Email, G=LinkedIn, J=Status, L=Notes
        updatedRow[2] = result.name;  // Column C: Contact
        updatedRow[3] = result.title; // Column D: Title
        updatedRow[4] = result.email; // Column E: Email
        if (result.linkedin) updatedRow[6] = result.linkedin; // Column G: LinkedIn
        updatedRow[9] = 'Enriched'; // Column J: Status
        
        // Append to notes in column L
        const existingNotes = updatedRow[11] || '';
        const newNote = `Enriched via ${result.source} on ${new Date().toISOString().split('T')[0]} (cron).`;
        updatedRow[11] = existingNotes ? `${existingNotes} | ${newNote}` : newNote;
        
        // Ensure row is long enough
        while (updatedRow.length < 14) updatedRow.push('');
        
        updates.push({
          range: `Sheet1!A${lead.rowNum}:N${lead.rowNum}`,
          values: [updatedRow],
        });
        
        successCount++;
        console.log(`  ✅ ENRICHED`);
      } else {
        console.log(`  ⏭️  No results - needs manual research`);
      }
      
      // Rate limit: 1 second between requests
      await new Promise(r => setTimeout(r, 1200));
      
    } catch (err) {
      console.error(`  ❌ Error: ${err.message}`);
    }
  }
  
  // Batch update sheet
  if (updates.length > 0) {
    console.log(`\n💾 Updating ${updates.length} rows in Google Sheet...`);
    
    try {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: CRM_SHEET_ID,
        requestBody: {
          valueInputOption: 'USER_ENTERED',
          data: updates,
        },
      });
      
      console.log(`✅ Sheet updated successfully!`);
    } catch (err) {
      console.error(`❌ Sheet update failed: ${err.message}`);
    }
  }
  
  // Summary
  console.log(`\n📊 === ENRICHMENT SUMMARY ===`);
  console.log(`  Total rows scanned: ${dataRows.length}`);
  console.log(`  Need enrichment: ${needsEnrichment.length}`);
  console.log(`  Attempted this run: ${toEnrich.length}`);
  console.log(`  Successfully enriched: ${successCount}`);
  console.log(`  Failed/manual needed: ${toEnrich.length - successCount}`);
  console.log(`  Remaining for future runs: ${needsEnrichment.length - toEnrich.length}`);
  
  return { successCount, totalAttempted: toEnrich.length };
}

enrichLeads().catch(err => {
  console.error('\n❌ FATAL ERROR:', err.message);
  console.error(err.stack);
  process.exit(1);
});
