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
  const companyIdx = headers.indexOf('Company Name');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const titleIdx = headers.indexOf('Title');
  const statusIdx = headers.indexOf('Status');
  const linkedinIdx = headers.indexOf('LinkedIn');
  const notesIdx = headers.indexOf('Notes');
  const websiteIdx = headers.indexOf('Website');
  
  console.log(`Total rows: ${rows.length}\n`);
  
  // 2. Find rows needing enrichment - ONLY active/real PE firms
  const needsEnrichment = [];
  const genericEmails = ['info@', 'sales@', 'ir@', 'contact@', 'admin@', 'careers@'];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    const website = row[websiteIdx] || '';
    
    // Skip if "Dead" anywhere in status, or "Sent", or already "Enriched"
    if (!company.trim()) continue;
    if (status.includes('Dead')) continue;
    if (status === 'Sent') continue;
    if (status === 'Enriched') continue;
    
    // Check if needs enrichment
    const hasGenericEmail = genericEmails.some(prefix => email.toLowerCase().startsWith(prefix));
    const needsWork = !contact.trim() || !email.trim() || hasGenericEmail;
    
    if (needsWork) {
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
  
  console.log(`Found ${needsEnrichment.length} active leads needing enrichment.\n`);
  
  if (needsEnrichment.length === 0) {
    console.log('✅ No active leads need enrichment. Sheet is in great shape!');
    console.log('\n📊 Consider adding 3-5 new PE firms to maintain pipeline.');
    return;
  }
  
  // 3. Limit to 15 for this run
  const batch = needsEnrichment.slice(0, 15);
  console.log(`Processing batch of ${batch.length} leads...\n`);
  
  const updates = [];
  let enrichedCount = 0;
  
  // 4. Search Apollo for each firm
  for (const lead of batch) {
    console.log(`\n--- ${lead.company} ---`);
    console.log(`Current: ${lead.contact || '(none)'} | ${lead.email || '(none)'} | Status: ${lead.status}`);
    
    try {
      // Apollo People Search - decision-makers only
      const titles = [
        'CEO', 'CTO', 'COO', 'CFO', 'CMO', 'President',
        'Partner', 'Managing Partner', 'General Partner', 'Operating Partner',
        'Director', 'Managing Director', 'VP', 'Vice President',
        'Head of Technology', 'Head of Operations', 'Head of Portfolio',
        'Principal'
      ];
      
      const searchResp = await fetch('https://api.apollo.io/api/v1/mixed_people/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': APOLLO_KEY
        },
        body: JSON.stringify({
          q_organization_name: lead.company,
          person_titles: titles,
          page: 1,
          per_page: 10
        })
      });
      
      if (!searchResp.ok) {
        console.log(`⚠️  Apollo search failed: ${searchResp.status} ${searchResp.statusText}`);
        updates.push({
          rowIndex: lead.rowIndex,
          notes: `Apollo error: ${searchResp.status}`
        });
        continue;
      }
      
      const searchData = await searchResp.json();
      const people = searchData.people || [];
      
      console.log(`   Found ${people.length} contacts`);
      
      if (people.length === 0) {
        console.log(`   ❌ No decision-makers found`);
        updates.push({
          rowIndex: lead.rowIndex,
          notes: 'Apollo: no decision-makers found'
        });
        continue;
      }
      
      // Pick the best contact: verified email preferred
      let bestMatch = null;
      
      // Priority 1: Verified email
      for (const person of people) {
        if (person.email && person.email_status === 'verified') {
          bestMatch = person;
          break;
        }
      }
      
      // Priority 2: Any email
      if (!bestMatch) {
        bestMatch = people.find(p => p.email);
      }
      
      // Priority 3: Take first result (will have no email)
      if (!bestMatch) {
        bestMatch = people[0];
      }
      
      const name = bestMatch.name || `${bestMatch.first_name || ''} ${bestMatch.last_name || ''}`.trim();
      const title = bestMatch.title || '';
      const email = bestMatch.email || '';
      const linkedin = bestMatch.linkedin_url || '';
      const emailStatus = bestMatch.email_status || 'not found';
      
      if (email && emailStatus === 'verified') {
        console.log(`   ✅ ${name} | ${title}`);
        console.log(`      Email: ${email} (verified)`);
        
        updates.push({
          rowIndex: lead.rowIndex,
          contactName: name,
          title,
          email,
          linkedin,
          status: 'Enriched',
          notes: `Apollo: verified email`
        });
        enrichedCount++;
      } else if (email) {
        console.log(`   ⚠️  ${name} | ${title}`);
        console.log(`      Email: ${email} (${emailStatus})`);
        
        updates.push({
          rowIndex: lead.rowIndex,
          contactName: name,
          title,
          email,
          linkedin,
          status: 'Enriched (unverified)',
          notes: `Apollo: ${emailStatus}`
        });
        enrichedCount++;
      } else {
        console.log(`   ℹ️  ${name} | ${title} - no email found`);
        updates.push({
          rowIndex: lead.rowIndex,
          contactName: name,
          title,
          linkedin,
          notes: 'Apollo: contact found but no email'
        });
      }
      
      // Rate limit: 500ms between requests
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (err) {
      console.error(`   ❌ Error: ${err.message}`);
      updates.push({
        rowIndex: lead.rowIndex,
        notes: `Error: ${err.message}`
      });
    }
  }
  
  // 5. Write updates back to sheet
  console.log(`\n\n=== Writing ${updates.length} updates to Google Sheet ===\n`);
  
  for (const update of updates) {
    const rowNum = update.rowIndex + 1;
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
    
    console.log(`   Row ${rowNum} updated`);
  }
  
  // 6. Summary
  console.log('\n\n=== ✅ Enrichment Complete ===');
  console.log(`Successfully enriched: ${enrichedCount}/${batch.length} leads`);
  console.log(`Partial updates: ${updates.filter(u => u.contactName && !u.email).length}`);
  console.log(`Failed: ${updates.filter(u => !u.contactName).length}`);
  console.log(`\nRemaining leads needing enrichment: ${needsEnrichment.length - batch.length}`);
  
  if (enrichedCount > 0) {
    console.log('\n📧 Next step: Review enriched leads and prepare outreach emails');
  }
  
  if (needsEnrichment.length === batch.length) {
    console.log('\n🎯 All active leads have been enriched!');
    console.log('💡 Recommendation: Add 3-5 new mid-market PE firms ($500M-$5B AUM, services focus)');
  }
}

main().catch(console.error);
