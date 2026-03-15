const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function main() {
  console.log('🔍 PE Research & Enrichment - Fixed Apollo Auth - March 8, 5:06 AM\n');
  
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

  const needsEnrichment = data
    .map((row, idx) => ({ row, idx: idx + 2 }))
    .filter(({ row }) => {
      const status = row[colMap['Status']] || '';
      const company = row[colMap['Company Name']] || '';
      const website = row[colMap['Website']] || '';
      
      return (status === 'New - Unresearched' || status === 'Partial') && company && website;
    });

  console.log(`✅ Found ${needsEnrichment.length} leads\n`);

  const batch = needsEnrichment.slice(0, 12);
  console.log(`🎯 Enriching ${batch.length} leads...\n`);

  const updates = [];
  const findings = [];

  for (const { row, idx: rowIndex } of batch) {
    const company = row[colMap['Company Name']];
    const website = row[colMap['Website']];
    
    console.log(`\n🔎 ${company}`);

    let domain = website;
    try {
      const url = new URL(website.startsWith('http') ? website : `https://${website}`);
      domain = url.hostname.replace('www.', '');
    } catch (e) {
      domain = website.replace('www.', '').replace(/^https?:\/\//, '').split('/')[0];
    }

    console.log(`   Domain: ${domain}`);

    try {
      // Step 1: Organization search
      const orgSearchBody = {
        q_organization_domains: [domain]
      };

      const orgRes = await fetch('https://api.apollo.io/v1/organizations/search', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Api-Key': APOLLO_API_KEY,
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(orgSearchBody)
      });

      if (!orgRes.ok) {
        const errorText = await orgRes.text();
        console.log(`  ⚠️  Org search: ${orgRes.status} - ${errorText.substring(0, 150)}`);
        await new Promise(r => setTimeout(r, 1100));
        continue;
      }

      const orgData = await orgRes.json();
      
      if (orgData.organizations && orgData.organizations.length > 0) {
        const org = orgData.organizations[0];
        console.log(`  ✓ Found org: ${org.name}`);

        // Step 2: People search at this organization
        const peopleSearchBody = {
          organization_ids: [org.id],
          person_seniorities: ["owner", "c_suite", "vp", "partner"],
          per_page: 10
        };

        const peopleRes = await fetch('https://api.apollo.io/v1/mixed_people/search', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-Api-Key': APOLLO_API_KEY,
            'Cache-Control': 'no-cache'
          },
          body: JSON.stringify(peopleSearchBody)
        });

        if (peopleRes.ok) {
          const peopleData = await peopleRes.json();

          if (peopleData.people && peopleData.people.length > 0) {
            // Prefer CEO/Managing Partner/President
            let person = peopleData.people.find(p => 
              p.title && /CEO|Managing Partner|Chief Executive|President/i.test(p.title)
            );
            if (!person) {
              person = peopleData.people.find(p => 
                p.title && /Chief|C-level|Partner/i.test(p.title)
              );
            }
            if (!person) person = peopleData.people[0];

            const name = person.name || '';
            const title = person.title || '';
            const directEmail = person.email || '';
            const linkedIn = person.linkedin_url || '';

            console.log(`  ✅ ${name}`);
            console.log(`     ${title}`);
            if (directEmail) console.log(`     ${directEmail}`);
            if (linkedIn) console.log(`     ${linkedIn.substring(0, 60)}`);

            // Update sheet
            updates.push({
              range: `Sheet1!C${rowIndex}:G${rowIndex}`,
              values: [[name, title, directEmail, website, linkedIn]]
            });
            
            updates.push({
              range: `Sheet1!J${rowIndex}`,
              values: [['Enriched - Apollo']]
            });

            findings.push({ company, name, title, email: directEmail });
          } else {
            console.log('  ⚠️  No people found');
            updates.push({
              range: `Sheet1!J${rowIndex}`,
              values: [['Researched']]
            });
          }
        } else {
          console.log(`  ⚠️  People search failed: ${peopleRes.status}`);
        }
      } else {
        console.log('  ⚠️  Org not found');
        updates.push({
          range: `Sheet1!J${rowIndex}`,
          values: [['Researched']]
        });
      }

      // Rate limit: ~1 req/sec
      await new Promise(r => setTimeout(r, 1200));

    } catch (err) {
      console.log(`  ❌ Error: ${err.message}`);
    }
  }

  // Apply updates
  if (updates.length > 0) {
    console.log(`\n\n📝 Applying ${updates.length} updates to sheet...`);
    
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    
    console.log('✅ Sheet updated');
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 ENRICHMENT SUMMARY');
  console.log('='.repeat(60));
  console.log(`Processed: ${batch.length}`);
  console.log(`Successfully enriched: ${findings.length}`);
  console.log(`Not found: ${batch.length - findings.length}`);
  
  if (findings.length > 0) {
    console.log('\n✅ Successfully enriched:');
    findings.forEach(f => {
      console.log(`  • ${f.company}`);
      console.log(`    → ${f.name} (${f.title})`);
      if (f.email) console.log(`    → ${f.email}`);
    });
  }

  console.log('\n✅ Cron job complete.');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
