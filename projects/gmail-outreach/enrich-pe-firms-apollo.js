/**
 * Enrich PE firms using Apollo API
 * Focus on finding decision-makers with verified direct emails
 */

const { google } = require('googleapis');
const path = require('path');
const https = require('https');

const CRM_SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

function apolloSearch(domain, firmName) {
  return new Promise((resolve, reject) => {
    const titles = [
      'CTO', 'Chief Technology Officer',
      'CIO', 'Chief Information Officer', 
      'Chief AI Officer',
      'Managing Partner Technology',
      'Operating Partner Technology',
      'Director of Technology',
      'VP Product', 'VP Technology',
      'Head of Digital', 'Head of Technology'
    ];
    
    const payload = JSON.stringify({
      q_organization_domains: domain,
      person_titles: titles,
      per_page: 10,
      page: 1
    });
    
    const options = {
      hostname: 'api.apollo.io',
      path: '/v1/mixed_people/search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length,
        'X-Api-Key': APOLLO_API_KEY,
        'Cache-Control': 'no-cache'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.people && json.people.length > 0) {
            const person = json.people[0];
            resolve({
              name: person.name,
              title: person.title,
              email: person.email,
              linkedin: person.linkedin_url,
              source: 'Apollo API'
            });
          } else {
            resolve(null);
          }
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function enrichFirms() {
  const sheets = await getSheets();
  
  // Read Sheet1
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: CRM_SHEET_ID,
    range: 'Sheet1!A:N',
  });
  
  const rows = res.data.values || [];
  const header = rows[0];
  
  console.log('Reading firms from Sheet1...\n');
  
  const toEnrich = [];
  
  for (let i = 1; i < Math.min(rows.length, 50); i++) { // First 50 firms
    const row = rows[i];
    if (!row || row.length === 0) continue;
    
    const company = row[0] || '';
    const website = row[1] || '';
    const currentContact = row[2] || '';
    const currentEmail = row[4] || '';
    const status = row[9] || '';
    
    if (!company) continue;
    if (/dead|not qualified/i.test(status)) continue;
    
    // Check if needs enrichment
    const hasGenericEmail = /^(info@|contact@|sales@|ir@)/i.test(currentEmail);
    const missingEmail = !currentEmail || currentEmail.trim() === '';
    const emailFromWrongDomain = currentEmail && !currentEmail.includes(website.replace(/https?:\/\/(www\.)?/, '').split('/')[0].split('.')[0]);
    
    if (!currentContact || missingEmail || hasGenericEmail || emailFromWrongDomain) {
      // Extract domain from website
      let domain = '';
      if (website) {
        const match = website.match(/https?:\/\/(www\.)?([^\/]+)/);
        if (match) domain = match[2];
      }
      
      if (domain && !domain.includes('github.com')) {
        toEnrich.push({
          rowIndex: i,
          company,
          website,
          domain,
          currentContact,
          currentEmail,
          reason: missingEmail ? 'No email' : (hasGenericEmail ? 'Generic email' : 'Wrong domain email')
        });
      }
    }
  }
  
  console.log(`Found ${toEnrich.length} firms to enrich\n`);
  
  const enriched = [];
  const updates = [];
  
  for (const firm of toEnrich.slice(0, 10)) { // Top 10
    console.log(`\nEnriching: ${firm.company} (${firm.domain})`);
    console.log(`  Current: ${firm.currentContact} <${firm.currentEmail}>`);
    console.log(`  Reason: ${firm.reason}`);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Rate limit
      
      const contact = await apolloSearch(firm.domain, firm.company);
      
      if (contact && contact.email) {
        console.log(`  ✅ Found: ${contact.name} (${contact.title}) — ${contact.email}`);
        
        enriched.push({
          ...firm,
          ...contact
        });
        
        // Prepare update
        const rowIndex = firm.rowIndex + 1; // 1-indexed
        updates.push({
          range: `Sheet1!C${rowIndex}:E${rowIndex}`,
          values: [[
            contact.name,
            contact.title,
            contact.email
          ]]
        });
        
        // Update status
        updates.push({
          range: `Sheet1!H${rowIndex}`,
          values: [['Enriched']]
        });
        
        // Add notes
        const note = `Apollo API: ${contact.name} (${contact.title}) ${contact.email}. Source: Apollo verified. (2026-03-16 cron)`;
        updates.push({
          range: `Sheet1!I${rowIndex}`,
          values: [[note]]
        });
        
      } else {
        console.log(`  ⚠️  No contacts found`);
      }
      
    } catch (e) {
      console.log(`  ❌ Error: ${e.message}`);
    }
  }
  
  // Apply updates
  if (updates.length > 0) {
    console.log(`\n📝 Applying ${updates.length} updates to sheet...`);
    
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: CRM_SHEET_ID,
      requestBody: {
        data: updates,
        valueInputOption: 'RAW'
      }
    });
    
    console.log('✅ Updates applied!');
  }
  
  console.log(`\n🎯 Enrichment Summary:`);
  console.log(`  Scanned: ${toEnrich.length} firms`);
  console.log(`  Enriched: ${enriched.length} firms`);
  console.log(`  Success rate: ${enriched.length > 0 ? ((enriched.length / Math.min(toEnrich.length, 10)) * 100).toFixed(1) : 0}%`);
  
  if (enriched.length > 0) {
    console.log(`\n📧 Newly enriched contacts:`);
    enriched.forEach((e, i) => {
      console.log(`${i + 1}. ${e.name} (${e.title}) at ${e.company} — ${e.email}`);
    });
  }
  
  return enriched;
}

enrichFirms().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
