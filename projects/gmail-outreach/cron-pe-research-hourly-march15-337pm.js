const { google } = require('googleapis');
const fs = require('fs');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Wide net of decision-maker titles
const TARGET_TITLES = [
  'CEO', 'Chief Executive Officer',
  'Managing Partner', 'Operating Partner', 'General Partner', 'Partner',
  'Managing Director', 'President', 'Founder',
  'COO', 'Chief Operating Officer',
  'CTO', 'Chief Technology Officer',
  'CMO', 'Chief Marketing Officer',
  'CFO', 'Chief Financial Officer',
  'VP Technology', 'VP Operations', 'VP Digital Transformation', 'VP Portfolio Operations',
  'VP Business Development', 'VP Marketing',
  'Director Technology', 'Director Product', 'Director Operations',
  'Director Marketing', 'Director Digital', 'Director Business Development',
  'Head of Value Creation', 'Head of Portfolio Operations',
  'Head of Business Development', 'Head of Technology'
];

async function searchApolloContact(companyDomain, companyName) {
  try {
    const searchBody = {
      api_key: APOLLO_API_KEY,
      q_organization_domains: companyDomain,
      person_titles: TARGET_TITLES,
      page: 1,
      per_page: 15
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
      // Filter out generic emails, return first valid contact
      for (const person of data.people) {
        if (person.email && !person.email.match(/^(info@|sales@|ir@|contact@|admin@|support@|hello@)/i)) {
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

function extractDomain(websiteUrl) {
  if (!websiteUrl) return '';
  try {
    const url = new URL(websiteUrl);
    return url.hostname.replace('www.', '');
  } catch (e) {
    // Fallback parsing
    return websiteUrl.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].trim();
  }
}

async function enrichLeads() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

  // Read the full sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A1:N1000',
  });

  const rows = response.data.values;
  const headers = rows[0] || [];
  console.log('=== PE RESEARCH & ENRICHMENT (Hourly Cron) ===');
  console.log(`Total rows in sheet: ${rows.length}`);
  console.log(`Columns: ${headers.join(', ')}\n`);

  // Identify leads needing enrichment
  let needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const company = (row[0] || '').trim();
    const website = (row[1] || '').trim();
    const contactName = (row[2] || '').trim();
    const title = (row[3] || '').trim();
    const email = (row[4] || '').trim();
    const status = (row[7] || '').trim();
    
    if (!company) continue;
    
    // Skip if enriched or dead
    if (status.toLowerCase().includes('enriched') && contactName && email && !email.match(/^(info@|sales@|ir@|contact@)/i)) {
      continue;
    }
    if (status.toLowerCase().includes('dead')) continue;
    
    // Target: missing contact OR missing/generic email
    const needsResearch = !contactName || 
                         !email || 
                         email.match(/^(info@|sales@|ir@|contact@|admin@|support@)/i) ||
                         status.toLowerCase().includes('needs');
    
    if (needsResearch) {
      needsEnrichment.push({
        rowIndex: i,
        rowNumber: i + 1,
        company,
        website,
        contactName,
        title,
        email,
        status
      });
    }
  }

  console.log(`Found ${needsEnrichment.length} leads needing enrichment`);
  console.log('Processing first 15 this run...\n');

  const targets = needsEnrichment.slice(0, 15);
  let enriched = [];
  let failed = [];
  let researchNotes = [];

  for (const lead of targets) {
    console.log(`\n[Row ${lead.rowNumber}] ${lead.company}`);
    console.log(`  Current: ${lead.contactName || '(none)'} | ${lead.email || '(none)'}`);
    console.log(`  Status: ${lead.status || 'Unknown'}`);
    
    const domain = extractDomain(lead.website);
    
    if (!domain) {
      console.log('  ⚠️  No website/domain - marking for manual research');
      researchNotes.push({ ...lead, reason: 'No domain found' });
      continue;
    }

    console.log(`  🔍 Searching Apollo for ${domain}...`);
    const contact = await searchApolloContact(domain, lead.company);
    
    // Rate limit delay
    await new Promise(resolve => setTimeout(resolve, 1200));

    if (contact) {
      console.log(`  ✅ FOUND: ${contact.name} (${contact.title})`);
      console.log(`     Email: ${contact.email}`);
      if (contact.linkedin) console.log(`     LinkedIn: ${contact.linkedin}`);
      
      enriched.push({
        ...lead,
        newContact: contact
      });
    } else {
      console.log(`  ❌ Apollo returned no results`);
      console.log(`  💡 Recommend manual search: site:${domain} team OR site:linkedin.com/in ${lead.company}`);
      researchNotes.push({ 
        ...lead, 
        reason: 'Apollo no results - needs web research',
        searchHint: `site:${domain} team, site:linkedin.com/in ${lead.company}, check press releases`
      });
    }
  }

  // Batch update the sheet
  if (enriched.length > 0) {
    console.log(`\n\n=== UPDATING SHEET (${enriched.length} enriched rows) ===`);
    
    const updates = enriched.map(item => ({
      range: `Sheet1!C${item.rowNumber}:I${item.rowNumber}`,
      values: [[
        item.newContact.name,              // C: Contact Name
        item.newContact.title,             // D: Title
        item.newContact.email,             // E: Email
        item.website || '',                // F: Website (preserve)
        item.newContact.linkedin || '',    // G: LinkedIn
        'Enriched',                        // H: Status
        `Apollo.io ${new Date().toISOString().split('T')[0]}. ${item.newContact.source}` // I: Notes
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

  // Summary
  console.log('\n\n=== ENRICHMENT SUMMARY ===');
  console.log(`Processed: ${targets.length}`);
  console.log(`Enriched: ${enriched.length}`);
  console.log(`Need manual research: ${researchNotes.length}`);
  
  if (enriched.length > 0) {
    console.log('\n✅ Successfully Enriched:');
    enriched.forEach(item => {
      console.log(`  [${item.rowNumber}] ${item.company}`);
      console.log(`      → ${item.newContact.name} | ${item.newContact.title}`);
      console.log(`      → ${item.newContact.email}`);
    });
  }
  
  if (researchNotes.length > 0) {
    console.log('\n🔍 Needs Manual Research:');
    researchNotes.forEach(item => {
      console.log(`  [${item.rowNumber}] ${item.company} - ${item.reason}`);
      if (item.searchHint) {
        console.log(`      Hint: ${item.searchHint}`);
      }
    });
  }

  // Save results
  const results = {
    timestamp: new Date().toISOString(),
    targetedCount: targets.length,
    enrichedCount: enriched.length,
    needsManualCount: researchNotes.length,
    enriched: enriched.map(e => ({
      rowNumber: e.rowNumber,
      company: e.company,
      contact: e.newContact.name,
      title: e.newContact.title,
      email: e.newContact.email,
      linkedin: e.newContact.linkedin
    })),
    needsManual: researchNotes.map(n => ({
      rowNumber: n.rowNumber,
      company: n.company,
      reason: n.reason,
      searchHint: n.searchHint || ''
    }))
  };

  const resultsFile = `enrichment-results-${Date.now()}.json`;
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
  console.log(`\nResults saved: ${resultsFile}`);
  
  console.log('\n=== CRON RUN COMPLETE ===');
}

enrichLeads().catch(console.error);
