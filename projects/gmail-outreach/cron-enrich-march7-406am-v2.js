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

async function searchApollo(companyDomain, companyName) {
  try {
    const response = await axios.post('https://api.apollo.io/v1/mixed_people/search', {
      q_organization_domains: companyDomain,
      person_titles: [
        'CEO', 'Chief Executive Officer', 'Founder', 'Co-Founder',
        'Managing Partner', 'Managing Director', 'General Partner',
        'Partner', 'CTO', 'Chief Technology Officer',
        'COO', 'Chief Operating Officer', 'President',
        'CFO', 'Chief Financial Officer',
        'VP Operations', 'VP Technology', 'VP Business Development',
        'Director Operations', 'Director Technology', 'Director Business Development',
        'Head of Operations', 'Head of Technology', 'Head of Business Development'
      ],
      page: 1,
      per_page: 10
    }, {
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY
      }
    });
    
    return response.data.people || [];
  } catch (error) {
    console.error(`  ❌ Apollo API error: ${error.message}`);
    if (error.response) {
      console.error(`  Response: ${JSON.stringify(error.response.data)}`);
    }
    return [];
  }
}

async function main() {
  console.log('=== PE Research & Enrichment Cron - March 7, 4:06 AM ===\n');
  
  const rows = await readSheet();
  console.log(`Total rows: ${rows.length}`);
  
  const header = rows[0];
  console.log('Headers:', header.join(' | '));
  
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    
    const company = row[0] || '';
    const website = row[1] || '';
    const contactName = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    const status = row[9] || '';
    
    // Skip if already enriched, sent, or dead
    if (status && (status.includes('Enriched') || status.includes('Sent') || status.includes('Dead'))) {
      continue;
    }
    
    // Check if needs enrichment
    const hasGenericEmail = email && (
      email.includes('info@') || 
      email.includes('contact@') || 
      email.includes('sales@') || 
      email.includes('ir@') ||
      email.includes('hello@') ||
      email.includes('support@')
    );
    
    if (!contactName || !email || hasGenericEmail) {
      needsEnrichment.push({
        rowIndex: i + 1,
        company,
        website,
        contactName,
        title,
        email,
        status
      });
    }
  }
  
  console.log(`\nFound ${needsEnrichment.length} firms needing enrichment`);
  
  const batch = needsEnrichment.slice(0, 15);
  console.log(`\nProcessing batch of ${batch.length}:\n`);
  
  let enriched = 0;
  let failed = 0;
  
  for (const lead of batch) {
    console.log(`\n📋 Row ${lead.rowIndex}: ${lead.company}`);
    console.log(`   Website: ${lead.website}`);
    console.log(`   Current: ${lead.contactName || '(no name)'} | ${lead.email || '(no email)'}`);
    
    if (lead.website) {
      try {
        const domain = lead.website
          .replace(/^https?:\/\//, '')
          .replace(/^www\./, '')
          .replace(/\/$/, '')
          .split('/')[0];
        
        console.log(`   🔎 Apollo search: ${domain}`);
        
        const people = await searchApollo(domain, lead.company);
        
        if (people.length > 0) {
          console.log(`   ✅ Found ${people.length} contacts`);
          
          // Pick best contact (prioritize seniority)
          const best = people.find(p => 
            p.title && p.email && 
            (p.title.toLowerCase().includes('ceo') || 
             p.title.toLowerCase().includes('managing') || 
             p.title.toLowerCase().includes('partner'))
          ) || people.find(p => p.title && p.email) || people[0];
          
          if (best && best.email) {
            console.log(`   👤 ${best.name} - ${best.title}`);
            console.log(`   📧 ${best.email}`);
            console.log(`   🔗 ${best.linkedin_url || '(no LinkedIn)'}`);
            
            await updateRow(lead.rowIndex, {
              contactName: best.name,
              title: best.title,
              email: best.email,
              linkedIn: best.linkedin_url || '',
              status: 'Enriched',
              notes: `Apollo enrichment ${new Date().toISOString().split('T')[0]}`
            });
            
            console.log(`   ✨ Updated row ${lead.rowIndex}`);
            enriched++;
          } else {
            console.log(`   ⚠️ No valid email found in Apollo results`);
            failed++;
          }
        } else {
          console.log(`   ❌ No contacts found in Apollo for ${domain}`);
          failed++;
        }
        
        // Rate limit: Apollo allows ~2 requests/second
        await new Promise(resolve => setTimeout(resolve, 600));
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        failed++;
      }
    } else {
      console.log(`   ⚠️ No website to search`);
      failed++;
    }
  }
  
  console.log('\n=== Enrichment Complete ===');
  console.log(`✅ Enriched: ${enriched}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Remaining to enrich: ${needsEnrichment.length - batch.length}`);
}

main().catch(console.error);
