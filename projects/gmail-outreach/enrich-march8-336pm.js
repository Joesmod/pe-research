const { google } = require('googleapis');
const axios = require('axios');
const fs = require('fs');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

const needsEnrichment = [
  {
    rowIndex: 708,
    company: "ArrowMark Partners",
    contact: "Sanjai Bhonsle",
    email: "",
    website: "http://www.arrowmarkpartners.com",
    status: "Partial",
    reason: "no_email"
  },
  {
    rowIndex: 724,
    company: "Carmel Capital Partners",
    contact: "Russell Silberstein",
    email: "",
    website: "",
    status: "Partial",
    reason: "no_email"
  },
  {
    rowIndex: 741,
    company: "Essex Investment Management Company, LLC",
    contact: "Nancy Prial",
    email: "",
    website: "http://www.essexinvest.com",
    status: "Partial",
    reason: "no_email"
  }
];

async function searchApollo(companyName, domain) {
  try {
    const response = await axios.post('https://api.apollo.io/api/v1/mixed_people/api_search', {
      organization_name: companyName,
      ...(domain && { organization_domains: [domain] }),
      person_titles: [
        'CEO', 'Chief Executive Officer',
        'Managing Partner', 'General Partner', 'Partner',
        'Managing Director', 'Director',
        'COO', 'Chief Operating Officer',
        'CTO', 'Chief Technology Officer',
        'VP', 'Vice President',
        'Head of'
      ],
      per_page: 10
    }, {
      headers: {
        'X-Api-Key': APOLLO_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    const people = response.data.people || [];
    return people.filter(p => p.email && !p.email.match(/^(info|sales|ir|contact|admin|support)@/i));
  } catch (error) {
    console.error(`Apollo search error for ${companyName}:`, error.response?.data || error.message);
    return [];
  }
}

async function enrichLeads() {
  const enriched = [];
  
  for (const lead of needsEnrichment) {
    console.log(`\nEnriching: ${lead.company}`);
    
    let domain = null;
    if (lead.website) {
      const match = lead.website.match(/https?:\/\/(?:www\.)?([^\/]+)/);
      domain = match ? match[1] : null;
    }
    
    const results = await searchApollo(lead.company, domain);
    
    if (results.length > 0) {
      // Prioritize: Partner > Director > VP > CEO
      const partner = results.find(p => /partner/i.test(p.title));
      const director = results.find(p => /director/i.test(p.title));
      const vp = results.find(p => /vp|vice president/i.test(p.title));
      const ceo = results.find(p => /ceo|chief executive/i.test(p.title));
      
      const best = partner || director || vp || ceo || results[0];
      
      enriched.push({
        rowIndex: lead.rowIndex,
        company: lead.company,
        contactName: best.name,
        title: best.title,
        email: best.email,
        linkedIn: best.linkedin_url || '',
        source: 'Apollo',
        status: 'Enriched'
      });
      
      console.log(`  ✓ Found: ${best.name} (${best.title}) - ${best.email}`);
    } else {
      console.log(`  ✗ No results found`);
    }
    
    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n\nEnrichment Summary:`);
  console.log(`Total leads: ${needsEnrichment.length}`);
  console.log(`Successfully enriched: ${enriched.length}`);
  console.log(JSON.stringify(enriched, null, 2));
  
  fs.writeFileSync('enrichment-results-march8-336pm.json', JSON.stringify(enriched, null, 2));
  
  return enriched;
}

enrichLeads().catch(console.error);
