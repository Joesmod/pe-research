/**
 * PE Enrichment - March 16, 2026 9:37 PM
 * Enrich leads with empty Contact Name or generic/empty emails
 */

const { google } = require('googleapis');
const path = require('path');
const fetch = require('node-fetch');
const fs = require('fs').promises;

const CRM_SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Generic email patterns
const GENERIC_PATTERNS = /^(info|contact|sales|ir|investor\.relations|hello|support|admin|general|inquiries)@/i;

// Column indices (zero-based)
const COL = {
  COMPANY: 0,
  WEBSITE: 1,
  CONTACT: 2,
  TITLE: 3,
  EMAIL: 4,
  LINKEDIN: 6,
  STATUS: 7,
  NOTES: 8,
};

async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function apolloSearch(companyDomain, companyName) {
  console.log(`  🔍 Apollo: ${companyDomain}`);
  
  const body = {
    api_key: APOLLO_API_KEY,
    q_organization_domains: [companyDomain],
    person_titles: [
      'CEO', 'CTO', 'CIO', 'COO', 'CMO', 'CFO',
      'Chief Executive', 'Chief Technology', 'Chief Information', 'Chief Operating',
      'Managing Partner', 'Operating Partner', 'General Partner', 'Senior Partner',
      'Director of Technology', 'Director of Product', 'Director of Operations',
      'Director of Digital', 'Director of Business Development',
      'VP Technology', 'VP Operations', 'VP Digital Transformation',
      'VP Portfolio Operations', 'VP Value Creation',
      'Head of Value Creation', 'Head of Portfolio Operations',
      'Head of Technology', 'Head of Business Development',
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
    throw new Error(`Apollo ${res.status}: ${text.substring(0, 200)}`);
  }
  
  const data = await res.json();
  const people = data.people || [];
  
  if (people.length === 0) {
    console.log(`    ❌ No results`);
    return null;
  }
  
  // Find first person with verified email
  for (const person of people) {
    if (person.email && !GENERIC_PATTERNS.test(person.email)) {
      console.log(`    ✅ ${person.name} (${person.title}) - ${person.email}`);
      return {
        name: person.name || '',
        title: person.title || '',
        email: person.email || '',
        linkedin: person.linkedin_url || '',
        source: 'Apollo API',
      };
    }
  }
  
  console.log(`    ⚠️  Found ${people.length} people but no verified emails`);
  return null;
}

async function enrichLeads() {
  const sheets = await getSheets();
  
  console.log(`📊 Reading Sheet1...`);
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: CRM_SHEET_ID,
    range: 'Sheet1!A:N',
  });
  
  const rows = res.data.values || [];
  console.log(`Total rows: ${rows.length}`);
  
  // Find leads needing enrichment (skip row 0)
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const company = (row[COL.COMPANY] || '').trim();
    const contact = (row[COL.CONTACT] || '').trim();
    const email = (row[COL.EMAIL] || '').trim();
    const website = (row[COL.WEBSITE] || '').trim();
    const status = (row[COL.STATUS] || '').trim().toLowerCase();
    
    // Skip if no company or dead/sent
    if (!company || status === 'dead' || status === 'sent') continue;
    
    // Check if needs enrichment
    const noContact = !contact || contact.length < 3;
    const noEmail = !email;
    const genericEmail = email && GENERIC_PATTERNS.test(email);
    
    if ((noContact || noEmail || genericEmail) && website) {
      needsEnrichment.push({
        rowIndex: i,
        company,
        contact,
        email,
        website,
        status,
        row,
        reason: noContact ? 'No contact' : genericEmail ? 'Generic email' : 'No email',
      });
    }
  }
  
  console.log(`\n🎯 Found ${needsEnrichment.length} firms needing enrichment`);
  
  // Show first 5 examples
  console.log(`\nFirst 5 examples:`);
  needsEnrichment.slice(0, 5).forEach((lead, idx) => {
    console.log(`  ${idx + 1}. ${lead.company} - ${lead.reason}`);
  });
  
  // Enrich 10-15 leads
  const toEnrich = needsEnrichment.slice(0, 12);
  console.log(`\n📝 Enriching ${toEnrich.length} leads...\n`);
  
  const updates = [];
  const results = [];
  let successCount = 0;
  
  for (const lead of toEnrich) {
    console.log(`\n🏢 ${lead.company}`);
    console.log(`  Current: ${lead.contact || '(empty)'} / ${lead.email || '(empty)'}`);
    console.log(`  Reason: ${lead.reason}`);
    
    try {
      // Extract domain
      let domain = lead.website
        .replace(/^https?:\/\/(www\.)?/, '')
        .split('/')[0]
        .trim();
      
      if (!domain) {
        console.log(`  ⚠️  No valid domain`);
        continue;
      }
      
      // Apollo search
      const result = await apolloSearch(domain, lead.company);
      
      if (result) {
        // Prepare update
        const updatedRow = [...lead.row];
        updatedRow[COL.CONTACT] = result.name;
        updatedRow[COL.TITLE] = result.title;
        updatedRow[COL.EMAIL] = result.email;
        if (result.linkedin) updatedRow[COL.LINKEDIN] = result.linkedin;
        updatedRow[COL.STATUS] = 'Enriched';
        
        const existingNotes = updatedRow[COL.NOTES] || '';
        const timestamp = new Date().toISOString().split('T')[0];
        updatedRow[COL.NOTES] = `${existingNotes ? existingNotes + '; ' : ''}${result.name} (${result.title}) found via ${result.source}. ${timestamp} hourly cron.`;
        
        // Ensure row is complete
        while (updatedRow.length < 14) updatedRow.push('');
        
        updates.push({
          range: `Sheet1!A${lead.rowIndex + 1}:N${lead.rowIndex + 1}`,
          values: [updatedRow],
        });
        
        results.push({
          company: lead.company,
          contact: result.name,
          title: result.title,
          email: result.email,
          source: result.source,
        });
        
        successCount++;
        console.log(`  ✅ ENRICHED`);
      } else {
        console.log(`  ⏭️  No results - manual research needed`);
      }
      
      // Rate limit
      await new Promise(r => setTimeout(r, 1500));
      
    } catch (err) {
      console.error(`  ❌ Error: ${err.message}`);
    }
  }
  
  // Apply updates
  if (updates.length > 0) {
    console.log(`\n💾 Updating ${updates.length} rows...`);
    
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: CRM_SHEET_ID,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: updates,
      },
    });
    
    console.log(`✅ Sheet updated!`);
  }
  
  // Save results log
  const logPath = path.join(__dirname, `enrichment-results-march16-${Date.now()}.json`);
  await fs.writeFile(logPath, JSON.stringify(results, null, 2));
  
  // Summary
  console.log(`\n📊 ENRICHMENT SUMMARY`);
  console.log(`─`.repeat(50));
  console.log(`  Total scanned: ${rows.length - 1}`);
  console.log(`  Needs enrichment: ${needsEnrichment.length}`);
  console.log(`  Attempted: ${toEnrich.length}`);
  console.log(`  Successfully enriched: ${successCount}`);
  console.log(`  Failed/manual needed: ${toEnrich.length - successCount}`);
  console.log(`─`.repeat(50));
  
  return { successCount, totalAttempted: toEnrich.length };
}

enrichLeads().catch(err => {
  console.error('FATAL ERROR:', err);
  process.exit(1);
});
