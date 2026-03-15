const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function main() {
  console.log('🔍 PE Research & Enrichment Cron - March 8, 5:06 AM\n');
  
  // Auth setup
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // Read the sheet
  console.log('📊 Reading PE Leads sheet...');
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:M',
  });

  const rows = response.data.values || [];
  const headers = rows[0];
  const data = rows.slice(1);

  // Map headers
  const colMap = {};
  headers.forEach((h, i) => { colMap[h] = i; });

  console.log(`Found ${data.length} total leads\n`);

  // Find leads needing enrichment
  const needsEnrichment = data.filter((row, idx) => {
    const company = row[colMap['Company']] || '';
    const contactName = row[colMap['Contact Name']] || '';
    const email = row[colMap['Email']] || '';
    const status = row[colMap['Status']] || '';
    
    // Skip if already enriched or dead
    if (status === 'Enriched' || status === 'Dead') return false;
    
    // Need enrichment if:
    // - Empty contact name, OR
    // - Empty/generic email (info@, sales@, ir@, contact@)
    const hasGenericEmail = email && /^(info|sales|ir|contact|admin|support|hello)@/i.test(email);
    const needsHelp = !contactName || !email || hasGenericEmail;
    
    return needsHelp && company;
  });

  console.log(`✅ Found ${needsEnrichment.length} leads needing enrichment\n`);

  if (needsEnrichment.length === 0) {
    console.log('No leads need enrichment at this time.');
    return;
  }

  // Process first 12 leads
  const batch = needsEnrichment.slice(0, 12);
  console.log(`🎯 Enriching ${batch.length} leads...\n`);

  const updates = [];

  for (const row of batch) {
    const company = row[colMap['Company']];
    const domain = row[colMap['Domain']];
    const rowIndex = data.indexOf(row) + 2; // +2 for header and 0-index

    console.log(`\n🔎 ${company} (${domain})`);

    if (!domain) {
      console.log('  ⚠️  No domain — skipping');
      continue;
    }

    // Apollo People Search API
    try {
      const searchBody = {
        api_key: APOLLO_API_KEY,
        q_organization_domains: domain,
        person_titles: [
          "CEO", "CTO", "COO", "CMO", "CFO",
          "Managing Partner", "Operating Partner", "General Partner", "Partner",
          "VP Technology", "VP Operations", "VP Digital",
          "Director Technology", "Director Operations", "Director Digital",
          "Head of Technology", "Head of Value Creation"
        ],
        page: 1,
        per_page: 5
      };

      const searchRes = await fetch('https://api.apollo.io/v1/mixed_people/search', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(searchBody)
      });

      const searchData = await searchRes.json();
      
      if (searchData.people && searchData.people.length > 0) {
        // Take first person found
        const person = searchData.people[0];
        const name = person.name || '';
        const title = person.title || '';
        const directEmail = person.email || '';
        const linkedIn = person.linkedin_url || '';

        console.log(`  ✅ Found: ${name} (${title})`);
        console.log(`     Email: ${directEmail}`);

        updates.push({
          range: `Sheet1!E${rowIndex}:H${rowIndex}`,
          values: [[name, title, directEmail, linkedIn]]
        });
        
        // Also update status
        updates.push({
          range: `Sheet1!I${rowIndex}`,
          values: [['Enriched']]
        });
      } else {
        console.log('  ❌ No contacts found via Apollo');
      }

      // Rate limit: 1 req/sec
      await new Promise(r => setTimeout(r, 1100));

    } catch (err) {
      console.log(`  ❌ Error: ${err.message}`);
    }
  }

  // Write updates to sheet
  if (updates.length > 0) {
    console.log(`\n📝 Applying ${updates.length} updates to sheet...`);
    
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    
    console.log('✅ Sheet updated successfully\n');
  } else {
    console.log('\n⚠️  No successful enrichments to write\n');
  }

  console.log('Done.');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
