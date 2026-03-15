const { google } = require('googleapis');
const axios = require('axios');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Target firms from enrichment-targets-march11-6pm.json
const targetFirms = JSON.parse(
  fs.readFileSync('enrichment-targets-march11-6pm.json', 'utf8')
);

async function searchApolloContact(companyName) {
  try {
    const response = await axios.post(
      'https://api.apollo.io/v1/mixed_people/search',
      {
        q_organization_name: companyName,
        person_titles: [
          'CEO', 'CTO', 'COO', 'CFO', 'CMO',
          'Managing Partner', 'General Partner', 'Operating Partner',
          'Director', 'VP', 'Vice President',
          'Head of Operations', 'Head of Technology'
        ],
        per_page: 5
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );

    const people = response.data?.people || [];
    if (people.length === 0) return null;

    // Filter for verified emails only
    const verified = people.filter(
      p => p.email && p.email_status === 'verified'
    );

    if (verified.length === 0) return null;

    // Prefer executives/partners
    const preferred = verified.find(
      p => p.title &&
        (p.title.toLowerCase().includes('partner') ||
         p.title.toLowerCase().includes('ceo') ||
         p.title.toLowerCase().includes('cto') ||
         p.title.toLowerCase().includes('president'))
    );

    const contact = preferred || verified[0];

    return {
      name: contact.name || `${contact.first_name} ${contact.last_name}`,
      title: contact.title || '',
      email: contact.email,
      linkedin: contact.linkedin_url || '',
      source: 'Apollo verified'
    };
  } catch (error) {
    console.error(`  ❌ Apollo error for ${companyName}: ${error.message}`);
    return null;
  }
}

async function updateSheet(rowNum, contact, company) {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const updates = [];
  
  // Column C: Contact Name
  updates.push({
    range: `Sheet1!C${rowNum}`,
    values: [[contact.name]]
  });

  // Column D: Title
  updates.push({
    range: `Sheet1!D${rowNum}`,
    values: [[contact.title]]
  });

  // Column E: Email
  updates.push({
    range: `Sheet1!E${rowNum}`,
    values: [[contact.email]]
  });

  // Column G: LinkedIn
  if (contact.linkedin) {
    updates.push({
      range: `Sheet1!G${rowNum}`,
      values: [[contact.linkedin]]
    });
  }

  // Column J: Status
  updates.push({
    range: `Sheet1!J${rowNum}`,
    values: [['Enriched']]
  });

  // Column L: Notes
  const timestamp = new Date().toISOString().split('T')[0];
  updates.push({
    range: `Sheet1!L${rowNum}`,
    values: [[`${contact.source} - ${timestamp}`]]
  });

  for (const update of updates) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: update.range,
      valueInputOption: 'RAW',
      resource: {
        values: update.values
      }
    });
  }

  console.log(`  ✅ Updated row ${rowNum}: ${company} → ${contact.name} (${contact.email})`);
}

async function main() {
  console.log('🔍 PE Research & Enrichment - March 11, 2026 6:07 PM');
  console.log(`📋 Processing ${targetFirms.length} firms needing enrichment\n`);

  const results = {
    enriched: [],
    notFound: [],
    errors: []
  };

  for (const [idx, firm] of targetFirms.entries()) {
    console.log(`\n${idx + 1}/${targetFirms.length}: ${firm.company}`);
    console.log(`  Current status: ${firm.issue}`);

    try {
      const contact = await searchApolloContact(firm.company);
      
      if (contact) {
        await updateSheet(firm.rowNum, contact, firm.company);
        results.enriched.push({
          company: firm.company,
          contact: contact.name,
          email: contact.email,
          title: contact.title
        });
        
        // Rate limit: wait 2 seconds between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        console.log(`  ⚠️  No verified contact found`);
        results.notFound.push(firm.company);
      }
    } catch (error) {
      console.error(`  ❌ Error: ${error.message}`);
      results.errors.push({
        company: firm.company,
        error: error.message
      });
    }
  }

  // Save results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportFile = `enrichment-report-${timestamp}.json`;
  fs.writeFileSync(reportFile, JSON.stringify(results, null, 2));

  console.log(`\n\n📊 FINAL RESULTS:`);
  console.log(`✅ Successfully enriched: ${results.enriched.length}`);
  console.log(`⚠️  No contact found: ${results.notFound.length}`);
  console.log(`❌ Errors: ${results.errors.length}`);
  console.log(`\n📄 Full report saved to: ${reportFile}\n`);

  if (results.enriched.length > 0) {
    console.log('🎯 Enriched firms:');
    results.enriched.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.company} → ${r.contact} (${r.title})`);
      console.log(`     ${r.email}`);
    });
  }
}

main().catch(console.error);
