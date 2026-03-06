const axios = require('axios');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Target firms to enrich (from sheet row 735-750)
const targets = [
  { firm: 'DLP Capital', website: 'dlpcapital.com', rowIndex: 735 },
  { firm: 'Driehaus Capital Management LLC', website: 'driehaus.com', rowIndex: 736 },
  { firm: 'Dynamics Search Partners', website: 'dspny.com', rowIndex: 737 },
  { firm: 'EIV Capital, LLC', website: 'eivcapital.com', rowIndex: 739 },
  { firm: 'Essex Investment Management Company, LLC', website: 'essexinvest.com', rowIndex: 741 },
  { firm: 'First Trust Capital Management L.P.', website: 'firsttrustcapital.com', rowIndex: 743 },
  { firm: 'Funden', website: 'funden.com', rowIndex: 744 },
  { firm: 'GF Capital Management & Advisors, LLC', website: 'gfcap.com', rowIndex: 745 },
  { firm: 'Great Point Partners', website: 'gppfunds.com', rowIndex: 746 },
  { firm: 'Hermitage Capital', website: 'hermitagecap.com', rowIndex: 749 }
];

async function searchContacts(firmName, domain) {
  try {
    // Search for decision-makers at the firm
    const response = await axios.post(
      'https://api.apollo.io/v1/mixed_people/api_search',
      {
        q_organization_domains: domain,
        person_titles: [
          'Partner',
          'Managing Partner',
          'Managing Director',
          'CEO',
          'Founder',
          'Co-Founder',
          'President',
          'General Partner'
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

    const people = response.data.people || [];
    return people.map(person => ({
      name: person.name,
      title: person.title,
      email: person.email,
      linkedin: person.linkedin_url,
      emailStatus: person.email_status
    }));
  } catch (error) {
    console.error(`Error searching ${firmName}:`, error.response?.data || error.message);
    return [];
  }
}

(async () => {
  console.log('Searching Apollo for PE firm contacts...\n');
  
  const enrichments = [];
  
  for (const target of targets) {
    console.log(`\nSearching: ${target.firm} (${target.website})`);
    const contacts = await searchContacts(target.firm, target.website);
    
    if (contacts.length > 0) {
      console.log(`  Found ${contacts.length} contacts:`);
      contacts.forEach((c, i) => {
        console.log(`    ${i + 1}. ${c.name} - ${c.title}`);
        console.log(`       Email: ${c.email || '(none)'} (${c.emailStatus})`);
      });
      
      // Take the first contact with verified email
      const bestContact = contacts.find(c => c.email && c.emailStatus === 'verified') || contacts[0];
      
      if (bestContact && bestContact.email) {
        enrichments.push({
          rowIndex: target.rowIndex,
          firmName: target.firm,
          contactName: bestContact.name,
          title: bestContact.title,
          email: bestContact.email,
          linkedin: bestContact.linkedin || '',
          notes: `Contact found via Apollo.io (email status: ${bestContact.emailStatus})`,
          status: 'Enriched'
        });
      }
    } else {
      console.log(`  No contacts found`);
    }
    
    // Rate limit: wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n\n=== ENRICHMENTS FOUND ===`);
  console.log(JSON.stringify(enrichments, null, 2));
  console.log(`\nTotal enrichments: ${enrichments.length}`);
  
})().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
