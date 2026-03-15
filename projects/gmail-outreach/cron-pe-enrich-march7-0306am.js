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
  
  // Column C: Contact Name
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
  
  // Column D: Title
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
  
  // Column E: Email
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
  
  // Column G: LinkedIn
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
  
  // Column L: Notes
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
  
  // Column J: Status
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

// Extract domain from website
function extractDomain(website) {
  if (!website) return null;
  try {
    let domain = website.trim()
      .replace(/^https?:\/\/(www\.)?/, '')
      .split('/')[0]
      .toLowerCase();
    return domain;
  } catch (e) {
    return null;
  }
}

// Apollo.io organization search
async function findOrganization(domain) {
  try {
    const response = await axios.post('https://api.apollo.io/v1/organizations/search', {
      q_organization_domains: domain,
      page: 1,
      per_page: 1
    }, {
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY
      }
    });
    
    if (response.data.organizations && response.data.organizations.length > 0) {
      return response.data.organizations[0];
    }
    return null;
  } catch (error) {
    console.error(`    ✗ Org search error: ${error.message}`);
    return null;
  }
}

// Apollo.io people search (cast wide net for decision-makers)
async function searchPeople(organizationId, companyName) {
  try {
    // CAST A WIDE NET - all decision-maker levels
    const titles = [
      // C-level
      'CEO', 'Chief Executive Officer', 'CTO', 'Chief Technology Officer',
      'COO', 'Chief Operating Officer', 'CMO', 'Chief Marketing Officer',
      'CFO', 'Chief Financial Officer', 'CIO', 'Chief Information Officer',
      // Partners
      'Managing Partner', 'General Partner', 'Operating Partner', 'Partner',
      // Directors
      'Director', 'Technology Director', 'Product Director', 'Operations Director',
      'Marketing Director', 'Digital Director', 'Business Development Director',
      // VPs
      'VP', 'Vice President', 'VP Technology', 'VP Operations', 
      'VP Digital Transformation', 'VP Portfolio Operations',
      // Heads
      'Head of Value Creation', 'Head of Portfolio Operations',
      'Head of Business Development', 'Head of Technology', 'Head of Product',
      // Founders
      'Founder', 'Co-Founder', 'President'
    ];
    
    const response = await axios.post('https://api.apollo.io/api/v1/mixed_people/search', {
      organization_ids: [organizationId],
      person_titles: titles,
      page: 1,
      per_page: 15  // Get more candidates
    }, {
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY
      }
    });
    
    return response.data.people || [];
  } catch (error) {
    console.error(`    ✗ People search error: ${error.message}`);
    return [];
  }
}

// Main enrichment logic
async function main() {
  console.log('='.repeat(70));
  console.log('PE Research & Enrichment - Hourly Cron');
  console.log('Saturday, March 7th, 2026 — 3:06 AM (America/Chicago)');
  console.log('='.repeat(70));
  console.log('\nReading Google Sheet...');
  
  const rows = await readSheet();
  const headers = rows[0];
  console.log(`Loaded ${rows.length - 1} PE firms\n`);
  
  // Find firms needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const website = row[5] || '';  // Column F: Website
    const contactName = row[2] || '';
    const email = row[4] || '';  // Column E: Email
    const status = row[9] || '';  // Column J: Status
    
    // Skip dead/sent/contacted leads
    if (status && (
      status.toLowerCase().includes('dead') || 
      status.toLowerCase().includes('sent') ||
      status.toLowerCase().includes('contacted')
    )) {
      continue;
    }
    
    // Check for generic emails
    const isGenericEmail = email && (
      email.toLowerCase().startsWith('info@') ||
      email.toLowerCase().startsWith('sales@') ||
      email.toLowerCase().startsWith('ir@') ||
      email.toLowerCase().startsWith('contact@') ||
      email.toLowerCase().startsWith('admin@') ||
      email.toLowerCase().startsWith('hello@') ||
      email.toLowerCase().startsWith('support@')
    );
    
    const needsContact = !contactName || contactName.trim() === '';
    const needsValidEmail = !email || email.trim() === '' || isGenericEmail;
    
    if ((needsContact || needsValidEmail) && website) {
      needsEnrichment.push({
        rowIndex: i + 1,
        company,
        website,
        contactName,
        email,
        status,
        needsContact,
        needsValidEmail
      });
    }
  }
  
  console.log(`Found ${needsEnrichment.length} firms needing enrichment`);
  
  // Process 10-15 per run
  const batchSize = Math.min(15, needsEnrichment.length);
  const toEnrich = needsEnrichment.slice(0, batchSize);
  console.log(`Will enrich ${toEnrich.length} firms this run\n`);
  
  let enrichedCount = 0;
  const results = [];
  const failed = [];
  
  for (const lead of toEnrich) {
    console.log(`\n[${ enrichedCount + 1}/${toEnrich.length}] ${lead.company}`);
    console.log(`  Website: ${lead.website}`);
    console.log(`  Needs: ${lead.needsContact ? 'Contact' : ''}${lead.needsContact && lead.needsValidEmail ? ' + ' : ''}${lead.needsValidEmail ? 'Email' : ''}`);
    
    const domain = extractDomain(lead.website);
    if (!domain) {
      console.log(`  ✗ Invalid domain`);
      failed.push({ company: lead.company, reason: 'Invalid domain' });
      continue;
    }
    
    console.log(`  Domain: ${domain}`);
    
    // Find organization in Apollo
    const org = await findOrganization(domain);
    
    if (!org) {
      console.log(`  ✗ Organization not found in Apollo`);
      failed.push({ company: lead.company, reason: 'Org not found in Apollo' });
      await new Promise(resolve => setTimeout(resolve, 1000));
      continue;
    }
    
    console.log(`  ✓ Found org: ${org.name} (ID: ${org.id})`);
    
    // Search for decision-makers
    const people = await searchPeople(org.id, lead.company);
    
    if (people.length === 0) {
      console.log(`  ✗ No decision-makers found`);
      failed.push({ company: lead.company, reason: 'No contacts found' });
      await new Promise(resolve => setTimeout(resolve, 1500));
      continue;
    }
    
    console.log(`  ✓ Found ${people.length} potential contacts`);
    
    // Pick best: verified email > highest seniority
    const withEmail = people.filter(p => p.email && p.email.trim() !== '');
    const best = withEmail.length > 0 ? withEmail[0] : people[0];
    
    if (!best.email) {
      console.log(`  ✗ No verified email found`);
      failed.push({ company: lead.company, reason: 'No verified email' });
      await new Promise(resolve => setTimeout(resolve, 1500));
      continue;
    }
    
    console.log(`  ✓ Selected: ${best.name || best.first_name + ' ' + best.last_name}`);
    console.log(`    Title: ${best.title || 'N/A'}`);
    console.log(`    Email: ${best.email}`);
    
    // Update sheet
    const contactName = best.name || `${best.first_name} ${best.last_name}`;
    const updates = {
      contactName,
      title: best.title || '',
      email: best.email,
      linkedIn: best.linkedin_url || '',
      notes: `Apollo.io - ${new Date().toISOString().split('T')[0]}`,
      status: 'Enriched'
    };
    
    await updateRow(lead.rowIndex, updates);
    
    enrichedCount++;
    results.push({
      company: lead.company,
      contact: contactName,
      title: best.title || '',
      email: best.email,
      linkedIn: best.linkedin_url || ''
    });
    
    // Rate limit: 1.5 seconds between API calls
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('ENRICHMENT COMPLETE');
  console.log('='.repeat(70));
  console.log(`Total needing enrichment: ${needsEnrichment.length}`);
  console.log(`Processed this run: ${toEnrich.length}`);
  console.log(`Successfully enriched: ${enrichedCount}`);
  console.log(`Failed: ${failed.length}`);
  
  if (results.length > 0) {
    console.log('\nENRICHED CONTACTS:');
    results.forEach((r, idx) => {
      console.log(`  ${idx + 1}. ${r.company}`);
      console.log(`     ${r.contact} - ${r.title}`);
      console.log(`     ${r.email}`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\nFAILED:');
    failed.forEach((f, idx) => {
      console.log(`  ${idx + 1}. ${f.company} - ${f.reason}`);
    });
  }
  
  // Write completion report
  const timestamp = new Date();
  const reportFile = `CRON-PE-ENRICHMENT-20260307-0306.md`;
  
  const report = `# PE Research & Enrichment - Hourly Cron
**Run Date:** ${timestamp.toISOString()}
**Status:** ${enrichedCount > 0 ? '✅ SUCCESS' : '⚠️ PARTIAL'}

## Summary
- **Total needing enrichment:** ${needsEnrichment.length}
- **Processed this run:** ${toEnrich.length}
- **Successfully enriched:** ${enrichedCount}
- **Failed:** ${failed.length}

## Enriched Contacts
${results.map((r, idx) => `${idx + 1}. **${r.company}**
   - ${r.contact} - ${r.title}
   - ${r.email}
   - ${r.linkedIn || 'No LinkedIn'}`).join('\n\n')}

## Failed
${failed.map((f, idx) => `${idx + 1}. ${f.company} - ${f.reason}`).join('\n')}

## Next Steps
- ${needsEnrichment.length - toEnrich.length} firms still need enrichment
- Continue hourly runs until all enriched or exhausted options
- DO NOT SEND EMAILS - research only
`;
  
  fs.writeFileSync(reportFile, report);
  console.log(`\n✓ Report saved: ${reportFile}`);
  
  // Also save JSON for programmatic access
  const jsonFile = `CRON-PE-ENRICHMENT-20260307-0306.json`;
  fs.writeFileSync(jsonFile, JSON.stringify({
    timestamp: timestamp.toISOString(),
    totalNeeds: needsEnrichment.length,
    processed: toEnrich.length,
    enriched: enrichedCount,
    failed: failed.length,
    results,
    failedList: failed
  }, null, 2));
  
  console.log(`✓ JSON report: ${jsonFile}`);
}

main().catch(error => {
  console.error('\n❌ ERROR:', error.message);
  if (error.response) {
    console.error('Response:', error.response.data);
  }
  process.exit(1);
});
