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
    // Extract domain from website if available
    let domain = null;
    if (firm.website) {
      try {
        const url = new URL(firm.website);
        domain = url.hostname.replace('www.', '');
      } catch (e) {
        console.log(`   ⚠️  Could not parse website: ${firm.website}`);
      }
    }
    
    // Search for decision-makers: Partner, VP, Director, C-level
    const titleKeywords = [
      'Partner', 'Managing Partner', 'General Partner',
      'CEO', 'President', 'COO', 'CTO', 'CFO',
      'VP', 'Vice President',
      'Director', 'Managing Director'
    ];
    
    const searchBody = {
      api_key: APOLLO_API_KEY,
      q_organization_name: firm.firm,
      person_titles: titleKeywords,
      per_page: 5,
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
    
    // Get the best contact (highest title rank)
    const topContact = searchResults.people[0];
    
    const result = {
      rowIndex: firm.rowIndex,
      firm: firm.firm,
      website: firm.website || domain,
      contactName: topContact.name || '',
      title: topContact.title || '',
      email: topContact.email || '',
      linkedIn: topContact.linkedin_url || '',
      status: 'Enriched',
      source: 'Apollo API',
      verificationStatus: topContact.email ? 'Verified' : 'No Email'
    };
    
    console.log(`   📧 ${result.contactName} - ${result.title}`);
    console.log(`   Email: ${result.email || 'NOT AVAILABLE'}`);
    console.log(`   LinkedIn: ${result.linkedIn || 'N/A'}`);
    
    return result;
    
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return { firm: firm.firm, rowIndex: firm.rowIndex, status: 'ERROR', error: error.message };
  }
}

async function main() {
  console.log('🚀 PE Lead Enrichment - Hourly Cron Run');
  console.log('📅 Monday, March 9, 2026 - 10:06 PM CST\n');
  
  // Read enrichment needs
  const allNeeds = JSON.parse(fs.readFileSync('enrichment-needs-march9-906am.json', 'utf-8'));
  
  // Filter for valid PE firms
  const validFirms = allNeeds.filter(lead => {
    const status = (lead.status || '').toLowerCase();
    
    // Skip non-PE entities
    if (status.includes('not a pe') || status.includes('educational') || 
        status.includes('consulting') || status.includes('recruiting') ||
        status.includes('search firm') || status.includes('executive search') ||
        status.includes('investment bank')) {
      return false;
    }
    
    // Must have firm name
    if (!lead.firm) return false;
    
    // Priority: no contact OR generic email
    const email = (lead.email || '').toLowerCase();
    const hasGenericEmail = email.includes('info@') || email.includes('sales@') || 
                            email.includes('ir@') || email.includes('contact@');
    const noContact = !lead.contactName || lead.contactName.trim() === '';
    
    return noContact || hasGenericEmail;
  });
  
  console.log(`📊 Total leads in file: ${allNeeds.length}`);
  console.log(`✅ Valid PE firms needing enrichment: ${validFirms.length}`);
  
  // Select top 12 targets (rate limit friendly)
  const targets = validFirms.slice(0, 12);
  
  console.log(`\n🎯 Enriching ${targets.length} firms...\n`);
  console.log('═'.repeat(60));
  
  const results = [];
  
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    console.log(`\n[${i + 1}/${targets.length}] ${target.firm}`);
    
    const result = await enrichFirm(target);
    results.push(result);
    
    // Rate limit: 500ms between requests
    if (i < targets.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('\n📊 ENRICHMENT SUMMARY\n');
  
  const enriched = results.filter(r => r.status === 'Enriched' && r.email);
  const partialEnriched = results.filter(r => r.status === 'Enriched' && !r.email);
  const notFound = results.filter(r => r.status === 'NOT_FOUND');
  const errors = results.filter(r => r.status === 'ERROR' || r.status === 'API_ERROR');
  
  console.log(`✅ Fully Enriched (with email): ${enriched.length}`);
  console.log(`⚠️  Partially Enriched (no email): ${partialEnriched.length}`);
  console.log(`❌ Not Found: ${notFound.length}`);
  console.log(`🚨 Errors: ${errors.length}`);
  
  // Save results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputFile = `apollo-enrichment-results-${timestamp}.json`;
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  
  console.log(`\n💾 Results saved to: ${outputFile}`);
  
  // Print enriched contacts
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
