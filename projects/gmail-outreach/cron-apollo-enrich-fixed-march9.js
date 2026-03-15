const fs = require('fs');
const https = require('https');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

function apiRequest(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    
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

    req.on('error', (e) => { reject(e); });
    req.write(data);
    req.end();
  });
}

async function enrichFirm(firm) {
  console.log(`\n🔍 Enriching: ${firm.firm}...`);
  
  try {
    // Extract domain from website
    let domain = null;
    if (firm.website) {
      try {
        const url = new URL(firm.website);
        domain = url.hostname.replace('www.', '');
      } catch (e) {
        // Invalid URL, skip
      }
    }
    
    // Search for decision-makers
    const searchBody = {
      api_key: APOLLO_API_KEY,
      q_organization_name: firm.firm,
      person_titles: [
        'Partner', 'Managing Partner', 'General Partner', 'Operating Partner',
        'CEO', 'President', 'COO', 'CTO', 'CFO',
        'VP', 'Vice President',
        'Director', 'Managing Director'
      ],
      per_page: 3,
      page: 1
    };
    
    if (domain) {
      searchBody.organization_domains = [domain];
    }
    
    const searchResults = await apiRequest('/api/v1/mixed_people/api_search', searchBody);
    
    if (searchResults.error) {
      console.error(`   ❌ API Error: ${searchResults.error}`);
      return { firm: firm.firm, rowIndex: firm.rowIndex, status: 'API_ERROR', error: searchResults.error };
    }
    
    if (!searchResults.people || searchResults.people.length === 0) {
      console.log(`   ❌ No decision-makers found`);
      return { firm: firm.firm, rowIndex: firm.rowIndex, status: 'NOT_FOUND' };
    }
    
    console.log(`   ✅ Found ${searchResults.people.length} contacts`);
    
    // Now enrich the first contact to get full details including email
    const topContact = searchResults.people[0];
    
    if (!topContact.id) {
      console.log(`   ⚠️  No contact ID available`);
      return {
        rowIndex: firm.rowIndex,
        firm: firm.firm,
        website: firm.website || domain,
        contactName: topContact.name || '',
        title: topContact.title || '',
        email: '',
        linkedIn: topContact.linkedin_url || '',
        status: 'Partial',
        source: 'Apollo API (no ID for enrichment)'
      };
    }
    
    console.log(`   🔄 Enriching contact: ${topContact.name}...`);
    
    // Enrich the person to get email
    const enrichBody = {
      api_key: APOLLO_API_KEY,
      id: topContact.id
    };
    
    const enrichResult = await apiRequest('/api/v1/people/match', enrichBody);
    
    if (enrichResult.error) {
      console.error(`   ❌ Enrichment error: ${enrichResult.error}`);
    }
    
    const enrichedPerson = enrichResult.person || topContact;
    
    const result = {
      rowIndex: firm.rowIndex,
      firm: firm.firm,
      website: firm.website || domain,
      contactName: enrichedPerson.name || '',
      title: enrichedPerson.title || '',
      email: enrichedPerson.email || '',
      linkedIn: enrichedPerson.linkedin_url || '',
      status: enrichedPerson.email ? 'Enriched' : 'Partial',
      source: 'Apollo API'
    };
    
    console.log(`   ✅ ${result.contactName} - ${result.title}`);
    console.log(`   📧 ${result.email || 'NO EMAIL FOUND'}`);
    console.log(`   🔗 ${result.linkedIn || 'No LinkedIn'}`);
    
    return result;
    
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return { firm: firm.firm, rowIndex: firm.rowIndex, status: 'ERROR', error: error.message };
  }
}

async function main() {
  console.log('🚀 PE Lead Enrichment - Hourly Cron Run (FIXED)');
  console.log('📅 Monday, March 9, 2026 - 10:06 PM CST\n');
  
  const allNeeds = JSON.parse(fs.readFileSync('enrichment-needs-march9-906am.json', 'utf-8'));
  
  const validFirms = allNeeds.filter(lead => {
    const status = (lead.status || '').toLowerCase();
    
    // Skip non-PE entities
    if (status.includes('not a pe') || status.includes('educational') || 
        status.includes('consulting') || status.includes('recruiting') ||
        status.includes('search firm') || status.includes('executive search') ||
        status.includes('investment bank')) {
      return false;
    }
    
    if (!lead.firm) return false;
    
    const email = (lead.email || '').toLowerCase();
    const hasGenericEmail = email.includes('info@') || email.includes('sales@') || 
                            email.includes('ir@') || email.includes('contact@');
    const noContact = !lead.contactName || lead.contactName.trim() === '';
    
    return noContact || hasGenericEmail;
  });
  
  console.log(`📊 Total leads in file: ${allNeeds.length}`);
  console.log(`✅ Valid PE firms needing enrichment: ${validFirms.length}`);
  
  // Select top 12 targets
  const targets = validFirms.slice(0, 12);
  
  console.log(`\n🎯 Enriching ${targets.length} firms...\n`);
  console.log('═'.repeat(60));
  
  const results = [];
  
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    console.log(`\n[${i + 1}/${targets.length}] ${target.firm}`);
    
    const result = await enrichFirm(target);
    results.push(result);
    
    // Rate limit: 1 second between requests
    if (i < targets.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('\n📊 ENRICHMENT SUMMARY\n');
  
  const enriched = results.filter(r => r.status === 'Enriched');
  const partial = results.filter(r => r.status === 'Partial');
  const notFound = results.filter(r => r.status === 'NOT_FOUND');
  const errors = results.filter(r => r.status === 'ERROR' || r.status === 'API_ERROR');
  
  console.log(`✅ Fully Enriched (with email): ${enriched.length}`);
  console.log(`⚠️  Partially Enriched (no email): ${partial.length}`);
  console.log(`❌ Not Found: ${notFound.length}`);
  console.log(`🚨 Errors: ${errors.length}`);
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputFile = `apollo-enrichment-FIXED-${timestamp}.json`;
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  
  console.log(`\n💾 Results saved to: ${outputFile}`);
  
  if (enriched.length > 0) {
    console.log('\n✅ SUCCESSFULLY ENRICHED:\n');
    enriched.forEach((r, i) => {
      console.log(`${i + 1}. ${r.firm} (Row ${r.rowIndex})`);
      console.log(`   ${r.contactName} - ${r.title}`);
      console.log(`   📧 ${r.email}`);
      console.log(`   🔗 ${r.linkedIn || 'No LinkedIn'}`);
      console.log('');
    });
  }
  
  console.log('\n🏁 Enrichment cron completed.');
}

main().catch(console.error);
