const axios = require('axios');
const { google } = require('googleapis');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Priority enrichment targets with partial data
const targets = [
  { row: 176, company: 'Hg Capital', nameHint: 'Nic Humphries' },
  { row: 223, company: 'Harvest Partners (SCF)', nameHint: 'James Harter' },
  { row: 276, company: 'Harkness Capital Partners', nameHint: 'Ted Dardani' },
  { row: 285, company: 'Sentinel Capital Partners', nameHint: 'Josh Garrett' },
  { row: 305, company: 'Bertram Capital', nameHint: 'Jeff Drazan' },
  { row: 310, company: 'Argonaut Private Equity', nameHint: 'Anil Khatod' },
  { row: 311, company: 'Mill Point Capital', nameHint: 'Aileen Wang' },
  { row: 319, company: 'CIVC Partners', nameHint: 'Wright' },
  { row: 335, company: 'Odyssey Investment Partners', nameHint: 'Brian Kwait' },
  { row: 478, company: 'Palm Beach Capital', nameHint: 'Mike Schmickle' },
  { row: 500, company: 'Aurora Capital Partners', nameHint: 'Andrew Wilson' },
  { row: 511, company: 'Emerging Capital Partners', nameHint: 'Carolyn Campbell' },
  { row: 525, company: 'Levine Leichtman Capital Partners', nameHint: 'Tannaz Chapman' }
];

async function searchApollo(companyName, nameHint = null) {
  try {
    console.log(`\n🔍 Searching: ${companyName}${nameHint ? ` (hint: ${nameHint})` : ''}`);
    
    const response = await axios.post(
      'https://api.apollo.io/v1/mixed_people/search',
      {
        q_organization_name: companyName,
        person_titles: [
          'Managing Partner', 'Managing Director', 'Partner', 'CEO', 'COO', 'CTO',
          'Head of', 'VP', 'Vice President', 'Director', 'Chief Operating Officer',
          'Chief Executive Officer', 'General Partner', 'Operating Partner'
        ],
        per_page: 10,
        page: 1
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );

    const people = response.data.people || [];
    
    // If we have a name hint, prioritize matching
    if (nameHint) {
      const nameMatch = people.find(p => 
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(nameHint.toLowerCase())
      );
      if (nameMatch && nameMatch.email) {
        console.log(`✅ Found hint match: ${nameMatch.first_name} ${nameMatch.last_name}`);
        console.log(`   Title: ${nameMatch.title}`);
        console.log(`   Email: ${nameMatch.email}`);
        console.log(`   LinkedIn: ${nameMatch.linkedin_url || 'N/A'}`);
        return {
          name: `${nameMatch.first_name} ${nameMatch.last_name}`,
          title: nameMatch.title,
          email: nameMatch.email,
          linkedin: nameMatch.linkedin_url || '',
          source: 'Apollo API - Name Match'
        };
      }
    }

    // Otherwise, take first person with email
    const withEmail = people.filter(p => p.email);
    if (withEmail.length > 0) {
      const person = withEmail[0];
      console.log(`✅ Found: ${person.first_name} ${person.last_name}`);
      console.log(`   Title: ${person.title}`);
      console.log(`   Email: ${person.email}`);
      console.log(`   LinkedIn: ${person.linkedin_url || 'N/A'}`);
      return {
        name: `${person.first_name} ${person.last_name}`,
        title: person.title,
        email: person.email,
        linkedin: person.linkedin_url || '',
        source: 'Apollo API'
      };
    }

    console.log('⚠️  No contacts with email found');
    return null;
  } catch (error) {
    console.error(`❌ Error searching ${companyName}:`, error.response?.data?.message || error.message);
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
    try {
      // Update Contact Name (Column C)
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!C${update.row}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[update.name]]
        }
      });

      // Update Title (Column D)
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!D${update.row}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[update.title]]
        }
      });

      // Update Email (Column E)
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!E${update.row}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[update.email]]
        }
      });

      // Update LinkedIn (Column G)
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!G${update.row}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[update.linkedin]]
        }
      });

      // Update Status (Column J)
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!J${update.row}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [['Enriched']]
        }
      });

      // Update Notes (Column L)
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!L${update.row}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[update.source]]
        }
      });

      console.log(`✅ Updated row ${update.row}`);
    } catch (error) {
      console.error(`❌ Failed to update row ${update.row}:`, error.message);
    }
  }
}

async function main() {
  console.log('🚀 Starting PE Research & Enrichment (March 12, 2026 - 5:37 AM)');
  console.log(`Target: ${targets.length} firms needing enrichment\n`);

  const updates = [];
  
  for (const target of targets) {
    const result = await searchApollo(target.company, target.nameHint);
    if (result) {
      updates.push({
        row: target.row,
        company: target.company,
        ...result
      });
    }
    
    // Rate limit: 1 request per 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`\n\n📊 ENRICHMENT SUMMARY:`);
  console.log(`Total targets: ${targets.length}`);
  console.log(`Successfully enriched: ${updates.length}`);
  console.log(`Failed: ${targets.length - updates.length}\n`);

  if (updates.length > 0) {
    console.log('📝 Updating Google Sheet...');
    await updateSheet(updates);
    console.log('\n✅ Sheet updated successfully!');
    
    console.log('\n📋 ENRICHED CONTACTS:');
    updates.forEach(u => {
      console.log(`\n${u.company}:`);
      console.log(`  ${u.name} - ${u.title}`);
      console.log(`  ${u.email}`);
      console.log(`  ${u.linkedin}`);
    });
  }

  console.log('\n🎯 Enrichment complete!');
}

main().catch(console.error);
