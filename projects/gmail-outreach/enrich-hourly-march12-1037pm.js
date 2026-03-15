const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

const serviceAccountAuth = new JWT({
  email: 'openclaw-sheets@gmail-outreach-447719.iam.gserviceaccount.com',
  key: require('./service-account.json').private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

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
  const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];
  const rows = await sheet.getRows();

  console.log(`\n🔍 Enriching leads (10:37 PM March 12)\n`);

  let enriched = 0;
  let processed = 0;

  for (let i = 0; i < rows.length && enriched < 15; i++) {
    const row = rows[i];
    const company = row.get('Company Name');
    const contact = row.get('Contact Name');
    const email = row.get('Email');
    const website = row.get('Website');

    // Skip if already enriched
    if (contact && contact.trim() !== '' && email && !email.includes('Managing Director') && !email.includes('@')) continue;

    // Skip dead firms
    const status = row.get('Status');
    if (status && status.includes('Dead')) continue;

    processed++;
    console.log(`\n${enriched + 1}. ${company}`);

    const result = await searchApollo(company, website);
    if (result) {
      row.set('Contact Name', result.name);
      row.set('Title', result.title);
      row.set('Email', result.email);
      if (result.linkedin) row.set('LinkedIn', result.linkedin);
      row.set('Status', 'Enriched');
      row.set('NotebookLM', new Date().toISOString().split('T')[0]);

      await row.save();
      enriched++;

      console.log(`  ✅ ${result.name} | ${result.title}`);
      console.log(`  📧 ${result.email}`);
    }

    // Rate limit: 1 req/sec
    await new Promise(r => setTimeout(r, 1000));

    if (enriched >= 15) break;
  }

  console.log(`\n✅ Enriched ${enriched} leads (processed ${processed} candidates)\n`);
}

enrichLeads().catch(console.error);
