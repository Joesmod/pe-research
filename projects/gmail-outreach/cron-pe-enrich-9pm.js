const axios = require('axios');
const { google } = require('googleapis');
const key = require('./service-account.json');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function searchApolloPeople(companyDomain, companyName) {
  try {
    const response = await axios.post(
      'https://api.apollo.io/v1/mixed_people/search',
      {
        q_organization_domains: companyDomain,
        person_titles: [
          'Managing Partner',
          'Managing Director', 
          'General Partner',
          'Partner',
          'CEO',
          'Chief Executive Officer',
          'President',
          'Co-Founder',
          'Principal',
          'COO',
          'Chief Operating Officer',
          'CTO',
          'Chief Technology Officer',
          'CMO',
          'CFO',
          'VP',
          'Vice President',
          'Director',
          'Head of'
        ],
        page: 1,
        per_page: 5
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );

    if (response.data && response.data.people && response.data.people.length > 0) {
      // Filter for verified emails only, exclude generic emails
      const peopleWithEmail = response.data.people.filter(p => {
        const email = p.email || '';
        return email && 
               !email.includes('info@') && 
               !email.includes('contact@') &&
               !email.includes('sales@') &&
               !email.includes('ir@') &&
               !email.includes('admin@') &&
               !email.includes('support@');
      });
      return peopleWithEmail;
    }
    return [];
  } catch (error) {
    console.error(`Apollo people search error for ${companyName}:`, error.message);
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
  console.log('Headers:', headers);
  console.log(`\n📊 Total rows: ${rows.length - 1}`);
  
  // Find leads needing enrichment
  const needsEnrichment = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const website = row[1] || '';
    const contactName = row[2] || '';
    const email = row[4] || '';
    const status = row[9] || '';
    
    const hasEmptyContact = !contactName || contactName.trim() === '' || contactName === 'Jacob Zodikoff';
    const hasGenericEmail = !email || 
                            email.includes('info@') || 
                            email.includes('sales@') || 
                            email.includes('ir@') || 
                            email.includes('contact@') ||
                            email.includes('admin@') ||
                            email.trim() === '';
    
    const needsAttention = (status === 'New - Unresearched' || 
                           status === 'Partial' || 
                           status === 'Enriched - Needs Email' ||
                           hasEmptyContact || 
                           hasGenericEmail);
    
    if (needsAttention && company && website) {
      needsEnrichment.push({
        rowIndex: i,
        company,
        website,
        contactName,
        email,
        status
      });
    }
  }

  console.log(`\n=== Found ${needsEnrichment.length} leads needing enrichment ===\n`);

  // Enrich first 12
  const toEnrich = needsEnrichment.slice(0, 12);
  const updates = [];
  let enriched = 0;
  let notFound = 0;

  for (const lead of toEnrich) {
    console.log(`\n📍 Enriching: ${lead.company}`);
    console.log(`   Current: ${lead.contactName || '(empty)'} / ${lead.email || '(empty)'}`);
    console.log(`   Website: ${lead.website}`);
    
    // Extract domain from website
    let domain = lead.website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    
    // Search Apollo for people at this company
    const people = await searchApolloPeople(domain, lead.company);
    
    if (people.length > 0) {
      const bestContact = people[0]; // Get the first (highest ranking) person
      console.log(`   ✅ Found: ${bestContact.name}`);
      console.log(`   Title: ${bestContact.title}`);
      console.log(`   Email: ${bestContact.email}`);
      console.log(`   LinkedIn: ${bestContact.linkedin_url || 'N/A'}`);
      
      // Update: Contact Name, Title, Email, LinkedIn URL, Notes, Status
      updates.push({
        range: `Sheet1!C${lead.rowIndex + 1}:J${lead.rowIndex + 1}`,
        values: [[
          bestContact.name,
          bestContact.title || '',
          bestContact.email || '',
          lead.website,
          bestContact.linkedin_url || '',
          '', // Sectors
          `Apollo enriched ${new Date().toISOString().split('T')[0]}`,
          'Enriched'
        ]]
      });
      enriched++;
    } else {
      console.log(`   ❌ No contacts found`);
      notFound++;
    }
    
    // Rate limit: wait 600ms between requests
    await new Promise(resolve => setTimeout(resolve, 600));
  }

  // Batch update the sheet
  if (updates.length > 0) {
    console.log(`\n📝 Updating ${updates.length} rows in sheet...`);
    
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    
    console.log(`✅ Sheet updated successfully!`);
  }

  console.log(`\n🎯 Summary:`);
  console.log(`   Total needing enrichment: ${needsEnrichment.length}`);
  console.log(`   Attempted: ${toEnrich.length}`);
  console.log(`   Successfully enriched: ${enriched}`);
  console.log(`   Not found: ${notFound}`);
}

enrichLeads().catch(console.error);
