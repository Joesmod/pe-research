const { google } = require('googleapis');
const key = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const APOLLO_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function main() {
  console.log('=== PE Research & Enrichment - March 9, 8:06 AM ===\n');
  
  // 1. Read the sheet
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:M'
  });
  
  const rows = res.data.values || [];
  if (rows.length === 0) {
    console.log('Sheet is empty.');
    return;
  }
  
  const headers = rows[0];
  const companyIdx = headers.indexOf('Company');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const titleIdx = headers.indexOf('Position/Title');
  const statusIdx = headers.indexOf('Status');
  const linkedinIdx = headers.indexOf('LinkedIn URL');
  const notesIdx = headers.indexOf('Notes');
  const websiteIdx = headers.indexOf('Website');
  
  console.log(`Headers: ${headers.join(', ')}`);
  console.log(`Total rows: ${rows.length}\n`);
  
  // 2. Find rows needing enrichment (empty Contact Name OR generic/empty Email)
  const needsEnrichment = [];
  const genericEmails = ['info@', 'sales@', 'ir@', 'contact@', 'admin@', 'careers@'];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    const website = row[websiteIdx] || '';
    
    // Skip if already "Enriched" or "Dead"
    if (status === 'Enriched' || status === 'Dead' || status === 'Sent') continue;
    
    // Check if needs enrichment
    const hasGenericEmail = genericEmails.some(prefix => email.toLowerCase().startsWith(prefix));
    const needsWork = !contact.trim() || !email.trim() || hasGenericEmail;
    
    if (needsWork && company.trim()) {
      needsEnrichment.push({
        rowIndex: i,
        company,
        contact,
        email,
        website,
        status
      });
    }
  }
  
  console.log(`Found ${needsEnrichment.length} leads needing enrichment.\n`);
  
  if (needsEnrichment.length === 0) {
    console.log('No enrichment needed. Sheet is in good shape! ✅');
    return;
  }
  
  // 3. Limit to 15 for this run
  const batch = needsEnrichment.slice(0, 15);
  console.log(`Processing batch of ${batch.length} leads...\n`);
  
  const updates = [];
  
  // 4. Search Apollo for each firm
  for (const lead of batch) {
    console.log(`\n--- ${lead.company} ---`);
    console.log(`Current: ${lead.contact || '(empty)'} | ${lead.email || '(empty)'}`);
    
    try {
      // Apollo People Search - cast a wide net
      const searchResp = await fetch('https://api.apollo.io/api/v1/mixed_people/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': APOLLO_KEY
        },
        body: JSON.stringify({
          organization_name: lead.company,
          person_titles: [
            'CEO', 'CTO', 'COO', 'CFO', 'CMO',
            'Partner', 'Managing Partner', 'General Partner', 'Operating Partner',
            'Director', 'VP', 'Head of', 'Principal'
          ],
          page: 1,
          per_page: 5
        })
      });
      
      if (!searchResp.ok) {
        console.log(`Apollo search failed: ${searchResp.status}`);
        continue;
      }
      
      const searchData = await searchResp.json();
      const people = searchData.people || [];
      
      console.log(`Found ${people.length} potential contacts`);
      
      if (people.length === 0) {
        updates.push({
          rowIndex: lead.rowIndex,
          notes: 'Apollo search: no results'
        });
        continue;
      }
      
      // Pick the first result with a verified email
      let bestMatch = null;
      for (const person of people) {
        const email = person.email;
        const emailStatus = person.email_status;
        
        if (email && emailStatus === 'verified') {
          bestMatch = person;
          break;
        }
      }
      
      // If no verified, take first with any email
      if (!bestMatch) {
        bestMatch = people.find(p => p.email) || people[0];
      }
      
      if (bestMatch) {
        const name = bestMatch.name || `${bestMatch.first_name} ${bestMatch.last_name}`.trim();
        const title = bestMatch.title || '';
        const email = bestMatch.email || '';
        const linkedin = bestMatch.linkedin_url || '';
        const emailStatus = bestMatch.email_status || '';
        
        console.log(`✅ ${name} | ${title} | ${email} (${emailStatus})`);
        
        updates.push({
          rowIndex: lead.rowIndex,
          contactName: name,
          title,
          email,
          linkedin,
          status: emailStatus === 'verified' ? 'Enriched' : 'Enriched (unverified)',
          notes: `Apollo: ${emailStatus || 'found'}`
        });
      } else {
        console.log('No email found for any contact');
        updates.push({
          rowIndex: lead.rowIndex,
          notes: 'Apollo: contacts found but no emails'
        });
      }
      
      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (err) {
      console.error(`Error enriching ${lead.company}:`, err.message);
      updates.push({
        rowIndex: lead.rowIndex,
        notes: `Error: ${err.message}`
      });
    }
  }
  
  // 5. Write updates back to sheet
  console.log(`\n\n=== Applying ${updates.length} updates to sheet ===`);
  
  for (const update of updates) {
    const rowNum = update.rowIndex + 1; // 1-indexed for Sheets API
    const cellUpdates = [];
    
    if (update.contactName) {
      cellUpdates.push({
        range: `Sheet1!${String.fromCharCode(65 + contactIdx)}${rowNum}`,
        values: [[update.contactName]]
      });
    }
    if (update.title) {
      cellUpdates.push({
        range: `Sheet1!${String.fromCharCode(65 + titleIdx)}${rowNum}`,
        values: [[update.title]]
      });
    }
    if (update.email) {
      cellUpdates.push({
        range: `Sheet1!${String.fromCharCode(65 + emailIdx)}${rowNum}`,
        values: [[update.email]]
      });
    }
    if (update.linkedin) {
      cellUpdates.push({
        range: `Sheet1!${String.fromCharCode(65 + linkedinIdx)}${rowNum}`,
        values: [[update.linkedin]]
      });
    }
    if (update.status) {
      cellUpdates.push({
        range: `Sheet1!${String.fromCharCode(65 + statusIdx)}${rowNum}`,
        values: [[update.status]]
      });
    }
    if (update.notes) {
      cellUpdates.push({
        range: `Sheet1!${String.fromCharCode(65 + notesIdx)}${rowNum}`,
        values: [[update.notes]]
      });
    }
    
    for (const cell of cellUpdates) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: cell.range,
        valueInputOption: 'RAW',
        resource: { values: cell.values }
      });
    }
    
    console.log(`Row ${rowNum} updated`);
  }
  
  console.log('\n✅ Enrichment complete!');
  console.log(`Enriched: ${updates.filter(u => u.contactName).length}`);
  console.log(`Partial/Failed: ${updates.filter(u => !u.contactName).length}`);
}

main().catch(console.error);
