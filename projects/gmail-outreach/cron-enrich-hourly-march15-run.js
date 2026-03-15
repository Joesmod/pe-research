const { google } = require('googleapis');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

const enrichmentLog = [];
let auth, sheets;

async function initialize() {
  auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  sheets = google.sheets({ version: 'v4', auth });
}

async function readSheet() {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:O'
  });
  return response.data.values || [];
}

async function searchApollo(firmName, website) {
  try {
    console.log(`  🔎 Searching Apollo for ${firmName}...`);
    
    // Extract domain from website
    let domain = website;
    if (website) {
      domain = website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    }
    
    // Try multiple title variations
    const titleSets = [
      ['CEO', 'CTO', 'COO', 'Managing Partner', 'General Partner'],
      ['Partner', 'Operating Partner', 'Managing Director'],
      ['VP Operations', 'VP Technology', 'VP Digital', 'Director of Technology', 'Director of Operations'],
      ['Head of Technology', 'Head of Value Creation', 'Head of Portfolio Operations']
    ];
    
    for (const titles of titleSets) {
      const searchPayload = {
        person_titles: titles,
        per_page: 5
      };
      
      if (domain && !domain.includes('n/a')) {
        searchPayload.q_organization_domains = domain;
      } else {
        searchPayload.q_organization_name = firmName;
      }
      
      const searchResponse = await axios.post(
        'https://api.apollo.io/api/v1/mixed_people/api_search',
        searchPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': APOLLO_API_KEY
          }
        }
      );
      
      if (searchResponse.data.people && searchResponse.data.people.length > 0) {
        const person = searchResponse.data.people[0];
        
        // Now enrich to get full email
        const enrichResponse = await axios.post(
          'https://api.apollo.io/v1/people/match',
          { id: person.id },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Api-Key': APOLLO_API_KEY
            }
          }
        );
        
        const enrichedPerson = enrichResponse.data.person;
        
        if (enrichedPerson && enrichedPerson.email) {
          return {
            name: enrichedPerson.name,
            title: enrichedPerson.title,
            email: enrichedPerson.email,
            linkedin: enrichedPerson.linkedin_url || '',
            source: `Apollo API - ${titles.join(', ')}`
          };
        }
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return null;
  } catch (error) {
    console.error(`  ❌ Apollo error for ${firmName}:`, error.response?.data?.message || error.message);
    return null;
  }
}

async function updateSheet(rowNum, contact, title, email, linkedin, notes) {
  try {
    const updates = [];
    
    // Column indices (0-based): C=Contact Name, D=Position/Title, E=Email, L=LinkedIn URL, N=Notes
    if (contact) updates.push({ range: `Sheet1!C${rowNum}`, values: [[contact]] });
    if (title) updates.push({ range: `Sheet1!D${rowNum}`, values: [[title]] });
    if (email) updates.push({ range: `Sheet1!E${rowNum}`, values: [[email]] });
    if (linkedin) updates.push({ range: `Sheet1!L${rowNum}`, values: [[linkedin]] });
    if (notes) updates.push({ range: `Sheet1!N${rowNum}`, values: [[notes]] });
    
    // Also update Status to "Enriched"
    updates.push({ range: `Sheet1!O${rowNum}`, values: [['Enriched']] });
    
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        data: updates,
        valueInputOption: 'USER_ENTERED'
      }
    });
    
    console.log(`  ✅ Updated row ${rowNum}`);
    return true;
  } catch (error) {
    console.error(`  ❌ Failed to update row ${rowNum}:`, error.message);
    return false;
  }
}

async function run() {
  try {
    console.log('🚀 Starting PE Research & Enrichment - Hourly Cron');
    console.log('Time:', new Date().toISOString());
    console.log('');
    
    await initialize();
    
    // Read sheet
    console.log('📖 Reading Google Sheet...');
    const rows = await readSheet();
    
    if (rows.length === 0) {
      console.log('❌ No data found in sheet.');
      return;
    }
    
    const headers = rows[0];
    const companyIdx = headers.indexOf('Company/Firm');
    const contactIdx = headers.indexOf('Contact Name');
    const emailIdx = headers.indexOf('Email');
    const statusIdx = headers.indexOf('Status');
    const websiteIdx = headers.indexOf('Website');
    
    // Find leads needing enrichment
    const needsEnrichment = [];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const company = row[companyIdx] || '';
      const contact = row[contactIdx] || '';
      const email = row[emailIdx] || '';
      const status = (row[statusIdx] || '').toLowerCase();
      const website = row[websiteIdx] || '';
      
      // Skip dead firms
      if (status.includes('dead') || status === 'closed') continue;
      
      // Check if needs enrichment
      const needsWork = !contact || 
                       !email || 
                       email.toLowerCase().includes('info@') ||
                       email.toLowerCase().includes('sales@') ||
                       email.toLowerCase().includes('ir@') ||
                       email.toLowerCase().includes('contact@');
      
      if (needsWork && company) {
        needsEnrichment.push({
          rowNum: i + 1,
          company,
          website,
          contact: contact || '',
          email: email || '',
          status: row[statusIdx] || ''
        });
      }
    }
    
    console.log(`\n📊 Found ${needsEnrichment.length} leads needing enrichment`);
    console.log(`🎯 Will process up to 15 leads\n`);
    
    // Process up to 15 leads
    const toProcess = needsEnrichment.slice(0, 15);
    let enriched = 0;
    let failed = 0;
    
    for (const lead of toProcess) {
      console.log(`\n[${enriched + failed + 1}/${toProcess.length}] ${lead.company} (Row ${lead.rowNum})`);
      console.log(`  Current: Contact="${lead.contact}" | Email="${lead.email}"`);
      
      const result = await searchApollo(lead.company, lead.website);
      
      if (result) {
        console.log(`  ✨ Found: ${result.name} - ${result.title}`);
        console.log(`  📧 Email: ${result.email}`);
        
        const updated = await updateSheet(
          lead.rowNum,
          result.name,
          result.title,
          result.email,
          result.linkedin,
          result.source
        );
        
        if (updated) {
          enriched++;
          enrichmentLog.push({
            company: lead.company,
            name: result.name,
            title: result.title,
            email: result.email,
            source: result.source
          });
        } else {
          failed++;
        }
      } else {
        console.log(`  ⚠️  No contact found via Apollo`);
        failed++;
      }
      
      // Rate limiting between searches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 ENRICHMENT SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully enriched: ${enriched}`);
    console.log(`⚠️  Failed/not found: ${failed}`);
    console.log(`📝 Total processed: ${toProcess.length}`);
    console.log(`📋 Remaining: ${needsEnrichment.length - toProcess.length}`);
    
    // Save log
    const logFile = path.join(__dirname, `cron-enrichment-results-march15-${Date.now()}.json`);
    fs.writeFileSync(logFile, JSON.stringify(enrichmentLog, null, 2));
    console.log(`\n💾 Log saved: ${logFile}`);
    
    return { enriched, failed, total: toProcess.length };
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error(error.stack);
    throw error;
  }
}

run().then(results => {
  console.log('\n🎉 Cron job complete!');
  process.exit(0);
}).catch(err => {
  console.error('\n💥 Cron job failed:', err.message);
  process.exit(1);
});
