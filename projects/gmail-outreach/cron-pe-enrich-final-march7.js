const axios = require('axios');
const { google } = require('googleapis');
const fs = require('fs');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Read sheet
async function readSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:M'
  });
  
  return response.data.values || [];
}

// Update sheet row
async function updateRow(rowIndex, updates) {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const updatePromises = [];
  
  if (updates.contactName) {
    updatePromises.push(
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!C${rowIndex}`,
        valueInputOption: 'RAW',
        resource: { values: [[updates.contactName]] }
      })
    );
  }
  
  if (updates.title) {
    updatePromises.push(
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!D${rowIndex}`,
        valueInputOption: 'RAW',
        resource: { values: [[updates.title]] }
      })
    );
  }
  
  if (updates.email) {
    updatePromises.push(
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!E${rowIndex}`,
        valueInputOption: 'RAW',
        resource: { values: [[updates.email]] }
      })
    );
  }
  
  if (updates.linkedIn) {
    updatePromises.push(
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!G${rowIndex}`,
        valueInputOption: 'RAW',
        resource: { values: [[updates.linkedIn]] }
      })
    );
  }
  
  if (updates.notes) {
    updatePromises.push(
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!L${rowIndex}`,
        valueInputOption: 'RAW',
        resource: { values: [[updates.notes]] }
      })
    );
  }
  
  if (updates.status) {
    updatePromises.push(
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!J${rowIndex}`,
        valueInputOption: 'RAW',
        resource: { values: [[updates.status]] }
      })
    );
  }
  
  await Promise.all(updatePromises);
  console.log(`  ✓ Updated row ${rowIndex}`);
}

// Extract domain
function extractDomain(website) {
  if (!website) return null;
  try {
    return website.trim()
      .replace(/^https?:\/\/(www\.)?/, '')
      .split('/')[0]
      .toLowerCase();
  } catch (e) {
    return null;
  }
}

// Step 1: Search for people (NEW API)
async function searchPeople(domain) {
  try {
    const response = await axios.post('https://api.apollo.io/api/v1/mixed_people/api_search', {
      q_organization_domains: domain,
      person_titles: [
        'CEO', 'Chief Executive Officer', 'CTO', 'Chief Technology Officer',
        'COO', 'Chief Operating Officer', 'CMO', 'Chief Marketing Officer',
        'Managing Partner', 'General Partner', 'Operating Partner', 'Partner',
        'Director', 'Managing Director', 'VP', 'Vice President',
        'Head of Business Development', 'Head of Operations',
        'Founder', 'Co-Founder', 'President'
      ],
      page: 1,
      per_page: 15
    }, {
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'x-api-key': APOLLO_API_KEY
      }
    });
    
    return response.data.people || [];
  } catch (error) {
    console.error(`    ✗ Search error: ${error.message}`);
    return [];
  }
}

// Step 2: Enrich person to get email
async function enrichPerson(firstName, lastName, domain) {
  try {
    const response = await axios.post('https://api.apollo.io/api/v1/people/match', {
      first_name: firstName,
      last_name: lastName,
      domain: domain,
      reveal_personal_emails: true
    }, {
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'x-api-key': APOLLO_API_KEY
      }
    });
    
    return response.data.person || null;
  } catch (error) {
    console.error(`    ✗ Enrich error for ${firstName}: ${error.message}`);
    return null;
  }
}

// Main
async function main() {
  console.log('='.repeat(70));
  console.log('PE Research & Enrichment - Hourly Cron (FINAL)');
  console.log('Saturday, March 7th, 2026 — 3:06 AM');
  console.log('='.repeat(70));
  console.log('\nReading Google Sheet...');
  
  const rows = await readSheet();
  console.log(`Loaded ${rows.length - 1} PE firms\n`);
  
  // Find firms needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const website = row[5] || '';
    const contactName = row[2] || '';
    const email = row[4] || '';
    const status = row[9] || '';
    
    if (status && (
      status.toLowerCase().includes('dead') || 
      status.toLowerCase().includes('sent') ||
      status.toLowerCase().includes('contacted')
    )) {
      continue;
    }
    
    const isGenericEmail = email && (
      email.toLowerCase().startsWith('info@') ||
      email.toLowerCase().startsWith('sales@') ||
      email.toLowerCase().startsWith('ir@') ||
      email.toLowerCase().startsWith('contact@')
    );
    
    const needsContact = !contactName || contactName.trim() === '';
    const needsValidEmail = !email || email.trim() === '' || isGenericEmail;
    
    if ((needsContact || needsValidEmail) && website) {
      needsEnrichment.push({
        rowIndex: i + 1,
        company,
        website
      });
    }
  }
  
  console.log(`Found ${needsEnrichment.length} firms needing enrichment`);
  
  const batchSize = Math.min(10, needsEnrichment.length);
  const toEnrich = needsEnrichment.slice(0, batchSize);
  console.log(`Will enrich ${toEnrich.length} firms this run\n`);
  
  let enrichedCount = 0;
  const results = [];
  const failed = [];
  
  for (const lead of toEnrich) {
    console.log(`\n[${enrichedCount + 1}/${toEnrich.length}] ${lead.company}`);
    
    const domain = extractDomain(lead.website);
    if (!domain) {
      console.log(`  ✗ Invalid domain`);
      failed.push({ company: lead.company, reason: 'Invalid domain' });
      continue;
    }
    
    console.log(`  Domain: ${domain}`);
    
    // Step 1: Search for people
    const people = await searchPeople(domain);
    
    if (people.length === 0) {
      console.log(`  ✗ No contacts found`);
      failed.push({ company: lead.company, reason: 'No contacts in Apollo' });
      await new Promise(r => setTimeout(r, 1500));
      continue;
    }
    
    console.log(`  ✓ Found ${people.length} candidates`);
    
    // Step 2: Try to enrich the top candidate
    let enriched = null;
    for (const person of people.slice(0, 3)) {  // Try top 3
      const firstName = person.first_name;
      const lastNameFull = person.last_name || person.last_name_obfuscated?.replace(/\*+/, '');
      
      if (!firstName) continue;
      
      console.log(`  → Enriching: ${firstName} (${person.title})`);
      
      const enrichedPerson = await enrichPerson(firstName, lastNameFull || '', domain);
      
      if (enrichedPerson && enrichedPerson.email) {
        enriched = enrichedPerson;
        break;
      }
      
      await new Promise(r => setTimeout(r, 500));
    }
    
    if (!enriched || !enriched.email) {
      console.log(`  ✗ No verified email found`);
      failed.push({ company: lead.company, reason: 'No verified email' });
      await new Promise(r => setTimeout(r, 1500));
      continue;
    }
    
    console.log(`  ✓ Enriched: ${enriched.name}`);
    console.log(`    Title: ${enriched.title || 'N/A'}`);
    console.log(`    Email: ${enriched.email}`);
    
    // Update sheet
    await updateRow(lead.rowIndex, {
      contactName: enriched.name,
      title: enriched.title || '',
      email: enriched.email,
      linkedIn: enriched.linkedin_url || '',
      notes: `Apollo.io verified - ${new Date().toISOString().split('T')[0]}`,
      status: 'Enriched'
    });
    
    enrichedCount++;
    results.push({
      company: lead.company,
      contact: enriched.name,
      title: enriched.title || '',
      email: enriched.email
    });
    
    await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('ENRICHMENT COMPLETE');
  console.log('='.repeat(70));
  console.log(`Processed: ${toEnrich.length}`);
  console.log(`Enriched: ${enrichedCount}`);
  console.log(`Failed: ${failed.length}`);
  
  if (results.length > 0) {
    console.log('\nENRICHED:');
    results.forEach((r, idx) => {
      console.log(`  ${idx + 1}. ${r.company}: ${r.contact} - ${r.title} (${r.email})`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\nFAILED:');
    failed.forEach((f, idx) => {
      console.log(`  ${idx + 1}. ${f.company} - ${f.reason}`);
    });
  }
  
  // Write report
  const report = `# PE Research & Enrichment - Hourly Cron
**Date:** Saturday, March 7th, 2026 — 3:06 AM
**Status:** ${enrichedCount > 0 ? '✅ SUCCESS' : '⚠️ NO ENRICHMENTS'}

## Summary
- **Processed:** ${toEnrich.length}
- **Successfully enriched:** ${enrichedCount}
- **Failed:** ${failed.length}

## Enriched Contacts
${results.map((r, idx) => `${idx + 1}. **${r.company}**
   - ${r.contact} - ${r.title}
   - ${r.email}`).join('\n\n')}

## Failed
${failed.map((f, idx) => `${idx + 1}. ${f.company} - ${f.reason}`).join('\n')}
`;
  
  fs.writeFileSync('CRON-PE-ENRICHMENT-MARCH7-0306AM-FINAL.md', report);
  console.log(`\n✓ Report saved`);
}

main().catch(error => {
  console.error('\n❌ ERROR:', error.message);
  process.exit(1);
});
