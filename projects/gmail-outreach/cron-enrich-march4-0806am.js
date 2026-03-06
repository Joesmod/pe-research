const axios = require('axios');
const { google } = require('googleapis');
const fs = require('fs');
const key = require('./service-account.json');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const auth = new google.auth.GoogleAuth({
  credentials: key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

async function searchApollo(companyName, companyWebsite) {
  try {
    console.log(`  Searching Apollo for: ${companyName}`);
    
    let searchDomain = null;
    if (companyWebsite) {
      try {
        const url = new URL(companyWebsite.startsWith('http') ? companyWebsite : `https://${companyWebsite}`);
        searchDomain = url.hostname.replace('www.', '');
      } catch (e) {
        console.log(`    Invalid website URL: ${companyWebsite}`);
      }
    }
    
    const orgParams = {
      page: 1,
      per_page: 1
    };
    
    if (searchDomain) {
      orgParams.q_organization_domains = searchDomain;
    } else {
      orgParams.q_organization_name = companyName;
    }
    
    const orgResponse = await axios.get('https://api.apollo.io/v1/organizations/search', {
      params: orgParams,
      headers: {
        'X-Api-Key': APOLLO_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    const orgs = orgResponse.data.organizations || [];
    if (orgs.length === 0) {
      console.log(`  ❌ No organization found`);
      return [];
    }
    
    const org = orgs[0];
    const domain = org.primary_domain;
    console.log(`  ✅ Found org: ${org.name} (${domain})`);
    
    const peopleResponse = await axios.post('https://api.apollo.io/v1/mixed_people/search', {
      q_organization_domains: [domain],
      person_titles: [
        'Managing Partner', 'Partner', 'Managing Director', 'Principal', 
        'CEO', 'COO', 'President', 'CTO', 'CFO', 'CMO',
        'General Partner', 'Operating Partner', 'Senior Partner',
        'Director', 'VP', 'Vice President', 'Head of',
        'Chief Technology Officer', 'Chief Information Officer'
      ],
      page: 1,
      per_page: 15
    }, {
      headers: {
        'X-Api-Key': APOLLO_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    const people = peopleResponse.data.people || [];
    console.log(`  Found ${people.length} potential contacts`);
    
    const validPeople = people.filter(p => {
      if (!p.email) return false;
      const email = p.email.toLowerCase();
      if (email.startsWith('info@') || email.startsWith('sales@') || 
          email.startsWith('contact@') || email.startsWith('ir@') ||
          email.startsWith('admin@') || email.startsWith('support@')) {
        return false;
      }
      return true;
    });
    
    const seniorityScore = (title) => {
      if (!title) return 0;
      const t = title.toLowerCase();
      if (t.includes('cto') || t.includes('cio') || t.includes('chief technology') || t.includes('chief information')) return 12;
      if (t.includes('managing partner') || t.includes('ceo') || t.includes('founder')) return 10;
      if (t.includes('partner')) return 9;
      if (t.includes('managing director')) return 8;
      if (t.includes('president')) return 7;
      if (t.includes('principal')) return 6;
      if (t.includes('director')) return 5;
      if (t.includes('vp') || t.includes('vice president')) return 4;
      return 3;
    };
    
    validPeople.sort((a, b) => seniorityScore(b.title) - seniorityScore(a.title));
    
    return validPeople.slice(0, 3);
  } catch (error) {
    if (error.response) {
      console.error(`  Apollo API error ${error.response.status}: ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(`  Error: ${error.message}`);
    }
    return [];
  }
}

async function enrichCron() {
  console.log('=== PE Research & Enrichment - Hourly Cron ===');
  console.log(`Started: ${new Date().toISOString()}\n`);
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:N'
  });
  
  const rows = res.data.values || [];
  const header = rows[0];
  
  console.log(`Total rows in sheet: ${rows.length}`);
  console.log(`Header columns: ${header.join(', ')}\n`);
  
  // Identify firms needing enrichment
  const needsEnrichment = [];
  const genericEmailPattern = /^(info@|contact@|sales@|ir@|admin@|support@)/i;
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;
    
    // Column mapping from header
    const company = row[0];
    const website = row[5];
    const contactName = row[2];
    const email = row[4];
    const status = row[9];
    
    if (!company) continue;
    
    // Skip if already contacted or dead lead
    if (status && (status.toLowerCase().includes('contacted') || status.toLowerCase().includes('dead'))) {
      continue;
    }
    
    // Needs enrichment if: missing contact name OR missing/generic email
    const missingContact = !contactName || contactName.trim() === '' || contactName === 'Board of Directors';
    const missingEmail = !email || email.trim() === '';
    const hasGenericEmail = email && genericEmailPattern.test(email);
    
    if ((missingContact || missingEmail || hasGenericEmail) && website) {
      needsEnrichment.push({
        rowNum,
        company,
        website,
        contactName: contactName || '',
        email: email || '',
        status: status || ''
      });
    }
  }
  
  console.log(`\n📊 Found ${needsEnrichment.length} firms needing enrichment`);
  
  // Select 15 firms to enrich this run
  const selectedTargets = needsEnrichment.slice(0, 15);
  console.log(`Processing ${selectedTargets.length} firms this run\n`);
  
  const updates = [];
  let successCount = 0;
  const enrichmentLog = [];
  
  for (const target of selectedTargets) {
    console.log(`\n[Row ${target.rowNum}] ${target.company}`);
    console.log(`  Website: ${target.website}`);
    console.log(`  Current: ${target.contactName || '(no name)'} - ${target.email || '(no email)'}`);
    
    const contacts = await searchApollo(target.company, target.website);
    
    if (contacts.length > 0) {
      const best = contacts[0];
      console.log(`  ✅ FOUND: ${best.name} - ${best.title}`);
      console.log(`     📧 ${best.email}`);
      if (best.linkedin_url) console.log(`     🔗 ${best.linkedin_url}`);
      
      const rowIdx = target.rowNum - 1;
      const currentRow = rows[rowIdx] || [];
      const newRow = [...currentRow];
      
      // Ensure row has enough columns (up to column N = index 13)
      while (newRow.length < 14) newRow.push('');
      
      // Update columns
      newRow[2] = best.name;  // Contact Name
      newRow[3] = best.title || '';  // Title
      newRow[4] = best.email;  // Email
      if (best.linkedin_url) newRow[6] = best.linkedin_url;  // LinkedIn
      newRow[9] = 'Enriched';  // Status
      newRow[10] = new Date().toISOString();  // Last Contacted
      newRow[11] = `Apollo API enriched via cron 2026-03-04 08:06 AM. Contact: ${best.name}, Title: ${best.title}`;  // Notes
      
      updates.push({
        range: `Sheet1!A${target.rowNum}:N${target.rowNum}`,
        values: [newRow]
      });
      
      enrichmentLog.push({
        rowNum: target.rowNum,
        company: target.company,
        contact: best.name,
        title: best.title,
        email: best.email,
        linkedin: best.linkedin_url || '',
        timestamp: new Date().toISOString()
      });
      
      successCount++;
    } else {
      console.log(`  ❌ No valid contacts found via Apollo`);
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  if (updates.length > 0) {
    console.log(`\n\n📊 Updating ${updates.length} rows in sheet...`);
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      resource: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    console.log('✅ Sheet updated successfully');
  }
  
  fs.writeFileSync('enrichment-log-march4-0806am.json', JSON.stringify(enrichmentLog, null, 2));
  
  const report = {
    timestamp: new Date().toISOString(),
    processed: selectedTargets.length,
    enriched: successCount,
    failed: selectedTargets.length - successCount,
    successRate: `${Math.round(successCount / selectedTargets.length * 100)}%`,
    contacts: enrichmentLog
  };
  
  fs.writeFileSync('CRON-REPORT-2026-03-04-0806am.md', `# PE Research & Enrichment - Cron Report
**Time:** ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}

## Summary
- **Processed:** ${report.processed} firms
- **Enriched:** ${report.enriched} firms
- **Failed:** ${report.failed} firms
- **Success Rate:** ${report.successRate}

## Enriched Contacts
${enrichmentLog.map(e => `- **${e.company}** (Row ${e.rowNum})
  - Contact: ${e.contact}
  - Title: ${e.title}
  - Email: ${e.email}
  - LinkedIn: ${e.linkedin || 'N/A'}`).join('\n\n')}

## Next Steps
- Continue enriching remaining ${needsEnrichment.length - selectedTargets.length} firms in future runs
- Begin outreach to newly enriched contacts
- Add 3-5 new mid-market PE firms if time permits
`);
  
  console.log(`\n\n=== ENRICHMENT SUMMARY ===`);
  console.log(`Processed: ${report.processed}`);
  console.log(`Enriched: ${report.enriched}`);
  console.log(`Failed: ${report.failed}`);
  console.log(`Success Rate: ${report.successRate}`);
  console.log(`\nReport saved to CRON-REPORT-2026-03-04-0806am.md`);
  console.log(`Log saved to enrichment-log-march4-0806am.json`);
}

enrichCron().catch(console.error);
