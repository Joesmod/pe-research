const { google } = require('googleapis');
const fs = require('fs');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function enrichLeads() {
  console.log('=== PE RESEARCH & ENRICHMENT - MARCH 9, 1:36 PM ===\n');
  
  // Initialize Google Sheets
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read the sheet
  console.log('Reading Google Sheet...');
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'A:K',
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found in sheet.');
    return;
  }
  
  const headers = rows[0];
  console.log(`Headers: ${headers.join(', ')}\n`);
  
  // Find column indices
  const companyIdx = headers.indexOf('Company Name');
  const contactIdx = headers.indexOf('Contact Name');
  const titleIdx = headers.indexOf('Title');
  const emailIdx = headers.indexOf('Email');
  const linkedinIdx = headers.indexOf('LinkedIn');
  const statusIdx = headers.indexOf('Status');
  const notesIdx = headers.indexOf('Last Contacted');
  const websiteIdx = headers.indexOf('Website');
  
  // Find leads needing enrichment
  console.log('Finding leads needing enrichment...');
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    const website = row[websiteIdx] || '';
    
    // Skip if already enriched or dead
    if (status === 'Enriched' || status === 'Dead') continue;
    if (!company) continue;
    
    // Check if needs enrichment
    const hasNoContact = !contact || contact.trim() === '';
    const hasGenericEmail = email && (
      email.toLowerCase().startsWith('info@') ||
      email.toLowerCase().startsWith('sales@') ||
      email.toLowerCase().startsWith('ir@') ||
      email.toLowerCase().startsWith('contact@')
    );
    
    if (hasNoContact || hasGenericEmail) {
      needsEnrichment.push({
        rowIndex: i,
        company,
        website,
        currentContact: contact,
        currentEmail: email,
        currentTitle: row[titleIdx] || '',
        currentLinkedIn: row[linkedinIdx] || '',
        notes: row[notesIdx] || ''
      });
    }
  }
  
  console.log(`Found ${needsEnrichment.length} leads needing enrichment.\n`);
  
  // Limit to 10-15 leads
  const leadsToProcess = needsEnrichment.slice(0, 15);
  console.log(`Processing ${leadsToProcess.length} leads...\n`);
  
  const updates = [];
  const enrichmentLog = [];
  
  for (const lead of leadsToProcess) {
    console.log(`\n--- ${lead.company} ---`);
    
    // Extract domain from website
    let domain = '';
    if (lead.website) {
      try {
        const url = new URL(lead.website.startsWith('http') ? lead.website : 'https://' + lead.website);
        domain = url.hostname.replace('www.', '');
      } catch (e) {
        console.log(`  Could not parse website: ${lead.website}`);
      }
    }
    
    if (!domain) {
      console.log('  No valid domain found, skipping.');
      continue;
    }
    
    // Search Apollo for contacts at this firm
    console.log(`  Searching Apollo for contacts at ${domain}...`);
    
    try {
      const searchResponse = await fetch('https://api.apollo.io/v1/mixed_people/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': APOLLO_API_KEY
        },
        body: JSON.stringify({
          organization_domains: [domain],
          person_titles: [
            'CEO', 'Chief Executive Officer',
            'CTO', 'Chief Technology Officer',
            'COO', 'Chief Operating Officer',
            'Managing Partner', 'Managing Director',
            'Operating Partner', 'General Partner',
            'Partner',
            'VP Technology', 'VP Operations', 'VP Digital',
            'Director Technology', 'Director Operations', 'Director Digital',
            'Head of Technology', 'Head of Operations', 'Head of Value Creation'
          ],
          per_page: 5
        })
      });
      
      if (!searchResponse.ok) {
        console.log(`  Apollo search failed: ${searchResponse.status} ${searchResponse.statusText}`);
        continue;
      }
      
      const searchData = await searchResponse.json();
      
      if (!searchData.people || searchData.people.length === 0) {
        console.log('  No contacts found via Apollo search.');
        continue;
      }
      
      console.log(`  Found ${searchData.people.length} potential contacts.`);
      
      // Pick the best contact (first one with email)
      let bestContact = null;
      for (const person of searchData.people) {
        if (person.email && person.email.includes('@') && !person.email.startsWith('info@') && !person.email.startsWith('sales@')) {
          bestContact = person;
          break;
        }
      }
      
      if (!bestContact) {
        console.log('  No contacts with direct email found.');
        continue;
      }
      
      console.log(`  ✓ Found: ${bestContact.name}`);
      console.log(`    Title: ${bestContact.title || 'N/A'}`);
      console.log(`    Email: ${bestContact.email || 'N/A'}`);
      console.log(`    LinkedIn: ${bestContact.linkedin_url || 'N/A'}`);
      
      // Prepare update
      updates.push({
        range: `B${lead.rowIndex + 1}:F${lead.rowIndex + 1}`, // Contact Name through LinkedIn URL
        values: [[
          bestContact.name || '',
          bestContact.title || '',
          bestContact.email || '',
          bestContact.linkedin_url || ''
        ]]
      });
      
      // Update status to Enriched
      updates.push({
        range: `I${lead.rowIndex + 1}`, // Status column
        values: [['Enriched']]
      });
      
      // Update notes
      const newNote = `Enriched via Apollo API on 2026-03-09`;
      updates.push({
        range: `K${lead.rowIndex + 1}`, // Notes column
        values: [[newNote]]
      });
      
      enrichmentLog.push({
        company: lead.company,
        contact: bestContact.name,
        title: bestContact.title,
        email: bestContact.email,
        linkedin: bestContact.linkedin_url,
        source: 'Apollo API'
      });
      
      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.log(`  Error searching Apollo: ${error.message}`);
    }
  }
  
  // Apply updates to sheet
  if (updates.length > 0) {
    console.log(`\n\nApplying ${updates.length} updates to Google Sheet...`);
    
    for (const update of updates) {
      try {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: update.range,
          valueInputOption: 'RAW',
          resource: { values: update.values }
        });
      } catch (error) {
        console.log(`Error updating ${update.range}: ${error.message}`);
      }
    }
    
    console.log('✓ Sheet updates complete.');
  } else {
    console.log('\nNo updates to apply.');
  }
  
  // Save enrichment log
  if (enrichmentLog.length > 0) {
    const logPath = `enrichment-log-march9-136pm.json`;
    fs.writeFileSync(logPath, JSON.stringify(enrichmentLog, null, 2));
    console.log(`\n✓ Enrichment log saved: ${logPath}`);
  }
  
  // Create summary report
  const report = `
# PE RESEARCH & ENRICHMENT REPORT
**Date:** Monday, March 9, 2026 — 1:36 PM
**Run:** Hourly Cron Job

## Summary
- Leads Analyzed: ${needsEnrichment.length}
- Leads Processed: ${leadsToProcess.length}
- Successfully Enriched: ${enrichmentLog.length}

## Enriched Contacts
${enrichmentLog.map(item => `
### ${item.company}
- **Contact:** ${item.contact}
- **Title:** ${item.title}
- **Email:** ${item.email}
- **LinkedIn:** ${item.linkedin || 'N/A'}
- **Source:** ${item.source}
`).join('\n')}

## Next Steps
- Continue hourly enrichment runs
- Monitor for new PE firms to add
- Update GitHub dossiers with enriched data
`;
  
  const reportPath = `CRON-COMPLETION-20260309-136PM.md`;
  fs.writeFileSync(reportPath, report);
  console.log(`\n✓ Report saved: ${reportPath}`);
  
  console.log('\n=== ENRICHMENT COMPLETE ===');
  console.log(`Enriched: ${enrichmentLog.length} leads`);
  console.log(`Remaining: ${needsEnrichment.length - leadsToProcess.length} leads`);
}

enrichLeads().catch(error => {
  console.error('FATAL ERROR:', error);
  process.exit(1);
});
