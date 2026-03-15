const { google } = require('googleapis');
const key = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const APOLLO_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function searchApollo(orgName) {
  const response = await fetch('https://api.apollo.io/api/v1/people/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'X-Api-Key': APOLLO_KEY
    },
    body: JSON.stringify({
      api_key: APOLLO_KEY,
      q_organization_name: orgName,
      person_titles: [
        'CEO', 'CTO', 'COO', 'CFO', 'CMO', 'President',
        'Partner', 'Managing Partner', 'General Partner', 'Operating Partner',
        'Director', 'Managing Director',
        'VP', 'Vice President',
        'Head of Technology', 'Head of Operations', 'Head of Portfolio',
        'Principal'
      ],
      per_page: 10,
      page: 1
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Apollo API error: ${response.status} - ${errorText}`);
  }
  
  return await response.json();
}

async function main() {
  console.log('=== PE Research & Enrichment - March 9, 8:06 AM (v2) ===\n');
  
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
  
  // 2. Find active leads needing enrichment
  const needsEnrichment = [];
  const genericEmails = ['info@', 'sales@', 'ir@', 'contact@', 'admin@', 'careers@'];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    
    if (!company.trim()) continue;
    if (status.includes('Dead')) continue;
    if (status === 'Sent') continue;
    if (status === 'Enriched') continue;
    
    const hasGenericEmail = genericEmails.some(prefix => email.toLowerCase().startsWith(prefix));
    const needsWork = !contact.trim() || !email.trim() || hasGenericEmail;
    
    if (needsWork) {
      needsEnrichment.push({
        rowIndex: i,
        company,
        contact,
        email,
        status
      });
    }
  }
  
  console.log(`Found ${needsEnrichment.length} active leads needing enrichment.\n`);
  
  if (needsEnrichment.length === 0) {
    console.log('✅ No active leads need enrichment.');
    console.log('\n💡 Recommendation: Add 3-5 new PE firms to maintain pipeline.');
    return;
  }
  
  // 3. Process up to 10 leads
  const batch = needsEnrichment.slice(0, 10);
  console.log(`Processing batch of ${batch.length} leads...\n`);
  
  const updates = [];
  let enrichedCount = 0;
  
  for (const lead of batch) {
    console.log(`\n--- ${lead.company} ---`);
    console.log(`Current: ${lead.contact || '(none)'} | ${lead.email || '(none)'}`);
    
    try {
      const data = await searchApollo(lead.company);
      const people = data.people || [];
      
      console.log(`   Found ${people.length} contacts`);
      
      if (people.length === 0) {
        console.log(`   ❌ No decision-makers found`);
        updates.push({
          rowIndex: lead.rowIndex,
          notes: 'Apollo: no results'
        });
        continue;
      }
      
      // Find best match: verified email preferred
      let bestMatch = null;
      for (const person of people) {
        if (person.email && person.email_status === 'verified') {
          bestMatch = person;
          break;
        }
      }
      
      if (!bestMatch) {
        bestMatch = people.find(p => p.email);
      }
      
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
        console.log(`      ${email} (verified)`);
        
        updates.push({
          rowIndex: lead.rowIndex,
          contactName: name,
          title,
          email,
          linkedin,
          status: 'Enriched',
          notes: `Apollo verified ${new Date().toISOString().split('T')[0]}`
        });
        enrichedCount++;
      } else if (email) {
        console.log(`   ⚠️  ${name} | ${title}`);
        console.log(`      ${email} (${emailStatus})`);
        
        updates.push({
          rowIndex: lead.rowIndex,
          contactName: name,
          title,
          email,
          linkedin,
          status: 'Enriched (unverified)',
          notes: `Apollo ${emailStatus} ${new Date().toISOString().split('T')[0]}`
        });
        enrichedCount++;
      } else {
        console.log(`   ℹ️  ${name} | ${title} - no email`);
        updates.push({
          rowIndex: lead.rowIndex,
          contactName: name,
          title,
          linkedin,
          notes: 'Apollo: contact found, no email'
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 600));
      
    } catch (err) {
      console.error(`   ❌ Error: ${err.message}`);
      updates.push({
        rowIndex: lead.rowIndex,
        notes: `Error: ${err.message.substring(0, 100)}`
      });
    }
  }
  
  // 4. Write updates to sheet
  console.log(`\n\n=== Writing ${updates.length} updates ===\n`);
  
  for (const update of updates) {
    const rowNum = update.rowIndex + 1;
    const cellUpdates = [];
    
    if (update.contactName) {
      cellUpdates.push({
        range: `Sheet1!C${rowNum}`,
        values: [[update.contactName]]
      });
    }
    if (update.title) {
      cellUpdates.push({
        range: `Sheet1!D${rowNum}`,
        values: [[update.title]]
      });
    }
    if (update.email) {
      cellUpdates.push({
        range: `Sheet1!E${rowNum}`,
        values: [[update.email]]
      });
    }
    if (update.linkedin) {
      cellUpdates.push({
        range: `Sheet1!G${rowNum}`,
        values: [[update.linkedin]]
      });
    }
    if (update.status) {
      cellUpdates.push({
        range: `Sheet1!J${rowNum}`,
        values: [[update.status]]
      });
    }
    if (update.notes) {
      cellUpdates.push({
        range: `Sheet1!L${rowNum}`,
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
  
  console.log('\n\n=== ✅ Complete ===');
  console.log(`Enriched: ${enrichedCount}/${batch.length}`);
  console.log(`Remaining: ${needsEnrichment.length - batch.length}`);
  
  if (needsEnrichment.length === batch.length) {
    console.log('\n🎯 All active leads enriched!');
    console.log('💡 Add 3-5 new mid-market PE firms ($500M-$5B AUM, services focus)');
  }
}

main().catch(console.error);
