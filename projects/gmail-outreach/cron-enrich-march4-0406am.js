const { google } = require('googleapis');
const axios = require('axios');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function searchApolloForContact(companyName, website) {
  try {
    const domain = website ? website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') : null;
    
    const response = await axios.post('https://api.apollo.io/v1/mixed_people/search', {
      q_organization_domains: domain,
      q_organization_name: companyName,
      person_titles: [
        'Partner', 'Managing Partner', 'Operating Partner', 'General Partner',
        'Managing Director', 'Principal',
        'CEO', 'President', 'Chief Executive Officer',
        'CFO', 'Chief Financial Officer',
        'CTO', 'Chief Technology Officer',
        'COO', 'Chief Operating Officer',
        'CMO', 'Chief Marketing Officer',
        'VP Technology', 'VP Operations', 'VP Digital',
        'Vice President',
        'Director Technology', 'Director Operations', 'Director Digital',
        'Head of Technology', 'Head of Operations', 'Head of Digital',
        'Head of Portfolio', 'Head of Value Creation'
      ],
      page: 1,
      per_page: 10
    }, {
      headers: { 
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY
      }
    });

    if (response.data && response.data.people && response.data.people.length > 0) {
      // Return the first person with a verified email
      for (const person of response.data.people) {
        if (person.email && !person.email.match(/(info@|sales@|ir@|contact@|hello@|admin@|team@)/i)) {
          return {
            name: person.name || '',
            title: person.title || '',
            email: person.email || '',
            linkedin: person.linkedin_url || '',
            source: 'Apollo API (2026-03-04 04:06)'
          };
        }
      }
    }
    return null;
  } catch (error) {
    console.error(`Apollo error for ${companyName}:`, error.response?.data?.message || error.message);
    return null;
  }
}

async function main() {
  console.log('=== PE ENRICHMENT CRON - March 4, 2026 04:06 AM ===\n');
  
  const sheets = await getSheets();
  
  // Read current sheet data
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:J',
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  const headers = rows[0];
  console.log('Headers:', headers);
  const dataRows = rows.slice(1);
  
  // Identify rows needing enrichment
  const needsEnrichment = [];
  dataRows.forEach((row, idx) => {
    const company = row[0] || '';
    const contact = row[2] || '';
    const email = row[4] || '';
    const website = row[5] || '';
    const status = row[8] || '';
    
    // Skip if no company name
    if (!company || company === '(empty)') return;
    
    // Need enrichment if:
    // - No contact name OR
    // - No email OR
    // - Generic email (info@, sales@, ir@, contact@)
    const hasGenericEmail = email && email.match(/(info@|sales@|ir@|contact@|hello@|admin@|team@)/i);
    const needsContact = !contact || !email || hasGenericEmail;
    
    if (!needsContact) return;
    
    // Skip duplicates
    if (needsEnrichment.find(item => item.company === company)) return;
    
    needsEnrichment.push({
      rowIndex: idx + 2, // +2 because: +1 for header, +1 for 1-indexed
      company,
      website,
      currentContact: contact,
      currentEmail: email,
      currentStatus: status
    });
  });
  
  console.log(`\nFound ${needsEnrichment.length} firms needing enrichment`);
  console.log(`Processing first 15...\n`);
  
  // Process first 15 firms
  const toProcess = needsEnrichment.slice(0, 15);
  const enrichmentLog = [];
  const updates = [];
  
  for (const firm of toProcess) {
    console.log(`[Row ${firm.rowIndex}] ${firm.company}`);
    console.log(`  Current: ${firm.currentContact || '(none)'} | ${firm.currentEmail || '(none)'}`);
    console.log(`  Website: ${firm.website || '(none)'}`);
    
    const contact = await searchApolloForContact(firm.company, firm.website);
    
    if (contact) {
      console.log(`  ✓ FOUND: ${contact.name}`);
      console.log(`    Title: ${contact.title}`);
      console.log(`    Email: ${contact.email}`);
      console.log(`    LinkedIn: ${contact.linkedin || '(none)'}`);
      
      enrichmentLog.push({
        row: firm.rowIndex,
        company: firm.company,
        contact: contact.name,
        title: contact.title,
        email: contact.email,
        linkedin: contact.linkedin,
        source: contact.source
      });
      
      // Update row C, D, E, F (Contact Name, Title, Email, LinkedIn)
      updates.push({
        range: `Sheet1!C${firm.rowIndex}:F${firm.rowIndex}`,
        values: [[contact.name, contact.title, contact.email, contact.linkedin]]
      });
      
      // Update Notes column (I) with source
      updates.push({
        range: `Sheet1!I${firm.rowIndex}`,
        values: [[contact.source]]
      });
      
      // Update Status (H) to "Enriched"
      updates.push({
        range: `Sheet1!H${firm.rowIndex}`,
        values: [['Enriched']]
      });
    } else {
      console.log(`  ✗ No contact found via Apollo`);
    }
    
    console.log('');
    
    // Rate limiting: 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Apply all updates in batch
  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: updates
      }
    });
    console.log(`✓ Applied ${updates.length} updates to sheet`);
  }
  
  // Save log
  const logFilename = 'enrichment-log-2026-03-04-0406am.json';
  fs.writeFileSync(logFilename, JSON.stringify(enrichmentLog, null, 2));
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Candidates reviewed: ${toProcess.length}`);
  console.log(`Successfully enriched: ${enrichmentLog.length}`);
  console.log(`Success rate: ${Math.round((enrichmentLog.length / toProcess.length) * 100)}%`);
  console.log(`Remaining to enrich: ${needsEnrichment.length - toProcess.length}`);
  console.log(`\nLog saved: ${logFilename}`);
  
  // Output enriched firms for reporting
  if (enrichmentLog.length > 0) {
    console.log(`\n=== ENRICHED FIRMS ===`);
    enrichmentLog.forEach(item => {
      console.log(`${item.company}: ${item.contact} (${item.title}) - ${item.email}`);
    });
  }
}

main().catch(console.error);
