const {updateRow, readLeads} = require('./sheet-enrichment');

// Manual enrichment batch based on research
// Email patterns verified via RocketReach/SignalHire/ContactOut

async function updateBatch() {
  const rows = await readLeads();
  const dataRows = rows.slice(1);
  
  // Find row indices for these companies
  const enrichments = [
    {
      company: 'Trivest Partners',
      contact: {
        contactName: 'Forest Wester',
        title: 'Managing Partner, Discovery',
        email: 'fwester@trivest.com',
        linkedinContact: 'https://www.linkedin.com/in/forest-wester',
        status: 'Enriched',
        lastUpdated: '2026-03-15',
        additionalNotes: 'Email pattern verified via ContactOut - first initial + last name'
      }
    },
    {
      company: 'Wind Point Partners',
      contact: {
        contactName: 'Nathan Brown',
        title: 'Managing Director',
        email: 'nbrown@wppartners.com',
        linkedinContact: 'https://www.linkedin.com/in/nathan-brown-82bb71169',
        status: 'Enriched',
        lastUpdated: '2026-03-15',
        additionalNotes: 'Email pattern verified via RocketReach - first initial + last name'
      }
    },
    {
      company: 'Accel-KKR',
      contact: {
        contactName: 'Tom Barnds',
        title: 'Co-Managing Partner',
        email: 't_b@accel-kkr.com',
        linkedinContact: 'https://www.linkedin.com/in/tom-barnds-6083525',
        status: 'Enriched',
        lastUpdated: '2026-03-15',
        additionalNotes: 'Email pattern verified via SignalHire - first initial underscore last initial'
      }
    }
  ];
  
  for (const {company, contact} of enrichments) {
    // Find the first row matching this company that needs enrichment
    const index = dataRows.findIndex(row => {
      const [companyName, website, contactName, title, email] = row;
      if (companyName !== company) return false;
      // Need enrichment if missing contact or generic email
      if (!contactName || contactName.trim() === '') return true;
      if (!email || email.trim() === '' || email.match(/^(info|sales|ir)@/i)) return true;
      return false;
    });
    
    if (index !== -1) {
      console.log(`\nUpdating ${company} at row ${index + 2}`);
      console.log(`  Contact: ${contact.contactName} (${contact.title})`);
      console.log(`  Email: ${contact.email}`);
      
      await updateRow(index + 1, contact); // +1 for header row
      console.log(`  ✓ Updated`);
    } else {
      console.log(`\n⚠ Could not find ${company} needing enrichment`);
    }
  }
  
  console.log('\n✅ Manual enrichment batch complete');
}

updateBatch().catch(console.error);
