const axios = require('axios');
const { google } = require('googleapis');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const targets = [
  { row: 18, company: 'Gryphon Investors', website: 'https://www.gryphon-inv.com', contactName: 'Keith Stimson' },
  { row: 36, company: 'Cressey & Company', website: 'https://www.cresseyco.com', contactName: 'Bryan Cressey' },
  { row: 39, company: 'Ampersand Capital Partners', website: 'https://www.ampersandcapital.com', contactName: 'Herb Hooper' },
  { row: 55, company: 'Clearview Capital', website: 'William F. Case Jr.', contactName: 'William Case', correctWebsite: 'https://www.clearviewcp.com' },
  { row: 68, company: 'Pamlico Capital', website: 'https://www.pamlicocapital.com', contactName: 'Watts Hamrick' },
  { row: 135, company: 'Leeds Equity Partners', website: 'https://www.leedsequity.com', contactName: 'Jeffrey Leeds' },
  { row: 192, company: 'NewSpring Capital', website: 'Michael DiPiano', contactName: 'Michael DiPiano', correctWebsite: 'https://www.newspringcapital.com' },
  { row: 361, company: 'K1 Investment Management', website: 'http://www.k1.com', contactName: 'Ron Cano' },
  { row: 375, company: 'Kinzie Capital Partners LP', website: 'Suzanne Yoon', contactName: 'Suzanne Yoon', correctWebsite: 'https://kinziecapital.com' }
];

async function searchApolloByName(company, contactName, website) {
  try {
    const domain = website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    
    const response = await axios.post(
      'https://api.apollo.io/api/v1/mixed_people/api_search',
      {
        q_organization_domains: [domain],
        person_names: [contactName],
        page: 1,
        per_page: 5
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );

    if (response.data && response.data.people && response.data.people.length > 0) {
      return response.data.people
        .filter(p => p.email && !p.email.includes('@apollo.io'))
        .map(p => ({
          name: `${p.first_name} ${p.last_name}`,
          title: p.title,
          email: p.email,
          linkedin: p.linkedin_url,
          verified: p.email_status === 'verified'
        }));
    }
    return [];
  } catch (error) {
    console.error(`Apollo error for ${company}:`, error.response?.data?.message || error.message);
    return [];
  }
}

async function updateSheetRow(sheets, rowIndex, updates) {
  try {
    const batchUpdates = [];
    if (updates.email) batchUpdates.push({ range: `Sheet1!E${rowIndex}`, values: [[updates.email]] });
    if (updates.title) batchUpdates.push({ range: `Sheet1!D${rowIndex}`, values: [[updates.title]] });
    if (updates.linkedin) batchUpdates.push({ range: `Sheet1!G${rowIndex}`, values: [[updates.linkedin]] });
    if (updates.status) batchUpdates.push({ range: `Sheet1!H${rowIndex}`, values: [[updates.status]] });
    if (updates.notes) batchUpdates.push({ range: `Sheet1!I${rowIndex}`, values: [[updates.notes]] });
    if (updates.website) batchUpdates.push({ range: `Sheet1!B${rowIndex}`, values: [[updates.website]] });

    if (batchUpdates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          valueInputOption: 'RAW',
          data: batchUpdates
        }
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error updating row ${rowIndex}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🫡 PE Enrichment - Hourly Run (Wed March 25, 7:46 PM CST)');
  console.log(`Processing ${targets.length} firms with contacts but missing emails\n`);
  
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  let enriched = 0;
  let notFound = 0;
  const log = [];
  
  for (const target of targets) {
    const website = target.correctWebsite || target.website;
    console.log(`\n${'='.repeat(70)}`);
    console.log(`Row ${target.row}: ${target.company}`);
    console.log(`Contact: ${target.contactName}`);
    console.log(`Website: ${website}`);
    console.log('Searching Apollo...');
    
    const contacts = await searchApolloByName(target.company, target.contactName, website);
    
    if (contacts.length > 0) {
      console.log(`\n✓ Found ${contacts.length} match(es):`);
      contacts.forEach((c, idx) => {
        console.log(`  ${idx + 1}. ${c.name} - ${c.title}`);
        console.log(`     ${c.email} ${c.verified ? '(verified ✓)' : ''}`);
      });
      
      const best = contacts.find(c => c.verified) || contacts[0];
      const notes = `Apollo API (2026-03-25 7:46pm) - Email: ${best.verified ? 'Verified' : 'Unverified'}. Source: Apollo database.`;
      
      const updates = {
        email: best.email,
        title: best.title,
        linkedin: best.linkedin || '',
        status: 'Enriched',
        notes
      };
      
      if (target.correctWebsite) {
        updates.website = target.correctWebsite;
      }
      
      const success = await updateSheetRow(sheets, target.row, updates);
      
      if (success) {
        console.log(`\n✅ ENRICHED: ${best.email} ${best.verified ? '✓' : ''}`);
        enriched++;
        log.push({ company: target.company, contact: best.name, email: best.email, verified: best.verified });
      }
      
      await new Promise(r => setTimeout(r, 2000));
    } else {
      console.log('❌ No email found in Apollo for this contact');
      notFound++;
      
      const notes = `Apollo search: No email found for ${target.contactName} (2026-03-25). Check firm website team page or LinkedIn profile.`;
      await updateSheetRow(sheets, target.row, { notes });
      
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  
  console.log(`\n${'='.repeat(70)}`);
  console.log(`\n🫡 ENRICHMENT COMPLETE`);
  console.log(`Processed: ${targets.length} firms`);
  console.log(`Enriched: ${enriched} with verified emails`);
  console.log(`Not found: ${notFound}\n`);
  
  if (log.length > 0) {
    console.log('✓ Enriched leads:\n');
    log.forEach((item, idx) => {
      console.log(`${idx + 1}. ${item.company}: ${item.contact}`);
      console.log(`   ${item.email} ${item.verified ? '✓' : ''}\n`);
    });
  }
}

main().catch(console.error);
