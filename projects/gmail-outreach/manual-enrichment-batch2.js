const {updateRow, readLeads} = require('./sheet-enrichment');

// Manual enrichment batch 2 based on research
async function updateBatch() {
  const rows = await readLeads();
  const dataRows = rows.slice(1);
  
  const enrichments = [
    {
      company: 'Gryphon Investors',
      contact: {
        contactName: 'Mark Abatto',
        title: 'Managing Director',
        email: 'abatto@gryphoninvestors.com',
        linkedinContact: 'https://www.linkedin.com/in/mark-abatto-67b7929',
        status: 'Enriched',
        lastUpdated: '2026-03-15',
        additionalNotes: 'Email pattern verified via RocketReach - last name only'
      }
    },
    {
      company: 'Wynnchurch Capital',
      contact: {
        contactName: 'Brian R. Riordan',
        title: 'Managing Director',
        email: 'briordan@wynnchurch.com',
        linkedinContact: 'https://www.linkedin.com/in/brian-riordan-664496a',
        status: 'Enriched',
        lastUpdated: '2026-03-15',
        additionalNotes: 'Email pattern verified via ContactOut - first initial + last name'
      }
    },
    {
      company: 'The Riverside Company',
      contact: {
        contactName: 'Stewart Kohl',
        title: 'Co-CEO',
        email: 'SKohl@riversidecompany.com',
        linkedinContact: 'https://www.linkedin.com/in/stewart-kohl',
        status: 'Enriched',
        lastUpdated: '2026-03-15',
        additionalNotes: 'Email pattern verified via LeadIQ - first initial + last name'
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
  
  console.log('\n✅ Manual enrichment batch 2 complete');
}

updateBatch().catch(console.error);
