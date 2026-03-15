const { google } = require('googleapis');
const https = require('https');

const apolloApiKey = 'Fx6RpQS0PKxfVgnxWOPWuw';
const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Apollo API search
async function searchApollo(orgName, titles) {
  const data = JSON.stringify({
    q_organization_name: orgName,
    person_titles: titles,
    page: 1,
    per_page: 10
  });

  const options = {
    hostname: 'api.apollo.io',
    port: 443,
    path: '/api/v1/mixed_people/search',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'X-Api-Key': apolloApiKey,
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve(result);
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

// Initialize Google Sheets
async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  return google.sheets({ version: 'v4', auth });
}

// Read all data from sheet
async function readSheet(sheets) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:N'
  });
  return response.data.values || [];
}

// Update a single row in the sheet
async function updateRow(sheets, rowIndex, contact, title, email, linkedin) {
  const range = `Sheet1!C${rowIndex}:G${rowIndex}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    resource: {
      values: [[contact, title, email, '', linkedin]]
    }
  });
}

// Update status and notes
async function updateStatusAndNotes(sheets, rowIndex, status, notes) {
  const rangeStatus = `Sheet1!J${rowIndex}`;
  const rangeNotes = `Sheet1!L${rowIndex}`;
  
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    resource: {
      data: [
        { range: rangeStatus, values: [[status]] },
        { range: rangeNotes, values: [[notes]] }
      ],
      valueInputOption: 'RAW'
    }
  });
}

// Check if row needs enrichment
function needsEnrichment(row) {
  const [company, , contact, title, email, website, linkedin, , , status] = row;
  
  if (!company) return false;
  
  // Check for generic/empty contacts
  const genericContact = !contact || 
    contact === 'Investor Relations' || 
    contact.toLowerCase().includes('general') ||
    contact.toLowerCase().includes('contact');
  
  // Check for generic/empty emails
  const genericEmail = !email || 
    email.includes('info@') || 
    email.includes('ir@') || 
    email.includes('sales@') || 
    email.includes('contact@') ||
    email.includes('general@');
  
  // Check status
  const needsResearch = status && (
    status.includes('Needs Manual Research') ||
    status.includes('Generic Contact Only')
  );
  
  return (genericContact || genericEmail) && needsResearch;
}

// Main enrichment function
async function enrichLeads() {
  console.log('🔍 PE Research & Enrichment - March 11, 2026 (2:37 PM)\n');
  
  const sheets = await getSheets();
  const rows = await readSheet(sheets);
  
  console.log(`📊 Total rows in sheet: ${rows.length}`);
  
  // Find rows needing enrichment
  const needsWork = [];
  for (let i = 1; i < rows.length; i++) {
    if (needsEnrichment(rows[i])) {
      needsWork.push({ row: rows[i], index: i + 1 });
    }
  }
  
  console.log(`\n🎯 Found ${needsWork.length} firms needing enrichment`);
  console.log(`📝 Processing first 12...\n`);
  
  const toProcess = needsWork.slice(0, 12);
  const results = [];
  
  for (const { row, index } of toProcess) {
    const [company, , , , , website] = row;
    console.log(`\n━━━ ${company} (Row ${index}) ━━━`);
    
    // Try Apollo first - cast a wide net
    const titles = [
      'CEO', 'President', 'Managing Partner', 'General Partner', 'Partner',
      'Chief Operating Officer', 'COO', 'CTO', 'Chief Technology Officer',
      'Managing Director', 'Director', 'VP Technology', 'VP Operations',
      'VP Digital', 'Head of Technology', 'Head of Operations',
      'Head of Portfolio Operations', 'Director of Technology'
    ];
    
    try {
      console.log(`  🔎 Searching Apollo for decision-makers...`);
      const apolloResult = await searchApollo(company, titles);
      
      if (apolloResult.people && apolloResult.people.length > 0) {
        // Filter for verified emails only
        const withEmail = apolloResult.people.filter(p => 
          p.email && 
          !p.email.includes('info@') && 
          !p.email.includes('general@') &&
          p.email_status === 'verified'
        );
        
        if (withEmail.length > 0) {
          const person = withEmail[0];
          const contact = person.name || person.first_name + ' ' + person.last_name;
          const title = person.title || 'N/A';
          const email = person.email;
          const linkedin = person.linkedin_url || 'N/A';
          
          console.log(`  ✅ Found: ${contact} - ${title}`);
          console.log(`  📧 Email: ${email} (${person.email_status})`);
          
          // Update the sheet
          await updateRow(sheets, index, contact, title, email, linkedin);
          await updateStatusAndNotes(sheets, index, 'Enriched', 
            `Apollo enriched ${new Date().toISOString().split('T')[0]}. verified.`);
          
          results.push({
            company,
            contact,
            title,
            email,
            source: 'Apollo',
            status: 'success'
          });
          
          // Rate limit: wait 2 seconds between requests
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        } else {
          console.log(`  ⚠️ Apollo found people but no verified emails`);
        }
      } else {
        console.log(`  ⚠️ No Apollo results`);
      }
    } catch (err) {
      console.log(`  ❌ Apollo error: ${err.message}`);
    }
    
    // If Apollo didn't work, mark for manual research
    console.log(`  📝 Marking for manual web research`);
    await updateStatusAndNotes(sheets, index, 'Needs Manual Research', 
      `Apollo: no results with verified emails. Needs web research - check LinkedIn, team page, press releases. ${new Date().toISOString().split('T')[0]}`);
    
    results.push({
      company,
      contact: null,
      source: 'Manual needed',
      status: 'needs_research'
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Summary
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 ENRICHMENT SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const successful = results.filter(r => r.status === 'success');
  const needsManual = results.filter(r => r.status === 'needs_research');
  
  console.log(`✅ Successfully enriched: ${successful.length}`);
  console.log(`📝 Needs manual research: ${needsManual.length}`);
  console.log(`📊 Total processed: ${results.length}\n`);
  
  if (successful.length > 0) {
    console.log('✅ Successfully Enriched:');
    successful.forEach(r => {
      console.log(`  • ${r.company}: ${r.contact} (${r.title}) - ${r.email}`);
    });
    console.log('');
  }
  
  if (needsManual.length > 0) {
    console.log('📝 Needs Manual Research:');
    needsManual.forEach(r => {
      console.log(`  • ${r.company}`);
    });
    console.log('');
  }
  
  console.log('✅ Enrichment run complete!');
  console.log(`📅 ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}`);
}

// Run
enrichLeads().catch(err => {
  console.error('\n❌ ERROR:', err.message);
  console.error(err.stack);
  process.exit(1);
});
