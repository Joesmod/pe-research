/**
 * PE Enrichment Cron - March 16, 2026 9:07 PM
 * Enrich leads with empty Contact Name or generic emails
 */

const { google } = require('googleapis');
const path = require('path');
const fetch = require('node-fetch');

const CRM_SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

const GENERIC_PATTERNS = /^(info|contact|sales|ir|investor\.relations|hello|support|admin|general|inquiries)@/i;

// Column indices (0-based)
const COL = {
  COMPANY: 0,      // A
  WEBSITE: 1,      // B
  CONTACT: 2,      // C
  TITLE: 3,        // D
  EMAIL: 4,        // E
  LINKEDIN: 6,     // G
  STATUS: 7,       // H
  NOTES: 8,        // I
  STATUS2: 9,      // J
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
      'CTO', 'CIO', 'Chief Technology Officer', 'Chief Information Officer',
      'Managing Partner', 'Operating Partner', 'General Partner', 'Partner',
      'Director of Technology', 'Director of Digital', 'Director of Operations',
      'VP Technology', 'VP Digital', 'VP Operations', 'VP Portfolio',
      'Head of Value Creation', 'Head of Portfolio Operations', 'Head of Digital'
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
    console.log(`    ❌ Apollo API error ${res.status}: ${text.substring(0, 200)}`);
    return null;
  }
  
  const data = await res.json();
  const people = data.people || [];
  
  if (people.length === 0) {
    console.log(`    ⚠️  No results from Apollo`);
    return null;
  }
  
  // Return first person with valid email
  for (const person of people) {
    if (person.email && !GENERIC_PATTERNS.test(person.email)) {
      console.log(`    ✅ Found: ${person.name} (${person.title}) - ${person.email}`);
      return {
        name: person.name,
        title: person.title,
        email: person.email,
        linkedin: person.linkedin_url || '',
        source: 'Apollo API',
      };
    }
  }
  
  console.log(`    ⚠️  Found ${people.length} people but no valid direct emails`);
  return null;
}

async function enrichLeads() {
  const sheets = await getSheets();
  
  // Read all data
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: CRM_SHEET_ID,
    range: 'Sheet1!A:Z',
  });
  
  const rows = res.data.values || [];
  
  console.log(`📊 Total rows: ${rows.length}`);
  
  // Find leads needing enrichment
  const needsEnrichment = [];
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] || [];
    const company = (row[COL.COMPANY] || '').trim();
    const contact = (row[COL.CONTACT] || '').trim();
    const email = (row[COL.EMAIL] || '').trim();
    const status = (row[COL.STATUS] || '').trim().toLowerCase();
    const website = (row[COL.WEBSITE] || '').trim();
    
    // Skip if no company or dead/sent
    if (!company || status === 'dead' || status === 'sent') continue;
    
    // Check if needs enrichment
    const needsEnrich = (
      !contact ||  // Empty contact name
      !email ||    // No email
      GENERIC_PATTERNS.test(email)  // Generic email
    );
    
    if (needsEnrich && website && website.startsWith('http')) {
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
  
  // Limit to 10-15 per run
  const toEnrich = needsEnrichment.slice(0, 12);
  
  console.log(`📝 Enriching ${toEnrich.length} leads...\n`);
  
  const updates = [];
  let successCount = 0;
  
  for (const lead of toEnrich) {
    console.log(`\n🏢 ${lead.company} (Row ${lead.rowIndex + 1})`);
    console.log(`  Current: ${lead.contact || '(empty)'} - ${lead.email || '(empty)'}`);
    console.log(`  Website: ${lead.website}`);
    
    try {
      // Extract domain
      let domain = lead.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
      
      // Try Apollo
      const result = await apolloSearch(domain, lead.company);
      
      if (result) {
        // Update row
        const updatedRow = [...lead.row];
        
        // Pad array if needed
        while (updatedRow.length <= Math.max(...Object.values(COL))) {
          updatedRow.push('');
        }
        
        updatedRow[COL.CONTACT] = result.name;
        updatedRow[COL.TITLE] = result.title;
        updatedRow[COL.EMAIL] = result.email;
        if (result.linkedin) updatedRow[COL.LINKEDIN] = result.linkedin;
        updatedRow[COL.STATUS] = 'Enriched';
        
        const today = new Date().toISOString().split('T')[0];
        const existingNotes = updatedRow[COL.NOTES] || '';
        updatedRow[COL.NOTES] = `${existingNotes ? existingNotes + '; ' : ''}Enriched via ${result.source} on ${today}`;
        
        updates.push({
          range: `Sheet1!A${lead.rowIndex + 1}:${String.fromCharCode(65 + updatedRow.length - 1)}${lead.rowIndex + 1}`,
          values: [updatedRow],
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
  
  // Batch update
  if (updates.length > 0) {
    console.log(`\n📤 Updating ${updates.length} rows in sheet...`);
    
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: CRM_SHEET_ID,
      requestBody: {
        data: updates,
        valueInputOption: 'RAW',
      },
    });
    
    console.log(`✅ Sheet updated!`);
  }
  
  console.log(`\n📊 ENRICHMENT SUMMARY`);
  console.log(`  Total scanned: ${rows.length}`);
  console.log(`  Needs enrichment: ${needsEnrichment.length}`);
  console.log(`  Attempted: ${toEnrich.length}`);
  console.log(`  Successfully enriched: ${successCount}`);
  console.log(`  Failed/manual needed: ${toEnrich.length - successCount}`);
}

enrichLeads().catch(e => {
  console.error('Fatal error:', e.message);
  process.exit(1);
});
