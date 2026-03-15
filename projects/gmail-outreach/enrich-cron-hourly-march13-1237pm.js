// PE Research & Enrichment - Hourly Cron (March 13, 2026 - 12:37 PM)
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const sheets = google.sheets({ version: 'v4', auth });
  
  console.log('🔍 PE Research & Enrichment - Hourly Run');
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
  console.log(`📝 Will process: ${Math.min(needsEnrichment.length, 15)} leads\n`);
  
  if (needsEnrichment.length === 0) {
    console.log('✅ All leads are enriched! No work needed.');
    return;
  }
  
  // Step 3: Process top 10-15 leads
  const toProcess = needsEnrichment.slice(0, 15);
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
  
  console.log('🔬 Starting Apollo enrichment...\n');
  
  for (const lead of toProcess) {
    console.log('─'.repeat(60));
    console.log(`🏢 ${lead.company} (Row ${lead.row})`);
    console.log(`   Current Contact: ${lead.contact || '(empty)'}`);
    console.log(`   Current Email: ${lead.email || '(empty)'}`);
    
    try {
      const result = await searchApollo(lead.company, searchTitles);
      
      if (result.error) {
        console.log(`   ❌ Apollo API Error: ${result.error}`);
        enrichmentLog.push({
          row: lead.row,
          company: lead.company,
          status: 'error',
          message: result.error
        });
      } else if (result.people && result.people.length > 0) {
        console.log(`   ✅ Found ${result.people.length} contacts in Apollo`);
        
        // Find best contact - prioritize those with emails, then by title
        let bestContact = null;
        const titlePriority = ['CEO', 'Managing', 'Partner', 'President', 'Chief', 'Director', 'VP', 'Vice President', 'Head'];
        
        // First pass: try to find someone with a non-generic email
        for (const person of result.people) {
          const email = person.email || '';
          const isGeneric = email.includes('info@') || email.includes('sales@') || email.includes('ir@') || email.includes('contact@');
          
          if (email && !isGeneric) {
            bestContact = person;
            break;
          }
        }
        
        // Second pass: if no email found, take the highest-ranking title
        if (!bestContact) {
          for (const priority of titlePriority) {
            const match = result.people.find(p => (p.title || '').toLowerCase().includes(priority.toLowerCase()));
            if (match) {
              bestContact = match;
              break;
            }
          }
        }
        
        // Third pass: just take the first person if still no match
        if (!bestContact && result.people.length > 0) {
          bestContact = result.people[0];
        }
        
        if (bestContact) {
          const name = bestContact.name || `${bestContact.first_name || ''} ${bestContact.last_name || ''}`.trim();
          const title = bestContact.title || '';
          const email = bestContact.email || '';
          const linkedin = bestContact.linkedin_url || '';
          
          console.log(`   🎯 Selected: ${name}`);
          console.log(`      Title: ${title}`);
          console.log(`      Email: ${email}`);
          console.log(`      LinkedIn: ${linkedin}`);
          
          updates.push({
            range: `Sheet1!B${lead.row}:G${lead.row}`,
            values: [[
              name,                              // Contact Name
              title,                             // Title
              email,                             // Email
              lead.rowData[websiteIdx] || '',   // Website (preserve)
              linkedin,                          // LinkedIn
              'Enriched'                         // Status
            ]]
          });
          
          // Also update Notes with source
          if (notesIdx >= 0) {
            const noteUpdate = {
              range: `Sheet1!${String.fromCharCode(65 + notesIdx)}${lead.row}`,
              values: [[`Apollo enrichment: ${new Date().toLocaleDateString()} - Found ${result.people.length} contacts, selected ${name} (${title})`]]
            };
            updates.push(noteUpdate);
          }
          
          enrichmentLog.push({
            row: lead.row,
            company: lead.company,
            contact: name,
            title: title,
            email: email,
            linkedin: linkedin,
            totalFound: result.people.length,
            status: 'enriched'
          });
        } else {
          console.log(`   ⚠️  Found ${result.people.length} contacts but none with verified direct email`);
          enrichmentLog.push({
            row: lead.row,
            company: lead.company,
            status: 'no_verified_email',
            totalFound: result.people.length
          });
        }
      } else {
        console.log(`   ⚠️  No contacts found in Apollo for this firm`);
        enrichmentLog.push({
          row: lead.row,
          company: lead.company,
          status: 'not_found',
          totalFound: 0
        });
      }
      
      // Rate limiting: 1.5 seconds between requests
      await sleep(1500);
      
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
  const logPath = `enrichment-log-march13-1237pm.json`;
  fs.writeFileSync(logPath, JSON.stringify(enrichmentLog, null, 2));
  console.log(`📄 Enrichment log saved to ${logPath}`);
  
  // Step 6: Summary
  console.log('\n📊 ENRICHMENT SUMMARY');
  console.log('=' + '='.repeat(60));
  const enriched = enrichmentLog.filter(l => l.status === 'enriched').length;
  const notFound = enrichmentLog.filter(l => l.status === 'not_found').length;
  const noEmail = enrichmentLog.filter(l => l.status === 'no_verified_email').length;
  const errors = enrichmentLog.filter(l => l.status === 'error').length;
  
  console.log(`✅ Successfully enriched: ${enriched}`);
  console.log(`⚠️  No contacts found: ${notFound}`);
  console.log(`⚠️  No verified email: ${noEmail}`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`📋 Total processed: ${enrichmentLog.length}`);
  console.log(`📋 Remaining to enrich: ${needsEnrichment.length - toProcess.length}`);
  console.log();
  console.log('✅ Hourly enrichment run complete!');
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
