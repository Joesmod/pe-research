const { google } = require('googleapis');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Sheet structure (0-based indices):
// A(0): Company Name
// B(1): NotebookLM / Website
// C(2): Contact Name
// D(3): Title
// E(4): Email
// F(5): Various
// G(6): LinkedIn URL
// H(7): Status
// I(8): Notes
// J(9): Status (duplicate?)
// K(10): Last Contacted
// L(11): Notes
// M(12): Company Info URL
// N(13): Gumbo Score

async function initialize() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  return google.sheets({ version: 'v4', auth });
}

async function searchApollo(firmName, website) {
  try {
    console.log(`  🔎 Apollo search: ${firmName}`);
    
    let domain = '';
    if (website && website.includes('http')) {
      domain = website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    }
    
    const titleSets = [
      ['CEO', 'CTO', 'COO', 'Managing Partner', 'General Partner'],
      ['Partner', 'Operating Partner', 'Managing Director'],
      ['VP Technology', 'VP Operations', 'VP Digital', 'Director Technology'],
      ['Head of Technology', 'Head of Value Creation', 'Director of IT']
    ];
    
    for (const titles of titleSets) {
      const payload = { person_titles: titles, per_page: 3 };
      
      if (domain) {
        payload.q_organization_domains = domain;
      } else {
        payload.q_organization_name = firmName;
      }
      
      const searchResp = await axios.post(
        'https://api.apollo.io/api/v1/mixed_people/api_search',
        payload,
        { headers: { 'Content-Type': 'application/json', 'X-Api-Key': APOLLO_API_KEY } }
      );
      
      if (searchResp.data.people && searchResp.data.people.length > 0) {
        const person = searchResp.data.people[0];
        
        const enrichResp = await axios.post(
          'https://api.apollo.io/v1/people/match',
          { id: person.id },
          { headers: { 'Content-Type': 'application/json', 'X-Api-Key': APOLLO_API_KEY } }
        );
        
        const enriched = enrichResp.data.person;
        if (enriched && enriched.email) {
          console.log(`  ✅ Found: ${enriched.name} (${enriched.title})`);
          return {
            name: enriched.name,
            title: enriched.title,
            email: enriched.email,
            linkedin: enriched.linkedin_url || '',
            source: `Apollo API - ${new Date().toISOString().slice(0, 10)}`
          };
        }
      }
      
      await new Promise(r => setTimeout(r, 400));
    }
    
    return null;
  } catch (err) {
    if (err.response?.status === 429) {
      console.log(`  ⏸️  Rate limited, waiting 2s...`);
      await new Promise(r => setTimeout(r, 2000));
    }
    console.error(`  ❌ Error: ${err.response?.data?.message || err.message}`);
    return null;
  }
}

async function run() {
  try {
    console.log('🚀 PE Research & Enrichment - March 15, 2026 5:07 AM');
    console.log('');
    
    const sheets = await initialize();
    
    console.log('📖 Reading sheet...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:N'
    });
    
    const rows = response.data.values || [];
    console.log(`Total rows: ${rows.length}`);
    
    const needsEnrichment = [];
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const company = row[0] || '';
      const website = row[1] || '';
      const contact = row[2] || '';
      const email = row[4] || '';
      const status = (row[7] || '').toLowerCase();
      
      if (!company) continue;
      if (status.includes('dead') || status === 'closed') continue;
      
      const isGeneric = email && (
        email.includes('info@') || email.includes('sales@') || 
        email.includes('ir@') || email.includes('contact@')
      );
      
      if (!contact || !email || isGeneric) {
        needsEnrichment.push({
          rowNum: i + 1,
          company,
          website,
          contact: contact || '',
          email: email || '',
          status: row[7] || ''
        });
      }
    }
    
    console.log(`\n📊 Found ${needsEnrichment.length} leads needing enrichment`);
    
    if (needsEnrichment.length === 0) {
      console.log('✨ Sheet is already well-enriched!');
      return { enriched: 0, failed: 0, total: 0 };
    }
    
    console.log('🎯 Processing up to 15 leads...\n');
    
    const toProcess = needsEnrichment.slice(0, 15);
    const enrichmentLog = [];
    let enriched = 0;
    let failed = 0;
    
    for (const lead of toProcess) {
      console.log(`\n[${enriched + failed + 1}/${toProcess.length}] ${lead.company} (Row ${lead.rowNum})`);
      console.log(`  Current: "${lead.contact}" | "${lead.email}"`);
      
      const result = await searchApollo(lead.company, lead.website);
      
      if (result) {
        console.log(`  📧 ${result.email}`);
        
        // Update sheet (row is 1-based for Sheets API)
        const updates = [
          { range: `Sheet1!C${lead.rowNum}`, values: [[result.name]] },
          { range: `Sheet1!D${lead.rowNum}`, values: [[result.title]] },
          { range: `Sheet1!E${lead.rowNum}`, values: [[result.email]] },
          { range: `Sheet1!G${lead.rowNum}`, values: [[result.linkedin]] },
          { range: `Sheet1!H${lead.rowNum}`, values: [['Enriched']] },
          { range: `Sheet1!I${lead.rowNum}`, values: [[result.source]] }
        ];
        
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: SHEET_ID,
          requestBody: {
            data: updates,
            valueInputOption: 'USER_ENTERED'
          }
        });
        
        console.log(`  ✅ Updated`);
        enriched++;
        enrichmentLog.push({ company: lead.company, ...result });
      } else {
        console.log(`  ⚠️  No contact found`);
        failed++;
      }
      
      await new Promise(r => setTimeout(r, 1000));
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Enriched: ${enriched}`);
    console.log(`⚠️  Failed: ${failed}`);
    console.log(`📝 Processed: ${toProcess.length}`);
    console.log(`📋 Remaining: ${needsEnrichment.length - toProcess.length}`);
    
    const logFile = path.join(__dirname, `enrichment-log-${Date.now()}.json`);
    fs.writeFileSync(logFile, JSON.stringify(enrichmentLog, null, 2));
    console.log(`\n💾 Log: ${path.basename(logFile)}`);
    
    return { enriched, failed, total: toProcess.length };
    
  } catch (error) {
    console.error('❌ Fatal:', error.message);
    throw error;
  }
}

run().then(r => {
  console.log('\n🎉 Complete!');
  process.exit(0);
}).catch(e => {
  console.error('\n💥 Failed:', e.message);
  process.exit(1);
});
