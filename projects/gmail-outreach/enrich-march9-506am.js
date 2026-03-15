const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const APOLLO_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Load service account
const serviceAccountAuth = new JWT({
  email: 'pe-research@gmail-outreach-447620.iam.gserviceaccount.com',
  key: fs.readFileSync('./service-account.json', 'utf8').match(/"private_key": "(.*?)"/)[1].replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const targets = [
  {
    row: 974,
    firm: "Bow River Capital",
    contact: "Greg J. Hiatrides",
    title: "Partner, Head of Private Equity",
    domain: "bowrivercapital.com"
  },
  {
    row: 975,
    firm: "Amulet Capital Partners",
    contact: "Avi Uttamchandani",
    title: "Partner",
    domain: "amuletcapital.com"
  },
  {
    row: 976,
    firm: "Trivest Partners",
    contact: "Reid Callaway",
    title: "Managing Director",
    domain: "trivestpartners.com"
  }
];

async function apolloEnrich(person, orgDomain) {
  try {
    const response = await fetch('https://api.apollo.io/v1/people/match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': APOLLO_KEY
      },
      body: JSON.stringify({
        first_name: person.split(' ')[0],
        last_name: person.split(' ').slice(1).join(' '),
        organization_name: orgDomain?.replace(/\..*/,'') || '',
        domain: orgDomain,
        reveal_personal_emails: true
      })
    });

    if (!response.ok) {
      console.log(`Apollo API error for ${person}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    if (data.person && data.person.email) {
      return {
        email: data.person.email,
        title: data.person.title || '',
        linkedin: data.person.linkedin_url || ''
      };
    }
    return null;
  } catch (err) {
    console.error(`Error enriching ${person}:`, err.message);
    return null;
  }
}

async function updateSheet() {
  const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];
  await sheet.loadCells();

  const results = [];
  
  for (const target of targets) {
    console.log(`\nEnriching ${target.contact} at ${target.firm}...`);
    
    const result = await apolloEnrich(target.contact, target.domain);
    
    if (result && result.email) {
      console.log(`✅ Found: ${result.email}`);
      
      // Update sheet (row is 1-indexed, but array is 0-indexed, and row 1 is header)
      const cellRow = target.row;
      const emailCol = 4; // Column E (0-indexed)
      const titleCol = 3; // Column D
      const linkedinCol = 6; // Column G
      const statusCol = 9; // Column J
      
      const emailCell = sheet.getCell(cellRow, emailCol);
      const titleCell = sheet.getCell(cellRow, titleCol);
      const linkedinCell = sheet.getCell(cellRow, linkedinCol);
      const statusCell = sheet.getCell(cellRow, statusCol);
      
      emailCell.value = result.email;
      if (result.title) titleCell.value = result.title;
      if (result.linkedin) linkedinCell.value = result.linkedin;
      statusCell.value = 'Enriched';
      
      results.push({
        ...target,
        email: result.email,
        title: result.title,
        status: 'SUCCESS'
      });
    } else {
      console.log(`❌ No email found for ${target.contact}`);
      results.push({
        ...target,
        status: 'NOT_FOUND'
      });
    }
    
    // Rate limit
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log('\n💾 Saving changes to sheet...');
  await sheet.saveUpdatedCells();
  
  // Save results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  fs.writeFileSync(
    `enrichment-results-march9-${timestamp}.json`,
    JSON.stringify(results, null, 2)
  );
  
  console.log('\n✅ Enrichment complete!');
  console.log(`Found: ${results.filter(r => r.status === 'SUCCESS').length}`);
  console.log(`Not found: ${results.filter(r => r.status === 'NOT_FOUND').length}`);
  
  return results;
}

updateSheet().catch(console.error);
