const { google } = require('googleapis');
const axios = require('axios');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

const targets = require('./targets-with-domains-march7-536am.json');

function extractDomain(url) {
  if (!url) return null;
  try {
    const domain = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    return domain;
  } catch {
    return null;
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
      }
    });
    
    if (response.data.organizations && response.data.organizations.length > 0) {
      return response.data.organizations[0];
    }
    return null;
  } catch (error) {
    console.error(`  Org search error: ${error.message}`);
    return null;
  }
}

async function searchPeople(organizationId) {
  try {
    const response = await axios.post('https://api.apollo.io/api/v1/mixed_people/api_search', {
      organization_ids: [organizationId],
      person_titles: [
        'CEO', 'Chief Executive Officer', 'Founder', 'Co-Founder',
        'Managing Partner', 'Managing Director', 'General Partner',
        'Partner', 'CTO', 'Chief Technology Officer',
        'COO', 'Chief Operating Officer', 'President',
        'VP Technology', 'VP Operations', 'VP Digital',
        'Director Technology', 'Director Operations', 'Director Digital',
        'Head of Technology', 'Head of Operations', 'Head of Portfolio'
      ],
      page: 1,
      per_page: 10
    }, {
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY
      }
    });
    
    if (response.data && response.data.people && response.data.people.length > 0) {
      return response.data.people;
    }
    return [];
  } catch (error) {
    console.error(`  People search error: ${error.message}`);
    return [];
  }
}

async function enrichLeads() {
  const enriched = [];
  
  for (const target of targets) {
    console.log(`\n[${enriched.length + 1}/${targets.length}] ${target.company} (Row ${target.row})`);
    
    const domain = extractDomain(target.website);
    if (!domain) {
      console.log(`  ✗ No website domain`);
      continue;
    }
    
    console.log(`  Domain: ${domain}`);
    
    // Step 1: Find organization
    const org = await findOrganization(domain);
    if (!org) {
      console.log(`  ✗ Organization not found in Apollo`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      continue;
    }
    
    console.log(`  ✓ Found organization: ${org.name}`);
    
    // Step 2: Search for people
    const people = await searchPeople(org.id);
    if (people.length === 0) {
      console.log(`  ✗ No contacts found`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      continue;
    }
    
    // Step 3: Pick best contact
    const person = people[0];
    const email = person.email || '';
    const name = person.name || '';
    const title = person.title || '';
    const linkedin = person.linkedin_url || '';
    
    // Validate email (no generic)
    if (!email || email.match(/^(info@|sales@|ir@|contact@|support@)/i)) {
      console.log(`  ✗ No valid email (${email || 'empty'})`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      continue;
    }
    
    console.log(`  ✓ ${name} - ${title}`);
    console.log(`    Email: ${email}`);
    console.log(`    LinkedIn: ${linkedin || '(none)'}`);
    
    enriched.push({
      row: target.row,
      company: target.company,
      name,
      title,
      email,
      linkedin: linkedin || ''
    });
    
    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  return enriched;
}

async function updateSheet(enriched) {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  for (const lead of enriched) {
    const batchData = [
      { range: `Sheet1!C${lead.row}`, values: [[lead.name]] },
      { range: `Sheet1!D${lead.row}`, values: [[lead.title]] },
      { range: `Sheet1!E${lead.row}`, values: [[lead.email]] },
      { range: `Sheet1!G${lead.row}`, values: [[lead.linkedin]] },
      { range: `Sheet1!J${lead.row}`, values: [['Enriched']] }
    ];
    
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: batchData
      }
    });
    
    console.log(`✓ Updated row ${lead.row}: ${lead.company} -> ${lead.name}`);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

async function main() {
  console.log('=== PE ENRICHMENT - March 7, 5:36 AM ===\n');
  console.log(`Enriching ${targets.length} leads...\n`);
  
  const enriched = await enrichLeads();
  
  console.log(`\n\n=== ENRICHMENT SUMMARY ===`);
  console.log(`Total enriched: ${enriched.length} / ${targets.length}`);
  
  if (enriched.length > 0) {
    fs.writeFileSync('apollo-enrichment-v2-march7-536am.json', JSON.stringify(enriched, null, 2));
    console.log(`\nSaved results to apollo-enrichment-v2-march7-536am.json`);
    
    console.log(`\nUpdating Google Sheet...`);
    await updateSheet(enriched);
    console.log(`\n✓ Google Sheet updated`);
  } else {
    console.log(`\nNo leads enriched - nothing to update`);
  }
  
  console.log(`\n=== COMPLETE ===`);
}

main().catch(console.error);
