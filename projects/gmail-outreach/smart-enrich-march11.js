const { google } = require('googleapis');
const https = require('https');
const fs = require('fs').promises;

const apolloApiKey = 'Fx6RpQS0PKxfVgnxWOPWuw';
const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Extract domain from URL
function extractDomain(url) {
  if (!url) return null;
  try {
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/\s]+)/);
    return match ? match[1].toLowerCase() : null;
  } catch {
    return null;
  }
}

// Apollo API search
async function searchApollo(firmName, domain) {
  const query = {
    q_organization_name: firmName,
    person_titles: ["Partner", "Managing Partner", "General Partner", "Managing Director", "CEO", "President", "Co-Founder", "Operating Partner"],
    page: 1,
    per_page: 10
  };
  
  if (domain) {
    query.organization_domains = [domain];
  }
  
  const data = JSON.stringify(query);
  const options = {
    hostname: 'api.apollo.io',
    port: 443,
    path: '/api/v1/mixed_people/search',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.write(data);
    req.end();
  });
}

async function smartEnrichment() {
  console.log('🫡 Smart PE Enrichment - March 11, 2026\n');
  
  // Read sheet
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:N'
  });
  
  const rows = response.data.values;
  const results = [];
  
  // Viable targets: has website, not dead, needs enrichment
  const viableTargets = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const firm = row[0];
    const contact = row[2];
    const email = row[4];
    const website = row[5];
    const status = row[9];
    
    if (!firm || !website || !website.startsWith('http')) continue;
    if (status && (status.toLowerCase().includes('dead') || status.toLowerCase().includes('not pe'))) continue;
    
    const hasGenericEmail = email && (
      email.toLowerCase().includes('info@') ||
      email.toLowerCase().includes('sales@') ||
      email.toLowerCase().includes('ir@')
    );
    
    const needsWork = !contact || !email || hasGenericEmail;
    
    if (needsWork) {
      viableTargets.push({
        rowIndex: i + 1,
        firm,
        contact,
        email,
        website,
        status: status || ''
      });
    }
  }
  
  console.log(`Found ${viableTargets.length} viable enrichment targets\n`);
  
  // Enrich up to 10-12 firms
  const toEnrich = viableTargets.slice(0, 12);
  
  for (const target of toEnrich) {
    console.log(`\n[${results.length + 1}/${toEnrich.length}] ${target.firm}`);
    console.log(`   Website: ${target.website}`);
    console.log(`   Current: ${target.contact || 'N/A'} | ${target.email || 'N/A'}`);
    
    const domain = extractDomain(target.website);
    const apolloResult = await searchApollo(target.firm, domain);
    
    if (apolloResult && apolloResult.people && apolloResult.people.length > 0) {
      // Find best contact (has email, senior title)
      const best = apolloResult.people.find(p => 
        p.email && 
        !p.email.includes('info@') && 
        !p.email.includes('sales@')
      ) || apolloResult.people[0];
      
      if (best && best.email) {
        const fullName = `${best.first_name} ${best.last_name || ''}`.trim();
        console.log(`   ✅ Found: ${fullName}`);
        console.log(`      Title: ${best.title || 'N/A'}`);
        console.log(`      Email: ${best.email}`);
        
        results.push({
          rowIndex: target.rowIndex,
          firm: target.firm,
          contact: fullName,
          title: best.title || '',
          email: best.email,
          linkedin: best.linkedin_url || '',
          notes: `Apollo enriched ${new Date().toISOString().split('T')[0]}`,
          status: 'Enriched'
        });
      } else {
        console.log(`   ⚠️ Found contacts but no direct emails`);
      }
    } else {
      console.log(`   ❌ No Apollo results`);
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  // Save results to file
  const resultsPath = './enrichment-results-march11-1137am.json';
  await fs.writeFile(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\n\n✅ Results saved to ${resultsPath}`);
  console.log(`📊 Enriched: ${results.length} firms\n`);
  
  // Batch update sheet (all updates in one API call per row to minimize writes)
  if (results.length > 0) {
    console.log('Updating Google Sheet...');
    
    const batchData = results.map(r => ({
      range: `Sheet1!C${r.rowIndex}:G${r.rowIndex}`,
      values: [[r.contact, r.title, r.email, '', r.linkedin]]
    }));
    
    const statusUpdates = results.map(r => ({
      range: `Sheet1!J${r.rowIndex}`,
      values: [[r.status]]
    }));
    
    const notesUpdates = results.map(r => ({
      range: `Sheet1!L${r.rowIndex}`,
      values: [[r.notes]]
    }));
    
    // Single batch update call
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      resource: {
        valueInputOption: 'RAW',
        data: [...batchData, ...statusUpdates, ...notesUpdates]
      }
    });
    
    console.log('✅ Sheet updated successfully!\n');
  }
  
  // Generate summary report
  const reportPath = './CRON-ENRICHMENT-MARCH11-1137AM.md';
  const report = `# PE Enrichment Cron - March 11, 2026 11:37 AM

## Summary
- **Viable Targets Identified**: ${viableTargets.length}
- **Enriched**: ${results.length} leads
- **Method**: Apollo API (smart search with domain filtering)

## Enrichment Results

${results.map((r, idx) => `### ${idx + 1}. ${r.firm} (Row ${r.rowIndex})
- **Contact**: ${r.contact}
- **Title**: ${r.title}
- **Email**: ${r.email}
- **LinkedIn**: ${r.linkedin || 'N/A'}
`).join('\n')}

${results.length === 0 ? '**No new enrichments found.** Most viable candidates either:\n- Already have contacts\n- Are marked as dead/inactive\n- Have no Apollo data available\n\n**Recommendation**: Focus on manual research for remaining leads with websites.' : ''}

## Next Steps
- Manual research for firms without Apollo data
- Review "Dead" status leads for potential re-activation
- Add new mid-market PE firms ($500M-$5B AUM) to pipeline

---
*Automated enrichment run*
`;
  
  await fs.writeFile(reportPath, report);
  console.log(`📄 Report saved: ${reportPath}\n`);
  
  return results;
}

smartEnrichment()
  .then(results => {
    console.log('🫡 Enrichment complete!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
