const { google } = require('googleapis');
const fs = require('fs');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function searchApolloContact(companyDomain, companyName) {
  try {
    // Try searching by domain first
    const searchBody = {
      api_key: APOLLO_API_KEY,
      q_organization_domains: companyDomain,
      person_titles: [
        'CEO', 'Chief Executive Officer',
        'Managing Partner', 'Managing Director',
        'General Partner', 'Partner',
        'President', 'COO', 'Chief Operating Officer',
        'CTO', 'Chief Technology Officer',
        'VP Technology', 'VP Operations', 'VP Digital',
        'Director Technology', 'Director Operations', 'Director Digital',
        'Head of Technology', 'Head of Operations'
      ],
      page: 1,
      per_page: 10
    };

    const response = await fetch('https://api.apollo.io/v1/mixed_people/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(searchBody)
    });

    const data = await response.json();
    
    if (data.people && data.people.length > 0) {
      // Return first valid contact with email
      for (const person of data.people) {
        if (person.email && !person.email.match(/^(info@|sales@|ir@|contact@|admin@)/i)) {
          return {
            name: person.name,
            title: person.title,
            email: person.email,
            linkedin: person.linkedin_url || '',
            source: 'Apollo.io API'
          };
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Apollo search error for ${companyName}:`, error.message);
    return null;
  }
}

async function enrichLeads() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

  // Read sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A1:N1000',
  });

  const rows = response.data.values;
  console.log('Total rows:', rows.length);

  // Find leads needing enrichment
  let needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const company = (row[0] || '').trim();
    const website = (row[1] || '').trim();
    const contactName = (row[2] || '').trim();
    const email = (row[4] || '').trim();
    const status = (row[7] || '').trim();
    const statusAlt = (row[9] || '').trim();
    
    if (!company) continue;
    
    // Skip if already enriched or dead
    if (status === 'Enriched' || statusAlt === 'Enriched') continue;
    if (status.includes('Dead') || statusAlt.includes('Dead')) continue;
    
    // Target these statuses
    const needsResearch = status === 'Needs Manual Research' || 
                         status === 'Research - Needs Email' ||
                         status === 'Contact Found - Needs Email' ||
                         status === 'Enriched - Needs Email Verification' ||
                         status === 'Enriched - Needs Email' ||
                         status === 'Needs Email' ||
                         (!contactName || !email || email.match(/^(info@|sales@|ir@|contact@)/i));
    
    if (needsResearch) {
      needsEnrichment.push({
        rowIndex: i,
        rowNumber: i + 1,
        company,
        website,
        contactName,
        email,
        status
      });
    }
  }

  console.log(`\nFound ${needsEnrichment.length} leads needing enrichment`);
  console.log('Targeting first 12 for this run...\n');

  const targets = needsEnrichment.slice(0, 12);
  let enriched = [];
  let failed = [];

  for (const lead of targets) {
    console.log(`\n[${lead.rowNumber}] ${lead.company}`);
    console.log(`  Current: ${lead.contactName || '(none)'} | ${lead.email || '(none)'}`);
    console.log(`  Status: ${lead.status}`);
    
    // Extract domain from website
    let domain = '';
    if (lead.website) {
      try {
        domain = new URL(lead.website).hostname.replace('www.', '');
      } catch (e) {
        domain = lead.website.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
      }
    }

    if (!domain) {
      console.log('  ⚠️  No website/domain - skipping');
      failed.push({ ...lead, reason: 'No domain' });
      continue;
    }

    console.log(`  🔍 Searching Apollo for ${domain}...`);
    const contact = await searchApolloContact(domain, lead.company);
    
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (contact) {
      console.log(`  ✅ Found: ${contact.name} (${contact.title})`);
      console.log(`     Email: ${contact.email}`);
      
      enriched.push({
        ...lead,
        newContact: contact
      });
    } else {
      console.log(`  ❌ No contact found`);
      failed.push({ ...lead, reason: 'Apollo no results' });
    }
  }

  // Update sheet
  if (enriched.length > 0) {
    console.log(`\n\n=== UPDATING SHEET (${enriched.length} rows) ===`);
    
    const updates = enriched.map(item => ({
      range: `Sheet1!C${item.rowNumber}:I${item.rowNumber}`,
      values: [[
        item.newContact.name,           // C: Contact Name
        item.newContact.title,          // D: Title
        item.newContact.email,          // E: Email
        '',                             // F: (skip)
        item.newContact.linkedin,       // G: LinkedIn
        'Enriched - Apollo API',        // H: Status
        `Found via Apollo.io on ${new Date().toISOString().split('T')[0]}. Source: Apollo API.` // I: Notes
      ]]
    }));

    const batchUpdate = await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      resource: {
        valueInputOption: 'RAW',
        data: updates
      }
    });

    console.log(`Updated ${batchUpdate.data.totalUpdatedRows} rows`);
  }

  // Summary report
  console.log('\n\n=== ENRICHMENT SUMMARY ===');
  console.log(`Total processed: ${targets.length}`);
  console.log(`Successfully enriched: ${enriched.length}`);
  console.log(`Failed: ${failed.length}`);
  
  if (enriched.length > 0) {
    console.log('\n✅ Enriched:');
    enriched.forEach(item => {
      console.log(`  ${item.company} → ${item.newContact.name} (${item.newContact.email})`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n❌ Failed:');
    failed.forEach(item => {
      console.log(`  ${item.company} (${item.reason})`);
    });
  }

  // Save results
  const results = {
    timestamp: new Date().toISOString(),
    enriched: enriched.map(e => ({
      company: e.company,
      contact: e.newContact.name,
      title: e.newContact.title,
      email: e.newContact.email,
      linkedin: e.newContact.linkedin
    })),
    failed: failed.map(f => ({
      company: f.company,
      reason: f.reason
    }))
  };

  fs.writeFileSync('enrichment-results-march15-cron.json', JSON.stringify(results, null, 2));
  console.log('\nResults saved to enrichment-results-march15-cron.json');
}

enrichLeads().catch(console.error);
