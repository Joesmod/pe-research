// PE Research & Enrichment - Two-Step Apollo (Search + Enrich)
const { google } = require('googleapis');
const https = require('https');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SERVICE_ACCOUNT = JSON.parse(fs.readFileSync('service-account.json'));

const auth = new google.auth.GoogleAuth({
  credentials: SERVICE_ACCOUNT,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Step 1: Search for people at a company
async function searchApollo(companyName, titles) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      q_organization_name: companyName,
      person_titles: titles,
      page: 1,
      per_page: 25
    });
    
    const options = {
      hostname: 'api.apollo.io',
      port: 443,
      path: '/v1/mixed_people/api_search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length,
        'X-Api-Key': APOLLO_API_KEY,
        'Cache-Control': 'no-cache'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Step 2: Enrich a specific person to get full contact data
async function enrichPerson(personId) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      id: personId,
      reveal_personal_emails: true
    });
    
    const options = {
      hostname: 'api.apollo.io',
      port: 443,
      path: '/v1/people/match',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length,
        'X-Api-Key': APOLLO_API_KEY,
        'Cache-Control': 'no-cache'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const sheets = google.sheets({ version: 'v4', auth });
  
  console.log('🔍 PE Research & Enrichment - Working Version');
  console.log('=' + '='.repeat(60));
  console.log(`Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}`);
  console.log();
  
  // Step 1: Read the sheet
  console.log('📊 Reading Google Sheet...');
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:K',
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('❌ No data found in sheet.');
    return;
  }
  
  const headers = rows[0];
  const companyIdx = headers.indexOf('Company Name');
  const contactIdx = headers.indexOf('Contact Name');
  const titleIdx = headers.indexOf('Title');
  const emailIdx = headers.indexOf('Email');
  const websiteIdx = headers.indexOf('Website');
  const linkedinIdx = headers.indexOf('LinkedIn');
  const statusIdx = headers.indexOf('Status');
  const notesIdx = headers.indexOf('Notes');
  
  console.log(`✅ Loaded ${rows.length - 1} rows from sheet\n`);
  
  // Step 2: Identify leads needing enrichment
  console.log('🎯 Identifying leads needing enrichment...');
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[companyIdx]) continue;
    
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    
    // Skip if already processed
    if (status === 'Dead' || status === 'Sent') continue;
    
    // Check if needs enrichment
    const hasNoContact = !contact || contact.trim() === '';
    const hasGenericEmail = email && (
      email.includes('info@') || 
      email.includes('sales@') || 
      email.includes('ir@') ||
      email.includes('contact@') ||
      email.includes('hello@') ||
      email.includes('admin@')
    );
    const hasNoEmail = !email || email.trim() === '';
    
    if (hasNoContact || hasGenericEmail || hasNoEmail) {
      needsEnrichment.push({
        row: i + 1,
        company,
        contact,
        email,
        website: row[websiteIdx] || '',
        linkedin: row[linkedinIdx] || '',
        status,
        rowData: row
      });
    }
  }
  
  console.log(`📋 Found ${needsEnrichment.length} leads needing enrichment`);
  console.log(`📝 Will process: ${Math.min(needsEnrichment.length, 12)} leads\n`);
  
  if (needsEnrichment.length === 0) {
    console.log('✅ All leads are enriched! No work needed.');
    return;
  }
  
  // Step 3: Process top 10-12 leads (conservative for enrichment credit use)
  const toProcess = needsEnrichment.slice(0, 12);
  const updates = [];
  const enrichmentLog = [];
  
  // Wide net of PE titles to search for
  const searchTitles = [
    'Managing Partner',
    'Managing Director',
    'Partner',
    'General Partner',
    'Operating Partner',
    'CEO',
    'Chief Executive Officer',
    'CTO',
    'COO',
    'CFO',
    'CMO',
    'President',
    'Vice President Technology',
    'VP Technology',
    'VP Operations',
    'VP Digital',
    'VP Portfolio Operations',
    'Director Technology',
    'Director Operations',
    'Director Digital',
    'Director Business Development',
    'Head of Technology',
    'Head of Operations',
    'Head of Digital',
    'Head of Value Creation',
    'Head of Portfolio Operations'
  ];
  
  console.log('🔬 Starting Apollo enrichment (2-step: Search + Enrich)...\n');
  
  for (const lead of toProcess) {
    console.log('─'.repeat(60));
    console.log(`🏢 ${lead.company} (Row ${lead.row})`);
    console.log(`   Current Contact: ${lead.contact || '(empty)'}`);
    console.log(`   Current Email: ${lead.email || '(empty)'}`);
    
    try {
      // STEP 1: Search for people at the company
      const searchResult = await searchApollo(lead.company, searchTitles);
      
      if (searchResult.error) {
        console.log(`   ❌ Apollo Search Error: ${searchResult.error}`);
        enrichmentLog.push({
          row: lead.row,
          company: lead.company,
          status: 'error',
          message: searchResult.error
        });
        await sleep(1000);
        continue;
      }
      
      if (!searchResult.people || searchResult.people.length === 0) {
        console.log(`   ⚠️  No contacts found in Apollo search`);
        enrichmentLog.push({
          row: lead.row,
          company: lead.company,
          status: 'not_found',
          totalFound: 0
        });
        await sleep(1000);
        continue;
      }
      
      console.log(`   📡 Search found ${searchResult.people.length} contacts`);
      
      // STEP 2: Pick best candidate and enrich to reveal email
      const titlePriority = ['CEO', 'Managing', 'Partner', 'President', 'Chief', 'Director', 'VP', 'Vice President', 'Head'];
      
      let bestCandidate = null;
      for (const priority of titlePriority) {
        const match = searchResult.people.find(p => 
          (p.title || '').toLowerCase().includes(priority.toLowerCase()) && p.has_email
        );
        if (match) {
          bestCandidate = match;
          break;
        }
      }
      
      // Fallback: just take first person with email
      if (!bestCandidate) {
        bestCandidate = searchResult.people.find(p => p.has_email);
      }
      
      if (!bestCandidate) {
        console.log(`   ⚠️  No candidates with email indicator found`);
        enrichmentLog.push({
          row: lead.row,
          company: lead.company,
          status: 'no_email_candidates',
          totalFound: searchResult.people.length
        });
        await sleep(1000);
        continue;
      }
      
      console.log(`   🎯 Enriching: ${bestCandidate.first_name} ${bestCandidate.last_name_obfuscated || ''} (${bestCandidate.title})`);
      
      // STEP 3: Enrich the person to reveal email
      const enrichResult = await enrichPerson(bestCandidate.id);
      await sleep(1500); // Rate limit between enrich calls
      
      if (enrichResult.error) {
        console.log(`   ❌ Apollo Enrich Error: ${enrichResult.error}`);
        enrichmentLog.push({
          row: lead.row,
          company: lead.company,
          status: 'enrich_error',
          message: enrichResult.error
        });
        continue;
      }
      
      const person = enrichResult.person || enrichResult;
      const name = person.name || `${person.first_name || ''} ${person.last_name || ''}`.trim();
      const title = person.title || '';
      const email = person.email || '';
      const linkedin = person.linkedin_url || '';
      
      if (!email) {
        console.log(`   ⚠️  Enrichment succeeded but no email revealed`);
        enrichmentLog.push({
          row: lead.row,
          company: lead.company,
          contact: name,
          title: title,
          status: 'no_email_revealed',
          linkedin: linkedin
        });
        continue;
      }
      
      // Check if email is generic
      const isGeneric = email.includes('info@') || email.includes('sales@') || email.includes('ir@') || email.includes('contact@');
      
      console.log(`   ✅ Enriched successfully!`);
      console.log(`      Name: ${name}`);
      console.log(`      Title: ${title}`);
      console.log(`      Email: ${email}${isGeneric ? ' ⚠️ (generic)' : ''}`);
      console.log(`      LinkedIn: ${linkedin || '(none)'}`);
      
      // Update the sheet
      updates.push({
        range: `Sheet1!B${lead.row}:G${lead.row}`,
        values: [[
          name,                              // Contact Name
          title,                             // Title
          email,                             // Email
          lead.rowData[websiteIdx] || '',   // Website (preserve)
          linkedin,                          // LinkedIn
          isGeneric ? 'Research' : 'Enriched'  // Status
        ]]
      });
      
      // Also update Notes with source
      if (notesIdx >= 0) {
        const noteText = isGeneric 
          ? `Apollo: Found ${name} (${title}) but email is generic: ${email}. Search returned ${searchResult.people.length} contacts.`
          : `Apollo enrichment ${new Date().toLocaleDateString()}: ${name} (${title}). Verified email. Source: Apollo.io ID ${bestCandidate.id}`;
        
        updates.push({
          range: `Sheet1!${String.fromCharCode(65 + notesIdx)}${lead.row}`,
          values: [[noteText]]
        });
      }
      
      enrichmentLog.push({
        row: lead.row,
        company: lead.company,
        contact: name,
        title: title,
        email: email,
        linkedin: linkedin,
        apolloId: bestCandidate.id,
        isGeneric: isGeneric,
        totalFound: searchResult.people.length,
        status: isGeneric ? 'generic_email' : 'enriched'
      });
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      enrichmentLog.push({
        row: lead.row,
        company: lead.company,
        status: 'error',
        message: error.message
      });
    }
  }
  
  console.log('\n' + '='.repeat(60));
  
  // Step 4: Batch update the sheet
  if (updates.length > 0) {
    console.log(`\n📝 Writing ${updates.length} updates to Google Sheet...`);
    
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    
    console.log('✅ Sheet updated successfully!');
  } else {
    console.log('\n⚠️  No updates to write.');
  }
  
  // Step 5: Save log
  const logPath = `enrichment-log-march13-working.json`;
  fs.writeFileSync(logPath, JSON.stringify(enrichmentLog, null, 2));
  console.log(`📄 Enrichment log saved to ${logPath}`);
  
  // Step 6: Summary
  console.log('\n📊 ENRICHMENT SUMMARY');
  console.log('=' + '='.repeat(60));
  const enriched = enrichmentLog.filter(l => l.status === 'enriched').length;
  const genericEmail = enrichmentLog.filter(l => l.status === 'generic_email').length;
  const notFound = enrichmentLog.filter(l => l.status === 'not_found').length;
  const noEmail = enrichmentLog.filter(l => l.status === 'no_email_revealed' || l.status === 'no_email_candidates').length;
  const errors = enrichmentLog.filter(l => l.status === 'error' || l.status === 'enrich_error').length;
  
  console.log(`✅ Successfully enriched (verified email): ${enriched}`);
  console.log(`⚠️  Generic email found: ${genericEmail}`);
  console.log(`⚠️  No contacts found: ${notFound}`);
  console.log(`⚠️  No email available: ${noEmail}`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`📋 Total processed: ${enrichmentLog.length}`);
  console.log(`📋 Remaining to enrich: ${needsEnrichment.length - toProcess.length}`);
  console.log();
  console.log('✅ Enrichment run complete!');
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
