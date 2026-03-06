const axios = require('axios');

const apiKey = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function searchOrganization(firmName) {
  try {
    const response = await axios.post('https://api.apollo.io/v1/organizations/search', {
      q_organization_name: firmName,
      per_page: 1
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey
      }
    });
    
    if (response.data.organizations && response.data.organizations.length > 0) {
      const org = response.data.organizations[0];
      console.log(`Found: ${org.name}`);
      console.log(`ID: ${org.id}`);
      console.log(`Website: ${org.website_url || 'N/A'}`);
      return org.id;
    } else {
      console.log(`No organization found for: ${firmName}`);
      return null;
    }
  } catch (err) {
    console.error(`Error searching org ${firmName}:`, err.response?.data || err.message);
    return null;
  }
}

async function searchPeopleAtOrg(orgId, firmName) {
  try {
    const response = await axios.post('https://api.apollo.io/v1/mixed_people/search', {
      organization_ids: [orgId],
      person_titles: ['Partner', 'Managing Director', 'Business Development', 'Head'],
      per_page: 5
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey
      }
    });
    
    console.log(`\n=== Contacts at ${firmName} ===`);
    if (response.data.people && response.data.people.length > 0) {
      response.data.people.forEach(person => {
        console.log(`\nName: ${person.name}`);
        console.log(`Title: ${person.title}`);
        console.log(`Email: ${person.email || 'Not available'}`);
        console.log(`LinkedIn: ${person.linkedin_url || 'N/A'}`);
      });
    } else {
      console.log('No contacts found');
    }
  } catch (err) {
    console.error(`Error searching people at ${firmName}:`, err.response?.data || err.message);
  }
}

async function enrichLeads() {
  const firms = ['Apax Partners', 'Keltic Financial Partners', 'WindPoint Partners'];
  
  for (const firm of firms) {
    console.log(`\n\n========== ${firm} ==========`);
    const orgId = await searchOrganization(firm);
    if (orgId) {
      await searchPeopleAtOrg(orgId, firm);
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

enrichLeads();
