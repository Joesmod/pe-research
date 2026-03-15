const axios = require('axios');
const { google } = require('googleapis');

// Configuration
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = './service-account.json';
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const APOLLO_BASE_URL = 'https://api.apollo.io/v1';

// Target roles for PE firms
const TARGET_TITLES = [
  'CEO', 'Chief Executive Officer',
  'CTO', 'Chief Technology Officer',
  'COO', 'Chief Operating Officer',
  'CFO', 'Chief Financial Officer',
  'CMO', 'Chief Marketing Officer',
  'Managing Partner', 'Managing Director',
  'Partner', 'General Partner', 'Operating Partner',
  'VP Technology', 'VP Operations', 'VP Digital',
  'Director Technology', 'Director Operations', 'Director Digital',
  'Head of Technology', 'Head of Operations', 'Head of Digital'
];

async function getSheetData() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:Z'
  });
  
  return response.data.values || [];
}

function findColumnIndex(headers, columnName) {
  return headers.findIndex(h => 
    h.toLowerCase().trim() === columnName.toLowerCase().trim()
  );
}

function needsEnrichment(row, headers) {
  const contactIdx = findColumnIndex(headers, 'Contact Name');
  const emailIdx = findColumnIndex(headers, 'Email');
  const statusIdx = findColumnIndex(headers, 'Status');
  
  if (contactIdx === -1 || emailIdx === -1) return false;
  
  // Skip if already processed
  if (statusIdx !== -1 && row[statusIdx]) {
    const status = row[statusIdx].toLowerCase();
    if (['dead lead', 'sent', 'replied', 'bounced'].some(s => status.includes(s))) {
      return false;
    }
  }
  
  // Check if contact name is empty
  const contactEmpty = !row[contactIdx] || !row[contactIdx].trim();
  
  // Check if email is empty or generic
  const email = (row[emailIdx] || '').toLowerCase().trim();
  const genericPrefixes = ['info@', 'contact@', 'sales@', 'ir@', 'investor@', 'admin@'];
  const emailGeneric = !email || genericPrefixes.some(prefix => email.startsWith(prefix));
  
  return contactEmpty || emailGeneric;
}

async function searchApolloForContact(firmName, website) {
  try {
    console.log(`\n🔍 Searching Apollo for: ${firmName}`);
    
    const response = await axios.post(
      `${APOLLO_BASE_URL}/mixed_people/search`,
      {
        q_organization_name: firmName,
        person_titles: TARGET_TITLES,
        page: 1,
        per_page: 5
      },
      {
        headers: {
          'X-Api-Key': APOLLO_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data && response.data.people && response.data.people.length > 0) {
      const person = response.data.people[0]; // Take the first result
      console.log(`   ✅ Found: ${person.name} - ${person.title}`);
      console.log(`      Email: ${person.email || 'Not available'}`);
      
      return {
        name: person.name,
        title: person.title,
        email: person.email,
        linkedin: person.linkedin_url,
        source: 'Apollo API'
      };
    }
    
    console.log(`   ⚠️  No contacts found in Apollo`);
    return null;
  } catch (error) {
    console.error(`   ❌ Apollo API Error: ${error.message}`);
    return null;
  }
}

async function enrichLeads() {
  console.log('🚀 PE Research & Enrichment - March 9, 1PM Run');
  console.log('=' . repeat(60));
  
  // Read sheet data
  console.log('\n📊 Reading Google Sheet...');
  const data = await getSheetData();
  const headers = data[0];
  const rows = data.slice(1);
  
  console.log(`   Total rows: ${rows.length}`);
  
  // Find column indices
  const companyIdx = findColumnIndex(headers, 'Company Name');
  const contactIdx = findColumnIndex(headers, 'Contact Name');
  const titleIdx = findColumnIndex(headers, 'Title');
  const emailIdx = findColumnIndex(headers, 'Email');
  const websiteIdx = findColumnIndex(headers, 'Website');
  const linkedinIdx = findColumnIndex(headers, 'LinkedIn');
  const statusIdx = findColumnIndex(headers, 'Status');
  
  // Identify leads needing enrichment
  console.log('\n🔎 Identifying leads needing enrichment...');
  const toEnrich = [];
  
  rows.forEach((row, idx) => {
    if (needsEnrichment(row, headers)) {
      toEnrich.push({
        rowNum: idx + 2, // +2 for header row and 0-indexing
        company: row[companyIdx] || 'Unknown',
        website: row[websiteIdx] || '',
        currentContact: row[contactIdx] || '',
        currentEmail: row[emailIdx] || ''
      });
    }
  });
  
  console.log(`   Found ${toEnrich.length} leads needing enrichment`);
  
  // Limit to 10-15 leads
  const targetCount = Math.min(15, toEnrich.length);
  const enrichBatch = toEnrich.slice(0, targetCount);
  
  console.log(`\n🎯 Enriching ${enrichBatch.length} leads:`);
  enrichBatch.forEach(lead => {
    console.log(`   Row ${lead.rowNum}: ${lead.company}`);
  });
  
  // Enrich each lead
  console.log(`\n\n🔬 Starting enrichment process...\n`);
  const enrichmentResults = [];
  
  for (const lead of enrichBatch) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📍 Row ${lead.rowNum}: ${lead.company}`);
    console.log(`   Website: ${lead.website || '(none)'}`);
    
    // Try Apollo API first
    const apolloResult = await searchApolloForContact(lead.company, lead.website);
    
    if (apolloResult && apolloResult.email) {
      enrichmentResults.push({
        rowNum: lead.rowNum,
        company: lead.company,
        contact: apolloResult.name,
        title: apolloResult.title,
        email: apolloResult.email,
        linkedin: apolloResult.linkedin || '',
        source: apolloResult.source,
        success: true
      });
      console.log(`   ✅ Enrichment successful!`);
    } else {
      enrichmentResults.push({
        rowNum: lead.rowNum,
        company: lead.company,
        contact: '',
        title: '',
        email: '',
        linkedin: '',
        source: 'Manual research required',
        success: false
      });
      console.log(`   ⚠️  Manual research required`);
      console.log(`      Search: site:${lead.website || lead.company.toLowerCase().replace(/ /g, '')+'.com'} team`);
      console.log(`      Search: site:linkedin.com "${lead.company}" Partner OR Director`);
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n\n${'='.repeat(60)}`);
  console.log('📊 ENRICHMENT SUMMARY');
  console.log('='.repeat(60));
  
  const successful = enrichmentResults.filter(r => r.success);
  const needsManual = enrichmentResults.filter(r => !r.success);
  
  console.log(`\n✅ Successfully enriched: ${successful.length}`);
  successful.forEach(r => {
    console.log(`   Row ${r.rowNum}: ${r.contact} (${r.title}) - ${r.email}`);
  });
  
  console.log(`\n⚠️  Requires manual research: ${needsManual.length}`);
  needsManual.forEach(r => {
    console.log(`   Row ${r.rowNum}: ${r.company}`);
  });
  
  // Save results
  const fs = require('fs');
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const outputFile = `enrichment-results-${timestamp}.json`;
  fs.writeFileSync(outputFile, JSON.stringify(enrichmentResults, null, 2));
  
  console.log(`\n💾 Results saved to: ${outputFile}`);
  console.log(`\n✅ Enrichment run complete!`);
  console.log(`   Next: Update Google Sheet with successful enrichments`);
  console.log(`   Next: Manually research the ${needsManual.length} remaining firms`);
}

enrichLeads().catch(console.error);
