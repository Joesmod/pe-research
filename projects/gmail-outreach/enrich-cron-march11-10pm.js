const { google } = require('googleapis');
const https = require('https');

const apolloApiKey = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function searchOrgContacts(orgName) {
  const data = JSON.stringify({
    organization_name: orgName,
    person_titles: [
      "Managing Partner", "Partner", "Managing Director", 
      "Co-Founder", "Founder", "CEO", "CFO", "CTO", "COO", 
      "VP", "Director", "Head of"
    ],
    page: 1,
    per_page: 10
  });

  const options = {
    hostname: 'api.apollo.io',
    port: 443,
    path: '/api/v1/mixed_people/search',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'X-Api-Key': apolloApiKey,
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function enrichLeads() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Read sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A1:P500'
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found');
    return;
  }
  
  // Find enrichable leads (same logic as before)
  const targets = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contact = row[2] || '';
    const email = row[4] || '';
    const status = row[9] || '';
    
    if (status.toLowerCase().includes('dead') || 
        status.toLowerCase().includes('inactive') ||
        status.toLowerCase().includes('acquired') ||
        status.toLowerCase().includes('merged') ||
        status.toLowerCase().includes('enriched')) {
      continue;
    }
    
    const emptyContact = !contact || contact.trim() === '';
    const emptyEmail = !email || email.trim() === '';
    const genericEmail = email && (
      email.toLowerCase().startsWith('info@') ||
      email.toLowerCase().startsWith('ir@') ||
      email.toLowerCase().startsWith('sales@') ||
      email.toLowerCase().startsWith('contact@')
    );
    
    const needsEnrichment = emptyContact || emptyEmail || genericEmail;
    
    if (needsEnrichment && company) {
      targets.push({ row: i + 1, company, contact, email });
    }
  }
  
  // Take first 10-15
  const toEnrich = targets.slice(0, 15);
  
  console.log(`\n=== ENRICHING ${toEnrich.length} LEADS ===\n`);
  
  const updates = [];
  const enriched = [];
  
  for (const target of toEnrich) {
    console.log(`\nSearching for contacts at: ${target.company} (Row ${target.row})`);
    
    try {
      const result = await searchOrgContacts(target.company);
      
      if (result.people && result.people.length > 0) {
        // Take the first person with an email
        let bestPerson = null;
        for (const person of result.people) {
          if (person.email && person.email.includes('@') && 
              !person.email.toLowerCase().startsWith('info@') &&
              !person.email.toLowerCase().startsWith('ir@')) {
            bestPerson = person;
            break;
          }
        }
        
        if (!bestPerson && result.people[0]) {
          bestPerson = result.people[0];
        }
        
        if (bestPerson) {
          const fullName = `${bestPerson.first_name || ''} ${bestPerson.last_name || ''}`.trim();
          const title = bestPerson.title || '';
          const email = bestPerson.email || '';
          const linkedin = bestPerson.linkedin_url || '';
          
          console.log(`  ✓ Found: ${fullName} - ${title}`);
          console.log(`    Email: ${email || 'N/A'}`);
          console.log(`    LinkedIn: ${linkedin || 'N/A'}`);
          
          // Prepare update for row
          // Columns: A=Company, B=Position, C=Contact Name, D=Title, E=Email, F=Website, G=LinkedIn, H=AUM, I=Focus, J=Status
          const rowRange = `Sheet1!C${target.row}:G${target.row}`;
          const rowUpdate = [[fullName, title, email, '', linkedin]];
          
          updates.push({ range: rowRange, values: rowUpdate });
          enriched.push({
            company: target.company,
            contact: fullName,
            title,
            email,
            linkedin,
            row: target.row
          });
        } else {
          console.log(`  ✗ No valid contacts found`);
        }
      } else {
        console.log(`  ✗ No results from Apollo`);
      }
      
      // Rate limit: 1 request per second
      await new Promise(resolve => setTimeout(resolve, 1100));
      
    } catch (error) {
      console.error(`  ✗ Error searching ${target.company}:`, error.message);
    }
  }
  
  // Apply all updates
  if (updates.length > 0) {
    console.log(`\n=== UPDATING SHEET (${updates.length} rows) ===\n`);
    
    for (const update of updates) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: update.range,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: update.values }
      });
      console.log(`Updated ${update.range}`);
    }
    
    // Also update Status column to "Enriched"
    for (const item of enriched) {
      const statusRange = `Sheet1!J${item.row}`;
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: statusRange,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [['Enriched']] }
      });
    }
  }
  
  // Write summary
  const fs = require('fs');
  const summary = {
    timestamp: new Date().toISOString(),
    enriched: enriched.length,
    details: enriched
  };
  
  fs.writeFileSync('enrichment-results-march11-10pm.json', JSON.stringify(summary, null, 2));
  
  console.log(`\n=== ENRICHMENT COMPLETE ===`);
  console.log(`Enriched ${enriched.length} leads`);
  console.log(`Results saved to: enrichment-results-march11-10pm.json`);
  
  return summary;
}

enrichLeads().catch(console.error);
