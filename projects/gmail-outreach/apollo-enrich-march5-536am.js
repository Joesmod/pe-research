const https = require('https');
const fs = require('fs');
const { google } = require('googleapis');
const key = require('./service-account.json');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const jwtClient = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  ['https://www.googleapis.com/auth/spreadsheets']
);

const sheets = google.sheets({ version: 'v4', auth: jwtClient });

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function apolloPeopleSearch(companyName, website) {
  return new Promise((resolve, reject) => {
    const domain = website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '').split('/')[0];
    
    const data = JSON.stringify({
      q_organization_domains: [domain],
      page: 1,
      per_page: 10,
      person_titles: [
        "CEO", "Chief Executive Officer",
        "Managing Partner", "Managing Director",
        "General Partner", "Operating Partner",
        "Partner", "Senior Partner",
        "COO", "Chief Operating Officer",
        "CTO", "Chief Technology Officer",
        "VP Technology", "VP Operations",
        "VP Digital", "VP Portfolio Operations",
        "Director Technology", "Director Operations",
        "Head of Technology", "Head of Operations"
      ]
    });

    const options = {
      hostname: 'api.apollo.io',
      port: 443,
      path: '/v1/mixed_people/search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'X-Api-Key': APOLLO_API_KEY
      }
    };

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

async function enrichFirm(firm) {
  console.log(`\n=== Enriching: ${firm.company} ===`);
  console.log(`Website: ${firm.website}`);
  
  try {
    const result = await apolloPeopleSearch(firm.company, firm.website);
    
    if (!result.people || result.people.length === 0) {
      console.log('❌ No contacts found');
      return null;
    }
    
    // Find best contact - prioritize Partners and MDs with verified emails
    const candidates = result.people.filter(p => p.email && p.email_status === 'verified');
    
    if (candidates.length === 0) {
      console.log('⚠️ No verified emails found');
      return null;
    }
    
    // Sort by title priority
    const titlePriority = {
      'ceo': 10, 'chief executive': 10,
      'managing partner': 9, 'managing director': 9,
      'general partner': 8, 'operating partner': 8,
      'partner': 7, 'senior partner': 7,
      'coo': 6, 'chief operating': 6,
      'cto': 6, 'chief technology': 6,
      'vp': 5, 'vice president': 5,
      'director': 4,
      'head': 3
    };
    
    candidates.sort((a, b) => {
      const aScore = Object.keys(titlePriority).reduce((score, keyword) => {
        return (a.title || '').toLowerCase().includes(keyword) ? Math.max(score, titlePriority[keyword]) : score;
      }, 0);
      const bScore = Object.keys(titlePriority).reduce((score, keyword) => {
        return (b.title || '').toLowerCase().includes(keyword) ? Math.max(score, titlePriority[keyword]) : score;
      }, 0);
      return bScore - aScore;
    });
    
    const bestContact = candidates[0];
    
    console.log(`✅ Found: ${bestContact.name}`);
    console.log(`   Title: ${bestContact.title}`);
    console.log(`   Email: ${bestContact.email} (${bestContact.email_status})`);
    console.log(`   LinkedIn: ${bestContact.linkedin_url || 'N/A'}`);
    
    return {
      company: firm.company,
      contactName: bestContact.name,
      title: bestContact.title,
      email: bestContact.email,
      linkedin: bestContact.linkedin_url || '',
      source: 'Apollo.io verified'
    };
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return null;
  }
}

async function updateSheet(enrichedContacts) {
  console.log('\n=== Updating Google Sheet ===\n');
  
  // Read current sheet
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:J'
  });
  
  const rows = res.data.values;
  const updates = [];
  
  for (const contact of enrichedContacts) {
    if (!contact) continue;
    
    // Find row for this company
    const rowIndex = rows.findIndex(row => row[0] === contact.company);
    
    if (rowIndex === -1) {
      console.log(`⚠️ Could not find row for ${contact.company}`);
      continue;
    }
    
    // Update row (A1 notation starts at 1, arrays start at 0, so +1)
    const rowNum = rowIndex + 1;
    
    updates.push({
      range: `Sheet1!C${rowNum}:G${rowNum}`,
      values: [[
        contact.contactName,
        contact.title,
        contact.email,
        '', // Keep existing website
        contact.linkedin
      ]]
    });
    
    // Update status to Enriched
    updates.push({
      range: `Sheet1!J${rowNum}`,
      values: [['Enriched']]
    });
    
    console.log(`✅ Queued update for ${contact.company} (Row ${rowNum})`);
  }
  
  // Batch update
  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    console.log(`\n✅ Updated ${updates.length / 2} firms in Google Sheet`);
  }
}

async function main() {
  console.log('=== PE Enrichment - March 5, 5:36 AM ===\n');
  
  // Read targets
  const targets = JSON.parse(fs.readFileSync('./enrichment-targets-real-pe-march5-536am.json', 'utf8'));
  
  console.log(`Processing ${targets.length} firms\n`);
  
  const enrichedContacts = [];
  
  for (let i = 0; i < targets.length; i++) {
    const firm = targets[i];
    
    // Skip if no website
    if (!firm.website || firm.website === 'N/A') {
      console.log(`⚠️ Skipping ${firm.company} - no website`);
      continue;
    }
    
    const enriched = await enrichFirm(firm);
    
    if (enriched) {
      enrichedContacts.push(enriched);
    }
    
    // Rate limit - wait 2 seconds between requests
    if (i < targets.length - 1) {
      await sleep(2000);
    }
  }
  
  console.log(`\n=== Enrichment Complete ===`);
  console.log(`Successful: ${enrichedContacts.length}/${targets.length}`);
  
  // Save results
  fs.writeFileSync(
    './apollo-enrichment-march5-536am.json',
    JSON.stringify(enrichedContacts, null, 2)
  );
  
  // Update Google Sheet
  if (enrichedContacts.length > 0) {
    await updateSheet(enrichedContacts);
  }
  
  console.log('\n✅ Done!');
}

main().catch(console.error);
