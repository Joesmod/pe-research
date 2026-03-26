const { google } = require('googleapis');
const https = require('https');
const fs = require('fs');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Apollo search function
async function apolloSearch(orgName, titles = ['Partner', 'Managing Director', 'VP', 'Director', 'Head of']) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      q_organization_name: orgName,
      person_titles: titles,
      page: 1,
      per_page: 10
    });

    const options = {
      hostname: 'api.apollo.io',
      path: '/api/v1/mixed_people/api_search',
      method: 'POST',
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(responseData));
          } catch (err) {
            reject(new Error(`Parse error: ${err.message}`));
          }
        } else {
          reject(new Error(`Apollo API ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Apollo enrich function to reveal full contact details
async function apolloEnrich(apolloId) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      id: apolloId,
      reveal_personal_emails: false,
      reveal_phone_number: false
    });

    const options = {
      hostname: 'api.apollo.io',
      path: '/api/v1/people/match',
      method: 'POST',
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(responseData));
          } catch (err) {
            reject(new Error(`Parse error: ${err.message}`));
          }
        } else {
          reject(new Error(`Apollo enrich ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('\n=== PE ENRICHMENT CRON - HOURLY RUN ===\n');
  console.log(`Started: ${new Date().toISOString()}\n`);

  // Auth
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Sheet1!A:K',
  });
  
  const rows = response.data.values;
  const headers = rows[0];
  
  const companyCol = headers.indexOf('Company Name');
  const contactCol = headers.indexOf('Contact Name');
  const titleCol = headers.indexOf('Title');
  const emailCol = headers.indexOf('Email');
  const websiteCol = headers.indexOf('Website');
  const linkedinCol = headers.indexOf('LinkedIn');
  const statusCol = headers.indexOf('Status');
  const notesCol = headers.indexOf('Notes');
  
  // Find enrichment targets
  const targets = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyCol] || '';
    const contact = row[contactCol] || '';
    const email = row[emailCol] || '';
    const status = row[statusCol] || '';
    
    // Skip dead leads
    if (status.includes('Dead Lead') || status.includes('Contacted')) {
      continue;
    }
    
    // Check if needs enrichment
    const needsContact = !contact || contact.trim() === '' || contact === 'Not identified';
    const hasGenericEmail = email && (
      email.toLowerCase().includes('info@') ||
      email.toLowerCase().includes('sales@') ||
      email.toLowerCase().includes('ir@') ||
      email.toLowerCase().includes('contact@')
    );
    const noEmail = !email || email.trim() === '';
    
    if (needsContact || hasGenericEmail || noEmail) {
      targets.push({
        rowIndex: i + 1,
        company,
        contact,
        email,
        status,
        row
      });
    }
  }
  
  console.log(`Found ${targets.length} enrichment targets (excluding Dead Leads)\n`);
  
  // Process first 10-15 targets
  const toProcess = targets.slice(0, 15);
  const enrichmentLog = [];
  const sheetUpdates = [];
  
  for (let i = 0; i < toProcess.length; i++) {
    const target = toProcess[i];
    console.log(`\n[${i + 1}/${toProcess.length}] ${target.company}`);
    console.log(`  Row: ${target.rowIndex}`);
    console.log(`  Current status: ${target.status}`);
    
    try {
      // Search Apollo
      const apolloResults = await apolloSearch(target.company);
      
      if (apolloResults.people && apolloResults.people.length > 0) {
        const searchPerson = apolloResults.people[0]; // Take first result
        
        // Enrich to reveal full details
        console.log(`  Enriching contact ID: ${searchPerson.id}`);
        const enriched = await apolloEnrich(searchPerson.id);
        
        if (!enriched.person) {
          console.log(`  ❌ Enrichment failed`);
          continue;
        }
        
        const person = enriched.person;
        const name = person.name || `${person.first_name} ${person.last_name}`.trim();
        const title = person.title || '';
        const email = person.email || '';
        const linkedin = person.linkedin_url || '';
        
        if (name && email && !email.includes('info@') && !email.includes('sales@')) {
          console.log(`  ✅ Found: ${name} (${title})`);
          console.log(`  Email: ${email}`);
          
          // Prepare sheet update
          const updateRow = target.row.slice(); // Copy row
          updateRow[contactCol] = name;
          updateRow[titleCol] = title;
          updateRow[emailCol] = email;
          if (linkedin) updateRow[linkedinCol] = linkedin;
          updateRow[statusCol] = 'Enriched';
          updateRow[notesCol] = (updateRow[notesCol] || '') + ` Apollo-verified ${new Date().toISOString().split('T')[0]}`;
          
          sheetUpdates.push({
            range: `Sheet1!A${target.rowIndex}:K${target.rowIndex}`,
            values: [updateRow]
          });
          
          enrichmentLog.push({
            company: target.company,
            contact: name,
            title,
            email,
            linkedin,
            source: 'Apollo',
            rowIndex: target.rowIndex
          });
        } else {
          console.log(`  ⚠️  Found contact but no verified email`);
        }
      } else {
        console.log(`  ❌ No contacts found`);
      }
      
      // Rate limit: ~1 req/sec
      await new Promise(resolve => setTimeout(resolve, 1200));
      
    } catch (err) {
      console.error(`  ❌ Error: ${err.message}`);
    }
  }
  
  // Write updates to sheet
  if (sheetUpdates.length > 0) {
    console.log(`\n\n=== UPDATING SHEET ===`);
    console.log(`Writing ${sheetUpdates.length} updates...\n`);
    
    for (const update of sheetUpdates) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: update.range,
        valueInputOption: 'RAW',
        resource: { values: update.values }
      });
      console.log(`✅ Updated ${update.range}`);
    }
  }
  
  // Save enrichment log
  const logFile = `enrichment-log-hourly-${new Date().toISOString().split('T')[0]}.json`;
  fs.writeFileSync(logFile, JSON.stringify(enrichmentLog, null, 2));
  
  console.log(`\n\n=== SUMMARY ===`);
  console.log(`Processed: ${toProcess.length} targets`);
  console.log(`Enriched: ${enrichmentLog.length} leads`);
  console.log(`Log saved: ${logFile}`);
  console.log(`\nCompleted: ${new Date().toISOString()}\n`);
}

main().catch(console.error);
