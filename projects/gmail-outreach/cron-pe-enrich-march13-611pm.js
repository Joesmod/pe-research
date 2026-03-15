const { google } = require('googleapis');
const axios = require('axios');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

const GENERIC_EMAIL_PATTERNS = ['info@', 'sales@', 'ir@', 'contact@', 'hello@', 'admin@'];

async function getSheetData() {
  const credentials = JSON.parse(fs.readFileSync('service-account.json', 'utf8'));
  
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:J'
  });
  
  return { sheets, rows: response.data.values || [] };
}

async function searchAndEnrichApollo(companyName, domain) {
  try {
    const cleanDomain = domain ? domain.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] : '';
    
    if (!cleanDomain) {
      console.log(`  ⚠️  No domain for ${companyName}, skipping`);
      return [];
    }

    console.log(`  🔍 Searching Apollo for: ${companyName} (${cleanDomain})`);
    
    // Step 1: Get organization ID
    let orgId;
    try {
      const orgResponse = await axios.get(
        'https://api.apollo.io/api/v1/organizations/enrich',
        {
          params: { domain: cleanDomain },
          headers: { 'X-Api-Key': APOLLO_API_KEY }
        }
      );
      orgId = orgResponse.data.organization?.id;
    } catch (error) {
      console.log(`  ⚠️  Org not found via enrich, trying search...`);
    }
    
    // Step 2: Search for people
    const searchPayload = orgId 
      ? { organization_ids: [orgId], per_page: 5, page: 1 }
      : { q_organization_domains: cleanDomain, per_page: 5, page: 1 };
    
    // Add title filters
    searchPayload.person_titles = [
      'CEO', 'Chief Executive Officer',
      'Managing Partner', 'Managing Director',
      'Partner', 'General Partner',
      'Principal',
      'President',
      'COO', 'Chief Operating Officer',
      'CFO', 'Chief Financial Officer',
      'CTO', 'Chief Technology Officer',
      'Head of', 'VP', 'Vice President'
    ];
    
    const searchResponse = await axios.post(
      'https://api.apollo.io/api/v1/mixed_people/api_search',
      searchPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );

    if (!searchResponse.data.people || searchResponse.data.people.length === 0) {
      console.log(`  ✗ No contacts found`);
      return [];
    }

    console.log(`  ✓ Found ${searchResponse.data.people.length} potential contacts`);
    
    // Step 3: Enrich top 3 contacts to get emails
    const enrichedContacts = [];
    const toEnrich = searchResponse.data.people.slice(0, 3);
    
    for (const person of toEnrich) {
      try {
        // Use people/match to get full contact details
        const enrichResponse = await axios.get(
          'https://api.apollo.io/api/v1/people/match',
          {
            params: { id: person.id },
            headers: { 'X-Api-Key': APOLLO_API_KEY }
          }
        );
        
        const enriched = enrichResponse.data.person;
        if (enriched) {
          enrichedContacts.push({
            name: `${enriched.first_name || ''} ${enriched.last_name || ''}`.trim(),
            title: enriched.title || person.title,
            email: enriched.email,
            linkedin: enriched.linkedin_url,
            verified: enriched.email_status === 'verified'
          });
          
          const emailInfo = enriched.email 
            ? `${enriched.email} ${enriched.email_status === 'verified' ? '✓' : ''}`
            : '(no email)';
          console.log(`    • ${enrichedContacts[enrichedContacts.length - 1].name} - ${enriched.title}`);
          console.log(`      ${emailInfo}`);
        }
        
        // Rate limiting between enrichment calls
        await new Promise(resolve => setTimeout(resolve, 600));
        
      } catch (error) {
        console.log(`    ⚠️  Could not enrich ${person.first_name || 'person'}`);
      }
    }
    
    return enrichedContacts;
    
  } catch (error) {
    console.error(`  ❌ Error searching Apollo for ${companyName}:`, error.response?.data?.error || error.message);
    return [];
  }
}

function needsEnrichment(row) {
  const [company, website, contactName, title, email, , , , , status] = row;
  
  if (!company || company.trim() === '') return false;
  
  if (status && (
    status.includes('Dead') ||
    status.includes('Not PE') ||
    status.includes('Duplicate')
  )) {
    return false;
  }
  
  const hasGenericEmail = email && GENERIC_EMAIL_PATTERNS.some(pattern => email.toLowerCase().includes(pattern));
  const needsContact = !contactName || contactName.trim() === '';
  const needsEmail = !email || email.trim() === '' || hasGenericEmail;
  const statusNeedsWork = status && (
    status.includes('Research') ||
    status.includes('Partial') ||
    status.includes('Needs Email') ||
    status.includes('Contact Found')
  );
  
  return needsContact || needsEmail || statusNeedsWork;
}

async function updateSheetRow(sheets, rowIndex, updates) {
  try {
    const updateData = [];
    
    if (updates.contactName) {
      updateData.push({ range: `Sheet1!C${rowIndex}`, values: [[updates.contactName]] });
    }
    if (updates.title) {
      updateData.push({ range: `Sheet1!D${rowIndex}`, values: [[updates.title]] });
    }
    if (updates.email) {
      updateData.push({ range: `Sheet1!E${rowIndex}`, values: [[updates.email]] });
    }
    if (updates.linkedin) {
      updateData.push({ range: `Sheet1!G${rowIndex}`, values: [[updates.linkedin]] });
    }
    if (updates.notes) {
      updateData.push({ range: `Sheet1!I${rowIndex}`, values: [[updates.notes]] });
    }
    if (updates.status) {
      updateData.push({ range: `Sheet1!J${rowIndex}`, values: [[updates.status]] });
    }
    
    if (updateData.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          valueInputOption: 'RAW',
          data: updateData
        }
      });
      console.log(`  ✅ Updated row ${rowIndex}`);
    }
    
  } catch (error) {
    console.error(`  ❌ Failed to update row ${rowIndex}:`, error.message);
  }
}

async function main() {
  console.log('🚀 Starting PE Research & Enrichment - Hourly Cron');
  console.log(`📅 ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}\n`);
  
  try {
    const { sheets, rows } = await getSheetData();
    console.log(`📊 Loaded ${rows.length} rows from sheet\n`);
    
    const toEnrich = [];
    rows.forEach((row, idx) => {
      if (idx === 0) return;
      if (needsEnrichment(row)) {
        toEnrich.push({ row, index: idx + 1 });
      }
    });
    
    console.log(`🎯 Found ${toEnrich.length} leads needing enrichment`);
    
    const batchSize = Math.min(10, toEnrich.length);
    const batch = toEnrich.slice(0, batchSize);
    
    console.log(`📦 Processing batch of ${batch.length} leads\n`);
    
    let enriched = 0;
    let partial = 0;
    let failed = 0;
    
    for (const { row, index } of batch) {
      const [company, website, currentContact, currentTitle, currentEmail] = row;
      
      console.log(`\n[${batch.indexOf({ row, index }) + 1}/${batch.length}] ${company}`);
      console.log(`  Current: ${currentContact || '(no contact)'} | ${currentEmail || '(no email)'}`);
      
      const contacts = await searchAndEnrichApollo(company, website);
      
      if (contacts.length > 0) {
        const bestContact = contacts.find(c => c.verified && c.email) ||
                          contacts.find(c => c.email) ||
                          contacts[0];
        
        console.log(`  ✅ Selected: ${bestContact.name} (${bestContact.title})`);
        
        await updateSheetRow(sheets, index, {
          contactName: bestContact.name,
          title: bestContact.title,
          email: bestContact.email || currentEmail,
          linkedin: bestContact.linkedin,
          notes: `Apollo API ${new Date().toISOString().split('T')[0]}`,
          status: bestContact.email ? 'Enriched' : 'Contact Found - Needs Email'
        });
        
        if (bestContact.email) {
          enriched++;
        } else {
          partial++;
        }
      } else {
        console.log(`  ⚠️  No contacts found`);
        failed++;
      }
      
      // Rate limiting between firms
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    console.log('\n\n=== ENRICHMENT SUMMARY ===');
    console.log(`✅ Successfully enriched (with email): ${enriched}`);
    console.log(`⚠️  Partial (contact but no email): ${partial}`);
    console.log(`❌ Failed to find contacts: ${failed}`);
    console.log(`📊 Total processed: ${batch.length}`);
    console.log(`🔄 Remaining in queue: ${toEnrich.length - batch.length}`);
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
