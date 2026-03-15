const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function searchApollo(firmName) {
  const titles = [
    'Chief Executive Officer', 'CEO', 'Chief Operating Officer', 'COO',
    'Managing Partner', 'General Partner', 'Operating Partner',
    'Managing Director', 'Partner',
    'Chief Technology Officer', 'CTO', 'VP Technology', 'VP Operations',
    'Director Technology', 'Director Operations', 'Head of Technology'
  ];

  try {
    const response = await fetch('https://api.apollo.io/v1/mixed_people/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': APOLLO_API_KEY
      },
      body: JSON.stringify({
        q_organization_name: firmName,
        page: 1,
        per_page: 10,
        person_titles: titles
      })
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (!data.people || data.people.length === 0) {
      return null;
    }

    // Filter for contacts with real corporate email
    const validContacts = data.people.filter(p => 
      p.email && 
      !p.email.includes('@gmail') && 
      !p.email.includes('@yahoo') && 
      !p.email.includes('@hotmail') &&
      p.email_status !== 'invalid'
    );

    if (validContacts.length === 0) return null;

    // Prefer C-level, then Partners, then Directors/VPs
    const contact = validContacts.find(p => 
      p.title && (p.title.includes('CEO') || p.title.includes('Chief'))
    ) || validContacts.find(p =>
      p.title && p.title.includes('Partner')
    ) || validContacts[0];

    return {
      name: contact.name || `${contact.first_name} ${contact.last_name}`,
      title: contact.title || '',
      email: contact.email,
      linkedin: contact.linkedin_url || ''
    };
  } catch (error) {
    return null;
  }
}

async function enrichLeads() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  console.log(`\n🔍 PE Research & Enrichment - Hourly Run (March 12, 10:37 PM)\n`);

  // Read all rows
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A2:J',  // Skip header row
  });
  
  const rows = response.data.values || [];
  
  let enriched = 0;
  let skipped = 0;
  const updates = [];

  for (let i = 0; i < rows.length && enriched < 15; i++) {
    const row = rows[i];
    const [company, notebookLM, contact, title, email, website, linkedin, sector, portfolio, status] = row;

    // Skip if has valid contact name and email
    if (contact && contact.trim() !== '' && email && email.includes('@')) {
      skipped++;
      continue;
    }

    // Skip dead firms
    if (status && status.toLowerCase().includes('dead')) continue;
    if (!company || company === 'No Company') continue;

    console.log(`\n${enriched + 1}. Researching: ${company}`);

    const result = await searchApollo(company);
    if (result) {
      const rowIndex = i + 2; // +2 because sheet is 1-indexed and we skipped header
      
      updates.push({
        range: `Sheet1!B${rowIndex}:H${rowIndex}`,
        values: [[
          new Date().toISOString().split('T')[0],  // NotebookLM date
          result.name,                               // Contact Name
          result.title,                              // Title
          result.email,                              // Email
          website || '',                             // Website (preserve)
          result.linkedin,                           // LinkedIn
          'Enriched'                                 // Status
        ]]
      });

      enriched++;
      console.log(`  ✅ Found: ${result.name}`);
      console.log(`  📧 ${result.email}`);
      console.log(`  💼 ${result.title}`);
    } else {
      console.log(`  ⚠️  No contacts found`);
    }

    // Rate limit
    await new Promise(r => setTimeout(r, 1200));

    if (enriched >= 15) break;
  }

  // Apply batch update
  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Enriched: ${enriched}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`\n✅ Complete\n`);
}

enrichLeads().catch(console.error);
