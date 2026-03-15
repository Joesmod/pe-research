const { google } = require('googleapis');
const https = require('https');
const fs = require('fs').promises;
const path = require('path');

const apolloApiKey = 'Fx6RpQS0PKxfVgnxWOPWuw';
const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Apollo API search for contacts
async function searchContacts(firmName, domain) {
  const searchQueries = [
    {
      organization_name: firmName,
      person_titles: ["Managing Partner", "Partner", "General Partner", "CEO", "President", "Managing Director"],
      page: 1,
      per_page: 5
    }
  ];
  
  // If we have a domain, also search by domain
  if (domain) {
    searchQueries.push({
      organization_domains: [domain],
      person_titles: ["Managing Partner", "Partner", "General Partner", "CEO", "President", "Managing Director", "Operating Partner"],
      page: 1,
      per_page: 5
    });
  }
  
  for (const query of searchQueries) {
    try {
      const data = JSON.stringify(query);
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
      
      const result = await new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          let body = '';
          res.on('data', (chunk) => body += chunk);
          res.on('end', () => {
            try {
              resolve(JSON.parse(body));
            } catch (e) {
              reject(e);
            }
          });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
      });
      
      if (result.people && result.people.length > 0) {
        // Filter for those with verified emails
        const withEmails = result.people.filter(p => p.email && !p.email.includes('info@') && !p.email.includes('sales@'));
        if (withEmails.length > 0) {
          return withEmails[0]; // Return first person with a direct email
        }
      }
      
      // Wait between queries to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Apollo search error for ${firmName}:`, error.message);
    }
  }
  
  return null;
}

// Read Google Sheet
async function readSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:J'
  });
  
  return { sheets, rows: response.data.values || [] };
}

// Update sheet row
async function updateSheetRow(sheets, rowIndex, contact, title, email, linkedin, notes) {
  const range = `Sheet1!B${rowIndex}:F${rowIndex}`;
  const values = [[contact, title, email, linkedin, notes]];
  
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    resource: { values }
  });
}

// Update status column
async function updateStatus(sheets, rowIndex, status) {
  const range = `Sheet1!H${rowIndex}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    resource: { values: [[status]] }
  });
}

// Extract domain from website URL
function extractDomain(url) {
  if (!url) return null;
  try {
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/\s]+)/);
    return match ? match[1].toLowerCase() : null;
  } catch {
    return null;
  }
}

// Main enrichment logic
async function enrichLeads() {
  console.log('🫡 PE Research & Enrichment Cron - Starting...\n');
  
  const { sheets, rows } = await readSheet();
  
  if (rows.length === 0) {
    console.log('No data found in sheet.');
    return;
  }
  
  const headers = rows[0];
  console.log('Headers:', headers.join(' | '), '\n');
  
  const enrichmentResults = [];
  let enrichedCount = 0;
  
  for (let i = 1; i < rows.length && enrichedCount < 15; i++) {
    const [firm, contact, title, email, linkedin, website, aum, status, notes, lastUpdated] = rows[i];
    
    // Check if needs enrichment
    const hasGenericEmail = email && (
      email.toLowerCase().includes('info@') || 
      email.toLowerCase().includes('sales@') || 
      email.toLowerCase().includes('ir@') ||
      email.toLowerCase().includes('contact@')
    );
    
    const needsEnrichment = !contact || !email || hasGenericEmail;
    
    if (!needsEnrichment || !firm) continue;
    
    console.log(`\n[${enrichedCount + 1}] Enriching: ${firm}`);
    console.log(`   Current: ${contact || 'N/A'} | ${email || 'N/A'}`);
    console.log(`   Website: ${website || 'N/A'}`);
    
    const domain = extractDomain(website);
    
    // Search Apollo
    const person = await searchContacts(firm, domain);
    
    if (person) {
      const fullName = `${person.first_name} ${person.last_name || ''}`.trim();
      const newTitle = person.title || title || '';
      const newEmail = person.email || email || '';
      const newLinkedIn = person.linkedin_url || linkedin || '';
      const newNotes = `Apollo enriched ${new Date().toISOString().split('T')[0]}`;
      
      console.log(`   ✅ Found: ${fullName}`);
      console.log(`      Title: ${newTitle}`);
      console.log(`      Email: ${newEmail}`);
      console.log(`      LinkedIn: ${newLinkedIn ? 'Yes' : 'No'}`);
      
      // Update the sheet
      await updateSheetRow(sheets, i + 1, fullName, newTitle, newEmail, newLinkedIn, newNotes);
      await updateStatus(sheets, i + 1, 'Enriched');
      
      enrichmentResults.push({
        firm,
        contact: fullName,
        title: newTitle,
        email: newEmail,
        linkedin: newLinkedIn,
        source: 'Apollo API',
        rowIndex: i + 1
      });
      
      enrichedCount++;
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else {
      console.log(`   ⚠️ No contact found via Apollo`);
      // Mark as researched but not found
      await updateStatus(sheets, i + 1, 'Needs Manual Research');
    }
  }
  
  // Save enrichment log
  const logPath = path.join(__dirname, `CRON-ENRICHMENT-MARCH11-1137AM.md`);
  const logContent = `# PE Enrichment Cron - March 11, 2026 11:37 AM

## Summary
- **Enriched**: ${enrichedCount} leads
- **Method**: Apollo API (organization + domain search)

## Enrichment Results

${enrichmentResults.map(r => `### ${r.firm}
- **Contact**: ${r.contact}
- **Title**: ${r.title}
- **Email**: ${r.email}
- **LinkedIn**: ${r.linkedin || 'N/A'}
- **Source**: ${r.source}
- **Sheet Row**: ${r.rowIndex}
`).join('\n')}

## Next Steps
- Continue hourly enrichment for remaining leads
- Update GitHub dossiers for enriched firms
- Manual research for "Needs Manual Research" status leads
`;
  
  await fs.writeFile(logPath, logContent);
  console.log(`\n✅ Enrichment complete! Log saved to ${logPath}`);
  console.log(`\n📊 Final tally: ${enrichedCount} leads enriched`);
  
  return enrichmentResults;
}

// Execute
enrichLeads()
  .then(() => {
    console.log('\n🫡 Cron job complete.');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
