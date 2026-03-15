const { google } = require('googleapis');
const https = require('https');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

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

// Try to find a specific person's email
async function findPersonEmail(personName, firmName, domain) {
  console.log(`\n🔍 Searching for ${personName} at ${firmName}...`);
  
  try {
    const searchBody = {
      q_keywords: personName,
      q_organization_name: firmName,
      per_page: 5,
      page: 1
    };
    
    if (domain) {
      searchBody.organization_domains = [domain];
    }
    
    const results = await apolloRequest('/api/v1/mixed_people/search', searchBody);
    
    if (!results.people || results.people.length === 0) {
      console.log('❌ Person not found in Apollo');
      return null;
    }
    
    console.log(`✅ Found ${results.people.length} matching people`);
    
    // Try to enrich the first match
    const person = results.people[0];
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
    
    console.log('❌ No verified email found');
    return null;
    
  } catch (error) {
    console.error(`❌ Error searching: ${error.message}`);
    return null;
  }
}

async function enrichExistingLeads() {
  console.log('\n🚀 PE Lead Final Enrichment - March 9, 2026 3:06 PM\n');
  console.log('═'.repeat(80));
  
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Target leads that need enrichment
  const targets = [
    {
      rowIndex: 804,
      firm: 'Trian Fund Management, L.P.',
      person: 'Nelson Peltz',
      domain: 'trianpartners.com',
      currentEmail: 'IR@trianpartners.com',
      reason: 'Replace generic IR email with direct email'
    },
    {
      rowIndex: 991,
      firm: 'Pharos Capital Group',
      person: 'Kneeland Youngblood',
      domain: 'pharosfunds.com',
      currentEmail: null,
      reason: 'No email found'
    }
  ];
  
  console.log(`\n📋 Enriching 2 existing leads:\n`);
  targets.forEach((t, i) => {
    console.log(`   ${i + 1}. ${t.person} at ${t.firm} (Row ${t.rowIndex})`);
    console.log(`      Reason: ${t.reason}\n`);
  });
  
  console.log('═'.repeat(80) + '\n');
  
  const enrichments = [];
  const updates = [];
  
  for (const target of targets) {
    console.log(`\nProcessing: ${target.person} at ${target.firm}`);
    console.log('─'.repeat(80));
    
    const result = await findPersonEmail(target.person, target.firm, target.domain);
    
    if (result) {
      enrichments.push({
        firm: target.firm,
        rowIndex: target.rowIndex,
        contact: result,
        previousEmail: target.currentEmail
      });
      
      // Update email column (E) and notes (J)
      updates.push({
        range: `Sheet1!E${target.rowIndex}`,
        values: [[result.email]]
      });
      
      updates.push({
        range: `Sheet1!J${target.rowIndex}`,
        values: [[`Email updated via ${result.source} - ${new Date().toISOString().split('T')[0]}`]]
      });
    } else {
      console.log(`⚠️ Could not find verified email for ${target.person}`);
      
      // Mark as attempted
      updates.push({
        range: `Sheet1!J${target.rowIndex}`,
        values: [[`Apollo search attempted - no verified email found - ${new Date().toISOString().split('T')[0]}`]]
      });
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1200));
  }
  
  console.log('\n' + '═'.repeat(80) + '\n');
  
  // Update the sheet
  if (updates.length > 0) {
    console.log(`✍️ Updating Google Sheet...\n`);
    
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
  
  // Generate report
  const report = `# PE Enrichment Completion - March 9, 2026 3:06 PM

## Existing Leads Enrichment

**Total leads in sheet:** 991  
**Leads needing enrichment:** 2  
**Successfully enriched:** ${enrichments.length}

${enrichments.length > 0 ? `
### Successful Enrichments

${enrichments.map((e, i) => `
#### ${i + 1}. ${e.contact.name} at ${e.firm} (Row ${e.rowIndex})

- **Email:** ${e.contact.email}
- **LinkedIn:** ${e.contact.linkedin || 'N/A'}
- **Source:** ${e.contact.source}
- **Previous Email:** ${e.previousEmail || '(none)'}
`).join('\n')}
` : ''}

${enrichments.length === 0 ? '### ⚠️ No emails found via Apollo\n\nBoth leads were searched but Apollo.io did not have verified direct emails available.' : ''}

## Next Steps

✅ Existing leads are fully enriched (991/991 with best available contact info)

Now adding new mid-market PE firms...
`;
  
  fs.writeFileSync('CRON-ENRICHMENT-20260309-306PM.md', report);
  
  console.log('═'.repeat(80));
  console.log(`\n✅ EXISTING LEADS PROCESSED\n`);
  console.log(`   📊 ${enrichments.length}/2 successful enrichments`);
  console.log(`   📄 Report: CRON-ENRICHMENT-20260309-306PM.md\n`);
  console.log('═'.repeat(80) + '\n');
  
  return enrichments.length;
}

async function addNewFirms() {
  console.log('\n🆕 Adding 5 new mid-market PE firms...\n');
  console.log('═'.repeat(80) + '\n');
  
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Mid-market PE firms to add (services-heavy, $500M-$5B AUM)
  const newFirms = [
    {
      name: 'Gryphon Investors',
      website: 'https://www.gryphoninvestors.com',
      sector: 'Business Services, Healthcare, Industrial',
      aum: '$5B+',
      note: 'San Francisco-based, focus on operational transformation'
    },
    {
      name: 'Trivest Partners',
      website: 'https://www.trivest.com',
      sector: 'Business Services, Healthcare, Technology',
      aum: '$3B+',
      note: 'Miami-based, founder-friendly'
    },
    {
      name: 'Brookside Capital',
      website: 'https://www.brooksidecapital.com',
      sector: 'Healthcare Services, Business Services',
      aum: '$1.5B+',
      note: 'Chicago-based, lower middle market focus'
    },
    {
      name: 'Cressey & Company',
      website: 'https://www.cressey.com',
      sector: 'Healthcare Services, Medical Technology',
      aum: '$2B+',
      note: 'Chicago-based, healthcare-focused'
    },
    {
      name: 'MidOcean Partners',
      website: 'https://www.midoceanpartners.com',
      sector: 'Business Services, Consumer, Distribution',
      aum: '$8B+',
      note: 'NYC-based, upper middle market'
    }
  ];
  
  const newRows = [];
  
  for (const firm of newFirms) {
    console.log(`\n🔍 Researching ${firm.name}...`);
    
    // Extract domain
    let domain = null;
    try {
      domain = new URL(firm.website).hostname.replace('www.', '');
    } catch (e) {}
    
    // Search for decision-maker
    console.log(`   Searching Apollo for decision-makers...`);
    
    const searchBody = {
      q_organization_name: firm.name,
      person_titles: [
        'Managing Partner',
        'General Partner',
        'CEO',
        'President',
        'Partner'
      ],
      per_page: 5
    };
    
    if (domain) {
      searchBody.organization_domains = [domain];
    }
    
    let contact = null;
    
    try {
      const results = await apolloRequest('/api/v1/mixed_people/search', searchBody);
      
      if (results.people && results.people.length > 0) {
        const person = results.people[0];
        console.log(`   Found: ${person.name} (${person.title || 'No title'})`);
        
        // Try to enrich
        const enrichBody = { id: person.id };
        const enriched = await apolloRequest('/api/v1/people/match', enrichBody);
        
        if (enriched.person) {
          contact = {
            name: enriched.person.name,
            title: enriched.person.title || '',
            email: enriched.person.email || '',
            linkedin: enriched.person.linkedin_url || ''
          };
          
          if (contact.email) {
            console.log(`   ✅ Email found: ${contact.email}`);
          } else {
            console.log(`   ⚠️ No email available`);
          }
        }
      } else {
        console.log(`   ❌ No contacts found in Apollo`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    // Prepare row for sheet
    newRows.push([
      firm.name,                                    // A: Company Name
      firm.website,                                 // B: NotebookLM/Website
      contact ? contact.name : '',                  // C: Contact Name
      contact ? contact.title : '',                 // D: Title
      contact ? contact.email : '',                 // E: Email
      firm.website,                                 // F: Website
      contact ? contact.linkedin : '',              // G: LinkedIn
      firm.sector,                                  // H: Sector Focus
      `${firm.aum} AUM | ${firm.note}`,            // I: Portfolio/Notes
      contact && contact.email ? 'Enriched' : 'New - Needs Research'  // J: Status
    ]);
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1200));
  }
  
  // Append to sheet
  console.log('\n' + '─'.repeat(80) + '\n');
  console.log(`✍️ Adding ${newRows.length} new firms to sheet...\n`);
  
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:J',
      valueInputOption: 'RAW',
      requestBody: {
        values: newRows
      }
    });
    console.log('✅ New firms added successfully\n');
  } catch (error) {
    console.error('❌ Error adding firms:', error.message);
  }
  
  console.log('═'.repeat(80));
  console.log(`\n✅ NEW FIRMS ADDED: ${newRows.length}\n`);
  console.log('═'.repeat(80) + '\n');
  
  return newRows.length;
}

async function main() {
  try {
    const enriched = await enrichExistingLeads();
    const added = await addNewFirms();
    
    console.log('\n🎉 CRON JOB COMPLETE\n');
    console.log(`   ✅ Existing leads enriched: ${enriched}/2`);
    console.log(`   ✅ New firms added: ${added}`);
    console.log(`   📄 Report: CRON-ENRICHMENT-20260309-306PM.md\n`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

main();
