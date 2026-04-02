const { google } = require('googleapis');
const axios = require('axios');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Wide net for decision-makers
const TARGET_TITLES = [
  'CEO', 'CTO', 'COO', 'CMO', 'CFO',
  'Chief Executive Officer', 'Chief Technology Officer', 'Chief Operating Officer',
  'Managing Partner', 'Managing Director', 'General Partner', 'Operating Partner', 'Senior Partner',
  'Partner', 'Principal',
  'VP Technology', 'VP Operations', 'VP Digital', 'VP Portfolio Operations',
  'Director of Technology', 'Director of Operations', 'Director of Digital',
  'Head of Technology', 'Head of Operations', 'Head of Value Creation'
];

function extractDomain(url) {
  if (!url || !url.includes('.')) return null;
  try {
    const cleaned = url
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .split('/')[0]
      .split('?')[0]
      .trim();
    return cleaned.length > 3 ? cleaned : null;
  } catch {
    return null;
  }
}

async function apolloSearchAndEnrich(companyName, domain) {
  try {
    console.log(`    🔍 Searching Apollo...`);
    
    // Step 1: Search for people
    const searchResponse = await axios.post(
      'https://api.apollo.io/v1/mixed_people/api_search',
      {
        page: 1,
        per_page: 10,
        organization_domains: domain ? [domain] : undefined,
        q_organization_name: !domain ? companyName : undefined,
        person_titles: TARGET_TITLES
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': APOLLO_API_KEY
        },
        timeout: 10000
      }
    );
    
    if (!searchResponse.data?.people?.length) {
      console.log(`    ❌ No contacts found`);
      return null;
    }
    
    console.log(`    📋 Found ${searchResponse.data.people.length} contacts, enriching...`);
    
    // Step 2: Enrich each person to get full details
    for (const person of searchResponse.data.people) {
      try {
        console.log(`       Enriching ${person.first_name} ${person.last_name_obfuscated || ''}...`);
        
        const enrichResponse = await axios.post(
          'https://api.apollo.io/v1/people/match',
          { id: person.id },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Api-Key': APOLLO_API_KEY
            },
            timeout: 10000
          }
        );
        
        await new Promise(r => setTimeout(r, 800));  // Rate limit between enrichments
        
        const enrichedPerson = enrichResponse.data?.person;
        if (!enrichedPerson) continue;
        
        const email = enrichedPerson.email || '';
        const isGeneric = email.match(/^(info|sales|ir|contact|hello|support|admin|general|investor|press|team)@/i);
        
        // Found someone with a real email!
        if (email.includes('@') && !isGeneric) {
          console.log(`    ✅ ${enrichedPerson.name} - ${email}`);
          return {
            name: enrichedPerson.name,
            title: enrichedPerson.title || '',
            email: email,
            linkedin: enrichedPerson.linkedin_url || '',
            source: 'Apollo API'
          };
        }
      } catch (enrichError) {
        console.log(`       Failed to enrich ${person.first_name}`);
      }
    }
    
    // No verified emails found, return first person even without email
    console.log(`    ⚠️  Found people but no verified emails`);
    return null;
    
  } catch (error) {
    const msg = error.response?.data?.error || error.response?.data?.message || error.message;
    if (!msg.includes('422')) {
      console.error(`    ❌ Error: ${msg}`);
    }
  }
  return null;
}

async function enrichLeads() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  console.log(`🚀 PE ENRICHMENT CRON - ${new Date().toISOString()}`);
  console.log(`${'='.repeat(80)}\n`);
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:N'
  });
  
  const rows = response.data.values;
  console.log(`📊 Total rows: ${rows.length}\n`);
  
  // Find targets: rows with URLs in email column or empty/generic emails
  let targets = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const company = (row[0] || '').trim();
    const websiteCol = (row[1] || '').trim();  // Column B
    const contact = (row[2] || '').trim();  // Column C
    const email = (row[4] || '').trim();  // Column E
    const status = (row[9] || '').trim();  // Column J
    
    if (!company || company.length < 3) continue;
    if (status.toLowerCase() === 'dead') continue;
    
    // Check if email column has URL instead of email
    const hasUrlInEmail = email && (email.startsWith('http') || email.includes('linkedin.com') || email.includes('.com/'));
    
    // Or if email is generic/empty
    const isGenericEmail = email && email.match(/^(info|sales|ir|contact|hello|support|admin|general|investor|press)@/i);
    const hasNoEmail = !email || email.length < 5 || !email.includes('@');
    
    if (hasUrlInEmail || isGenericEmail || hasNoEmail) {
      // Try to extract domain from column B (might be website)
      let domain = extractDomain(websiteCol);
      if (!domain) {
        // Try column F
        domain = extractDomain(row[5]);
      }
      
      targets.push({
        row: i + 1,
        company,
        websiteCol,
        domain,
        currentContact: contact || '(empty)',
        currentEmail: email || '(empty)',
        reason: hasUrlInEmail ? 'URL in email field' : (isGenericEmail ? 'Generic email' : 'No email')
      });
    }
  }
  
  console.log(`🎯 Found ${targets.length} enrichment targets`);
  console.log(`   Processing 10-12 in this batch\n`);
  console.log(`${'='.repeat(80)}\n`);
  
  const batch = targets.slice(0, 12);
  const updates = [];
  let enriched = 0;
  let notFound = 0;
  
  for (const target of batch) {
    console.log(`\n📌 [ROW ${target.row}] ${target.company}`);
    console.log(`   Domain: ${target.domain || 'N/A'}`);
    console.log(`   Current: ${target.currentContact} | ${target.currentEmail}`);
    console.log(`   Issue: ${target.reason}`);
    
    let result = null;
    
    // Try domain first if we have it
    if (target.domain) {
      result = await apolloSearchAndEnrich(target.company, target.domain);
      await new Promise(r => setTimeout(r, 2000));  // Rate limit between searches
    }
    
    // Retry with company name if domain failed
    if (!result && target.company) {
      console.log(`    🔄 Retry by company name...`);
      result = await apolloSearchAndEnrich(target.company, null);
      await new Promise(r => setTimeout(r, 2000));  // Rate limit
    }
    
    if (result && result.name && result.email && result.email.includes('@')) {
      console.log(`\n   ✅ ENRICHED`);
      console.log(`      Name: ${result.name}`);
      console.log(`      Title: ${result.title || 'N/A'}`);
      console.log(`      Email: ${result.email}`);
      console.log(`      LinkedIn: ${result.linkedin || 'N/A'}`);
      
      const today = new Date().toISOString().split('T')[0];
      const notes = `Apollo ${today}: ${result.name} - ${result.email} (verified)`;
      
      updates.push({
        row: target.row,
        company: target.company,
        contact: result.name,
        title: result.title,
        email: result.email,
        linkedin: result.linkedin || '',
        notes: notes,
        status: 'Enriched'
      });
      
      enriched++;
    } else {
      console.log(`\n   ❌ NOT FOUND`);
      notFound++;
    }
  }
  
  // Write updates
  if (updates.length > 0) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`\n💾 UPDATING ${updates.length} ROWS...\n`);
    
    for (const u of updates) {
      console.log(`✏️  Row ${u.row}: ${u.company}`);
      console.log(`   → ${u.contact} | ${u.title || 'N/A'} | ${u.email}`);
      
      // C=contact (col 3), D=title (col 4), E=email (col 5), G=linkedin (col 7), H=notes (col 8), J=status (col 10)
      const ops = [
        sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `Sheet1!C${u.row}`,
          valueInputOption: 'RAW',
          resource: { values: [[u.contact]] }
        }),
        sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `Sheet1!D${u.row}`,
          valueInputOption: 'RAW',
          resource: { values: [[u.title]] }
        }),
        sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `Sheet1!E${u.row}`,
          valueInputOption: 'RAW',
          resource: { values: [[u.email]] }
        }),
        sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `Sheet1!H${u.row}`,
          valueInputOption: 'RAW',
          resource: { values: [[u.notes]] }
        }),
        sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `Sheet1!J${u.row}`,
          valueInputOption: 'RAW',
          resource: { values: [[u.status]] }
        })
      ];
      
      if (u.linkedin) {
        ops.push(
          sheets.spreadsheets.values.update({
            spreadsheetId: SHEET_ID,
            range: `Sheet1!G${u.row}`,
            valueInputOption: 'RAW',
            resource: { values: [[u.linkedin]] }
          })
        );
      }
      
      await Promise.all(ops);
      console.log(`   ✅ Saved\n`);
    }
  }
  
  console.log(`\n${'='.repeat(80)}`);
  console.log(`\n📊 SUMMARY`);
  console.log(`   Scanned: ${batch.length}`);
  console.log(`   ✅ Enriched with verified email: ${enriched}`);
  console.log(`   ❌ Not found: ${notFound}`);
  console.log(`   📋 Remaining: ${targets.length - batch.length}`);
  console.log(`\n${'='.repeat(80)}\n`);
  
  return { enriched, notFound, remaining: targets.length - batch.length };
}

enrichLeads()
  .then((results) => {
    console.log(`✅ Hourly enrichment complete\n`);
    console.log(`   Enriched: ${results.enriched}`);
    console.log(`   Not found: ${results.notFound}`);
    console.log(`   Still need enrichment: ${results.remaining}`);
    process.exit(0);
  })
  .catch(err => {
    console.error(`❌ Error:`, err);
    process.exit(1);
  });
