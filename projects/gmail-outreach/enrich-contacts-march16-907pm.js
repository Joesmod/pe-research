/**
 * Enrich Contacts sheet - March 16, 2026 9:07 PM
 * Focus on generic emails and empty contacts
 */

const { google } = require('googleapis');
const path = require('path');
const fetch = require('node-fetch');

const CRM_SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

const GENERIC_PATTERNS = /^(info|contact|sales|ir|investor\.relations|hello|support|admin|general|inquiries)@/i;

const COL = {
  COMPANY: 0,
  SCORE: 1,
  CONTACT: 2,
  TITLE: 3,
  EMAIL: 4,
  EMAIL_STATUS: 5,
  LINKEDIN: 6,
  NOTES: 7,
};

async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function apolloSearchByCompany(companyName) {
  console.log(`  🔍 Apollo search: ${companyName}`);
  
  // Try to find the company domain first via web search
  let domain = null;
  
  // Common patterns
  const domainGuess = companyName.toLowerCase()
    .replace(/\s*partners?\s*/gi, '')
    .replace(/\s*capital\s*/gi, '')
    .replace(/\s*management\s*/gi, '')
    .replace(/\s*group\s*/gi, '')
    .replace(/\s*llc\s*/gi, '')
    .replace(/\s*&\s*/g, '')
    .replace(/\s+/g, '')
    + '.com';
  
  domain = domainGuess;
  
  console.log(`  🌐 Guessing domain: ${domain}`);
  
  const body = {
    q_organization_domains: [domain],
    person_titles: [
      'Managing Partner', 'Operating Partner', 'General Partner', 'Partner',
      'CEO', 'President', 'Founder',
      'Managing Director', 'Director',
      'CTO', 'CIO', 'Chief Technology Officer',
      'VP Technology', 'VP Digital', 'VP Operations',
      'Head of Value Creation', 'Head of Portfolio'
    ],
    page: 1,
    per_page: 5,
  };
  
  const res = await fetch('https://api.apollo.io/v1/mixed_people/search', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-Api-Key': APOLLO_API_KEY,
    },
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

async function enrichContacts() {
  const sheets = await getSheets();
  
  // Read Contacts sheet
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: CRM_SHEET_ID,
    range: 'Contacts!A:Z',
  });
  
  const rows = res.data.values || [];
  const headers = rows[0] || [];
  
  console.log(`📊 Total rows in Contacts: ${rows.length}\n`);
  
  // Find leads needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const company = (row[COL.COMPANY] || '').trim();
    const contact = (row[COL.CONTACT] || '').trim();
    const email = (row[COL.EMAIL] || '').trim();
    const emailStatus = (row[COL.EMAIL_STATUS] || '').trim().toLowerCase();
    
    if (!company) continue;
    
    // Skip if marked as linkedin outreach, verified team member, dead, etc
    if (emailStatus.includes('linkedin') || emailStatus.includes('dead') || 
        emailStatus.includes('no public email') || emailStatus.includes('verified team member')) {
      continue;
    }
    
    // Priority: generic emails or empty contacts
    const needsEnrich = (
      (email && GENERIC_PATTERNS.test(email)) ||  // Generic email
      (!contact && !email)  // Empty contact and email
    );
    
    if (needsEnrich) {
      needsEnrichment.push({
        rowIndex: i,
        company,
        contact,
        email,
        emailStatus,
        row,
      });
    }
  }
  
  console.log(`🎯 Found ${needsEnrichment.length} high-priority contacts to enrich\n`);
  
  // Limit to 10 per run
  const toEnrich = needsEnrichment.slice(0, 10);
  
  console.log(`📝 Enriching ${toEnrich.length} contacts...\n`);
  
  const updates = [];
  let successCount = 0;
  
  for (const lead of toEnrich) {
    console.log(`\n🏢 ${lead.company} (Row ${lead.rowIndex + 1})`);
    console.log(`  Current: ${lead.contact || '(empty)'} - ${lead.email || '(empty)'}`);
    
    try {
      const result = await apolloSearchByCompany(lead.company);
      
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
        updatedRow[COL.EMAIL_STATUS] = 'verified';
        if (result.linkedin) updatedRow[COL.LINKEDIN] = result.linkedin;
        
        const today = new Date().toISOString().split('T')[0];
        const existingNotes = updatedRow[COL.NOTES] || '';
        updatedRow[COL.NOTES] = `${existingNotes ? existingNotes + '; ' : ''}Enriched via ${result.source} on ${today}`;
        
        updates.push({
          range: `Contacts!A${lead.rowIndex + 1}:${String.fromCharCode(65 + updatedRow.length - 1)}${lead.rowIndex + 1}`,
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
    console.log(`\n📤 Updating ${updates.length} rows in Contacts sheet...`);
    
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: CRM_SHEET_ID,
      requestBody: {
        data: updates,
        valueInputOption: 'RAW',
      },
    });
    
    console.log(`✅ Contacts sheet updated!`);
  }
  
  console.log(`\n📊 ENRICHMENT SUMMARY`);
  console.log(`  Total scanned: ${rows.length - 1}`);
  console.log(`  Needs enrichment: ${needsEnrichment.length}`);
  console.log(`  Attempted: ${toEnrich.length}`);
  console.log(`  Successfully enriched: ${successCount}`);
  console.log(`  Failed/manual needed: ${toEnrich.length - successCount}`);
}

enrichContacts().catch(e => {
  console.error('Fatal error:', e.message);
  process.exit(1);
});
