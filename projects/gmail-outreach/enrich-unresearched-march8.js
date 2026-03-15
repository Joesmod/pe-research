const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function main() {
  console.log('🔍 PE Research & Enrichment - Targeting Unresearched - March 8, 5:06 AM\n');
  
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  console.log('📊 Reading PE Leads sheet...');
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:M',
  });

  const rows = response.data.values || [];
  const headers = rows[0];
  const data = rows.slice(1);

  const colMap = {};
  headers.forEach((h, i) => { colMap[h] = i; });

  console.log(`Found ${data.length} total leads\n`);

  // Find "New - Unresearched" and "Partial" leads
  const needsEnrichment = data
    .map((row, idx) => ({ row, idx: idx + 2 }))
    .filter(({ row }) => {
      const status = row[colMap['Status']] || '';
      const company = row[colMap['Company Name']] || '';
      const website = row[colMap['Website']] || '';
      
      return (status === 'New - Unresearched' || status === 'Partial') && company && website;
    });

  console.log(`✅ Found ${needsEnrichment.length} leads needing enrichment (New - Unresearched + Partial)\n`);

  if (needsEnrichment.length === 0) {
    console.log('No unresearched leads at this time.');
    return;
  }

  // Process first 12 leads
  const batch = needsEnrichment.slice(0, 12);
  console.log(`🎯 Enriching ${batch.length} leads...\n`);

  const updates = [];
  const findings = [];

  for (const { row, idx: rowIndex } of batch) {
    const company = row[colMap['Company Name']];
    const website = row[colMap['Website']];
    
    console.log(`\n🔎 ${company}`);
    console.log(`   ${website}`);

    // Extract domain from website
    let domain = website;
    try {
      const url = new URL(website.startsWith('http') ? website : `https://${website}`);
      domain = url.hostname.replace('www.', '');
    } catch (e) {
      domain = website.replace('www.', '').replace(/^https?:\/\//, '');
    }

    // Apollo People Search API
    try {
      const searchBody = {
        api_key: APOLLO_API_KEY,
        q_organization_domains: domain,
        person_titles: [
          "CEO", "Managing Partner", "Operating Partner", "General Partner", 
          "CTO", "COO", "CFO", "Chief Investment Officer",
          "Partner", "VP Technology", "VP Operations", "VP Digital Transformation",
          "Director Technology", "Director Operations", "Director Portfolio Operations",
          "Head of Technology", "Head of Value Creation", "Head of Portfolio Operations"
        ],
        page: 1,
        per_page: 10
      };

      const searchRes = await fetch('https://api.apollo.io/v1/mixed_people/search', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(searchBody)
      });

      if (!searchRes.ok) {
        console.log(`  ⚠️  Apollo API returned ${searchRes.status}`);
        await new Promise(r => setTimeout(r, 1100));
        continue;
      }

      const searchData = await searchRes.json();
      
      if (searchData.people && searchData.people.length > 0) {
        // Prefer C-level or Managing Partner, otherwise take first
        let person = searchData.people.find(p => 
          p.title && /CEO|Managing Partner|Chief|President/i.test(p.title)
        );
        if (!person) person = searchData.people[0];

        const name = person.name || '';
        const title = person.title || '';
        const directEmail = person.email || '';
        const linkedIn = person.linkedin_url || '';

        console.log(`  ✅ Found: ${name}`);
        console.log(`     Title: ${title}`);
        console.log(`     Email: ${directEmail || '(none)'}`);
        if (linkedIn) console.log(`     LinkedIn: ${linkedIn}`);

        // Update Contact Name, Title, Email, LinkedIn
        updates.push({
          range: `Sheet1!C${rowIndex}:G${rowIndex}`,
          values: [[name, title, directEmail, website, linkedIn]]
        });
        
        // Update status to "Enriched - Apollo"
        updates.push({
          range: `Sheet1!J${rowIndex}`,
          values: [['Enriched - Apollo']]
        });

        findings.push({
          company,
          name,
          title,
          email: directEmail,
          linkedIn,
          source: 'Apollo API'
        });
      } else {
        console.log('  ❌ No contacts found via Apollo');
        
        // Mark as "Researched" (needs manual follow-up)
        updates.push({
          range: `Sheet1!J${rowIndex}`,
          values: [['Researched']]
        });
      }

      // Rate limit: 1 req/sec
      await new Promise(r => setTimeout(r, 1100));

    } catch (err) {
      console.log(`  ❌ Error: ${err.message}`);
    }
  }

  // Write updates to sheet
  if (updates.length > 0) {
    console.log(`\n\n📝 Applying ${updates.length} updates to sheet...`);
    
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    
    console.log('✅ Sheet updated successfully');
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 ENRICHMENT SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total processed: ${batch.length}`);
  console.log(`Successful enrichments: ${findings.length}`);
  console.log(`Not found: ${batch.length - findings.length}`);
  
  if (findings.length > 0) {
    console.log('\n✅ Successfully enriched:');
    findings.forEach(f => {
      console.log(`  • ${f.company}: ${f.name} (${f.title}) - ${f.email || 'no email'}`);
    });
  }

  console.log('\n✅ Done.');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
