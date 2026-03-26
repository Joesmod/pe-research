const { google } = require('googleapis');
const fs = require('fs');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Manual enrichment data from web research
const manualEnrichments = {
  'Veritas Capital': {
    domain: 'veritascapital.com',
    name: 'Ramzi Musallam',
    title: 'CEO & Managing Partner',
    email: 'rmusallam@veritascapital.com', // Pattern inference from domain
    linkedin: 'https://www.linkedin.com/in/ramzi-musallam',
    source: 'Email pattern inferred from official website team page'
  },
  'TowerBrook Capital Partners': {
    domain: 'towerbrook.com',
    name: 'Karim Saddi',
    title: 'Co-CEO & Managing Partner',
    email: 'ksaddi@towerbrook.com', // Pattern inference
    linkedin: 'https://www.linkedin.com/in/karim-saddi-455067173/',
    source: 'Email pattern inferred from official website'
  },
  'Welsh Carson Anderson & Stowe': {
    domain: 'wcas.com',
    name: 'D. Scott Mackesy',
    title: 'Managing Partner',
    email: 'smackesy@wcas.com', // Known pattern from notes
    linkedin: 'https://wcas.com/firm/team/d-scott-mackesy/',
    source: 'Email pattern [first_initial][last]@wcas.com from website'
  },
  'Ridgemont Equity Partners': {
    domain: 'ridgemontep.com',
    name: 'John Shimp',
    title: 'Managing Partner',
    email: 'JShimp@ridgemontep.com', // Known pattern FLast@
    linkedin: 'https://www.linkedin.com/in/john-shimp-91a73927/',
    source: 'Email pattern FLast@ridgemontep.com verified via RocketReach'
  },
  'Tritium Partners': {
    domain: 'tritiumpartners.com',
    name: 'David Lack',
    title: 'Managing Partner',
    email: 'dlack@tritiumpartners.com', // Pattern inference
    linkedin: 'https://www.linkedin.com/in/davidlack',
    source: 'Email pattern inferred from official website tritiumpartners.com'
  },
  'Cressey & Company': {
    domain: 'cresseyco.com',
    name: 'Bryan Cressey',
    title: 'Founder',
    email: 'bcressey@cresseyco.com', // Pattern inference
    linkedin: 'https://www.linkedin.com/in/bryan-cressey/',
    source: 'Email pattern inferred from official website cresseyco.com'
  }
};

async function searchApollo(domain, companyName) {
  try {
    const searchBody = {
      api_key: APOLLO_API_KEY,
      q_organization_domains: domain,
      person_titles: [
        'CEO', 'Managing Partner', 'Managing Director',
        'General Partner', 'Partner',
        'President', 'COO'
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
        if (person.email && !person.email.match(/^(info@|sales@|ir@)/i)) {
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
  
  // Find leads with URL emails
  let targets = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const company = (row[0] || '').trim();
    const website = (row[1] || '').trim();
    const contactName = (row[2] || '').trim();
    const title = (row[3] || '').trim();
    const email = (row[4] || '').trim();
    const status = (row[7] || '').trim();
    
    if (!company) continue;
    if (status.includes('Dead')) continue;
    
    const emailIsUrl = email && email.startsWith('http');
    
    if (emailIsUrl) {
      targets.push({
        rowIndex: i,
        rowNumber: i + 1,
        company,
        website,
        contactName,
        title,
        email
      });
    }
  }

  console.log(`Found ${targets.length} leads with URL emails\n`);

  let enriched = [];
  let failed = [];

  // Process unique companies (dedupe Ridgemont)
  const uniqueCompanies = new Map();
  targets.forEach(t => {
    if (!uniqueCompanies.has(t.company)) {
      uniqueCompanies.set(t.company, [t]);
    } else {
      uniqueCompanies.get(t.company).push(t);
    }
  });

  for (const [companyName, leads] of uniqueCompanies) {
    console.log(`\n=== ${companyName} (${leads.length} rows) ===`);
    
    let contact = null;
    
    // Check manual enrichments first
    if (manualEnrichments[companyName]) {
      console.log('  ✅ Using manual enrichment data');
      contact = manualEnrichments[companyName];
    } else {
      // Try to extract domain from existing website field
      // (Note: in this data, website field contains contact names, need to find real domain)
      let domain = '';
      
      // Try common pattern
      const domainGuess = companyName.toLowerCase()
        .replace(/\s+/g, '')
        .replace(/&/g, 'and')
        .replace(/,/g, '')
        .replace(/\./g, '') + '.com';
      
      console.log(`  🔍 Searching Apollo for ${domainGuess}...`);
      contact = await searchApollo(domainGuess, companyName);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    if (contact) {
      console.log(`  ✅ ${contact.name} (${contact.title})`);
      console.log(`     ${contact.email}`);
      
      // Apply to all rows for this company
      leads.forEach(lead => {
        enriched.push({
          ...lead,
          newContact: contact
        });
      });
    } else {
      console.log(`  ❌ No contact found`);
      leads.forEach(lead => {
        failed.push({ ...lead, reason: 'No Apollo/manual result' });
      });
    }
  }

  // Update sheet
  if (enriched.length > 0) {
    console.log(`\n\n=== UPDATING ${enriched.length} ROWS ===`);
    
    const updates = enriched.map(item => ({
      range: `Sheet1!C${item.rowNumber}:I${item.rowNumber}`,
      values: [[
        item.newContact.name,
        item.newContact.title,
        item.newContact.email,
        '',
        item.newContact.linkedin,
        'Enriched',
        item.newContact.source || 'Enriched 2026-03-15'
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

  console.log('\n\n=== SUMMARY ===');
  console.log(`Enriched: ${enriched.length} rows`);
  console.log(`Failed: ${failed.length} rows`);
  
  if (enriched.length > 0) {
    console.log('\n✅ Enriched companies:');
    const companiesDone = new Set(enriched.map(e => e.company));
    companiesDone.forEach(c => console.log(`  - ${c}`));
  }

  const results = {
    timestamp: new Date().toISOString(),
    enriched: enriched.map(e => ({
      row: e.rowNumber,
      company: e.company,
      contact: e.newContact.name,
      email: e.newContact.email
    })),
    failed: failed.map(f => ({ company: f.company, reason: f.reason }))
  };

  fs.writeFileSync('enrichment-url-fixes-march15.json', JSON.stringify(results, null, 2));
  console.log('\n📝 Results saved to enrichment-url-fixes-march15.json');
}

enrichLeads().catch(console.error);
