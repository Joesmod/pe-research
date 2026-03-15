const { google } = require('googleapis');
const axios = require('axios');

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
  if (updates.status) {
    batchData.push({ range: `Sheet1!J${rowIndex}`, values: [[updates.status]] });
  }
  
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      valueInputOption: 'RAW',
      data: batchData
    }
  });
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
        'Head of Technology', 'Head of Operations'
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
    
    return response.data.people || [];
  } catch (error) {
    console.error(`  People search error: ${error.message}`);
    return [];
  }
}

async function main() {
  console.log('PE Research & Enrichment - March 7 5:06 AM\n');
  console.log('Reading sheet...');
  
  const rows = await readSheet();
  console.log(`Loaded ${rows.length} rows\n`);
  
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0];
    const website = row[1];
    const contactName = row[2];
    const email = row[4];
    const status = row[9];
    
    if (status && (status.toLowerCase().includes('dead') || 
                  status.toLowerCase().includes('contacted') ||
                  status.toLowerCase().includes('sent') ||
                  status.toLowerCase().includes('reply'))) {
      continue;
    }
    
    const hasGenericEmail = email && (email.includes('info@') || email.includes('sales@') || 
                                      email.includes('ir@') || email.includes('contact@'));
    const hasNoContactName = !contactName || contactName.trim() === '' || contactName === 'Jacob Zodikoff';
    const hasNoEmail = !email || email.trim() === '';
    
    if ((hasGenericEmail || hasNoContactName || hasNoEmail) && website) {
      needsEnrichment.push({
        rowIndex: i + 1,
        company: company,
        website: website,
        contactName: contactName || '',
        email: email || '',
        status: status || ''
      });
    }
  }
  
  console.log(`Found ${needsEnrichment.length} leads needing enrichment`);
  
  const toEnrich = needsEnrichment.slice(0, 12);
  console.log(`Will enrich ${toEnrich.length} leads this run\n`);
  
  let enrichedCount = 0;
  const results = [];
  
  for (const lead of toEnrich) {
    console.log(`=== ${lead.company} ===`);
    
    const domain = lead.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
    console.log(`  Domain: ${domain}`);
    
    const org = await findOrganization(domain);
    
    if (!org) {
      console.log(`  ✗ Organization not found in Apollo`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      continue;
    }
    
    console.log(`  ✓ Found org: ${org.name} (ID: ${org.id})`);
    
    const people = await searchPeople(org.id);
    
    if (people.length > 0) {
      const best = people.find(p => p.email && !p.email.startsWith('info@') && !p.email.startsWith('sales@')) || people[0];
      
      console.log(`  ✓ Found: ${best.name} - ${best.title}`);
      console.log(`    Email: ${best.email || 'N/A'}`);
      
      if (best.email) {
        await updateRow(lead.rowIndex, {
          contactName: best.name,
          title: best.title,
          email: best.email,
          linkedIn: best.linkedin_url || '',
          status: 'Enriched'
        });
        
        enrichedCount++;
        results.push({
          company: lead.company,
          contact: best.name,
          title: best.title,
          email: best.email
        });
      } else {
        console.log(`    ⚠ No verified email`);
      }
    } else {
      console.log(`  ✗ No decision-makers found`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  console.log(`\n✓ Enrichment complete: ${enrichedCount}/${toEnrich.length} leads enriched`);
  
  if (results.length > 0) {
    console.log('\nEnriched leads:');
    results.forEach(r => {
      console.log(`  • ${r.company}: ${r.contact} - ${r.title} (${r.email})`);
    });
  }
}

main().catch(error => {
  console.error('ERROR:', error.message);
  process.exit(1);
});
