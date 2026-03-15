const { google } = require('googleapis');
const fs = require('fs');
const https = require('https');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = JSON.parse(fs.readFileSync('service-account.json'));
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

const auth = new google.auth.GoogleAuth({
  credentials: SERVICE_ACCOUNT,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Targets for enrichment (skip Dead firms)
const TARGETS = [
  { row: 1064, company: 'The Riverside Company', contact: 'Stewart Kohl', website: 'riversidecompany.com' },
  { row: 1066, company: 'Genstar Capital', contact: 'J. Ryan Clark', website: 'gencap.com' },
  { row: 1067, company: 'Trivest Partners', contact: 'Chris Weldon', linkedin: 'https://www.linkedin.com/in/jchrisweldon/' },
  { row: 1068, company: 'Excellere Partners', contact: 'Brad Cornell', linkedin: 'https://www.linkedin.com/in/brad-cornell-016325a3/' },
  { row: 1069, company: 'Boathouse Capital', contact: 'Bill Dyer', website: 'boathousecapital.com' },
  { row: 1070, company: 'Bow River Capital', contact: 'Greg Hiatrides', website: 'bowrivercapital.com' },
];

function apolloSearch(query) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(query);
    
    const options = {
      hostname: 'api.apollo.io',
      path: '/v1/mixed_people/search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'X-Api-Key': APOLLO_API_KEY,
      },
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function enrichContact(target) {
  console.log(`\n🔍 Searching Apollo for: ${target.contact} at ${target.company}`);
  
  const query = {
    q_organization_name: target.company,
    per_page: 10,
  };
  
  // Add person name if we have it
  if (target.contact) {
    const nameParts = target.contact.split(' ');
    if (nameParts.length >= 2) {
      query.person_titles = [
        'CEO', 'Managing Partner', 'Partner', 'Managing Director', 'Director',
        'COO', 'CTO', 'President', 'VP', 'Head of'
      ];
    }
  }
  
  try {
    const response = await apolloSearch(query);
    
    if (!response.people || response.people.length === 0) {
      console.log(`❌ No results from Apollo for ${target.company}`);
      return null;
    }
    
    console.log(`📊 Found ${response.people.length} people at ${target.company}`);
    
    // Look for exact match or best match
    let bestMatch = null;
    const targetNameLower = target.contact.toLowerCase().replace(/[^a-z\s]/g, '');
    
    for (const person of response.people) {
      const fullName = `${person.first_name} ${person.last_name}`.toLowerCase();
      
      // Exact match
      if (fullName === targetNameLower || 
          targetNameLower.includes(person.last_name?.toLowerCase())) {
        if (person.email && !person.email.includes('@apollo.io')) {
          bestMatch = person;
          break;
        }
      }
    }
    
    // If no exact match, take first person with valid email
    if (!bestMatch) {
      for (const person of response.people) {
        if (person.email && !person.email.includes('@apollo.io')) {
          console.log(`⚠️  No exact match, using: ${person.first_name} ${person.last_name} - ${person.title}`);
          bestMatch = person;
          break;
        }
      }
    }
    
    if (!bestMatch) {
      console.log(`❌ No valid email found`);
      return null;
    }
    
    console.log(`✅ Found: ${bestMatch.first_name} ${bestMatch.last_name}`);
    console.log(`   Title: ${bestMatch.title}`);
    console.log(`   Email: ${bestMatch.email}`);
    console.log(`   LinkedIn: ${bestMatch.linkedin_url || 'N/A'}`);
    
    return {
      contact: `${bestMatch.first_name} ${bestMatch.last_name}`,
      title: bestMatch.title,
      email: bestMatch.email,
      linkedin: bestMatch.linkedin_url || '',
    };
    
  } catch (error) {
    console.error(`❌ Apollo API error for ${target.company}:`, error.message);
    return null;
  }
}

async function main() {
  const sheets = google.sheets({ version: 'v4', auth });
  const updates = [];
  
  console.log('🚀 Starting PE enrichment cron job - March 13, 2026 8:07 AM\n');
  console.log(`Enriching ${TARGETS.length} firms...\n`);
  
  for (const target of TARGETS) {
    const enriched = await enrichContact(target);
    
    if (enriched) {
      updates.push({
        row: target.row,
        company: target.company,
        ...enriched,
      });
      
      // Rate limit: 1 request per second
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log(`\n\n📋 Summary: ${updates.length} leads enriched\n`);
  
  if (updates.length === 0) {
    console.log('No updates to apply.');
    return;
  }
  
  // Apply updates to sheet
  console.log('📝 Updating Google Sheet...\n');
  
  for (const update of updates) {
    const range = `Sheet1!C${update.row}:G${update.row}`;
    const values = [[
      update.contact,
      update.title,
      update.email,
      '', // Website stays as-is
      update.linkedin,
    ]];
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range,
      valueInputOption: 'RAW',
      requestBody: { values },
    });
    
    // Update status to "Enriched"
    const statusRange = `Sheet1!J${update.row}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: statusRange,
      valueInputOption: 'RAW',
      requestBody: { values: [['Enriched']] },
    });
    
    console.log(`✅ Updated row ${update.row}: ${update.company} - ${update.contact} (${update.email})`);
  }
  
  console.log(`\n✅ Enrichment complete! Updated ${updates.length} leads.`);
}

main().catch(console.error);
