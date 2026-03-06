const axios = require('axios');
const fs = require('fs');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Firms needing enrichment from 9:06 AM analysis
const targets = [
  { firm: 'First Trust Capital Management L.P.', domain: 'firsttrustcapital.com', currentContact: 'Michael Peck, CFA', rowIndex: 743 },
  { firm: 'King Street Capital Management', domain: 'kingstreet.com', currentContact: 'Brian J. Higgins', rowIndex: 755 },
  { firm: 'Kudu Investment Management, LLC', domain: 'kuduinvestment.com', currentContact: 'Rob Jakacki', rowIndex: 757 },
  { firm: 'Left Lane Capital', domain: 'leftlane.com', currentContact: 'Vinny Pujji', rowIndex: 758 },
  { firm: 'Lowercarbon Capital', domain: 'lowercarbon.com', currentContact: 'Chris Sacca', rowIndex: 761 },
  { firm: 'Manulife | Comvest Credit Partners', domain: 'comvest.com', currentContact: 'Robert O\'Sullivan', rowIndex: 762 },
  { firm: 'Mercury Fund', domain: 'mercuryfund.com', currentContact: 'Blair Garrou', rowIndex: 763 },
  { firm: 'Merit Capital Partners', domain: 'meritcapital.com', currentContact: 'Evan Gallinson', rowIndex: 764 },
  { firm: 'Millennium Bridge Capital', domain: 'millenniumbridge.com', currentContact: 'John Fitzgerald', rowIndex: 765 },
  { firm: 'Newflow Partners', domain: 'newflow.partners', currentContact: 'Jason Levine', rowIndex: 766 },
  { firm: 'Notable Capital', domain: 'notablecap.com', currentContact: 'Glenn Solomon', rowIndex: 768 },
  { firm: 'Prospect Capital Management', domain: 'prospectcap.com', currentContact: 'Jacob Zodikoff', rowIndex: 777 },
  { firm: 'Pzena Investment Management', domain: 'pzena.com', currentContact: 'Jacob Zodikoff', rowIndex: 778 },
  { firm: 'Rainier Partners', domain: 'rainierpartners.com', currentContact: 'Jacob Zodikoff', rowIndex: 780 },
  { firm: 'Red Cove Capital', domain: 'redcovecap.com', currentContact: 'Jacob Zodikoff', rowIndex: 782 }
];

async function searchContacts(firmName, domain, currentContact) {
  try {
    console.log(`\nSearching Apollo for: ${firmName} (${domain})`);
    console.log(`Current contact: ${currentContact}`);
    
    const response = await axios.post(
      'https://api.apollo.io/v1/mixed_people/api_search',
      {
        q_organization_domains: domain,
        person_titles: [
          'Partner',
          'Managing Partner',
          'Managing Director',
          'CEO',
          'CFO',
          'COO',
          'Founder',
          'Co-Founder',
          'President',
          'General Partner',
          'Operating Partner',
          'Investment Partner'
        ],
        page: 1,
        per_page: 10
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
    
    if (people.length === 0) {
      console.log(`  ❌ No contacts found`);
      return null;
    }
    
    // Try to find the current contact first, otherwise take first result
    let bestMatch = people.find(p => p.name && p.name.toLowerCase().includes(currentContact.toLowerCase().split(',')[0]));
    if (!bestMatch) {
      bestMatch = people[0];
    }
    
    console.log(`  ✅ Found: ${bestMatch.name} - ${bestMatch.title}`);
    console.log(`     Email: ${bestMatch.email || '(no email)'}`);
    console.log(`     LinkedIn: ${bestMatch.linkedin_url || '(no LinkedIn)'}`);
    
    return {
      name: bestMatch.name,
      title: bestMatch.title,
      email: bestMatch.email,
      linkedin: bestMatch.linkedin_url,
      organization: bestMatch.organization?.name || firmName,
      allContacts: people.slice(0, 3).map(p => ({
        name: p.name,
        title: p.title,
        email: p.email
      }))
    };
    
  } catch (error) {
    console.log(`  ❌ Error: ${error.response?.data?.error || error.message}`);
    return null;
  }
}

async function enrichAll() {
  console.log('=== Apollo Enrichment - March 6, 2026 9:06 AM ===\n');
  
  const results = [];
  
  for (const target of targets) {
    const result = await searchContacts(target.firm, target.domain, target.currentContact);
    
    if (result) {
      results.push({
        firm: target.firm,
        rowIndex: target.rowIndex,
        ...result
      });
    }
    
    // Rate limiting - wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Save results
  fs.writeFileSync('apollo-enriched-march6-906am.json', JSON.stringify(results, null, 2));
  
  console.log(`\n=== Summary ===`);
  console.log(`Total firms searched: ${targets.length}`);
  console.log(`Contacts found: ${results.length}`);
  console.log(`Success rate: ${Math.round((results.length / targets.length) * 100)}%`);
  console.log(`\nResults saved to: apollo-enriched-march6-906am.json`);
  
  // Show firms with emails
  const withEmails = results.filter(r => r.email);
  console.log(`\nFirms with verified emails: ${withEmails.length}`);
  withEmails.forEach(r => {
    console.log(`  • ${r.name} (${r.title}) at ${r.firm}`);
    console.log(`    ${r.email}`);
  });
}

enrichAll().catch(console.error);
