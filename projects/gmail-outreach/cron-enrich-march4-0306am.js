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
        'Partner', 'Managing Partner', 'Managing Director', 'General Partner',
        'CEO', 'President', 'Chief Executive Officer',
        'CFO', 'Chief Financial Officer',
        'CTO', 'Chief Technology Officer',
        'COO', 'Chief Operating Officer',
        'VP', 'Vice President',
        'Director', 'Head of'
      ],
      page: 1,
      per_page: 5
    }, {
      headers: { 
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY
      }
    });

    if (response.data && response.data.people && response.data.people.length > 0) {
      // Return the first person with a verified email
      for (const person of response.data.people) {
        if (person.email && !person.email.match(/(info@|sales@|ir@|contact@|hello@)/i)) {
          return {
            name: person.name || '',
            title: person.title || '',
            email: person.email || '',
            linkedin: person.linkedin_url || '',
            source: 'Apollo API (2026-03-04)'
          };
        }
      }
    }
    return null;
  } catch (error) {
    console.error(`Apollo search error for ${companyName}:`, error.response?.data || error.message);
    return null;
  }
}

async function main() {
  console.log('Starting PE enrichment run - March 4, 2026 03:06 AM\n');
  
  const sheets = await getSheets();
  
  // Read current sheet data
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:I',
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  const headers = rows[0];
  const dataRows = rows.slice(1);
  
  // Identify rows needing enrichment
  const needsEnrichment = [];
  dataRows.forEach((row, idx) => {
    const company = row[0] || '';
    const contact = row[2] || '';
    const email = row[4] || '';
    const website = row[5] || '';
    
    // Skip if no company name or already enriched
    if (!company || company === '(empty)') return;
    
    // Skip if already has good contact + email
    if (contact && email && !email.match(/(info@|sales@|ir@|contact@|hello@)/i)) return;
    
    // Skip duplicates
    if (needsEnrichment.find(item => item.company === company)) return;
    
    needsEnrichment.push({
      rowIndex: idx + 2, // +2 because: +1 for header, +1 for 1-indexed
      company,
      website,
      currentContact: contact,
      currentEmail: email
    });
  });
  
  console.log(`Found ${needsEnrichment.length} firms needing enrichment\n`);
  
  // Process first 15 firms
  const toProcess = needsEnrichment.slice(0, 15);
  const enrichmentLog = [];
  const updates = [];
  
  for (const firm of toProcess) {
    console.log(`\n[${firm.rowIndex}] ${firm.company}`);
    console.log(`  Current: ${firm.currentContact || '(empty)'} | ${firm.currentEmail || '(empty)'}`);
    
    const contact = await searchApolloForContact(firm.company, firm.website);
    
    if (contact) {
      console.log(`  ✓ Found: ${contact.name} | ${contact.title} | ${contact.email}`);
      
      enrichmentLog.push({
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
      
      // Update status column (H) with source
      updates.push({
        range: `Sheet1!H${firm.rowIndex}`,
        values: [[contact.source]]
      });
    } else {
      console.log(`  ✗ No contact found`);
    }
    
    // Rate limiting: wait 1 second between requests
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
    console.log(`\n✓ Updated ${updates.length / 2} rows in sheet`);
  }
  
  // Save log
  fs.writeFileSync(
    'enrichment-log-2026-03-04-0306am.json',
    JSON.stringify(enrichmentLog, null, 2)
  );
  
  console.log(`\n=== ENRICHMENT SUMMARY ===`);
  console.log(`Processed: ${toProcess.length} firms`);
  console.log(`Enriched: ${enrichmentLog.length} firms`);
  console.log(`Success rate: ${Math.round((enrichmentLog.length / toProcess.length) * 100)}%`);
  console.log(`\nLog saved: enrichment-log-2026-03-04-0306am.json`);
}

main().catch(console.error);
