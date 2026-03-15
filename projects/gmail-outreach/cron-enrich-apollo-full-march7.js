const axios = require('axios');
const { google } = require('googleapis');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function readSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:M'
  });
  
  return response.data.values || [];
}

async function updateRow(rowIndex, updates) {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const updatePromises = [];
  
  if (updates.contactName) {
    updatePromises.push(
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!C${rowIndex}`,
        valueInputOption: 'RAW',
        resource: { values: [[updates.contactName]] }
      })
    );
  }
  
  if (updates.title) {
    updatePromises.push(
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!D${rowIndex}`,
        valueInputOption: 'RAW',
        resource: { values: [[updates.title]] }
      })
    );
  }
  
  if (updates.email) {
    updatePromises.push(
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!E${rowIndex}`,
        valueInputOption: 'RAW',
        resource: { values: [[updates.email]] }
      })
    );
  }
  
  if (updates.linkedIn) {
    updatePromises.push(
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!G${rowIndex}`,
        valueInputOption: 'RAW',
        resource: { values: [[updates.linkedIn]] }
      })
    );
  }
  
  if (updates.notes) {
    updatePromises.push(
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!L${rowIndex}`,
        valueInputOption: 'RAW',
        resource: { values: [[updates.notes]] }
      })
    );
  }
  
  if (updates.status) {
    updatePromises.push(
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!J${rowIndex}`,
        valueInputOption: 'RAW',
        resource: { values: [[updates.status]] }
      })
    );
  }
  
  await Promise.all(updatePromises);
}

// Step 1: Search for people
async function searchApollo(companyDomain) {
  try {
    const response = await axios.post('https://api.apollo.io/api/v1/mixed_people/api_search', {
      q_organization_domains: companyDomain,
      person_titles: [
        'CEO', 'Chief Executive Officer', 'Founder', 'Co-Founder',
        'Managing Partner', 'Managing Director', 'General Partner',
        'Partner', 'CTO', 'COO', 'President', 'CFO',
        'VP Operations', 'VP Technology', 'Director'
      ],
      page: 1,
      per_page: 5
    }, {
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY
      }
    });
    
    return response.data.people || [];
  } catch (error) {
    console.error(`  ❌ Apollo search error: ${error.message}`);
    return [];
  }
}

// Step 2: Enrich person to get full contact details
async function enrichPerson(personId) {
  try {
    const response = await axios.get(`https://api.apollo.io/api/v1/people/${personId}`, {
      headers: {
        'Cache-Control': 'no-cache',
        'X-Api-Key': APOLLO_API_KEY
      }
    });
    
    return response.data.person || null;
  } catch (error) {
    console.error(`  ❌ Apollo enrich error: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('=== PE Research & Enrichment with Full Apollo Enrichment ===\n');
  
  const rows = await readSheet();
  console.log(`Total rows: ${rows.length}`);
  
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    
    const company = row[0] || '';
    const website = row[1] || '';
    const contactName = row[2] || '';
    const email = row[4] || '';
    const status = row[9] || '';
    
    if (status && (status.includes('Enriched') || status.includes('Sent') || status.includes('Dead'))) {
      continue;
    }
    
    const hasGenericEmail = email && (
      email.includes('info@') || email.includes('contact@') || 
      email.includes('sales@') || email.includes('ir@')
    );
    
    if (!contactName || !email || hasGenericEmail) {
      needsEnrichment.push({
        rowIndex: i + 1,
        company,
        website,
        contactName,
        email,
        status
      });
    }
  }
  
  console.log(`Found ${needsEnrichment.length} firms needing enrichment\n`);
  
  const batch = needsEnrichment.slice(0, 10);
  console.log(`Processing batch of ${batch.length}:\n`);
  
  let enriched = 0;
  let failed = 0;
  
  for (const lead of batch) {
    console.log(`\n📋 Row ${lead.rowIndex}: ${lead.company}`);
    console.log(`   Website: ${lead.website}`);
    
    if (lead.website && lead.website.startsWith('http')) {
      try {
        const domain = lead.website
          .replace(/^https?:\/\//, '')
          .replace(/^www\./, '')
          .replace(/\/$/, '')
          .split('/')[0];
        
        console.log(`   🔎 Step 1: Search Apollo for ${domain}`);
        const people = await searchApollo(domain);
        
        if (people.length > 0) {
          console.log(`   ✅ Found ${people.length} candidates`);
          
          // Pick best candidate (prioritize senior titles)
          const best = people.find(p => 
            p.title && (
              p.title.toLowerCase().includes('ceo') || 
              p.title.toLowerCase().includes('managing') ||
              p.title.toLowerCase().includes('partner')
            )
          ) || people[0];
          
          console.log(`   👤 Selected: ${best.first_name} ${best.last_name_obfuscated} - ${best.title}`);
          console.log(`   🔎 Step 2: Enriching person ID ${best.id}...`);
          
          // Rate limit before enrichment call
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const enrichedPerson = await enrichPerson(best.id);
          
          if (enrichedPerson && enrichedPerson.email) {
            console.log(`   📧 Email: ${enrichedPerson.email}`);
            console.log(`   🔗 LinkedIn: ${enrichedPerson.linkedin_url || '(none)'}`);
            
            await updateRow(lead.rowIndex, {
              contactName: `${enrichedPerson.first_name} ${enrichedPerson.last_name}`,
              title: enrichedPerson.title,
              email: enrichedPerson.email,
              linkedIn: enrichedPerson.linkedin_url || '',
              status: 'Enriched',
              notes: `Apollo enriched ${new Date().toISOString().split('T')[0]}`
            });
            
            console.log(`   ✨ Updated row ${lead.rowIndex}`);
            enriched++;
          } else {
            console.log(`   ⚠️ No email returned from enrichment`);
            failed++;
          }
        } else {
          console.log(`   ⚠️ No candidates found`);
          failed++;
        }
        
        // Rate limit between firms
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        failed++;
      }
    } else {
      console.log(`   ⚠️ Invalid website`);
      failed++;
    }
  }
  
  console.log('\n=== Enrichment Complete ===');
  console.log(`✅ Enriched: ${enriched}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📋 Remaining: ${needsEnrichment.length - batch.length}`);
}

main().catch(console.error);
