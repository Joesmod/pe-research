const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

function extractDomain(website) {
  if (!website) return null;
  try {
    const url = website.startsWith('http') ? website : `https://${website}`;
    const domain = new URL(url).hostname.replace('www.', '');
    return domain;
  } catch {
    return null;
  }
}

async function searchPeopleByDomain(domain) {
  if (!domain) return null;

  try {
    // Use the NEW API endpoint
    const response = await fetch('https://api.apollo.io/api/v1/mixed_people/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY
      },
      body: JSON.stringify({
        organization_domain: domain,
        page: 1,
        per_page: 25,
        person_seniorities: ['partner', 'c_suite', 'vp', 'director']
      })
    });

    if (!response.ok) {
      const text = await response.text();
      console.log(`  ❌ ${response.status}: ${text.substring(0, 150)}`);
      return null;
    }

    const data = await response.json();
    
    if (!data.people || data.people.length === 0) {
      return null;
    }

    // Filter for verified emails
    const validContacts = data.people.filter(p => 
      p.email && 
      p.email.includes('@') &&
      !p.email.toLowerCase().includes('@gmail') && 
      !p.email.toLowerCase().includes('@yahoo') && 
      !p.email.toLowerCase().includes('@hotmail') &&
      p.email_status !== 'invalid'
    );

    if (validContacts.length === 0) return null;

    // Prioritize senior roles
    const contact = validContacts.find(p => 
      p.title && (p.title.toLowerCase().includes('ceo') || p.title.toLowerCase().includes('chief executive'))
    ) || validContacts.find(p =>
      p.title && p.title.toLowerCase().includes('partner')
    ) || validContacts.find(p =>
      p.title && p.title.toLowerCase().includes('managing director')
    ) || validContacts[0];

    return {
      name: contact.name || `${contact.first_name || ''} ${contact.last_name || ''}`.trim(),
      title: contact.title || '',
      email: contact.email,
      linkedin: contact.linkedin_url || ''
    };
  } catch (error) {
    console.log(`  ❌ Exception: ${error.message}`);
    return null;
  }
}

async function enrichLeads() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  console.log(`\n🔍 PE Research & Enrichment - Fixed API (March 12, 10:37 PM)\n`);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A2:J',
  });
  
  const rows = response.data.values || [];
  
  let enriched = 0;
  let skipped = 0;
  let noContact = 0;
  const updates = [];

  for (let i = 0; i < rows.length && enriched < 15; i++) {
    const row = rows[i];
    const [company, notebookLM, contact, title, email, website, linkedin, sector, portfolio, status] = row;

    // Skip if already has valid contact + email
    if (contact && contact.trim() !== '' && email && email.includes('@')) {
      skipped++;
      continue;
    }

    // Skip dead firms
    if (status && status.toLowerCase().includes('dead')) continue;
    if (!company || company === 'No Company') continue;
    if (!website) continue;

    const domain = extractDomain(website);
    if (!domain) continue;

    console.log(`\n${enriched + 1}. ${company}`);
    console.log(`   Domain: ${domain}`);

    const result = await searchPeopleByDomain(domain);
    if (result) {
      const rowIndex = i + 2;
      
      updates.push({
        range: `Sheet1!B${rowIndex}:H${rowIndex}`,
        values: [[
          new Date().toISOString().split('T')[0],
          result.name,
          result.title,
          result.email,
          website || '',
          result.linkedin,
          'Enriched'
        ]]
      });

      enriched++;
      console.log(`   ✅ ${result.name}`);
      console.log(`   📧 ${result.email}`);
      console.log(`   💼 ${result.title}`);
    } else {
      noContact++;
      console.log(`   ⚠️  No verified contacts`);
    }

    await new Promise(r => setTimeout(r, 1500));

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
    console.log(`\n✅ Updated ${updates.length} rows in sheet\n`);
  }

  console.log(`\n📊 Final Summary:`);
  console.log(`   ✅ Enriched: ${enriched}`);
  console.log(`   ⏭️  Skipped (already enriched): ${skipped}`);
  console.log(`   ❌ No contact found: ${noContact}\n`);
}

enrichLeads().catch(console.error);
