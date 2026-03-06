const axios = require('axios');
const { google } = require('googleapis');
const key = require('./service-account.json');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function searchApolloPeople(companyDomain) {
  try {
    const response = await axios.post(
      'https://api.apollo.io/v1/mixed_people/search',
      {
        organization_domains: [companyDomain],
        person_titles: [
          'Managing Partner',
          'Managing Director',
          'Partner',
          'CEO',
          'President',
          'General Partner',
          'Principal'
        ],
        page: 1,
        per_page: 3
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );

    if (response.data && response.data.people && response.data.people.length > 0) {
      return response.data.people.filter(p => p.email && 
        !p.email.includes('info@') && 
        !p.email.includes('contact@') &&
        !p.email.includes('sales@') &&
        !p.email.includes('ir@'));
    }
    return [];
  } catch (error) {
    if (error.response) {
      console.error(`   Apollo API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(`   Apollo error: ${error.message}`);
    }
    return [];
  }
}

async function enrichLeads() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // Read current sheet
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Sheet1!A:J'
  });

  const rows = result.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }

  const headers = rows[0];
  console.log('Sheet columns:', headers.join(', '));
  
  // Find leads needing enrichment (skip already enriched)
  const needsEnrichment = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contactName = row[2] || '';
    const email = row[4] || '';
    const website = row[5] || '';
    
    const hasEmptyContact = !contactName || contactName.trim() === '';
    const hasGenericEmail = !email || email.includes('info@') || email.includes('sales@') || email.includes('ir@') || email.includes('contact@') || email.trim() === '';
    
    if ((hasEmptyContact || hasGenericEmail) && company && website && !website.includes('linkedin.com')) {
      needsEnrichment.push({
        rowIndex: i,
        company,
        website,
        contactName,
        email
      });
    }
  }

  console.log(`\nFound ${needsEnrichment.length} leads needing enrichment\n`);

  // Manually enrich Osceola Capital first (already researched)
  const osceola = needsEnrichment.find(l => l.company.includes('Osceola'));
  if (osceola) {
    console.log(`✅ Osceola Capital - Michael Babb`);
    const updates = [{
      range: `Sheet1!C${osceola.rowIndex + 1}:E${osceola.rowIndex + 1}`,
      values: [['Michael Babb', 'Managing Partner', 'mbabb@osceola.com']]
    }];
    
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
  }

  // Try Apollo for a few more
  const toTry = needsEnrichment.slice(0, 10);
  
  for (const lead of toTry) {
    if (lead.company.includes('Osceola')) continue; // Already done
    
    console.log(`\n🔍 ${lead.company}`);
    console.log(`   Website: ${lead.website}`);
    
    // Extract clean domain
    let domain = lead.website
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0]
      .toLowerCase();
    
    console.log(`   Domain: ${domain}`);
    
    const people = await searchApolloPeople(domain);
    
    if (people.length > 0) {
      const contact = people[0];
      console.log(`   ✅ ${contact.name} - ${contact.title}`);
      console.log(`   📧 ${contact.email}`);
      
      const updates = [{
        range: `Sheet1!C${lead.rowIndex + 1}:E${lead.rowIndex + 1}`,
        values: [[contact.name, contact.title || '', contact.email || '']]
      }];
      
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          valueInputOption: 'RAW',
          data: updates
        }
      });
    } else {
      console.log(`   ❌ No contacts found`);
    }
    
    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n✅ Enrichment run complete');
}

enrichLeads().catch(console.error);
