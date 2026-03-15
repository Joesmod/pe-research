const axios = require('axios');
const { google } = require('googleapis');
const fs = require('fs');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Load service account credentials
const credentials = JSON.parse(fs.readFileSync('service-account.json', 'utf8'));

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

// Generic emails to flag
const GENERIC_EMAILS = ['info@', 'sales@', 'ir@', 'contact@', 'hello@'];

function isGenericEmail(email) {
  if (!email) return true;
  return GENERIC_EMAILS.some(prefix => email.toLowerCase().startsWith(prefix));
}

async function readSheet() {
  console.log('Reading sheet...');
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Tracker!A:K'
  });
  
  return response.data.values || [];
}

async function searchApollo(firmName) {
  try {
    console.log(`\nSearching Apollo for decision-makers at ${firmName}...`);
    
    // Cast a wide net - search for multiple relevant titles
    const titles = [
      'CEO', 'CTO', 'COO', 'CMO', 'CFO',
      'Managing Partner', 'General Partner', 'Operating Partner', 'Partner',
      'Director Technology', 'Director Digital', 'Director Operations', 'Director Product',
      'VP Technology', 'VP Operations', 'VP Digital',
      'Head of Value Creation', 'Head of Portfolio Operations'
    ];
    
    const response = await axios.post('https://api.apollo.io/api/v1/mixed_people/api_search', {
      q_organization_name: firmName,
      per_page: 15,
      person_titles: titles
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': APOLLO_API_KEY
      }
    });
    
    if (response.data && response.data.people && response.data.people.length > 0) {
      // Filter to only those with verified emails
      const withEmails = response.data.people.filter(p => p.email && p.email.includes('@') && !isGenericEmail(p.email));
      
      if (withEmails.length > 0) {
        // Sort by seniority - prioritize C-level and Partners
        withEmails.sort((a, b) => {
          const aTitle = (a.title || '').toLowerCase();
          const bTitle = (b.title || '').toLowerCase();
          
          const aPriority = 
            (aTitle.includes('ceo') || aTitle.includes('cto') || aTitle.includes('coo')) ? 1 :
            (aTitle.includes('managing partner') || aTitle.includes('general partner')) ? 2 :
            (aTitle.includes('partner')) ? 3 :
            (aTitle.includes('vp') || aTitle.includes('vice president')) ? 4 :
            (aTitle.includes('director')) ? 5 : 6;
          
          const bPriority = 
            (bTitle.includes('ceo') || bTitle.includes('cto') || bTitle.includes('coo')) ? 1 :
            (bTitle.includes('managing partner') || bTitle.includes('general partner')) ? 2 :
            (bTitle.includes('partner')) ? 3 :
            (bTitle.includes('vp') || bTitle.includes('vice president')) ? 4 :
            (bTitle.includes('director')) ? 5 : 6;
          
          return aPriority - bPriority;
        });
        
        const best = withEmails[0];
        console.log(`✓ Found: ${best.name} - ${best.title} - ${best.email}`);
        
        return {
          name: best.name,
          title: best.title,
          email: best.email,
          linkedin: best.linkedin_url || '',
          source: 'Apollo API'
        };
      }
    }
    
    console.log(`✗ No contacts found with direct email`);
    return null;
    
  } catch (error) {
    console.error(`Apollo API error: ${error.message}`);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    return null;
  }
}

async function updateSheet(rowIndex, data) {
  // Column indices: Company(B), Position/Title(C), Contact Name(D), Email(E), Status(F), Notes(G), LinkedIn(K)
  const updates = [];
  
  if (data.name) {
    updates.push({
      range: `Tracker!D${rowIndex}`,
      values: [[data.name]]
    });
  }
  
  if (data.title) {
    updates.push({
      range: `Tracker!C${rowIndex}`,
      values: [[data.title]]
    });
  }
  
  if (data.email) {
    updates.push({
      range: `Tracker!E${rowIndex}`,
      values: [[data.email]]
    });
  }
  
  if (data.linkedin) {
    updates.push({
      range: `Tracker!K${rowIndex}`,
      values: [[data.linkedin]]
    });
  }
  
  // Update status to Enriched
  updates.push({
    range: `Tracker!F${rowIndex}`,
    values: [['Enriched']]
  });
  
  // Add source note
  updates.push({
    range: `Tracker!G${rowIndex}`,
    values: [[`Enriched via Apollo API - ${new Date().toISOString().split('T')[0]}`]]
  });
  
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    resource: {
      data: updates,
      valueInputOption: 'USER_ENTERED'
    }
  });
  
  console.log(`✓ Updated sheet row ${rowIndex}`);
}

async function main() {
  console.log('=== PE Research & Enrichment - Hourly Cron ===');
  console.log('Time:', new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));
  console.log();
  
  const rows = await readSheet();
  
  if (rows.length < 2) {
    console.log('No data in sheet');
    return;
  }
  
  const headers = rows[0];
  console.log('Headers:', headers.join(' | '));
  console.log();
  
  // Find firms needing enrichment
  const toEnrich = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowIndex = i + 1; // 1-indexed for sheets
    
    const company = row[1] || ''; // Column B
    const contactName = row[3] || ''; // Column D
    const email = row[4] || ''; // Column E
    const status = row[5] || ''; // Column F
    
    // Skip if already Dead or Sent
    if (status === 'Dead' || status === 'Sent') continue;
    
    // Skip if both contact name and valid email exist
    if (contactName && email && !isGenericEmail(email)) continue;
    
    // This one needs enrichment
    if (company) {
      toEnrich.push({
        rowIndex,
        company,
        contactName,
        email,
        status
      });
    }
  }
  
  console.log(`Found ${toEnrich.length} firms needing enrichment`);
  console.log();
  
  // Process up to 15 leads
  const batch = toEnrich.slice(0, 15);
  let enriched = 0;
  
  for (const lead of batch) {
    console.log(`\n[Row ${lead.rowIndex}] ${lead.company}`);
    console.log(`  Current: ${lead.contactName || '(no contact)'} - ${lead.email || '(no email)'}`);
    
    const contact = await searchApollo(lead.company);
    
    if (contact) {
      await updateSheet(lead.rowIndex, contact);
      enriched++;
    }
    
    // Rate limit: wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n\n=== Summary ===`);
  console.log(`Firms checked: ${batch.length}`);
  console.log(`Successfully enriched: ${enriched}`);
  console.log(`Remaining to enrich: ${toEnrich.length - batch.length}`);
}

main().catch(console.error);
