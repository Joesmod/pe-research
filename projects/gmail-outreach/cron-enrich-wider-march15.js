const { google } = require('googleapis');
const fs = require('fs');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function searchApolloContact(companyDomain, companyName) {
  try {
    const searchBody = {
      api_key: APOLLO_API_KEY,
      q_organization_domains: companyDomain,
      person_titles: [
        'CEO', 'Chief Executive Officer',
        'Managing Partner', 'Managing Director',
        'General Partner', 'Partner',
        'President', 'COO', 'Chief Operating Officer',
        'CTO', 'VP Technology', 'VP Operations',
        'Director Technology', 'Director Operations',
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
    console.error(`Apollo error for ${companyName}:`, error.message);
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

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A1:N1000',
  });

  const rows = response.data.values;
  console.log('Total rows:', rows.length);

  // Find leads with sector statuses (not "Enriched")
  let needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const company = (row[0] || '').trim();
    const website = (row[1] || '').trim();
    const contactName = (row[2] || '').trim();
    const title = (row[3] || '').trim();
    const email = (row[4] || '').trim();
    const status = (row[7] || '').trim();
    
    if (!company || !website) continue;
    
    // Skip if already fully enriched or dead
    if (status.startsWith('Enriched')) continue;
    if (status.includes('Dead')) continue;
    
    // Include leads with sector descriptions, generic emails, or missing data
    const hasSectorStatus = status.match(/(Business Services|Healthcare|Technology|Industrial|Consumer|Financial Services|Manufacturing|Distribution)/i);
    const hasGenericEmail = email && email.match(/^(info@|sales@|ir@|contact@)/i);
    const hasNoDirectEmail = !email || hasGenericEmail;
    const hasContact = contactName && contactName.length > 0;
    
    if ((hasSectorStatus && !hasContact) || hasNoDirectEmail || !hasContact) {
      needsEnrichment.push({
        rowIndex: i,
        rowNumber: i + 1,
        company,
        website,
        contactName,
        title,
        email,
        status,
        reason: !hasContact ? 'No contact' : hasGenericEmail ? 'Generic email' : 'Needs verification'
      });
    }
  }

  console.log(`\nFound ${needsEnrichment.length} leads needing enrichment`);
  console.log('Targeting first 15 for this run...\n');

  const targets = needsEnrichment.slice(0, 15);
  let enriched = [];
  let failed = [];

  for (const lead of targets) {
    console.log(`\n[${lead.rowNumber}] ${lead.company}`);
    console.log(`  Current: ${lead.contactName || '(none)'} | ${lead.email || '(none)'}`);
    console.log(`  Status: ${lead.status}`);
    console.log(`  Reason: ${lead.reason}`);
    
    let domain = '';
    if (lead.website) {
      try {
        domain = new URL(lead.website).hostname.replace('www.', '');
      } catch (e) {
        domain = lead.website.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
      }
    }

    if (!domain) {
      console.log('  ⚠️  No domain - skipping');
      failed.push({ ...lead, reason: 'No domain' });
      continue;
    }

    console.log(`  🔍 Searching Apollo for ${domain}...`);
    const contact = await searchApolloContact(domain, lead.company);
    
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (contact) {
      console.log(`  ✅ Found: ${contact.name} (${contact.title})`);
      console.log(`     Email: ${contact.email}`);
      
      enriched.push({
        ...lead,
        newContact: contact
      });
    } else {
      console.log(`  ❌ No contact found via Apollo`);
      failed.push({ ...lead, apolloFailed: true });
    }
  }

  // Update sheet
  if (enriched.length > 0) {
    console.log(`\n\n=== UPDATING SHEET (${enriched.length} rows) ===`);
    
    const updates = enriched.map(item => ({
      range: `Sheet1!C${item.rowNumber}:I${item.rowNumber}`,
      values: [[
        item.newContact.name,
        item.newContact.title,
        item.newContact.email,
        '',
        item.newContact.linkedin,
        'Enriched - Apollo API',
        `Found via Apollo.io on ${new Date().toISOString().split('T')[0]}.`
      ]]
    }));

    const batchUpdate = await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      resource: {
        valueInputOption: 'RAW',
        data: updates
      }
    });

    console.log(`✅ Updated ${batchUpdate.data.totalUpdatedRows} rows`);
  }

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
  
  const results = {
    timestamp: new Date().toISOString(),
    summary: {
      processed: targets.length,
      enriched: enriched.length,
      failed: failed.length
    },
    enriched: enriched.map(e => ({
      company: e.company,
      contact: e.newContact.name,
      title: e.newContact.title,
      email: e.newContact.email,
      linkedin: e.newContact.linkedin
    })),
    failed: failed.map(f => ({
      company: f.company,
      website: f.website,
      currentContact: f.contactName,
      currentEmail: f.email,
      reason: f.apolloFailed ? 'Apollo no results' : f.reason
    }))
  };

  fs.writeFileSync('enrichment-summary-march15-cron.json', JSON.stringify(results, null, 2));
  console.log('\n📝 Results saved to enrichment-summary-march15-cron.json');

  return results;
}

enrichLeads().catch(console.error);
