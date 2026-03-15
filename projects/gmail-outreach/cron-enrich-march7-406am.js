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

async function enrichWithWeb(companyName, website) {
  console.log(`\n🔍 Web search for ${companyName}`);
  
  // Search for contact/team pages
  const searches = [
    `site:${website} leadership team`,
    `site:${website} contact us executives`,
    `"${companyName}" managing partner email`,
    `"${companyName}" CEO COO CFO email`,
  ];
  
  console.log(`  Searches: ${searches.join(', ')}`);
  return null; // Will require manual web search
}

async function main() {
  console.log('=== PE Research & Enrichment Cron - March 7, 4:06 AM ===\n');
  
  const rows = await readSheet();
  console.log(`Total rows: ${rows.length}`);
  
  // Skip header
  const header = rows[0];
  console.log('Headers:', header.join(' | '));
  
  // Find rows needing enrichment
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
    
    // Check if needs enrichment (empty name or generic email)
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
  
  // Show first 15
  const batch = needsEnrichment.slice(0, 15);
  console.log(`\nProcessing batch of ${batch.length}:\n`);
  
  for (const lead of batch) {
    console.log(`\n📋 Row ${lead.rowIndex}: ${lead.company}`);
    console.log(`   Website: ${lead.website}`);
    console.log(`   Current: ${lead.contactName || '(no name)'} | ${lead.email || '(no email)'}`);
    console.log(`   Status: ${lead.status || 'Active'}`);
    
    // Try Apollo API enrichment
    if (lead.website) {
      try {
        const domain = lead.website.replace(/^https?:\/\//, '').replace(/\/$/, '').split('/')[0];
        
        console.log(`   🔎 Apollo search: ${domain}`);
        
        const response = await axios.post(
          'https://api.apollo.io/api/v1/mixed_people/search',
          {
            organization_domains: [domain],
            person_titles: [
              'CEO', 'Chief Executive Officer',
              'Managing Partner', 'Managing Director',
              'COO', 'Chief Operating Officer',
              'Partner', 'General Partner',
              'President',
              'CFO', 'Chief Financial Officer',
              'VP Operations', 'VP Technology',
              'Director Operations', 'Director Technology'
            ],
            page: 1,
            per_page: 5
          },
          {
            headers: {
              'Cache-Control': 'no-cache',
              'Content-Type': 'application/json',
              'X-Api-Key': APOLLO_API_KEY
            }
          }
        );
        
        if (response.data && response.data.people && response.data.people.length > 0) {
          const people = response.data.people;
          console.log(`   ✅ Found ${people.length} contacts`);
          
          // Pick best contact (highest seniority)
          const best = people.find(p => 
            p.title && p.email && 
            (p.title.includes('CEO') || p.title.includes('Managing') || p.title.includes('Partner'))
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
              notes: `Enriched via Apollo on ${new Date().toISOString().split('T')[0]}`
            });
            
            console.log(`   ✨ Updated row ${lead.rowIndex}`);
          } else {
            console.log(`   ⚠️ No valid email found`);
          }
        } else {
          console.log(`   ❌ No contacts found in Apollo`);
          await enrichWithWeb(lead.company, lead.website);
        }
        
        // Rate limit: 2 requests per second
        await new Promise(resolve => setTimeout(resolve, 600));
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
  }
  
  console.log('\n=== Enrichment Complete ===');
  console.log(`Processed: ${batch.length}`);
  console.log(`Remaining: ${needsEnrichment.length - batch.length}`);
}

main().catch(console.error);
