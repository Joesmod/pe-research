const {readSheet, updateRow} = require('./sheet.js');
const https = require('https');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function apolloSearchByDomain(domain) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      q_organization_domains: domain,
      person_titles: ['CEO', 'Managing Partner', 'Managing Director', 'Partner', 'President', 'COO', 'CFO'],
      page: 1,
      per_page: 5
    });

    const options = {
      hostname: 'api.apollo.io',
      path: '/v1/mixed_people/api_search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function apolloEnrichPerson(personId) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      id: personId,
      reveal_personal_emails: true
    });

    const options = {
      hostname: 'api.apollo.io',
      path: '/v1/people/match',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function enrichCompany(row, headers) {
  const companyName = row.values[0] || '';
  const currentContact = row.values[2] || '';
  const currentEmail = row.values[4] || '';
  const companyUrl = row.values[12] || row.values[1] || '';
  
  // Skip if already has contact and direct email
  if (currentContact && currentEmail && !currentEmail.startsWith('info@') && !currentEmail.startsWith('sales@')) {
    console.log(`  ⏭️  Already enriched, skipping`);
    return null;
  }
  
  // Extract domain from company URL
  let domain = '';
  if (companyUrl) {
    try {
      const url = new URL(companyUrl);
      domain = url.hostname.replace('www.', '');
    } catch (e) {
      console.log(`  ❌ Invalid URL: ${companyUrl}`);
      return null;
    }
  } else {
    console.log(`  ❌ No company URL found`);
    return null;
  }
  
  console.log(`  🔍 Searching Apollo for: ${domain}`);
  
  try {
    const searchResults = await apolloSearchByDomain(domain);
    
    if (!searchResults.people || searchResults.people.length === 0) {
      console.log(`  ❌ No contacts found on Apollo`);
      return null;
    }
    
    console.log(`  ✅ Found ${searchResults.people.length} potential contacts`);
    
    // Try to enrich the first person
    const firstPerson = searchResults.people[0];
    console.log(`  📧 Enriching: ${firstPerson.first_name} ${firstPerson.last_name_obfuscated || ''} (${firstPerson.title})`);
    
    const enriched = await apolloEnrichPerson(firstPerson.id);
    
    if (enriched.person && enriched.person.email) {
      const p = enriched.person;
      console.log(`  ✅ Got verified contact!`);
      
      return {
        name: `${p.first_name} ${p.last_name}`,
        title: p.title,
        email: p.email,
        linkedin: p.linkedin_url || '',
        source: 'Apollo.io verification'
      };
    } else {
      console.log(`  ❌ Could not get email from Apollo`);
      return null;
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return null;
  }
}

async function main() {
  const maxToEnrich = parseInt(process.argv[2]) || 10;
  console.log(`🎯 PE Lead Enrichment - Target: ${maxToEnrich} leads\n`);
  
  const {headers, data} = await readSheet();
  
  // Find rows that truly need enrichment
  const needsEnrichment = data.filter(row => {
    const contact = (row.values[2] || '').trim();
    const email = (row.values[4] || '').trim();
    const status = (row.values[9] || '').toLowerCase();
    const companyUrl = row.values[12] || row.values[1] || '';
    
    // Skip if marked as dead/enriched/sent
    if (status.includes('dead') || status.includes('enriched') || status.includes('sent')) {
      return false;
    }
    
    // Need enrichment if no contact OR generic email
    const needsContact = !contact;
    const hasGenericEmail = email && (email.startsWith('info@') || email.startsWith('sales@') || email.startsWith('ir@'));
    
    return companyUrl && (needsContact || hasGenericEmail);
  });
  
  console.log(`📊 Found ${needsEnrichment.length} leads needing enrichment\n`);
  
  let enriched = 0;
  
  for (const row of needsEnrichment.slice(0, maxToEnrich)) {
    const company = row.values[0];
    console.log(`\n🏢 ${company} (Row ${row.rowIndex})`);
    
    const contact = await enrichCompany(row, headers);
    
    if (contact) {
      // Update the row
      const newRow = [...row.values];
      newRow[2] = contact.name;          // Contact Name
      newRow[3] = contact.title;         // Title
      newRow[4] = contact.email;         // Email
      newRow[5] = contact.linkedin;      // LinkedIn (if fits here)
      newRow[9] = 'Enriched';            // Status
      newRow[11] = `${newRow[11] || ''} | Apollo.io enrichment ${new Date().toISOString().split('T')[0]}: ${contact.name} (${contact.title})`.trim();
      
      await updateRow(row.rowIndex, newRow);
      console.log(`  💾 Updated sheet!`);
      enriched++;
      
      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log(`\n✅ Enrichment complete: ${enriched}/${maxToEnrich} leads enriched`);
}

main().catch(console.error);
