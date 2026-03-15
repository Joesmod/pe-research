#!/usr/bin/env node

const { google } = require('googleapis');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

// ========= CONFIG =========
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SHEET_NAME = 'Sheet1';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

const TARGETS_FILE = path.join(__dirname, 'enrichment-targets-march15-0037am.json');

// ========= SETUP =========
const auth = new google.auth.GoogleAuth({
  keyFile: SERVICE_ACCOUNT_PATH,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// ========= APOLLO SEARCH =========
async function searchApolloContacts(firmName) {
  console.log(`\n🔍 Searching Apollo for: ${firmName}`);
  
  try {
    const response = await axios.post(
      'https://api.apollo.io/v1/mixed_people/api_search',
      {
        q_organization_name: firmName,
        person_titles: [
          'CEO', 'CTO', 'COO', 'CFO', 'CMO',
          'Managing Partner', 'Operating Partner', 'General Partner', 'Partner',
          'Director', 'VP', 'Vice President',
          'Head of Technology', 'Head of Operations', 'Head of Digital'
        ],
        page: 1,
        per_page: 5
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );

    if (response.data && response.data.people && response.data.people.length > 0) {
      const results = response.data.people
        .filter(p => p.email && !p.email.match(/^(info|sales|ir|contact|hello|support)@/i))
        .map(person => ({
          name: person.name,
          title: person.title,
          email: person.email,
          linkedin: person.linkedin_url,
          source: 'Apollo.io'
        }));
      
      console.log(`✅ Found ${results.length} contacts with verified emails`);
      return results;
    }

    console.log(`⚠️  No contacts found`);
    return [];

  } catch (error) {
    console.error(`❌ Apollo error: ${error.message}`);
    if (error.response) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    return [];
  }
}

// ========= SHEET UPDATE =========
async function updateSheetRow(rowIndex, contact) {
  const range = `${SHEET_NAME}!B${rowIndex}:I${rowIndex}`;
  
  const values = [[
    '', // NotebookLM (column B)
    contact.name,
    contact.title,
    contact.email,
    '', // Website (column F)
    contact.linkedin || '',
    'Enriched',
    `${contact.source}. Verified contact with direct email.`
  ]];

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range,
    valueInputOption: 'RAW',
    resource: { values }
  });

  console.log(`✅ Updated row ${rowIndex}: ${contact.name} (${contact.email})`);
}

// ========= MAIN =========
async function main() {
  console.log('=== PE Contact Enrichment via Apollo ===');
  console.log(`Time: ${new Date().toISOString()}\n`);

  // Load targets
  const targets = JSON.parse(fs.readFileSync(TARGETS_FILE, 'utf8'));
  console.log(`Loaded ${targets.length} targets from ${path.basename(TARGETS_FILE)}\n`);

  const results = [];

  for (const target of targets) {
    console.log(`\n[${ targets.indexOf(target) + 1}/${targets.length}] ${target.firm} (Row ${target.rowIndex})`);
    
    // Search Apollo
    const contacts = await searchApolloContacts(target.firm);
    
    if (contacts.length > 0) {
      // Use the first (best) match
      const bestContact = contacts[0];
      
      try {
        await updateSheetRow(target.rowIndex, bestContact);
        results.push({
          firm: target.firm,
          rowIndex: target.rowIndex,
          contact: bestContact.name,
          email: bestContact.email,
          title: bestContact.title,
          status: 'SUCCESS'
        });
      } catch (error) {
        console.error(`❌ Failed to update row ${target.rowIndex}: ${error.message}`);
        results.push({
          firm: target.firm,
          rowIndex: target.rowIndex,
          status: 'SHEET_ERROR',
          error: error.message
        });
      }
    } else {
      results.push({
        firm: target.firm,
        rowIndex: target.rowIndex,
        status: 'NO_CONTACTS'
      });
    }

    // Rate limit: 1 request per second
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // ========= SUMMARY =========
  console.log('\n\n=== ENRICHMENT SUMMARY ===');
  const successful = results.filter(r => r.status === 'SUCCESS');
  const noContacts = results.filter(r => r.status === 'NO_CONTACTS');
  const errors = results.filter(r => r.status === 'SHEET_ERROR');

  console.log(`✅ Successfully enriched: ${successful.length}`);
  console.log(`⚠️  No contacts found: ${noContacts.length}`);
  console.log(`❌ Errors: ${errors.length}`);

  if (successful.length > 0) {
    console.log('\n✅ Enriched Firms:');
    successful.forEach(r => {
      console.log(`  • ${r.firm}: ${r.contact} (${r.email})`);
    });
  }

  if (noContacts.length > 0) {
    console.log('\n⚠️  Firms with no contacts found:');
    noContacts.forEach(r => {
      console.log(`  • ${r.firm} (Row ${r.rowIndex})`);
    });
  }

  // Save results
  const resultsFile = path.join(__dirname, 'enrichment-results-march15-207am.json');
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
  console.log(`\n📄 Results saved to: ${resultsFile}`);
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
