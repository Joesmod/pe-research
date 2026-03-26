/**
 * PE Enrichment - Find and enrich leads with missing contacts or generic emails
 * March 16, 2026 8:37 PM
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
  console.log(`  🔍 Apollo search: ${companyName} (${companyDomain})`);
  
  const body = {
    api_key: APOLLO_API_KEY,
    q_organization_domains: [companyDomain],
    person_titles: [
      'CEO', 'CTO', 'CIO', 'COO', 'CMO', 'CFO',
      'Managing Partner', 'Operating Partner', 'General Partner', 'Partner',
      'Director of Technology', 'Director of Digital', 'Director of Operations', 'Director of Product',
      'VP Technology', 'VP Digital', 'VP Operations', 'VP Portfolio',
      'Head of Value Creation', 'Head of Portfolio Operations', 'Head of Digital'
    ],
    page: 1,
    per_page: 10,
  };
  
  const res = await fetch('https://api.apollo.io/v1/mixed_people/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
    body: JSON.stringify(body),
  });
  
  if (!res.ok) {
    const text = await res.text();
    console.log(`    ❌ Apollo API error ${res.status}: ${text.slice(0, 200)}`);
    return null;
  }
  
  const data = await res.json();
  const people = data.people || [];
  
  if (people.length === 0) {
    console.log(`    ⚠️  No results from Apollo`);
    return null;
  }
  
  // Filter for people with valid, non-generic emails
  const validPeople = people.filter(p => p.email && !GENERIC_PATTERNS.test(p.email));
  
  if (validPeople.length === 0) {
    console.log(`    ⚠️  Found ${people.length} people but no valid emails`);
    return null;
  }
  
  const person = validPeople[0];
  console.log(`    ✅ Found: ${person.name} (${person.title}) - ${person.email}`);
  
  return {
    name: person.name,
    title: person.title,
    email: person.email,
    linkedin: person.linkedin_url || '',
    source: 'Apollo API',
  };
}

async function enrichLeads() {
  const sheets = await getSheets();
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: CRM_SHEET_ID,
    range: 'Sheet1!A:O',
  });
  
  const rows = res.data.values || [];
  
  console.log(`📊 Total rows: ${rows.length}`);
  console.log(`📋 First row (headers): ${rows[0].join(' | ')}`);
  
  // Column indices (0-based)
  // A=0: Company Name
  // B=1: Website URL
  // C=2: Contact Name
  // D=3: Title
  // E=4: Email
  // F=5: (varies)
  // G=6: LinkedIn URL
  // H=7: Status (Enriched/Researched/etc)
  // I=8: Notes
  // J=9: Status (another status column?)
  
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const company = (row[0] || '').trim();
    const website = (row[1] || '').trim();
    const contact = (row[2] || '').trim();
    const email = (row[4] || '').trim();
    const status = (row[9] || row[7] || '').trim().toLowerCase();
    
    if (!company) continue;
    if (status === 'dead' || status === 'sent') continue;
    
    const needsEnrich = (
      !contact || 
      !email || 
      GENERIC_PATTERNS.test(email)
    );
    
    if (needsEnrich && website) {
      needsEnrichment.push({
        rowIndex: i,
        company,
        website,
        contact: contact || '(empty)',
        email: email || '(empty)',
        status,
        row,
      });
    }
  }
  
  console.log(`\n🎯 Found ${needsEnrichment.length} firms needing enrichment`);
  
  if (needsEnrichment.length === 0) {
    console.log(`✅ All leads are already enriched!`);
    return { successCount: 0, totalAttempted: 0 };
  }
  
  // Sample first 5
  console.log(`\n📋 Sample needing enrichment:`);
  needsEnrichment.slice(0, 5).forEach(lead => {
    console.log(`  • ${lead.company} | Contact: ${lead.contact} | Email: ${lead.email}`);
  });
  
  // Enrich up to 12 leads
  const toEnrich = needsEnrichment.slice(0, 12);
  
  console.log(`\n🔧 Enriching ${toEnrich.length} leads...\n`);
  
  const updates = [];
  let successCount = 0;
  
  for (const lead of toEnrich) {
    console.log(`\n🏢 ${lead.company}`);
    console.log(`  Current: ${lead.contact} | ${lead.email}`);
    console.log(`  Website: ${lead.website}`);
    
    try {
      let domain = lead.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0].toLowerCase();
      
      const result = await apolloSearch(domain, lead.company);
      
      if (result) {
        const updatedRow = [...lead.row];
        
        // Ensure row has enough columns
        while (updatedRow.length < 14) updatedRow.push('');
        
        updatedRow[2] = result.name;           // Contact Name
        updatedRow[3] = result.title;          // Title
        updatedRow[4] = result.email;          // Email
        if (result.linkedin) updatedRow[6] = result.linkedin;  // LinkedIn
        updatedRow[7] = 'Enriched';            // Status column
        
        const note = `Enriched via ${result.source} on 2026-03-16`;
        updatedRow[8] = updatedRow[8] ? `${updatedRow[8]}; ${note}` : note;
        
        updates.push({
          range: `Sheet1!A${lead.rowIndex + 1}:O${lead.rowIndex + 1}`,
          values: [updatedRow],
        });
        
        successCount++;
        console.log(`  ✅ ENRICHED: ${result.name} - ${result.email}`);
      } else {
        console.log(`  ⏭️  No results - manual research needed`);
      }
      
      await new Promise(r => setTimeout(r, 1200));
      
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
    
    console.log(`✅ Sheet updated successfully!`);
  }
  
  console.log(`\n📊 ENRICHMENT SUMMARY`);
  console.log(`  Total rows scanned: ${rows.length - 1}`);
  console.log(`  Firms needing enrichment: ${needsEnrichment.length}`);
  console.log(`  Attempted this run: ${toEnrich.length}`);
  console.log(`  Successfully enriched: ${successCount}`);
  console.log(`  Failed/manual needed: ${toEnrich.length - successCount}`);
  console.log(`  Remaining to enrich: ${needsEnrichment.length - toEnrich.length}`);
  
  return { successCount, totalAttempted: toEnrich.length, remaining: needsEnrichment.length - toEnrich.length };
}

enrichLeads().catch(err => {
  console.error('FATAL ERROR:', err);
  process.exit(1);
});
