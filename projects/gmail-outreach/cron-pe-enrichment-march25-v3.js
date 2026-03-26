const axios = require('axios');
const { google } = require('googleapis');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function enrichPerson(personId) {
  try {
    const response = await axios.post(
      'https://api.apollo.io/api/v1/people/match',
      {
        id: personId,
        reveal_personal_emails: true
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );

    if (response.data && response.data.person) {
      const p = response.data.person;
      return {
        name: `${p.first_name} ${p.last_name}`,
        title: p.title,
        email: p.email,
        linkedin: p.linkedin_url,
        verified: p.email_status === 'verified'
      };
    }

    return null;
  } catch (error) {
    console.error(`Enrichment error:`, error.response?.data?.message || error.message);
    return null;
  }
}

async function searchApolloContacts(company, website) {
  try {
    // Step 1: Search for contacts
    const response = await axios.post(
      'https://api.apollo.io/api/v1/mixed_people/api_search',
      {
        q_organization_name: company,
        person_titles: [
          'CEO', 'Chief Executive Officer',
          'Managing Partner', 'Managing Director', 'Partner', 'General Partner',
          'Principal', 'President', 'COO', 'Chief Operating Officer',
          'CTO', 'Chief Technology Officer', 'CMO', 'Chief Marketing Officer',
          'VP Technology', 'VP Operations', 'VP Digital', 'Vice President',
          'Director Technology', 'Director Operations', 'Director Product',
          'Head of Value Creation', 'Head of Portfolio Operations'
        ],
        page: 1,
        per_page: 3  // Limit to 3 to avoid burning credits
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );

    if (response.data && response.data.people && response.data.people.length > 0) {
      // Step 2: Enrich each person to get full email
      const enriched = [];
      for (const person of response.data.people) {
        if (person.has_email) {
          const full = await enrichPerson(person.id);
          if (full && full.email) {
            enriched.push(full);
          }
          // Rate limit between enrichments
          await new Promise(r => setTimeout(r, 500));
        }
      }
      return enriched;
    }

    return [];
  } catch (error) {
    console.error(`Apollo error for ${company}:`, error.response?.data?.message || error.message);
    return [];
  }
}

async function getSheetData() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:I',
  });
  
  return { sheets: google.sheets({ version: 'v4', auth }), rows: response.data.values || [] };
}

async function updateSheetRow(sheets, rowIndex, contactName, title, email, linkedin, notes) {
  try {
    // Update Contact Name (C), Title (D), Email (E), LinkedIn (G), Status (H), Notes (I)
    const updates = [
      {
        range: `Sheet1!C${rowIndex}`,
        values: [[contactName]]
      },
      {
        range: `Sheet1!D${rowIndex}`,
        values: [[title]]
      },
      {
        range: `Sheet1!E${rowIndex}`,
        values: [[email]]
      },
      {
        range: `Sheet1!G${rowIndex}`,
        values: [[linkedin || '']]
      },
      {
        range: `Sheet1!H${rowIndex}`,
        values: [['Enriched']]
      },
      {
        range: `Sheet1!I${rowIndex}`,
        values: [[notes]]
      }
    ];

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates
      }
    });

    return true;
  } catch (error) {
    console.error(`Error updating row ${rowIndex}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🫡 PE Research & Enrichment - Hourly Run\n');
  console.log('Time:', new Date().toISOString());
  console.log('\nReading sheet...\n');
  
  const { sheets, rows } = await getSheetData();
  
  // Find firms needing enrichment
  const targets = [];
  for (let i = 1; i < rows.length && targets.length < 10; i++) {
    const row = rows[i] || [];
    const company = (row[0] || '').trim();
    const website = (row[1] || '').trim();
    const contactName = (row[2] || '').trim();
    const email = (row[4] || '').trim();
    const status = (row[7] || '').trim();
    
    // Skip if no company, dead/not PE, or already enriched
    if (!company || !website || status.toLowerCase().includes('dead') || status.toLowerCase().includes('not pe')) {
      continue;
    }
    
    // Target: No contact OR no email OR generic email AND not enriched
    const needsEnrichment = (
      !contactName || 
      !email || 
      email.startsWith('info@') || 
      email.startsWith('sales@') || 
      email.startsWith('ir@') ||
      email.startsWith('contact@')
    ) && !status.toLowerCase().includes('enriched');
    
    if (needsEnrichment) {
      targets.push({ company, website, rowIndex: i + 1, currentContact: contactName, currentEmail: email });
    }
  }
  
  console.log(`Found ${targets.length} firms needing enrichment\n`);
  
  if (targets.length === 0) {
    console.log('✓ Sheet is fully enriched. No action needed.');
    return;
  }
  
  let enriched = 0;
  
  for (const target of targets.slice(0, 10)) {  // Limit to 10 per run to conserve credits
    console.log(`\n${'='.repeat(60)}`);
    console.log(`${target.company} (Row ${target.rowIndex})`);
    console.log(`Website: ${target.website}`);
    console.log(`Current: ${target.currentContact || '[NONE]'} / ${target.currentEmail || '[NONE]'}`);
    console.log('Searching Apollo...');
    
    const contacts = await searchApolloContacts(target.company, target.website);
    
    if (contacts.length > 0) {
      console.log(`\nFound ${contacts.length} contacts:`);
      contacts.forEach((c, idx) => {
        console.log(`  ${idx + 1}. ${c.name} - ${c.title}`);
        console.log(`     ${c.email} ${c.verified ? '✓ verified' : ''}`);
      });
      
      // Pick best: verified email preferred
      const best = contacts.find(c => c.verified) || contacts[0];
      
      const notes = `Apollo API verified - ${new Date().toISOString().split('T')[0]}. ${contacts.length} decision-makers found.`;
      
      const success = await updateSheetRow(
        sheets,
        target.rowIndex,
        best.name,
        best.title,
        best.email,
        best.linkedin,
        notes
      );
      
      if (success) {
        console.log(`\n✅ ENRICHED: ${best.name} (${best.title}) - ${best.email}`);
        enriched++;
      }
      
      // Rate limit between companies
      await new Promise(r => setTimeout(r, 2000));
    } else {
      console.log('❌ No contacts found');
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`\n🫡 Enrichment complete: ${enriched}/${targets.length} firms enriched`);
  console.log(`Next run: In 1 hour`);
}

main().catch(console.error);
