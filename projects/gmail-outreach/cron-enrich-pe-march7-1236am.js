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
const GENERIC_EMAILS = ['info@', 'sales@', 'ir@', 'contact@', 'hello@', 'press@', 'media@'];

function isGenericEmail(email) {
  if (!email) return true;
  return GENERIC_EMAILS.some(prefix => email.toLowerCase().startsWith(prefix));
}

async function readSheet() {
  console.log('Reading Sheet1 (PE firms)...');
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:K'
  });
  
  return response.data.values || [];
}

async function searchApollo(firmName) {
  try {
    console.log(`\n  Searching Apollo for decision-makers at ${firmName}...`);
    
    // Try broad search first - no title restrictions
    let response = await axios.post('https://api.apollo.io/api/v1/mixed_people/api_search', {
      q_organization_name: firmName,
      per_page: 30
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': APOLLO_API_KEY
      }
    });
    
    if (response.data && response.data.people && response.data.people.length > 0) {
      console.log(`  Found ${response.data.people.length} people at ${firmName}`);
      
      // Filter to only those with verified emails
      const withEmails = response.data.people.filter(p => p.email && p.email.includes('@') && !isGenericEmail(p.email));
      
      console.log(`  ${withEmails.length} with direct emails`);
      
      if (withEmails.length > 0) {
        // Sort by seniority - prioritize C-level and Partners
        withEmails.sort((a, b) => {
          const aTitle = (a.title || '').toLowerCase();
          const bTitle = (b.title || '').toLowerCase();
          
          const aPriority = 
            (aTitle.includes('ceo') || aTitle.includes('chief executive') || aTitle.includes('founder')) ? 1 :
            (aTitle.includes('cto') || aTitle.includes('chief technology')) ? 2 :
            (aTitle.includes('coo') || aTitle.includes('chief operating')) ? 2 :
            (aTitle.includes('managing partner')) ? 3 :
            (aTitle.includes('general partner')) ? 3 :
            (aTitle.includes('operating partner')) ? 4 :
            (aTitle.includes('partner') && !aTitle.includes('associate')) ? 5 :
            (aTitle.includes('vp') || aTitle.includes('vice president')) ? 6 :
            (aTitle.includes('director') || aTitle.includes('head of')) ? 7 : 8;
          
          const bPriority = 
            (bTitle.includes('ceo') || bTitle.includes('chief executive') || bTitle.includes('founder')) ? 1 :
            (bTitle.includes('cto') || bTitle.includes('chief technology')) ? 2 :
            (bTitle.includes('coo') || bTitle.includes('chief operating')) ? 2 :
            (bTitle.includes('managing partner')) ? 3 :
            (bTitle.includes('general partner')) ? 3 :
            (bTitle.includes('operating partner')) ? 4 :
            (bTitle.includes('partner') && !bTitle.includes('associate')) ? 5 :
            (bTitle.includes('vp') || bTitle.includes('vice president')) ? 6 :
            (bTitle.includes('director') || bTitle.includes('head of')) ? 7 : 8;
          
          return aPriority - bPriority;
        });
        
        const best = withEmails[0];
        console.log(`  ✓ Best match: ${best.name} - ${best.title} - ${best.email}`);
        
        return {
          name: best.name,
          title: best.title,
          email: best.email,
          linkedin: best.linkedin_url || '',
          source: 'Apollo API'
        };
      }
    }
    
    console.log(`  ✗ No contacts found with direct email`);
    return null;
    
  } catch (error) {
    console.error(`  ✗ Apollo API error: ${error.message}`);
    if (error.response) {
      console.error('  Response:', error.response.data);
    }
    return null;
  }
}

async function updateSheet(rowIndex, data) {
  // Sheet1 columns: A=Company, B=NotebookLM, C=Contact Name, D=Title, E=Email, F=Website, G=LinkedIn, H=Sector, I=Portfolio, J=Status, K=Last Contacted
  const updates = [];
  
  if (data.name) {
    updates.push({
      range: `Sheet1!C${rowIndex}`,
      values: [[data.name]]
    });
  }
  
  if (data.title) {
    updates.push({
      range: `Sheet1!D${rowIndex}`,
      values: [[data.title]]
    });
  }
  
  if (data.email) {
    updates.push({
      range: `Sheet1!E${rowIndex}`,
      values: [[data.email]]
    });
  }
  
  if (data.linkedin) {
    updates.push({
      range: `Sheet1!G${rowIndex}`,
      values: [[data.linkedin]]
    });
  }
  
  // Update status to Enriched
  updates.push({
    range: `Sheet1!J${rowIndex}`,
    values: [['Enriched']]
  });
  
  // Update last contacted with enrichment note
  const now = new Date().toISOString();
  updates.push({
    range: `Sheet1!K${rowIndex}`,
    values: [[`Enriched via Apollo API - ${now.split('T')[0]}`]]
  });
  
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    resource: {
      data: updates,
      valueInputOption: 'USER_ENTERED'
    }
  });
  
  console.log(`  ✓ Updated sheet row ${rowIndex}`);
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
  console.log('Headers:', headers.slice(0, 11).join(' | '));
  console.log();
  
  // Find firms needing enrichment
  const toEnrich = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowIndex = i + 1; // 1-indexed for sheets
    
    const company = row[0] || ''; // Column A
    const contactName = row[2] || ''; // Column C
    const email = row[4] || ''; // Column E
    const status = row[9] || ''; // Column J
    
    // Skip if already Dead
    if (status && status.toLowerCase().includes('dead')) continue;
    
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
    console.log(`[Row ${lead.rowIndex}] ${lead.company}`);
    console.log(`  Current: ${lead.contactName || '(no contact)'} / ${lead.email || '(no email)'}`);
    
    const contact = await searchApollo(lead.company);
    
    if (contact) {
      await updateSheet(lead.rowIndex, contact);
      enriched++;
    }
    
    // Rate limit: wait 1.5 seconds between requests
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  console.log(`\n\n=== Summary ===`);
  console.log(`Firms checked: ${batch.length}`);
  console.log(`Successfully enriched: ${enriched}`);
  console.log(`Remaining to enrich: ${toEnrich.length - batch.length}`);
  
  if (enriched > 0) {
    console.log(`\n✅ Enriched ${enriched} PE firms with verified contacts`);
  } else {
    console.log(`\n⚠️  No new contacts found in this batch`);
  }
}

main().catch(console.error);
