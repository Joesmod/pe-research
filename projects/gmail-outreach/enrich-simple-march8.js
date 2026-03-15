const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function main() {
  console.log('🔍 PE Research & Enrichment - Simplified Apollo - March 8, 5:06 AM\n');
  
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

    // Simplified Apollo organization search
    try {
      const orgSearchBody = {
        api_key: APOLLO_API_KEY,
        q_organization_domains: [domain]
      };

      const orgRes = await fetch('https://api.apollo.io/v1/organizations/search', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(orgSearchBody)
      });

      if (!orgRes.ok) {
        const errorText = await orgRes.text();
        console.log(`  ⚠️  Apollo org search returned ${orgRes.status}: ${errorText.substring(0, 200)}`);
        await new Promise(r => setTimeout(r, 1100));
        continue;
      }

      const orgData = await orgRes.json();
      
      if (orgData.organizations && orgData.organizations.length > 0) {
        const org = orgData.organizations[0];
        console.log(`  ✓ Found org: ${org.name} (ID: ${org.id})`);

        // Now search for people at this organization
        const peopleSearchBody = {
          api_key: APOLLO_API_KEY,
          organization_ids: [org.id],
          person_seniorities: ["owner", "c_suite", "vp", "partner"],
          per_page: 10
        };

        const peopleRes = await fetch('https://api.apollo.io/v1/mixed_people/search', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
          body: JSON.stringify(peopleSearchBody)
        });

        if (peopleRes.ok) {
          const peopleData = await peopleRes.json();

          if (peopleData.people && peopleData.people.length > 0) {
            // Prefer CEO/Managing Partner
            let person = peopleData.people.find(p => 
              p.title && /CEO|Managing Partner|Chief|President/i.test(p.title)
            );
            if (!person) person = peopleData.people[0];

            const name = person.name || '';
            const title = person.title || '';
            const directEmail = person.email || '';
            const linkedIn = person.linkedin_url || '';

            console.log(`  ✅ Found: ${name}`);
            console.log(`     Title: ${title}`);
            console.log(`     Email: ${directEmail || '(none)'}`);

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
            console.log('  ❌ No people found');
            updates.push({
              range: `Sheet1!J${rowIndex}`,
              values: [['Researched']]
            });
          }
        } else {
          console.log(`  ⚠️  People search failed: ${peopleRes.status}`);
        }
      } else {
        console.log('  ❌ Organization not found in Apollo');
        updates.push({
          range: `Sheet1!J${rowIndex}`,
          values: [['Researched']]
        });
      }

      await new Promise(r => setTimeout(r, 1200));

    } catch (err) {
      console.log(`  ❌ Error: ${err.message}`);
    }
  }

  if (updates.length > 0) {
    console.log(`\n\n📝 Applying ${updates.length} updates...`);
    
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    
    console.log('✅ Sheet updated');
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`Processed: ${batch.length}`);
  console.log(`Enriched: ${findings.length}`);
  
  if (findings.length > 0) {
    console.log('\n✅ Enriched:');
    findings.forEach(f => {
      console.log(`  • ${f.company}: ${f.name} (${f.title})`);
    });
  }

  console.log('\n✅ Done.');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
