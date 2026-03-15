const axios = require('axios');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Leads that need enrichment (from our earlier scan)
const leadsToEnrich = [
  { company: 'Mercury Fund', website: 'http://www.mercuryfund.com', currentContact: 'Blair Garrou', currentEmail: 'blair@mercuryfund.com' },
  { company: 'Riverside Company', website: 'https://www.riversidecompany.com', currentContact: 'Stewart Kohl', currentEmail: '' },
  { company: 'GenCap', website: 'https://www.gencap.com', currentContact: 'J. Ryan Clark', currentEmail: '' },
  { company: 'Trivest', website: 'https://www.trivest.com', currentContact: 'Chris Weldon', currentEmail: '' },
  { company: 'Excellere Partners', website: 'https://excellere.com', currentContact: 'Brad Cornell', currentEmail: '' },
  { company: 'Boathouse Capital', website: 'https://boathousecapital.com', currentContact: 'Bill Dyer', currentEmail: '' },
  { company: 'Bow River Capital', website: 'https://www.bowrivercapital.com', currentContact: 'Greg Hiatrides', currentEmail: '' },
  { company: 'Ampersand Capital', website: 'https://ampersandcapital.com', currentContact: 'Herb Hooper', currentEmail: 'info@ampersandcapital.com' },
  { company: 'HGGC', website: 'https://www.hggc.com', currentContact: 'Rich Lawson', currentEmail: '' },
];

async function searchApolloContacts(company, website) {
  try {
    // First try to find the organization
    const domain = website ? new URL(website).hostname.replace('www.', '') : '';
    
    // Search for people at the organization using the new API endpoint
    const response = await axios.post(
      'https://api.apollo.io/api/v1/mixed_people/api_search',
      {
        q_organization_domains: domain,
        person_titles: [
          'CEO', 'Chief Executive Officer',
          'Managing Partner', 'Managing Director',
          'Partner', 'General Partner',
          'Principal',
          'President',
          'COO', 'Chief Operating Officer',
          'CTO', 'Chief Technology Officer'
        ],
        page: 1,
        per_page: 5
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );

    if (response.data && response.data.people && response.data.people.length > 0) {
      return response.data.people.map(person => ({
        name: person.name,
        title: person.title,
        email: person.email,
        linkedin: person.linkedin_url,
        verified: person.email_status === 'verified'
      }));
    }

    return [];
  } catch (error) {
    console.error(`Error searching Apollo for ${company}:`, error.response?.data || error.message);
    return [];
  }
}

async function enrichLeads() {
  console.log('Starting Apollo enrichment...\n');
  const results = [];

  for (const lead of leadsToEnrich) {
    console.log(`\n=== Searching for contacts at ${lead.company} ===`);
    
    const contacts = await searchApolloContacts(lead.company, lead.website);
    
    if (contacts.length > 0) {
      console.log(`Found ${contacts.length} contacts:`);
      contacts.forEach((contact, idx) => {
        console.log(`  ${idx + 1}. ${contact.name} - ${contact.title}`);
        console.log(`     Email: ${contact.email || '(not found)'} ${contact.verified ? '✓ verified' : ''}`);
        console.log(`     LinkedIn: ${contact.linkedin || '(not found)'}`);
      });

      // Pick best contact (first verified email, or first contact if none verified)
      const bestContact = contacts.find(c => c.verified && c.email) || contacts[0];
      
      results.push({
        company: lead.company,
        website: lead.website,
        contactName: bestContact.name,
        title: bestContact.title,
        email: bestContact.email,
        linkedin: bestContact.linkedin,
        verified: bestContact.verified,
        source: 'Apollo API',
        timestamp: new Date().toISOString()
      });

      console.log(`\n  ✓ Selected: ${bestContact.name} (${bestContact.title})`);
    } else {
      console.log(`  ✗ No contacts found`);
      results.push({
        company: lead.company,
        website: lead.website,
        contactName: lead.currentContact || '',
        title: '',
        email: lead.currentEmail || '',
        linkedin: '',
        verified: false,
        source: 'Not found',
        timestamp: new Date().toISOString()
      });
    }

    // Rate limiting: wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return results;
}

async function main() {
  try {
    const enriched = await enrichLeads();
    
    console.log('\n\n=== ENRICHMENT SUMMARY ===');
    console.log(`Total leads processed: ${enriched.length}`);
    console.log(`Leads with verified emails: ${enriched.filter(l => l.verified).length}`);
    console.log(`Leads with any email: ${enriched.filter(l => l.email).length}`);
    
    // Save results
    const fs = require('fs');
    const outputPath = 'enrichment-results-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json';
    fs.writeFileSync(outputPath, JSON.stringify(enriched, null, 2));
    console.log(`\nResults saved to: ${outputPath}`);

    return enriched;
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { enrichLeads, searchApolloContacts };
