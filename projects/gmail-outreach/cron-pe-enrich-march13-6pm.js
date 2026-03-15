const { google } = require('googleapis');
const axios = require('axios');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Target: Enrich leads with empty Contact Name or generic/empty emails
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

async function searchApolloContacts(companyName, domain) {
  try {
    const cleanDomain = domain ? domain.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] : '';
    
    if (!cleanDomain) {
      console.log(`  ⚠️  No domain for ${companyName}, skipping Apollo search`);
      return [];
    }

    console.log(`  🔍 Searching Apollo for: ${companyName} (${cleanDomain})`);
    
    const response = await axios.post(
      'https://api.apollo.io/api/v1/mixed_people/api_search',
      {
        q_organization_domains: cleanDomain,
        person_titles: [
          'CEO', 'Chief Executive Officer',
          'Managing Partner', 'Managing Director', 'Co-Managing Partner',
          'Partner', 'General Partner', 'Co-Founder',
          'Principal',
          'President', 'Co-President',
          'COO', 'Chief Operating Officer',
          'CFO', 'Chief Financial Officer',
          'CTO', 'Chief Technology Officer',
          'Head of Business Development',
          'VP', 'Vice President'
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
      console.log(`  ✓ Found ${response.data.people.length} contacts`);
      return response.data.people.map(person => ({
        name: `${person.first_name || ''} ${person.last_name || ''}`.trim(),
        title: person.title,
        email: person.email,
        linkedin: person.linkedin_url,
        verified: person.email_status === 'verified'
      }));
    }

    console.log(`  ✗ No contacts found via Apollo`);
    return [];
  } catch (error) {
    console.error(`  ❌ Error searching Apollo for ${companyName}:`, error.response?.data?.error || error.message);
    return [];
  }
}

function needsEnrichment(row) {
  const [company, website, contactName, title, email, , , , , status] = row;
  
  // Skip if no company name
  if (!company || company.trim() === '') return false;
  
  // Skip if status indicates it's dead/bad
  if (status && (
    status.includes('Dead') ||
    status.includes('Not PE') ||
    status.includes('Duplicate')
  )) {
    return false;
  }
  
  // Needs enrichment if:
  // 1. No contact name, OR
  // 2. No email, OR
  // 3. Generic email (info@, sales@, etc.), OR
  // 4. Status is "Research" or "Partial" or "Needs Email"
  
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
    // Build the update based on what we found
    const updateData = [];
    
    // Column C = Contact Name (index 2)
    if (updates.contactName) {
      updateData.push({
        range: `Sheet1!C${rowIndex}`,
        values: [[updates.contactName]]
      });
    }
    
    // Column D = Title (index 3)
    if (updates.title) {
      updateData.push({
        range: `Sheet1!D${rowIndex}`,
        values: [[updates.title]]
      });
    }
    
    // Column E = Email (index 4)
    if (updates.email) {
      updateData.push({
        range: `Sheet1!E${rowIndex}`,
        values: [[updates.email]]
      });
    }
    
    // Column G = LinkedIn (index 6)
    if (updates.linkedin) {
      updateData.push({
        range: `Sheet1!G${rowIndex}`,
        values: [[updates.linkedin]]
      });
    }
    
    // Column I = Notes (index 8)
    if (updates.notes) {
      updateData.push({
        range: `Sheet1!I${rowIndex}`,
        values: [[updates.notes]]
      });
    }
    
    // Column J = Status (index 9)
    if (updates.status) {
      updateData.push({
        range: `Sheet1!J${rowIndex}`,
        values: [[updates.status]]
      });
    }
    
    if (updateData.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          valueInputOption: 'RAW',
          data: updateData
        }
      });
      console.log(`  ✅ Updated row ${rowIndex} in Google Sheet`);
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
    
    // Find rows that need enrichment (skip header)
    const toEnrich = [];
    rows.forEach((row, idx) => {
      if (idx === 0) return; // Skip header
      if (needsEnrichment(row)) {
        toEnrich.push({ row, index: idx + 1 }); // +1 because sheets are 1-indexed
      }
    });
    
    console.log(`🎯 Found ${toEnrich.length} leads needing enrichment`);
    
    // Limit to 10-15 per run
    const batchSize = Math.min(15, toEnrich.length);
    const batch = toEnrich.slice(0, batchSize);
    
    console.log(`📦 Processing batch of ${batch.length} leads\n`);
    
    let enriched = 0;
    let failed = 0;
    
    for (const { row, index } of batch) {
      const [company, website, currentContact, currentTitle, currentEmail] = row;
      
      console.log(`\n[${ batch.indexOf({ row, index }) + 1}/${batch.length}] ${company}`);
      console.log(`  Current: ${currentContact || '(no contact)'} | ${currentEmail || '(no email)'}`);
      
      // Search Apollo
      const contacts = await searchApolloContacts(company, website);
      
      if (contacts.length > 0) {
        // Pick best contact: verified email first, then any email, then first contact
        const bestContact = contacts.find(c => c.verified && c.email) ||
                          contacts.find(c => c.email) ||
                          contacts[0];
        
        console.log(`  ✅ Selected: ${bestContact.name} (${bestContact.title})`);
        console.log(`     Email: ${bestContact.email || '(not found)'} ${bestContact.verified ? '✓ verified' : ''}`);
        
        // Update the sheet
        await updateSheetRow(sheets, index, {
          contactName: bestContact.name,
          title: bestContact.title,
          email: bestContact.email || currentEmail,
          linkedin: bestContact.linkedin,
          notes: `Apollo API ${new Date().toISOString().split('T')[0]}`,
          status: bestContact.email ? 'Enriched' : 'Contact Found - Needs Email'
        });
        
        enriched++;
      } else {
        console.log(`  ⚠️  No contacts found via Apollo`);
        failed++;
      }
      
      // Rate limiting: 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n\n=== ENRICHMENT SUMMARY ===');
    console.log(`✅ Successfully enriched: ${enriched}`);
    console.log(`⚠️  Failed to enrich: ${failed}`);
    console.log(`📊 Total processed: ${batch.length}`);
    console.log(`🔄 Remaining in queue: ${toEnrich.length - batch.length}`);
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
