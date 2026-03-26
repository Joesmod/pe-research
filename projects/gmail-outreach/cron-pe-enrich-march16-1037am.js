/**
 * Hourly PE Enrichment Cron - March 16, 2026 10:37 AM
 * FIXED: Correct column mapping based on actual sheet structure
 */

const { google } = require('googleapis');
const path = require('path');
const fetch = require('node-fetch');

const CRM_SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Generic email patterns to replace
const GENERIC_PATTERNS = /^(info|contact|sales|ir|investor\.relations|hello|support|admin|general|inquiries)@/i;

// FIXED column indices based on actual sheet structure
const COL = {
  COMPANY: 0,      // A: Company Name
  WEBSITE: 1,      // B: NotebookLM/Website
  CONTACT: 2,      // C: Contact Name
  TITLE: 3,        // D: Title
  EMAIL: 4,        // E: Email
  LINKEDIN: 6,     // G: LinkedIn
  STATUS: 9,       // J: Status
  NOTES: 11,       // L: Notes
  INFO_URL: 12,    // M: Company Info URL
};

async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function apolloSearch(companyDomain, companyName) {
  console.log(`  🔍 Apollo search: ${companyName} (${companyDomain})`);
  
  const body = {
    api_key: APOLLO_API_KEY,
    q_organization_domains: [companyDomain],
    person_titles: [
      'CEO', 'CTO', 'CIO', 'COO', 'CMO', 'CFO',
      'Chief Technology Officer', 'Chief Information Officer', 'Chief Operating Officer',
      'Managing Partner', 'Operating Partner', 'General Partner', 'Partner',
      'Director of Technology', 'Director of Digital', 'Director of Operations', 'Director of Product',
      'VP Technology', 'VP Digital', 'VP Operations', 'VP Portfolio Operations',
      'Head of Value Creation', 'Head of Portfolio Operations', 'Head of Digital', 'Head of Technology'
    ],
    page: 1,
    per_page: 10,
  };
  
  const res = await fetch('https://api.apollo.io/v1/mixed_people/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Apollo API error ${res.status}: ${text}`);
  }
  
  const data = await res.json();
  const people = data.people || [];
  
  if (people.length === 0) {
    console.log(`    ❌ No results from Apollo`);
    return null;
  }
  
  console.log(`    Found ${people.length} people`);
  
  // Return first person with valid email
  for (const person of people) {
    if (person.email && !GENERIC_PATTERNS.test(person.email)) {
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
  
  console.log(`    ⚠️  Found people but no valid direct emails`);
  return null;
}

async function enrichLeads() {
  const sheets = await getSheets();
  
  // Read Sheet1
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: CRM_SHEET_ID,
    range: 'Sheet1!A:Z',
  });
  
  const rows = res.data.values || [];
  const headers = rows[0] || [];
  
  console.log(`📊 Total rows: ${rows.length}`);
  console.log(`📋 Headers (first 10):`);
  for (let i = 0; i < Math.min(10, headers.length); i++) {
    console.log(`  [${String.fromCharCode(65 + i)}] ${headers[i] || '(empty)'}`);
  }
  
  // Find leads needing enrichment (skip header row)
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const company = (row[COL.COMPANY] || '').trim();
    const contact = (row[COL.CONTACT] || '').trim();
    const email = (row[COL.EMAIL] || '').trim();
    const status = (row[COL.STATUS] || '').trim().toLowerCase();
    const website = (row[COL.WEBSITE] || '').trim();
    
    // Skip if company is empty or status is "Dead" or "Sent"
    if (!company || status === 'dead' || status === 'sent') continue;
    
    // Check if needs enrichment
    const needsEnrich = (
      !contact ||  // Empty contact name
      !email ||    // No email
      GENERIC_PATTERNS.test(email)  // Generic email
    );
    
    if (needsEnrich && website) {
      needsEnrichment.push({
        rowIndex: i,
        company,
        contact,
        email,
        website,
        status,
        row,
      });
    }
  }
  
  console.log(`\n🎯 Found ${needsEnrichment.length} firms needing enrichment`);
  
  // Limit to 10-12 leads per run
  const toEnrich = needsEnrichment.slice(0, 12);
  
  console.log(`📝 Enriching ${toEnrich.length} leads...\n`);
  
  const updates = [];
  let successCount = 0;
  
  for (const lead of toEnrich) {
    console.log(`\n🏢 ${lead.company} (row ${lead.rowIndex + 1})`);
    console.log(`  Current: ${lead.contact || '(empty)'} - ${lead.email || '(empty)'}`);
    console.log(`  Website: ${lead.website}`);
    
    try {
      // Extract domain from website
      let domain = lead.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
      
      // Try Apollo
      const result = await apolloSearch(domain, lead.company);
      
      if (result) {
        // Update row - create a full copy with enough cells
        const updatedRow = [...lead.row];
        while (updatedRow.length < 15) updatedRow.push('');
        
        updatedRow[COL.CONTACT] = result.name;
        updatedRow[COL.TITLE] = result.title;
        updatedRow[COL.EMAIL] = result.email;
        if (result.linkedin) updatedRow[COL.LINKEDIN] = result.linkedin;
        updatedRow[COL.STATUS] = 'Enriched';
        
        const existingNotes = updatedRow[COL.NOTES] || '';
        const newNote = `Enriched via ${result.source} on ${new Date().toISOString().split('T')[0]}`;
        updatedRow[COL.NOTES] = existingNotes ? `${existingNotes}; ${newNote}` : newNote;
        
        updates.push({
          range: `Sheet1!A${lead.rowIndex + 1}:O${lead.rowIndex + 1}`,
          values: [updatedRow.slice(0, 15)],
        });
        
        successCount++;
        console.log(`  ✅ ENRICHED`);
      } else {
        console.log(`  ⏭️  No results - manual research needed`);
      }
      
      // Rate limit
      await new Promise(r => setTimeout(r, 2000));
      
    } catch (err) {
      console.error(`  ❌ Error: ${err.message}`);
    }
  }
  
  // Batch update
  if (updates.length > 0) {
    console.log(`\n💾 Updating ${updates.length} rows in sheet...`);
    
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: CRM_SHEET_ID,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: updates,
      },
    });
    
    console.log(`✅ Sheet updated!`);
  }
  
  // Summary
  console.log(`\n📊 ENRICHMENT SUMMARY`);
  console.log(`  Total scanned: ${rows.length - 1}`);
  console.log(`  Needs enrichment: ${needsEnrichment.length}`);
  console.log(`  Attempted: ${toEnrich.length}`);
  console.log(`  Successfully enriched: ${successCount}`);
  console.log(`  Failed/manual needed: ${toEnrich.length - successCount}`);
  
  return { successCount, totalAttempted: toEnrich.length };
}

enrichLeads().catch(err => {
  console.error('FATAL ERROR:', err);
  process.exit(1);
});
