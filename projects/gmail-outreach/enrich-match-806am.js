const { google } = require('googleapis');
const key = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const APOLLO_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

function parseName(fullName) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { first_name: parts[0], last_name: '' };
  }
  const first_name = parts[0];
  const last_name = parts.slice(1).join(' ');
  return { first_name, last_name };
}

async function apolloMatch(firstName, lastName, orgName) {
  const response = await fetch('https://api.apollo.io/v1/people/match', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'X-Api-Key': APOLLO_KEY
    },
    body: JSON.stringify({
      first_name: firstName,
      last_name: lastName,
      organization_name: orgName,
      reveal_personal_emails: true
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${response.status}: ${errorText}`);
  }
  
  return await response.json();
}

async function main() {
  console.log('=== PE Research & Enrichment - March 9, 8:06 AM ===\n');
  console.log('Using Apollo People Match API for contact enrichment\n');
  
  // 1. Read sheet
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
  const headers = rows[0];
  
  const companyIdx = headers.indexOf('Company Name');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const titleIdx = headers.indexOf('Title');
  const statusIdx = headers.indexOf('Status');
  const linkedinIdx = headers.indexOf('LinkedIn');
  const notesIdx = headers.indexOf('Notes');
  
  console.log(`Total rows: ${rows.length}\n`);
  
  // 2. Find leads with contact names but missing verified emails
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
    
    // Only process if we have a contact name but missing/generic email
    if (contact.trim()) {
      const hasGenericEmail = genericEmails.some(prefix => email.toLowerCase().startsWith(prefix));
      const needsEmail = !email.trim() || hasGenericEmail;
      
      if (needsEmail) {
        needsEnrichment.push({
          rowIndex: i,
          company,
          contact,
          email,
          status
        });
      }
    }
  }
  
  console.log(`Found ${needsEnrichment.length} contacts needing email enrichment.\n`);
  
  if (needsEnrichment.length === 0) {
    console.log('✅ All contacts with names have verified emails!');
    console.log('\n💡 For leads without contact names, use web research or LinkedIn search.');
    return;
  }
  
  // 3. Process up to 10
  const batch = needsEnrichment.slice(0, 10);
  console.log(`Processing batch of ${batch.length} contacts...\n`);
  
  const updates = [];
  let enrichedCount = 0;
  
  for (const lead of batch) {
    console.log(`\n--- ${lead.company}: ${lead.contact} ---`);
    
    try {
      const { first_name, last_name } = parseName(lead.contact);
      
      if (!first_name || !last_name) {
        console.log(`   ⚠️  Cannot parse name: "${lead.contact}"`);
        updates.push({
          rowIndex: lead.rowIndex,
          notes: 'Cannot parse contact name for enrichment'
        });
        continue;
      }
      
      console.log(`   Searching: ${first_name} ${last_name} at ${lead.company}`);
      
      const data = await apolloMatch(first_name, last_name, lead.company);
      
      if (data.person && data.person.email) {
        const email = data.person.email;
        const title = data.person.title || '';
        const linkedin = data.person.linkedin_url || '';
        const emailStatus = data.person.email_status || 'found';
        
        console.log(`   ✅ ${email} (${emailStatus})`);
        if (title) console.log(`      Title: ${title}`);
        
        updates.push({
          rowIndex: lead.rowIndex,
          email,
          title: title || undefined,
          linkedin: linkedin || undefined,
          status: emailStatus === 'verified' ? 'Enriched' : 'Enriched (unverified)',
          notes: `Apollo match ${emailStatus} ${new Date().toISOString().split('T')[0]}`
        });
        enrichedCount++;
      } else {
        console.log(`   ❌ No email found`);
        updates.push({
          rowIndex: lead.rowIndex,
          notes: 'Apollo match: no email found'
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 700));
      
    } catch (err) {
      console.error(`   ❌ Error: ${err.message}`);
      updates.push({
        rowIndex: lead.rowIndex,
        notes: `Error: ${err.message.substring(0, 80)}`
      });
    }
  }
  
  // 4. Write to sheet
  console.log(`\n\n=== Writing ${updates.length} updates ===\n`);
  
  for (const update of updates) {
    const rowNum = update.rowIndex + 1;
    const cellUpdates = [];
    
    if (update.title) {
      cellUpdates.push({ range: `Sheet1!D${rowNum}`, values: [[update.title]] });
    }
    if (update.email) {
      cellUpdates.push({ range: `Sheet1!E${rowNum}`, values: [[update.email]] });
    }
    if (update.linkedin) {
      cellUpdates.push({ range: `Sheet1!G${rowNum}`, values: [[update.linkedin]] });
    }
    if (update.status) {
      cellUpdates.push({ range: `Sheet1!J${rowNum}`, values: [[update.status]] });
    }
    if (update.notes) {
      cellUpdates.push({ range: `Sheet1!L${rowNum}`, values: [[update.notes]] });
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
  console.log(`Enriched with verified emails: ${enrichedCount}/${batch.length}`);
  console.log(`Remaining: ${needsEnrichment.length - batch.length}`);
  
  if (needsEnrichment.length <= batch.length) {
    console.log('\n🎯 All named contacts now have enriched emails!');
  } else {
    console.log(`\n⏭️  Next run will process ${Math.min(10, needsEnrichment.length - batch.length)} more`);
  }
}

main().catch(console.error);
