const axios = require('axios');
const { google } = require('googleapis');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Priority targets from scan (highest priority first)
const TARGETS = [
  { row: 18, company: 'Gryphon Investors', website: 'https://www.gryphon-inv.com', reason: 'Explicitly needs email' },
  { row: 13, company: 'Eckuity Capital', website: 'http://www.eckuity.com', reason: 'Verify inferred email' },
  { row: 19, company: 'Erez Capital', website: 'http://www.erezcapital.io', reason: 'Verify inferred email' },
  { row: 20, company: 'Charlesbank Capital Partners', website: 'https://www.charlesbank.com', reason: 'Verify inferred email' },
  { row: 22, company: 'Flyover Capital', website: 'http://www.flyovercapital.com', reason: 'Verify inferred email' },
  { row: 60, company: 'PSG Equity', website: 'https://www.psgequity.com', reason: 'Verify inferred email' },
  { row: 94, company: 'PennSpring Capital', website: 'https://pennspring.com', reason: 'Verify inferred email' },
  { row: 101, company: 'Littlejohn & Co', website: 'https://littlejohnllc.com', reason: 'Verify inferred email' },
  { row: 102, company: 'Stellus Capital Management', website: 'http://www.stelluscapital.com', reason: 'Verify inferred email' },
  { row: 147, company: 'TowerBrook Capital Partners', website: 'https://www.towerbrook.com', reason: 'Verify inferred email' },
  { row: 168, company: 'Clearlake Capital Group', website: 'https://www.clearlake.com', reason: 'Verify inferred email' },
  { row: 191, company: 'Flexpoint Ford', website: 'https://www.flexpointford.com', reason: 'Verify inferred email' },
  { row: 282, company: 'Ronin Equity Partners', website: 'https://www.roninequitypartners.com', reason: 'Verify inferred email' },
  { row: 404, company: 'Dwight Funding', website: 'http://www.dwightfunding.com', reason: 'Verify inferred email' },
  { row: 416, company: 'Jump Capital', website: 'http://www.jumpcap.com', reason: 'Verify inferred email' }
];

async function searchApollo(company, website) {
  try {
    const response = await axios.post(
      'https://api.apollo.io/api/v1/mixed_people/search',
      {
        q_organization_name: company,
        person_titles: [
          'CEO', 'Chief Executive Officer', 'Managing Partner', 'Managing Director',
          'Partner', 'General Partner', 'Principal', 'President', 'COO', 'CTO',
          'VP Technology', 'VP Operations', 'Director Technology', 'Director Operations',
          'Head of Value Creation', 'Head of Portfolio'
        ],
        page: 1,
        per_page: 5
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': APOLLO_API_KEY,
          'Cache-Control': 'no-cache'
        }
      }
    );

    if (response.data && response.data.people && response.data.people.length > 0) {
      const enriched = [];
      for (const person of response.data.people.slice(0, 3)) {
        if (person.email) {
          enriched.push({
            name: `${person.first_name} ${person.last_name}`,
            title: person.title || '',
            email: person.email,
            linkedin: person.linkedin_url || '',
            verified: person.email_status === 'verified'
          });
        }
      }
      return enriched;
    }
    return [];
  } catch (error) {
    console.error(`  ❌ Apollo error: ${error.response?.data?.message || error.message}`);
    return [];
  }
}

async function updateSheet(sheets, row, contactName, title, email, linkedin, notes) {
  try {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: [
          { range: `Sheet1!C${row}`, values: [[contactName]] },
          { range: `Sheet1!D${row}`, values: [[title]] },
          { range: `Sheet1!E${row}`, values: [[email]] },
          { range: `Sheet1!G${row}`, values: [[linkedin || '']] },
          { range: `Sheet1!H${row}`, values: [['Enriched']] },
          { range: `Sheet1!I${row}`, values: [[notes]] }
        ]
      }
    });
    return true;
  } catch (error) {
    console.error(`  ❌ Sheet update error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🫡 PE ENRICHMENT - Priority Batch\n');
  console.log(`Targeting ${TARGETS.length} firms with inferred/missing emails\n`);
  console.log('='.repeat(70) + '\n');
  
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  let enriched = 0;
  let failed = 0;
  
  for (const target of TARGETS.slice(0, 12)) {  // Limit to 12 to conserve credits
    console.log(`Row ${target.row}: ${target.company}`);
    console.log(`  Website: ${target.website}`);
    console.log(`  Reason: ${target.reason}`);
    console.log(`  Searching Apollo...`);
    
    const contacts = await searchApollo(target.company, target.website);
    
    if (contacts.length > 0) {
      console.log(`  ✓ Found ${contacts.length} contacts:`);
      contacts.forEach((c, idx) => {
        console.log(`    ${idx + 1}. ${c.name} - ${c.title}`);
        console.log(`       ${c.email} ${c.verified ? '✅ verified' : '⚠️  unverified'}`);
      });
      
      // Prefer verified emails
      const best = contacts.find(c => c.verified) || contacts[0];
      
      const notes = `Apollo API ${best.verified ? 'verified' : 'found'} - ${new Date().toISOString().split('T')[0]}. ${contacts.length} decision-makers available.`;
      
      const success = await updateSheet(
        sheets,
        target.row,
        best.name,
        best.title,
        best.email,
        best.linkedin,
        notes
      );
      
      if (success) {
        console.log(`  ✅ ENRICHED: ${best.name} (${best.title}) - ${best.email}\n`);
        enriched++;
      } else {
        failed++;
      }
      
      // Rate limit
      await new Promise(r => setTimeout(r, 2000));
    } else {
      console.log(`  ⚠️  No contacts found via Apollo`);
      console.log(`  📝 Manual research needed for this firm\n`);
      failed++;
    }
  }
  
  console.log('='.repeat(70));
  console.log(`\n✅ Enrichment Complete:`);
  console.log(`   Enriched: ${enriched}`);
  console.log(`   Failed/Need Manual: ${failed}`);
  console.log(`   Total processed: ${enriched + failed}\n`);
}

main().catch(console.error);
