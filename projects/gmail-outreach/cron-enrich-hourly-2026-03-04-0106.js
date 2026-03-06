const { google } = require('googleapis');
const axios = require('axios');
const fs = require('fs');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Initialize Google Sheets API
async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

// Read sheet data
async function readSheet() {
  const sheets = await getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:I',
  });
  return response.data.values || [];
}

// Search Apollo for decision-makers
async function searchApollo(firmName) {
  try {
    const response = await axios.post('https://api.apollo.io/api/v1/mixed_people/search', {
      q_organization_name: firmName,
      person_titles: [
        'Partner', 'Managing Director', 'Managing Partner',
        'CEO', 'President', 'COO', 'CTO', 'CFO', 'CMO',
        'VP', 'Vice President',
        'Director', 'Head of', 'Business Development'
      ],
      per_page: 5
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY
      }
    });

    if (response.data.people && response.data.people.length > 0) {
      const person = response.data.people[0]; // Take first result
      return {
        name: person.name,
        title: person.title,
        email: person.email,
        linkedin: person.linkedin_url,
        source: 'Apollo API'
      };
    }
    return null;
  } catch (err) {
    console.error(`Apollo error for ${firmName}:`, err.response?.data?.message || err.message);
    return null;
  }
}

// Update sheet with enrichment data
async function updateSheet(rowIndex, contactName, title, email, linkedIn, notes) {
  const sheets = await getSheetsClient();
  
  const updates = [];
  
  // Column C = Contact Name (index 2)
  if (contactName) {
    updates.push({
      range: `Sheet1!C${rowIndex}`,
      values: [[contactName]]
    });
  }
  
  // Column D = Title (index 3)
  if (title) {
    updates.push({
      range: `Sheet1!D${rowIndex}`,
      values: [[title]]
    });
  }
  
  // Column E = Email (index 4)
  if (email) {
    updates.push({
      range: `Sheet1!E${rowIndex}`,
      values: [[email]]
    });
  }
  
  // Column G = LinkedIn (index 6)
  if (linkedIn) {
    updates.push({
      range: `Sheet1!G${rowIndex}`,
      values: [[linkedIn]]
    });
  }
  
  // Column H = Status/Sector -> append enrichment note
  if (notes) {
    updates.push({
      range: `Sheet1!H${rowIndex}`,
      values: [[notes]]
    });
  }
  
  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      resource: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
  }
}

// Main enrichment function
async function enrichLeads() {
  console.log('Starting PE enrichment run - 2026-03-04 01:06 AM');
  
  const rows = await readSheet();
  const header = rows[0];
  
  let enriched = 0;
  let skipped = 0;
  let errors = 0;
  const log = [];
  
  // Process rows 2-932 (skip header)
  for (let i = 1; i < Math.min(rows.length, 100); i++) {
    const row = rows[i];
    const firmName = row[0]; // Column A
    const contactName = row[2]; // Column C
    const email = row[4]; // Column E
    
    // Skip if firm name is empty
    if (!firmName || firmName.trim() === '' || firmName === '(empty)') {
      skipped++;
      continue;
    }
    
    // Check if needs enrichment
    const needsEnrichment = 
      !contactName || contactName === '(empty)' ||
      !email || email === '(empty)' ||
      email.startsWith('info@') || 
      email.startsWith('sales@') ||
      email.startsWith('ir@') ||
      email.startsWith('contact@');
    
    if (!needsEnrichment) {
      skipped++;
      continue;
    }
    
    console.log(`\n[${i}/${rows.length}] Enriching: ${firmName}`);
    
    try {
      const result = await searchApollo(firmName);
      
      if (result && result.email && !result.email.startsWith('info@') && !result.email.startsWith('sales@')) {
        console.log(`  ✅ Found: ${result.name} (${result.title}) - ${result.email}`);
        
        await updateSheet(
          i + 1, // Row index (1-based, +1 for header)
          result.name,
          result.title,
          result.email,
          result.linkedin,
          `Apollo enriched 2026-03-04`
        );
        
        log.push({
          row: i + 1,
          firm: firmName,
          contact: result.name,
          title: result.title,
          email: result.email,
          status: 'enriched'
        });
        
        enriched++;
      } else {
        console.log(`  ⚠️  No valid contact found`);
        log.push({
          row: i + 1,
          firm: firmName,
          status: 'not_found'
        });
      }
      
      // Rate limit: 1 request per second
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // Stop after enriching 15 firms
      if (enriched >= 15) {
        console.log('\n✅ Target reached: 15 firms enriched');
        break;
      }
      
    } catch (err) {
      console.error(`  ❌ Error enriching ${firmName}:`, err.message);
      errors++;
      log.push({
        row: i + 1,
        firm: firmName,
        status: 'error',
        error: err.message
      });
    }
  }
  
  // Write log to file
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  fs.writeFileSync(
    `enrichment-log-cron-${timestamp}.json`,
    JSON.stringify(log, null, 2)
  );
  
  console.log('\n===========================================');
  console.log('ENRICHMENT RUN COMPLETE');
  console.log('===========================================');
  console.log(`Total enriched: ${enriched}`);
  console.log(`Skipped (already complete): ${skipped}`);
  console.log(`Errors: ${errors}`);
  console.log(`Log saved to: enrichment-log-cron-${timestamp}.json`);
  console.log('===========================================\n');
}

// Run enrichment
enrichLeads().catch(console.error);
