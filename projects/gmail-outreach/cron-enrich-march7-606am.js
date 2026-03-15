const { google } = require('googleapis');
const axios = require('axios');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

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

async function updateRow(rowIndex, updates) {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const batchData = [];
  
  if (updates.contactName) {
    batchData.push({ range: `Sheet1!C${rowIndex}`, values: [[updates.contactName]] });
  }
  if (updates.title) {
    batchData.push({ range: `Sheet1!D${rowIndex}`, values: [[updates.title]] });
  }
  if (updates.email) {
    batchData.push({ range: `Sheet1!E${rowIndex}`, values: [[updates.email]] });
  }
  if (updates.linkedIn) {
    batchData.push({ range: `Sheet1!G${rowIndex}`, values: [[updates.linkedIn]] });
  }
  if (updates.notes) {
    batchData.push({ range: `Sheet1!K${rowIndex}`, values: [[updates.notes]] });
  }
  if (updates.status) {
    batchData.push({ range: `Sheet1!J${rowIndex}`, values: [[updates.status]] });
  }
  
  if (batchData.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: batchData
      }
    });
  }
}

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
      },
      timeout: 15000
    });
    
    if (response.data.organizations && response.data.organizations.length > 0) {
      return response.data.organizations[0];
    }
    return null;
  } catch (error) {
    console.error(`  Org search error for ${domain}: ${error.message}`);
    return null;
  }
}

async function searchPeople(organizationId, companyName) {
  try {
    // Use the correct Apollo People Search API endpoint
    const response = await axios.post('https://api.apollo.io/api/v1/mixed_people/api_search', {
      organization_ids: [organizationId],
      person_titles: [
        'CEO', 'Chief Executive Officer', 'Founder', 'Co-Founder',
        'Managing Partner', 'Managing Director', 'General Partner',
        'Partner', 'Principal',
        'CTO', 'Chief Technology Officer', 'Chief Digital Officer',
        'COO', 'Chief Operating Officer', 
        'CFO', 'Chief Financial Officer',
        'President',
        'VP Technology', 'VP Operations', 'VP Digital', 'VP Product',
        'Vice President Technology', 'Vice President Operations',
        'Director Technology', 'Director Operations', 'Director Digital',
        'Director Product', 'Director Business Development',
        'Head of Technology', 'Head of Operations', 'Head of Digital',
        'Head of Portfolio Operations', 'Head of Value Creation'
      ],
      page: 1,
      per_page: 20
    }, {
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY
      },
      timeout: 15000
    });
    
    if (response.data.people && response.data.people.length > 0) {
      // Sort by seniority and email presence
      const people = response.data.people.filter(p => {
        if (!p.email || !p.email.includes('@')) return false;
        // Exclude generic emails
        const genericPrefixes = ['info@', 'sales@', 'ir@', 'contact@', 'hello@', 'support@'];
        return !genericPrefixes.some(prefix => p.email.toLowerCase().startsWith(prefix));
      });
      
      if (people.length === 0) return null;
      
      // Prefer C-level, then Partners, then VPs, then Directors
      const seniorityOrder = ['CEO', 'Founder', 'Partner', 'President', 'Chief', 'VP', 'Vice President', 'Director', 'Head'];
      people.sort((a, b) => {
        const aIndex = seniorityOrder.findIndex(s => (a.title || '').includes(s));
        const bIndex = seniorityOrder.findIndex(s => (b.title || '').includes(s));
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
      });
      
      return people[0];
    }
    return null;
  } catch (error) {
    console.error(`  People search error for org ${organizationId}: ${error.message}`);
    if (error.response) {
      console.error(`  Response status: ${error.response.status}, data:`, JSON.stringify(error.response.data).substring(0, 200));
    }
    return null;
  }
}

async function enrichLead(row, rowIndex) {
  const company = row[0] || '';
  const domain = row[1] || '';
  const contactName = row[2] || '';
  const email = row[4] || '';
  const status = row[9] || '';
  
  // Skip if already enriched
  if (status === 'Enriched' || status === 'Sent' || status === 'Dead') {
    return null;
  }
  
  // Check if needs enrichment
  const genericEmails = ['info@', 'sales@', 'ir@', 'contact@', 'hello@', 'support@'];
  const needsEnrichment = !contactName || 
                          !email || 
                          genericEmails.some(g => email.startsWith(g));
  
  if (!needsEnrichment) {
    return null;
  }
  
  if (!domain) {
    console.log(`  ❌ ${company}: No domain, skipping`);
    return { company, status: 'skipped', reason: 'No domain' };
  }
  
  console.log(`\n🔍 Enriching: ${company} (${domain})`);
  
  // 1. Find organization in Apollo
  const org = await findOrganization(domain);
  if (!org) {
    console.log(`  ❌ Organization not found in Apollo`);
    return { company, status: 'not_found', reason: 'Org not found in Apollo' };
  }
  
  console.log(`  ✓ Found org: ${org.name} (ID: ${org.id})`);
  
  // 2. Search for decision-makers
  const person = await searchPeople(org.id, company);
  if (!person) {
    console.log(`  ❌ No contacts found with direct email`);
    return { company, status: 'no_contacts', reason: 'No decision-makers found' };
  }
  
  console.log(`  ✅ Found: ${person.name}, ${person.title} (${person.email})`);
  
  // 3. Update the sheet
  const updates = {
    contactName: person.name,
    title: person.title,
    email: person.email,
    linkedIn: person.linkedin_url || '',
    notes: `Enriched via Apollo ${new Date().toISOString().split('T')[0]}`,
    status: 'Enriched'
  };
  
  await updateRow(rowIndex, updates);
  
  return { 
    company, 
    status: 'enriched', 
    contact: person.name, 
    title: person.title,
    email: person.email,
    linkedIn: person.linkedin_url || ''
  };
}

async function main() {
  console.log('📊 PE Research & Enrichment - Saturday, March 7th, 2026 — 6:06 AM\n');
  
  const rows = await readSheet();
  const headers = rows[0];
  const dataRows = rows.slice(1);
  
  console.log(`Total rows in sheet: ${dataRows.length}\n`);
  
  // Find rows needing enrichment
  const needsEnrichment = [];
  dataRows.forEach((row, idx) => {
    const contactName = row[2] || '';
    const email = row[4] || '';
    const status = row[9] || '';
    
    const genericEmails = ['info@', 'sales@', 'ir@', 'contact@', 'hello@', 'support@'];
    if ((status !== 'Enriched' && status !== 'Sent' && status !== 'Dead') &&
        (!contactName || !email || genericEmails.some(g => email.startsWith(g)))) {
      needsEnrichment.push({ row, index: idx + 2 }); // +2 for 1-indexed + header
    }
  });
  
  console.log(`📋 Found ${needsEnrichment.length} leads needing enrichment\n`);
  
  if (needsEnrichment.length === 0) {
    console.log('✅ All leads are already enriched!\n');
    return;
  }
  
  // Enrich up to 15 leads
  const toEnrich = needsEnrichment.slice(0, 15);
  const results = [];
  
  for (const { row, index } of toEnrich) {
    try {
      const result = await enrichLead(row, index);
      if (result) {
        results.push(result);
      }
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`\n❌ Error enriching row ${index}: ${error.message}`);
      results.push({ company: row[0], status: 'error', reason: error.message });
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 ENRICHMENT SUMMARY\n');
  
  const enriched = results.filter(r => r.status === 'enriched');
  const notFound = results.filter(r => r.status === 'not_found');
  const noContacts = results.filter(r => r.status === 'no_contacts');
  const skipped = results.filter(r => r.status === 'skipped');
  const errors = results.filter(r => r.status === 'error');
  
  console.log(`✅ Successfully enriched: ${enriched.length}`);
  if (enriched.length > 0) {
    enriched.forEach(r => {
      console.log(`   • ${r.company}: ${r.contact} (${r.title}) - ${r.email}`);
    });
  }
  
  console.log(`\n⚠️  Org not found: ${notFound.length}`);
  if (notFound.length > 0) {
    notFound.forEach(r => console.log(`   • ${r.company}`));
  }
  
  console.log(`\n⚠️  No contacts found: ${noContacts.length}`);
  if (noContacts.length > 0) {
    noContacts.forEach(r => console.log(`   • ${r.company}`));
  }
  
  console.log(`\n⏭️  Skipped: ${skipped.length}`);
  console.log(`❌ Errors: ${errors.length}`);
  
  console.log(`\n📈 Remaining to enrich: ${needsEnrichment.length - toEnrich.length}`);
  console.log('='.repeat(60));
  
  // Save results
  fs.writeFileSync('enrich-results-march7-606am.json', JSON.stringify(results, null, 2));
  console.log('\n💾 Results saved to enrich-results-march7-606am.json');
}

main().catch(console.error);
