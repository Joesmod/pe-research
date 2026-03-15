const { google } = require('googleapis');
const axios = require('axios');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Targets from read-full-sheet
const targets = [
  { row: 630, company: 'Kinect Capital', domain: 'kinectcap.com' },
  { row: 763, company: 'Mercury Fund', domain: 'mercuryfund.com' },
  { row: 801, company: 'Tennenbaum Capital Partners, LLC', domain: 'tennenbaumcapital.com' },
  { row: 808, company: 'UNC Kenan-Flagler Private Equity Fund', domain: 'kenan-flagler.unc.edu' },
  { row: 909, company: 'Backstroke', domain: null }, // Need to find domain
  { row: 910, company: 'Satso', domain: null }, // Need to find domain
  { row: 1061, company: 'Rehab Medical', domain: 'rehabmedical.com' },
  { row: 1064, company: 'The Riverside Company', domain: 'riversidecompany.com' },
  { row: 1066, company: 'Genstar Capital', domain: 'genstarcapital.com' },
  { row: 1067, company: 'Trivest Partners', domain: 'trivest.com' },
  { row: 1068, company: 'Excellere Partners', domain: 'excellerepartners.com' },
  { row: 1069, company: 'Boathouse Capital', domain: 'boathousecapital.com' },
  { row: 1070, company: 'Bow River Capital', domain: 'bowrivercapital.com' },
  { row: 1073, company: 'Ampersand Capital Partners', domain: 'ampersandcapital.com' },
  { row: 1074, company: 'HGGC', domain: 'hggc.com' }
];

async function searchApolloContacts(company, domain) {
  const url = 'https://api.apollo.io/v1/mixed_people/api_search';
  
  const titles = [
    'CEO', 'Chief Executive Officer', 'President',
    'COO', 'Chief Operating Officer',
    'CTO', 'Chief Technology Officer',
    'Managing Partner', 'General Partner', 'Operating Partner',
    'Managing Director', 'Director',
    'VP Technology', 'VP Operations', 'VP Digital',
    'Head of Technology', 'Head of Operations', 'Head of Portfolio Operations'
  ];
  
  try {
    const response = await axios.post(url, {
      organization_domains: domain ? [domain] : undefined,
      organization_names: [company],
      person_titles: titles,
      page: 1,
      per_page: 10
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': APOLLO_API_KEY
      }
    });

    if (response.data && response.data.people && response.data.people.length > 0) {
      // Return first person with an email
      for (const person of response.data.people) {
        if (person.email && !person.email.includes('info@') && !person.email.includes('sales@')) {
          return {
            name: person.name,
            title: person.title,
            email: person.email,
            linkedin: person.linkedin_url || '',
            source: 'Apollo API'
          };
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Apollo API error for ${company}:`, error.response?.data || error.message);
    return null;
  }
}

async function updateSheet(updates) {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth });

  for (const update of updates) {
    const { row, contact, title, email, linkedin, notes } = update;
    
    // Update columns C (contact), D (title), E (email), F (linkedin), K (notes)
    const requests = [];
    
    if (contact) {
      requests.push({
        range: `Sheet1!C${row}`,
        values: [[contact]]
      });
    }
    
    if (title) {
      requests.push({
        range: `Sheet1!D${row}`,
        values: [[title]]
      });
    }
    
    if (email) {
      requests.push({
        range: `Sheet1!E${row}`,
        values: [[email]]
      });
    }
    
    if (linkedin) {
      requests.push({
        range: `Sheet1!F${row}`,
        values: [[linkedin]]
      });
    }
    
    if (notes) {
      requests.push({
        range: `Sheet1!K${row}`,
        values: [[notes]]
      });
    }

    if (requests.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SHEET_ID,
        resource: {
          valueInputOption: 'RAW',
          data: requests
        }
      });
      
      console.log(`✅ Updated row ${row} with ${contact || 'data'}`);
    }
  }
  
  // Mark as Enriched
  const statusUpdates = updates.map(u => ({
    range: `Sheet1!J${u.row}`,
    values: [['Enriched']]
  }));
  
  if (statusUpdates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      resource: {
        valueInputOption: 'RAW',
        data: statusUpdates
      }
    });
  }
}

async function main() {
  console.log('🔍 Starting PE enrichment run...\n');
  
  const updates = [];
  let successCount = 0;
  
  for (const target of targets) {
    console.log(`\n🎯 Searching: ${target.company}`);
    
    if (!target.domain) {
      console.log(`  ⚠️  Skipping - no domain found`);
      continue;
    }
    
    const contact = await searchApolloContacts(target.company, target.domain);
    
    if (contact) {
      console.log(`  ✅ Found: ${contact.name} (${contact.title})`);
      console.log(`     Email: ${contact.email}`);
      
      updates.push({
        row: target.row,
        contact: contact.name,
        title: contact.title,
        email: contact.email,
        linkedin: contact.linkedin,
        notes: `Enriched via Apollo API on ${new Date().toISOString().split('T')[0]}`
      });
      
      successCount++;
    } else {
      console.log(`  ❌ No contacts found`);
      updates.push({
        row: target.row,
        notes: `Apollo search attempted ${new Date().toISOString().split('T')[0]} - no results`
      });
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (successCount >= 10) {
      console.log('\n🎯 Reached 10 successful enrichments, stopping.');
      break;
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`  Total searched: ${updates.length}`);
  console.log(`  Successful: ${successCount}`);
  console.log(`\n💾 Updating sheet...`);
  
  if (updates.length > 0) {
    await updateSheet(updates);
    console.log(`✅ Sheet updated!`);
  }
  
  // Save report
  const fs = require('fs');
  fs.writeFileSync(
    'CRON-ENRICHMENT-2026-03-13-10AM.md',
    `# PE Enrichment Run - March 13, 2026 10:07 AM

## Summary
- Total searched: ${updates.length}
- Successful enrichments: ${successCount}
- Failed: ${updates.length - successCount}

## Results
${updates.map(u => `
### Row ${u.row}
- Contact: ${u.contact || 'Not found'}
- Email: ${u.email || 'Not found'}
- Notes: ${u.notes || ''}
`).join('\n')}
`
  );
  
  console.log(`\n📄 Report saved to CRON-ENRICHMENT-2026-03-13-10AM.md`);
}

main().catch(console.error);
