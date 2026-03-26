/**
 * Hourly PE Enrichment Cron - March 16, 2026 8:37 AM
 * Find firms with empty Contact Name or generic emails and enrich them
 */

const { google } = require('googleapis');
const path = require('path');
const fetch = require('node-fetch');

const CRM_SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Generic email patterns to replace
const GENERIC_PATTERNS = /^(info|contact|sales|ir|investor\.relations|hello|support|admin|general|inquiries)@/i;

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
      'Managing Partner', 'Operating Partner', 'General Partner',
      'Director of Technology', 'Director of Digital', 'Director of Operations',
      'VP Technology', 'VP Digital', 'VP Operations',
      'Head of Value Creation', 'Head of Portfolio Operations'
    ],
    page: 1,
    per_page: 5,
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
  
  console.log(`    ⚠️  Found people but no valid emails`);
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
  console.log(`📋 Headers: ${headers.slice(0, 15).join(' | ')}`);
  
  // Find column indices
  const getColIndex = (name) => {
    const idx = headers.findIndex(h => h && h.toLowerCase().includes(name.toLowerCase()));
    return idx >= 0 ? idx : null;
  };
  
  const colCompany = getColIndex('company') || getColIndex('firm') || 0;
  const colContact = getColIndex('contact') || getColIndex('name');
  const colTitle = getColIndex('title') || getColIndex('position');
  const colEmail = getColIndex('email');
  const colWebsite = getColIndex('website') || getColIndex('url');
  const colStatus = getColIndex('status');
  const colLinkedIn = getColIndex('linkedin');
  const colNotes = getColIndex('notes');
  
  console.log(`\n🔎 Column mapping:`);
  console.log(`  Company: ${colCompany} (${headers[colCompany]})`);
  console.log(`  Contact: ${colContact} (${headers[colContact]})`);
  console.log(`  Title: ${colTitle} (${headers[colTitle]})`);
  console.log(`  Email: ${colEmail} (${headers[colEmail]})`);
  console.log(`  Website: ${colWebsite} (${headers[colWebsite]})`);
  console.log(`  Status: ${colStatus} (${headers[colStatus]})`);
  
  // Find leads needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const company = (row[colCompany] || '').trim();
    const contact = (row[colContact] || '').trim();
    const email = (row[colEmail] || '').trim();
    const status = (row[colStatus] || '').trim().toLowerCase();
    const website = (row[colWebsite] || '').trim();
    
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
  
  // Limit to 10-15 leads per run
  const toEnrich = needsEnrichment.slice(0, 12);
  
  console.log(`📝 Enriching ${toEnrich.length} leads...\n`);
  
  const updates = [];
  let successCount = 0;
  
  for (const lead of toEnrich) {
    console.log(`\n🏢 ${lead.company}`);
    console.log(`  Current: ${lead.contact || '(empty)'} - ${lead.email || '(empty)'}`);
    console.log(`  Website: ${lead.website}`);
    
    try {
      // Extract domain from website
      let domain = lead.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
      
      // Try Apollo
      const result = await apolloSearch(domain, lead.company);
      
      if (result) {
        // Update row
        const updatedRow = [...lead.row];
        if (colContact !== null) updatedRow[colContact] = result.name;
        if (colTitle !== null) updatedRow[colTitle] = result.title;
        if (colEmail !== null) updatedRow[colEmail] = result.email;
        if (colLinkedIn !== null && result.linkedin) updatedRow[colLinkedIn] = result.linkedin;
        if (colStatus !== null) updatedRow[colStatus] = 'Enriched';
        if (colNotes !== null) {
          const existingNotes = updatedRow[colNotes] || '';
          updatedRow[colNotes] = `${existingNotes ? existingNotes + '; ' : ''}Enriched via ${result.source} on ${new Date().toISOString().split('T')[0]}`;
        }
        
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
      await new Promise(r => setTimeout(r, 1000));
      
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
