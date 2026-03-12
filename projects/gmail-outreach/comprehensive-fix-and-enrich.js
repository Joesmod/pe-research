const { google } = require('googleapis');
const https = require('https');

const apolloApiKey = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function searchOrgContacts(orgName) {
  const data = JSON.stringify({
    organization_name: orgName,
    person_titles: [
      "Managing Partner", "Partner", "Managing Director", 
      "Co-Founder", "Founder", "CEO", "CFO", "CTO", "COO", 
      "VP", "Vice President", "Director", "Head of"
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

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const fixes = [];
  const enrichments = [];
  
  console.log('=== PHASE 1: FIX MISALIGNED DATA ===\n');
  
  // Fix Row 285: Sentinel Capital Partners
  console.log('Fixing Row 285 (Sentinel Capital Partners)...');
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Sheet1!B285:E285',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [['', 'Patrick Knise', 'Managing Director', 'knise@sentinelpartners.com']]
    }
  });
  fixes.push({ row: 285, company: 'Sentinel Capital Partners' });
  console.log('  ✓ Fixed\n');
  
  // Fix Row 305: Bertram Capital
  console.log('Fixing Row 305 (Bertram Capital)...');
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Sheet1!B305:E305',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [['', 'Jeff Drazan', 'Managing Director', 'jeff@bcap.com']]
    }
  });
  fixes.push({ row: 305, company: 'Bertram Capital' });
  console.log('  ✓ Fixed\n');
  
  // Fix Row 276: Harkness Capital (move name from B to C)
  console.log('Fixing Row 276 (Harkness Capital Partners)...');
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Sheet1!B276:C276',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [['', 'Ian Handsman']]
    }
  });
  fixes.push({ row: 276, company: 'Harkness Capital Partners' });
  console.log('  ✓ Fixed\n');
  
  console.log('=== PHASE 2: ENRICH MISSING CONTACTS ===\n');
  
  // Enrich Row 176: Hg Capital (has contact name but missing email)
  console.log('Enriching Row 176 (Hg Capital)...');
  try {
    const result = await searchOrgContacts('Hg Capital');
    if (result.people && result.people.length > 0) {
      // Look for someone with a direct email
      const bestPerson = result.people.find(p => p.email && p.email.includes('@') && !p.email.startsWith('info@')) || result.people[0];
      if (bestPerson && bestPerson.email) {
        const fullName = `${bestPerson.first_name || ''} ${bestPerson.last_name || ''}`.trim();
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: 'Sheet1!C176:E176',
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[fullName, bestPerson.title || 'Vice President', bestPerson.email]]
          }
        });
        enrichments.push({ row: 176, company: 'Hg Capital', contact: fullName, email: bestPerson.email });
        console.log(`  ✓ Found: ${fullName} - ${bestPerson.email}\n`);
      } else {
        console.log('  ✗ No email found\n');
      }
    } else {
      console.log('  ✗ No results from Apollo\n');
    }
    await new Promise(resolve => setTimeout(resolve, 1100));
  } catch (error) {
    console.error(`  ✗ Error:`, error.message);
  }
  
  // Enrich Row 234: The Jordan Company
  console.log('Enriching Row 234 (The Jordan Company)...');
  try {
    const result = await searchOrgContacts('The Jordan Company');
    if (result.people && result.people.length > 0) {
      const bestPerson = result.people.find(p => p.email && p.email.includes('@') && !p.email.startsWith('info@')) || result.people[0];
      if (bestPerson && bestPerson.email) {
        const fullName = `${bestPerson.first_name || ''} ${bestPerson.last_name || ''}`.trim();
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: 'Sheet1!C234:E234',
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[fullName, bestPerson.title || '', bestPerson.email]]
          }
        });
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: 'Sheet1!J234',
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [['Enriched']] }
        });
        enrichments.push({ row: 234, company: 'The Jordan Company', contact: fullName, email: bestPerson.email });
        console.log(`  ✓ Found: ${fullName} - ${bestPerson.email}\n`);
      } else {
        console.log('  ✗ No email found\n');
      }
    } else {
      console.log('  ✗ No results from Apollo\n');
    }
    await new Promise(resolve => setTimeout(resolve, 1100));
  } catch (error) {
    console.error(`  ✗ Error:`, error.message);
  }
  
  // Enrich Row 493: 360 Equipment Finance
  console.log('Enriching Row 493 (360 Equipment Finance)...');
  try {
    const result = await searchOrgContacts('360 Equipment Finance');
    if (result.people && result.people.length > 0) {
      const bestPerson = result.people.find(p => p.email && p.email.includes('@')) || result.people[0];
      if (bestPerson && bestPerson.email) {
        const fullName = `${bestPerson.first_name || ''} ${bestPerson.last_name || ''}`.trim();
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: 'Sheet1!C493:E493',
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[fullName, bestPerson.title || 'Founder', bestPerson.email]]
          }
        });
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: 'Sheet1!J493',
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [['Enriched']] }
        });
        enrichments.push({ row: 493, company: '360 Equipment Finance', contact: fullName, email: bestPerson.email });
        console.log(`  ✓ Found: ${fullName} - ${bestPerson.email}\n`);
      } else {
        console.log('  ✗ No email found\n');
      }
    } else {
      console.log('  ✗ No results from Apollo\n');
    }
    await new Promise(resolve => setTimeout(resolve, 1100));
  } catch (error) {
    console.error(`  ✗ Error:`, error.message);
  }
  
  // Summary
  console.log('=== SUMMARY ===\n');
  console.log(`Fixed ${fixes.length} misaligned rows:`);
  fixes.forEach(f => console.log(`  - Row ${f.row}: ${f.company}`));
  console.log('');
  console.log(`Enriched ${enrichments.length} leads with new contacts:`);
  enrichments.forEach(e => console.log(`  - Row ${e.row}: ${e.company} - ${e.contact} (${e.email})`));
  
  const fs = require('fs');
  fs.writeFileSync('comprehensive-fix-results-march11-10pm.json', JSON.stringify({
    timestamp: new Date().toISOString(),
    fixes,
    enrichments
  }, null, 2));
  
  console.log('\n✓ Complete. Results saved to comprehensive-fix-results-march11-10pm.json');
}

main().catch(console.error);
