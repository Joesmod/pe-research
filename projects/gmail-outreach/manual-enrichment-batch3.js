const {updateRow, readLeads} = require('./sheet-enrichment');

// Manual enrichment batch 3 based on research
async function updateBatch() {
  const rows = await readLeads();
  const dataRows = rows.slice(1);
  
  const enrichments = [
    {
      company: 'Ridgemont Equity Partners',
      contact: {
        contactName: 'Scott Poole',
        title: 'Partner',
        email: 'SPoole@ridgemontep.com',
        linkedinContact: 'https://www.linkedin.com/in/scott-poole-44780630',
        status: 'Enriched',
        lastUpdated: '2026-03-15',
        additionalNotes: 'Email pattern verified via LeadIQ - first initial + last name'
      }
    },
    {
      company: 'Sverica Capital Management',
      contact: {
        contactName: 'Jordan Richards',
        title: 'Managing Partner',
        email: 'jordan@sverica.com',
        linkedinContact: 'https://www.linkedin.com/in/jordan-richards',
        status: 'Enriched',
        lastUpdated: '2026-03-15',
        additionalNotes: 'Email pattern verified via RocketReach - first name only'
      }
    },
    {
      company: 'American Securities LLC',
      contact: {
        contactName: 'Michael Fisch',
        title: 'Partner',
        email: 'mfisch@american-securities.com',
        linkedinContact: 'https://www.linkedin.com/in/michael-fisch',
        status: 'Enriched',
        lastUpdated: '2026-03-15',
        additionalNotes: 'Email pattern verified via RocketReach - first initial + last name'
      }
    }
  ];
  
  for (const {company, contact} of enrichments) {
    const index = dataRows.findIndex(row => {
      const [companyName, website, contactName, title, email] = row;
      if (companyName !== company) return false;
      if (!contactName || contactName.trim() === '') return true;
      if (!email || email.trim() === '' || email.match(/^(info|sales|ir)@/i)) return true;
      return false;
    });
    
    if (index !== -1) {
      console.log(`\nUpdating ${company} at row ${index + 2}`);
      console.log(`  Contact: ${contact.contactName} (${contact.title})`);
      console.log(`  Email: ${contact.email}`);
      
      await updateRow(index + 1, contact);
      console.log(`  ✓ Updated`);
    } else {
      console.log(`\n⚠ Could not find ${company} needing enrichment`);
    }
  }
  
  console.log('\n✅ Manual enrichment batch 3 complete');
}

updateBatch().catch(console.error);
