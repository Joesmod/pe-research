const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function searchApollo(firmName, domain) {
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
      console.log(`  ❌ Apollo error ${response.status} for ${firmName}`);
      return null;
    }

    const data = await response.json();
    if (!data.people || data.people.length === 0) {
      console.log(`  ⚠️  No contacts found for ${firmName}`);
      return null;
    }

    // Filter for contacts with verified email
    const validContacts = data.people.filter(p => 
      p.email && 
      !p.email.includes('@gmail') && 
      !p.email.includes('@yahoo') && 
      !p.email.includes('@hotmail') &&
      p.email_status !== 'invalid'
    );

    if (validContacts.length === 0) {
      console.log(`  ⚠️  No valid emails for ${firmName}`);
      return null;
    }

    // Prefer C-level, then Partners, then Directors/VPs
    const contact = validContacts.find(p => 
      p.title && (p.title.includes('CEO') || p.title.includes('Chief'))
    ) || validContacts.find(p =>
      p.title && p.title.includes('Partner')
    ) || validContacts[0];

    return {
      name: contact.name || `${contact.first_name} ${contact.last_name}`,
      title: contact.title || 'N/A',
      email: contact.email,
      linkedin: contact.linkedin_url || ''
    };
  } catch (error) {
    console.log(`  ❌ Error searching ${firmName}: ${error.message}`);
    return null;
  }
}

async function enrichLeads() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  console.log(`\n🔍 Enriching leads (10:37 PM March 12)\n`);

  // Read all rows
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:J',
  });
  
  const rows = response.data.values;
  const headers = rows[0];
  
  // Find column indices
  const colMap = {
    company: headers.indexOf('Company Name'),
    notebookLM: headers.indexOf('NotebookLM'),
    contact: headers.indexOf('Contact Name'),
    title: headers.indexOf('Title'),
    email: headers.indexOf('Email'),
    website: headers.indexOf('Website'),
    linkedin: headers.indexOf('LinkedIn'),
    status: headers.indexOf('Status')
  };

  let enriched = 0;
  let updates = [];

  for (let i = 1; i < rows.length && enriched < 15; i++) {
    const row = rows[i];
    const company = row[colMap.company];
    const contact = row[colMap.contact];
    const email = row[colMap.email];
    const status = row[colMap.status];
    const website = row[colMap.website];

    // Skip if already enriched
    if (contact && contact.trim() !== '') continue;
    if (email && !email.includes('Managing Director') && email.includes('@')) continue;

    // Skip dead firms
    if (status && status.includes('Dead')) continue;
    if (!company || company === 'No Company') continue;

    console.log(`\n${enriched + 1}. ${company}`);

    const result = await searchApollo(company, website);
    if (result) {
      // Prepare update
      const rowIndex = i + 1; // 1-indexed for Sheets
      updates.push({
        range: `Sheet1!B${rowIndex}:H${rowIndex}`,
        values: [[
          new Date().toISOString().split('T')[0], // NotebookLM
          result.name,                              // Contact Name
          result.title,                             // Title
          result.email,                             // Email
          row[colMap.website] || '',                // Website (keep existing)
          result.linkedin,                          // LinkedIn
          row[colMap.status] || '',                 // Status (keep existing)
        ]]
      });

      enriched++;
      console.log(`  ✅ ${result.name} | ${result.title}`);
      console.log(`  📧 ${result.email}`);
    }

    // Rate limit: 1 req/sec
    await new Promise(r => setTimeout(r, 1000));

    if (enriched >= 15) break;
  }

  // Batch update all rows
  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
  }

  console.log(`\n✅ Enriched ${enriched} leads\n`);
  return enriched;
}

enrichLeads().catch(console.error);
