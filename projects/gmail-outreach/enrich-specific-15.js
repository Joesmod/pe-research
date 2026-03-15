const { google } = require('googleapis');
const https = require('https');

const apolloApiKey = 'Fx6RpQS0PKxfVgnxWOPWuw';
const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Target rows from read-sheet.js output
const targetRows = [161, 176, 220, 223, 234, 261, 276, 282, 283, 285, 286, 300, 305, 306, 307];

// Apollo API search - wide net for decision-makers
async function searchApollo(orgName) {
  const data = JSON.stringify({
    q_organization_name: orgName,
    person_titles: [
      'CEO', 'President', 'Managing Partner', 'General Partner', 'Partner',
      'Chief Operating Officer', 'COO', 'CTO', 'Chief Technology Officer',
      'Managing Director', 'Director', 'VP Technology', 'VP Operations',
      'VP Digital', 'Head of Technology', 'Head of Operations',
      'Head of Portfolio Operations', 'Director of Technology',
      'Chief Marketing Officer', 'CMO', 'Chief Financial Officer', 'CFO',
      'Head of Value Creation', 'Head of Business Development',
      'VP Portfolio Operations', 'VP Digital Transformation'
    ],
    page: 1,
    per_page: 15
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

// Initialize Google Sheets
async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  return google.sheets({ version: 'v4', auth });
}

// Read sheet data
async function readSheet(sheets) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:N'
  });
  return response.data.values || [];
}

// Update row with enriched data
async function updateRow(sheets, rowIndex, contact, title, email, linkedin, status, notes) {
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    resource: {
      data: [
        { range: `Sheet1!C${rowIndex}`, values: [[contact]] },
        { range: `Sheet1!D${rowIndex}`, values: [[title]] },
        { range: `Sheet1!E${rowIndex}`, values: [[email]] },
        { range: `Sheet1!G${rowIndex}`, values: [[linkedin || 'N/A']] },
        { range: `Sheet1!J${rowIndex}`, values: [[status]] },
        { range: `Sheet1!L${rowIndex}`, values: [[notes]] }
      ],
      valueInputOption: 'RAW'
    }
  });
}

// Main enrichment
async function enrichSpecific() {
  console.log('🎯 Enriching 15 Specific Firms - March 11, 2026 (3:07 PM)\n');
  
  const sheets = await getSheets();
  const rows = await readSheet(sheets);
  
  let enriched = 0;
  let failed = 0;
  const results = [];
  
  for (const rowIndex of targetRows) {
    const row = rows[rowIndex - 1];
    if (!row) continue;
    
    const company = row[0];
    console.log(`\n━━━ Row ${rowIndex}: ${company} ━━━`);
    
    try {
      console.log(`  🔎 Searching Apollo...`);
      const apolloResult = await searchApollo(company);
      
      if (apolloResult.people && apolloResult.people.length > 0) {
        // Filter for verified, direct emails
        const withEmail = apolloResult.people.filter(p => 
          p.email && 
          !p.email.includes('info@') && 
          !p.email.includes('general@') &&
          !p.email.includes('ir@') &&
          !p.email.includes('contact@') &&
          (p.email_status === 'verified' || p.email_status === 'likely_to_engage')
        );
        
        if (withEmail.length > 0) {
          const person = withEmail[0];
          const contact = `${person.first_name} ${person.last_name}`;
          const title = person.title || 'N/A';
          const email = person.email;
          const linkedin = person.linkedin_url || 'N/A';
          
          console.log(`  ✅ Found: ${contact} (${title})`);
          console.log(`     📧 ${email}`);
          
          await updateRow(sheets, rowIndex, contact, title, email, linkedin, 
            'Enriched', `Apollo verified: ${new Date().toISOString().split('T')[0]}`);
          
          enriched++;
          results.push({ company, contact, title, email, status: 'enriched' });
        } else {
          console.log(`  ⚠️  Found people but no verified direct emails`);
          await updateRow(sheets, rowIndex, '', '', '', '', 
            'Needs Manual Research', 'Apollo: People found but no direct emails');
          failed++;
          results.push({ company, status: 'manual' });
        }
      } else {
        console.log(`  ❌ No people found in Apollo`);
        await updateRow(sheets, rowIndex, '', '', '', '', 
          'Needs Manual Research', 'Apollo: No results');
        failed++;
        results.push({ company, status: 'manual' });
      }
      
      // Rate limit: wait 2 seconds between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      failed++;
      results.push({ company, status: 'error', error: error.message });
    }
  }
  
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 ENRICHMENT SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`✅ Successfully enriched: ${enriched}`);
  console.log(`📝 Needs manual research: ${failed}`);
  console.log(`📊 Total processed: ${targetRows.length}\n`);
  
  // Save results to file
  const fs = require('fs');
  fs.writeFileSync('enrichment-results-march11-307pm.json', JSON.stringify(results, null, 2));
  
  console.log('✅ Results saved to enrichment-results-march11-307pm.json');
  console.log(`📅 ${new Date().toLocaleString()}`);
}

enrichSpecific().catch(console.error);
