const { google } = require('googleapis');
const https = require('https');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const MAX_ENRICHMENTS = 15;

// Apollo API helper
function apolloRequest(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ ...body, api_key: APOLLO_API_KEY });
    
    const options = {
      hostname: 'api.apollo.io',
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': APOLLO_API_KEY
      }
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => { responseBody += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(responseBody));
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Search for decision-makers at a firm
async function findDecisionMaker(firmName, domain) {
  console.log(`\n🔍 Searching for decision-makers at ${firmName}...`);
  
  const titles = [
    'CEO', 'Chief Executive Officer',
    'Managing Partner', 'General Partner', 'Operating Partner',
    'President', 'COO', 'Chief Operating Officer',
    'CTO', 'Chief Technology Officer',
    'VP Technology', 'VP Operations', 'VP Digital',
    'Director of Technology', 'Director of Operations'
  ];
  
  try {
    const searchBody = {
      q_organization_name: firmName,
      per_page: 10,
      page: 1
    };
    
    if (domain) {
      searchBody.organization_domains = [domain];
    }
    
    const results = await apolloRequest('/api/v1/mixed_people/search', searchBody);
    
    if (!results.people || results.people.length === 0) {
      console.log('❌ No people found');
      return null;
    }
    
    console.log(`✅ Found ${results.people.length} people`);
    
    // Try to enrich the first few promising candidates
    for (const person of results.people.slice(0, 5)) {
      // Prioritize by title
      const title = (person.title || '').toLowerCase();
      const isHighPriority = titles.some(t => title.includes(t.toLowerCase()));
      
      if (!isHighPriority && results.people.length > 1) continue;
      
      console.log(`   📧 Enriching: ${person.name} (${person.title || 'No title'})`);
      
      try {
        const enrichBody = { id: person.id };
        const enriched = await apolloRequest('/api/v1/people/match', enrichBody);
        
        if (enriched.person && enriched.person.email) {
          const p = enriched.person;
          console.log(`   ✅ Found verified email: ${p.email}`);
          
          return {
            name: p.name,
            title: p.title || '',
            email: p.email,
            linkedin: p.linkedin_url || '',
            source: 'Apollo.io'
          };
        }
      } catch (e) {
        console.log(`   ⚠️ Enrichment failed: ${e.message}`);
      }
      
      // Rate limit protection
      await new Promise(resolve => setTimeout(resolve, 600));
    }
    
    console.log('❌ No verified email found');
    return null;
    
  } catch (error) {
    console.error(`❌ Error searching: ${error.message}`);
    return null;
  }
}

// Main enrichment function
async function enrichLeads() {
  console.log('🚀 Starting PE Lead Enrichment Cron (March 9, 3:06 PM)\n');
  console.log('═'.repeat(80));
  
  // Step 1: Read the sheet
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:J'
  });
  
  const rows = res.data.values;
  if (!rows || rows.length === 0) {
    console.log('❌ No data found in sheet');
    return;
  }

  const headers = rows[0];
  const dataRows = rows.slice(1);
  
  console.log(`\n📊 Sheet has ${dataRows.length} total rows\n`);
  
  // Step 2: Identify leads needing enrichment
  const needsEnrichment = [];
  
  dataRows.forEach((row, index) => {
    const firm = row[0] || '';
    const website = row[1] || '';
    const contactName = row[2] || '';
    const email = row[4] || '';
    const status = row[8] || '';
    
    const hasGenericEmail = email && (
      email.toLowerCase().startsWith('info@') ||
      email.toLowerCase().startsWith('sales@') ||
      email.toLowerCase().startsWith('ir@') ||
      email.toLowerCase().startsWith('admin@') ||
      email.toLowerCase().startsWith('contact@')
    );
    
    const isDead = status.toLowerCase().includes('dead');
    
    if (!isDead && firm.trim() && (
      !contactName.trim() || 
      !email.trim() || 
      hasGenericEmail
    )) {
      needsEnrichment.push({
        rowIndex: index + 2,
        firm,
        website,
        contactName,
        email,
        status
      });
    }
  });
  
  console.log(`🎯 Found ${needsEnrichment.length} leads needing enrichment\n`);
  console.log(`   Priority targets (will enrich ${Math.min(MAX_ENRICHMENTS, needsEnrichment.length)}):\n`);
  
  // Show first 15
  needsEnrichment.slice(0, MAX_ENRICHMENTS).forEach((lead, i) => {
    console.log(`   ${i + 1}. ${lead.firm} (Row ${lead.rowIndex})`);
  });
  
  console.log('\n' + '═'.repeat(80) + '\n');
  
  // Step 3: Enrich each lead
  const enrichments = [];
  const updates = [];
  
  for (let i = 0; i < Math.min(MAX_ENRICHMENTS, needsEnrichment.length); i++) {
    const lead = needsEnrichment[i];
    console.log(`\n[${ i + 1}/${Math.min(MAX_ENRICHMENTS, needsEnrichment.length)}] Processing: ${lead.firm}`);
    console.log('─'.repeat(80));
    
    // Extract domain from website
    let domain = null;
    if (lead.website) {
      try {
        const url = lead.website.startsWith('http') ? lead.website : `https://${lead.website}`;
        domain = new URL(url).hostname.replace('www.', '');
      } catch (e) {
        console.log(`⚠️ Could not parse website: ${lead.website}`);
      }
    }
    
    const result = await findDecisionMaker(lead.firm, domain);
    
    if (result) {
      enrichments.push({
        firm: lead.firm,
        rowIndex: lead.rowIndex,
        contact: result
      });
      
      // Prepare update for Google Sheet
      updates.push({
        range: `Sheet1!C${lead.rowIndex}:F${lead.rowIndex}`,
        values: [[
          result.name,
          result.title,
          result.email,
          result.linkedin
        ]]
      });
      
      // Update status column (I)
      updates.push({
        range: `Sheet1!I${lead.rowIndex}`,
        values: [['Enriched']]
      });
      
      // Update notes column (J)
      updates.push({
        range: `Sheet1!J${lead.rowIndex}`,
        values: [[`Enriched via ${result.source} - ${new Date().toISOString().split('T')[0]}`]]
      });
    } else {
      console.log(`⚠️ Could not find verified contact for ${lead.firm}`);
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '═'.repeat(80) + '\n');
  
  // Step 4: Update the sheet
  if (updates.length > 0) {
    console.log(`\n✍️ Updating Google Sheet with ${enrichments.length} enrichments...\n`);
    
    try {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          data: updates,
          valueInputOption: 'RAW'
        }
      });
      console.log('✅ Sheet updated successfully\n');
    } catch (error) {
      console.error('❌ Error updating sheet:', error.message);
    }
  }
  
  // Step 5: Save completion report
  const report = {
    timestamp: new Date().toISOString(),
    totalLeadsReviewed: needsEnrichment.length,
    leadsProcessed: Math.min(MAX_ENRICHMENTS, needsEnrichment.length),
    successfulEnrichments: enrichments.length,
    enrichments: enrichments.map(e => ({
      firm: e.firm,
      rowIndex: e.rowIndex,
      contact: e.contact
    }))
  };
  
  fs.writeFileSync(
    'CRON-COMPLETION-20260309-306PM.md',
    `# PE Enrichment Cron - March 9, 2026 3:06 PM

## Summary

- **Total leads needing enrichment:** ${needsEnrichment.length}
- **Leads processed:** ${Math.min(MAX_ENRICHMENTS, needsEnrichment.length)}
- **Successful enrichments:** ${enrichments.length}
- **Success rate:** ${((enrichments.length / Math.min(MAX_ENRICHMENTS, needsEnrichment.length)) * 100).toFixed(1)}%

## Enrichments

${enrichments.map((e, i) => `
### ${i + 1}. ${e.firm} (Row ${e.rowIndex})

- **Name:** ${e.contact.name}
- **Title:** ${e.contact.title}
- **Email:** ${e.contact.email}
- **LinkedIn:** ${e.contact.linkedin || 'N/A'}
- **Source:** ${e.contact.source}
`).join('\n')}

${enrichments.length === 0 ? '_No successful enrichments this run._' : ''}

## Next Steps

${needsEnrichment.length > MAX_ENRICHMENTS ? 
  `⚠️ ${needsEnrichment.length - MAX_ENRICHMENTS} leads still need enrichment. Next cron will continue.` : 
  '✅ All identified leads have been processed.'}
`
  );
  
  console.log('═'.repeat(80));
  console.log('\n✅ ENRICHMENT COMPLETE\n');
  console.log(`   📊 ${enrichments.length}/${Math.min(MAX_ENRICHMENTS, needsEnrichment.length)} successful enrichments`);
  console.log(`   📄 Report saved: CRON-COMPLETION-20260309-306PM.md`);
  console.log(`   🔄 ${needsEnrichment.length - Math.min(MAX_ENRICHMENTS, needsEnrichment.length)} leads remaining\n`);
  console.log('═'.repeat(80) + '\n');
}

enrichLeads().catch(console.error);
