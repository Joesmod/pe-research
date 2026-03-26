const { google } = require('googleapis');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const ENRICHMENT_LIMIT = 15; // Process up to 15 leads

let auth, sheets;

async function initialize() {
  auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  sheets = google.sheets({ version: 'v4', auth });
}

// Find leads that need enrichment
async function findEnrichmentNeeds() {
  console.log('📋 Scanning sheet for enrichment candidates...\n');
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:N'
  });
  
  const rows = response.data.values || [];
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const website = row[1] || '';
    const contact = row[2] || '';
    const email = row[4] || '';
    const status = (row[7] || '').toLowerCase();
    
    // Skip if no company
    if (!company || company === 'Company Name') continue;
    
    // Skip dead/inactive firms
    if (status.includes('dead') || status.includes('closed') || status.includes('inactive')) continue;
    
    // Skip already enriched with good data
    if (status === 'enriched' && contact && email && !isGenericEmail(email)) continue;
    
    // Identify if needs enrichment
    const hasGenericEmail = isGenericEmail(email);
    const needsWork = !contact || !email || hasGenericEmail;
    
    if (needsWork) {
      needsEnrichment.push({
        rowNum: i + 1,
        company,
        website,
        currentContact: contact || '',
        currentEmail: email || '',
        reason: !contact ? 'No contact' : (!email ? 'No email' : 'Generic email')
      });
    }
    
    // Stop if we have enough candidates
    if (needsEnrichment.length >= ENRICHMENT_LIMIT * 2) break;
  }
  
  console.log(`✅ Found ${needsEnrichment.length} candidates\n`);
  return needsEnrichment.slice(0, ENRICHMENT_LIMIT);
}

function isGenericEmail(email) {
  if (!email) return false;
  const lower = email.toLowerCase();
  return (
    lower.includes('info@') ||
    lower.includes('sales@') ||
    lower.includes('ir@') ||
    lower.includes('contact@') ||
    lower.includes('inquiries@') ||
    lower.includes('hello@') ||
    lower.includes('admin@')
  );
}

// Extract domain from website URL
function extractDomain(website) {
  if (!website || !website.startsWith('http')) return '';
  return website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
}

// Search Apollo API for contacts
async function searchApollo(firmName, website) {
  try {
    console.log(`  🔎 Searching Apollo for ${firmName}...`);
    
    const domain = extractDomain(website);
    
    // Cast a wide net - multiple title sets
    const titleSets = [
      ['CEO', 'CTO', 'COO', 'Managing Partner', 'General Partner'],
      ['Partner', 'Operating Partner', 'Managing Director', 'Principal'],
      ['VP Operations', 'VP Technology', 'VP Digital', 'VP Portfolio Operations'],
      ['Director of Technology', 'Director of Operations', 'Director of Digital'],
      ['Head of Technology', 'Head of Value Creation', 'Head of Portfolio Operations', 'Head of Business Development']
    ];
    
    for (const titles of titleSets) {
      const searchPayload = {
        person_titles: titles,
        per_page: 3
      };
      
      // Prioritize domain search, fallback to company name
      if (domain) {
        searchPayload.q_organization_domains = domain;
      } else {
        searchPayload.q_organization_name = firmName;
      }
      
      const searchResponse = await axios.post(
        'https://api.apollo.io/api/v1/mixed_people/search',
        searchPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': APOLLO_API_KEY
          }
        }
      );
      
      if (searchResponse.data.people && searchResponse.data.people.length > 0) {
        // Try to enrich the first match
        for (const person of searchResponse.data.people) {
          try {
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
            
            if (enrichedPerson && enrichedPerson.email && !isGenericEmail(enrichedPerson.email)) {
              return {
                name: enrichedPerson.name,
                title: enrichedPerson.title,
                email: enrichedPerson.email,
                linkedin: enrichedPerson.linkedin_url || '',
                source: `Apollo API - ${titles[0]}`
              };
            }
          } catch (enrichErr) {
            console.log(`    Enrich failed for person ${person.id}, trying next...`);
          }
          
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      // Rate limiting between title set searches
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return null;
  } catch (error) {
    console.error(`  ❌ Apollo error:`, error.response?.data?.message || error.message);
    return null;
  }
}

// Update Google Sheet with enriched data
async function updateSheet(rowNum, contact, title, email, linkedin, notes) {
  try {
    const updates = [];
    
    if (contact) updates.push({ range: `Sheet1!C${rowNum}`, values: [[contact]] });
    if (title) updates.push({ range: `Sheet1!D${rowNum}`, values: [[title]] });
    if (email) updates.push({ range: `Sheet1!E${rowNum}`, values: [[email]] });
    if (linkedin) updates.push({ range: `Sheet1!G${rowNum}`, values: [[linkedin]] });
    
    // Mark as Enriched
    updates.push({ range: `Sheet1!H${rowNum}`, values: [['Enriched']] });
    
    // Add notes
    if (notes) {
      updates.push({ range: `Sheet1!I${rowNum}`, values: [[notes]] });
    }
    
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
  console.log('🚀 PE RESEARCH & ENRICHMENT - Hourly Cron');
  console.log('Time:', new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));
  console.log('Target: 10-15 leads with verified direct emails\n');
  console.log('='.repeat(80));
  
  await initialize();
  
  const targets = await findEnrichmentNeeds();
  
  if (targets.length === 0) {
    console.log('\n✨ No leads need enrichment at this time!');
    return { enriched: 0, failed: 0, total: 0 };
  }
  
  console.log(`\n📊 Processing ${targets.length} leads:\n`);
  
  let enriched = 0;
  let failed = 0;
  const results = [];
  
  for (const target of targets) {
    console.log(`\n[${enriched + failed + 1}/${targets.length}] ${target.company} (Row ${target.rowNum})`);
    console.log(`  Current: ${target.currentContact || '(no contact)'} / ${target.currentEmail || '(no email)'}`);
    console.log(`  Website: ${target.website || '(none)'}`);
    
    const result = await searchApollo(target.company, target.website);
    
    if (result) {
      console.log(`  ✨ FOUND: ${result.name} - ${result.title}`);
      console.log(`  📧 Email: ${result.email}`);
      
      const notes = `${result.source}. Enriched ${new Date().toISOString().split('T')[0]}.`;
      
      const updated = await updateSheet(
        target.rowNum,
        result.name,
        result.title,
        result.email,
        result.linkedin,
        notes
      );
      
      if (updated) {
        enriched++;
        results.push({
          company: target.company,
          name: result.name,
          title: result.title,
          email: result.email,
          row: target.rowNum
        });
      } else {
        failed++;
      }
    } else {
      console.log(`  ⚠️  No suitable contact found`);
      
      // Update notes to indicate research attempt
      await updateSheet(
        target.rowNum,
        null, null, null, null,
        `Apollo search attempted ${new Date().toISOString().split('T')[0]} - no verified contact found. Consider manual research.`
      );
      
      failed++;
    }
    
    // Rate limiting between firms
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 ENRICHMENT SUMMARY');
  console.log('='.repeat(80));
  console.log(`✅ Successfully enriched: ${enriched}`);
  console.log(`⚠️  Not found/failed: ${failed}`);
  console.log(`📝 Total processed: ${targets.length}`);
  
  if (enriched > 0) {
    console.log('\n🎯 Enriched contacts:');
    results.forEach(r => {
      console.log(`  • ${r.company} → ${r.name} (${r.title}) - ${r.email}`);
    });
  }
  
  // Save results to log file
  const logFile = path.join(__dirname, `enrichment-results-march15-${Date.now()}.json`);
  fs.writeFileSync(logFile, JSON.stringify({ timestamp: new Date(), enriched, failed, results }, null, 2));
  
  console.log(`\n💾 Results saved to: ${path.basename(logFile)}`);
  
  return { enriched, failed, total: targets.length, results };
}

run().then(results => {
  console.log('\n🎉 Hourly enrichment complete!');
  process.exit(0);
}).catch(err => {
  console.error('\n💥 Enrichment failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
