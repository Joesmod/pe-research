const https = require('https');
const { google } = require('googleapis');
const fs = require('fs');
const { execSync } = require('child_process');

const APOLLO_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const RANGE = 'Sheet1!A:K';

function apolloPost(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const opts = {
      hostname: 'api.apollo.io', 
      path, 
      method: 'POST',
      headers: { 
        'x-api-key': APOLLO_KEY, 
        'Content-Type': 'application/json', 
        'Content-Length': Buffer.byteLength(data) 
      }
    };
    const req = https.request(opts, res => {
      let d = ''; 
      res.on('data', c => d += c);
      res.on('end', () => { 
        try { 
          resolve(JSON.parse(d)); 
        } catch(e) { 
          reject(new Error(d)); 
        } 
      });
    });
    req.on('error', reject);
    req.write(data); 
    req.end();
  });
}

function sleep(ms) { 
  return new Promise(r => setTimeout(r, ms)); 
}

async function findContact(companyName) {
  try {
    console.log(`  🔍 Searching Apollo for: ${companyName}`);
    
    // Step 1: Search for senior people at the company
    const searchRes = await apolloPost('/v1/mixed_people/api_search', {
      q_organization_name: companyName,
      person_titles: [
        'CEO', 'CTO', 'COO', 'CMO', 'CFO',
        'Managing Partner', 'Operating Partner', 'General Partner', 'Partner',
        'Managing Director', 'Director',
        'Vice President', 'VP',
        'Head of', 'Business Development', 'Principal', 'President'
      ],
      page: 1, 
      per_page: 10
    });
    
    if (!searchRes.people || searchRes.people.length === 0) {
      console.log(`  ❌ No results from Apollo`);
      return null;
    }
    
    console.log(`  📋 Found ${searchRes.people.length} potential contacts`);
    
    // Step 2: Pick best candidate (prefer has_email=true)
    let candidate = searchRes.people.find(p => p.has_email) || searchRes.people[0];
    
    console.log(`  👤 Selected: ${candidate.first_name} ${candidate.last_name_obfuscated || ''} (${candidate.title})`);
    
    // Step 3: Reveal full details via match
    await sleep(500);
    const matchRes = await apolloPost('/v1/people/match', { 
      id: candidate.id, 
      reveal_personal_emails: false 
    });
    
    if (!matchRes.person) {
      console.log(`  ❌ Match failed`);
      return null;
    }
    
    const p = matchRes.person;
    
    // Filter out generic emails
    const email = p.email || null;
    if (email && (
      email.toLowerCase().startsWith('info@') ||
      email.toLowerCase().startsWith('sales@') ||
      email.toLowerCase().startsWith('ir@') ||
      email.toLowerCase().startsWith('contact@')
    )) {
      console.log(`  ⚠️ Generic email found: ${email}`);
      return null;
    }
    
    if (email) {
      console.log(`  ✅ Enriched: ${p.name} | ${p.title} | ${email}`);
    } else {
      console.log(`  ⚠️ Found contact but no email: ${p.name} (${p.title})`);
    }
    
    return {
      name: p.name || `${p.first_name} ${p.last_name}`,
      title: p.title || '',
      email: email,
      emailStatus: p.email_status || '',
      linkedin: p.linkedin_url || ''
    };
  } catch (err) {
    console.error(`  ❌ Error: ${err.message}`);
    return null;
  }
}

async function updateSheetRow(sheets, rowIndex, contactData) {
  try {
    const updates = [];
    
    // Column C: Contact Name (index 2)
    if (contactData.name) {
      updates.push({
        range: `Sheet1!C${rowIndex}`,
        values: [[contactData.name]]
      });
    }
    
    // Column D: Title (index 3)
    if (contactData.title) {
      updates.push({
        range: `Sheet1!D${rowIndex}`,
        values: [[contactData.title]]
      });
    }
    
    // Column E: Email (index 4)
    if (contactData.email) {
      updates.push({
        range: `Sheet1!E${rowIndex}`,
        values: [[contactData.email]]
      });
    }
    
    // Column G: LinkedIn (index 6)
    if (contactData.linkedin) {
      updates.push({
        range: `Sheet1!G${rowIndex}`,
        values: [[contactData.linkedin]]
      });
    }
    
    // Column J: Status (index 9)
    updates.push({
      range: `Sheet1!J${rowIndex}`,
      values: [['Enriched - Apollo']]
    });
    
    // Batch update
    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SHEET_ID,
        resource: {
          data: updates,
          valueInputOption: 'RAW'
        }
      });
      console.log(`  💾 Updated sheet row ${rowIndex}`);
    }
  } catch (error) {
    console.error(`  ❌ Error updating row ${rowIndex}:`, error.message);
  }
}

async function createDossier(company, contactData) {
  try {
    const slug = company.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    const dossierDir = `../../pe-research/PE-firms/${slug}`;
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dossierDir)) {
      fs.mkdirSync(dossierDir, { recursive: true });
    }
    
    const dossierPath = `${dossierDir}/DOSSIER.md`;
    
    // Read existing or create new
    let content = '';
    if (fs.existsSync(dossierPath)) {
      content = fs.readFileSync(dossierPath, 'utf8');
    } else {
      content = `# ${company}\n\n`;
    }
    
    // Add contact info if not already present
    if (contactData.name && !content.includes(contactData.name)) {
      const contactSection = `## Contacts\n\n### ${contactData.name}\n- **Title:** ${contactData.title}\n- **Email:** ${contactData.email || 'Not available'}\n- **LinkedIn:** ${contactData.linkedin || 'N/A'}\n- **Source:** Apollo API\n- **Date Added:** ${new Date().toISOString().split('T')[0]}\n\n`;
      
      if (content.includes('## Contacts')) {
        // Append to existing contacts section
        const beforeContacts = content.substring(0, content.indexOf('## Contacts') + 12);
        const afterContacts = content.substring(content.indexOf('## Contacts') + 12);
        content = beforeContacts + '\n\n' + contactSection + afterContacts;
      } else {
        content += '\n' + contactSection;
      }
    }
    
    fs.writeFileSync(dossierPath, content);
    console.log(`  📝 Updated dossier: ${dossierPath}`);
  } catch (error) {
    console.error(`  ❌ Error creating dossier for ${company}:`, error.message);
  }
}

async function commitToGit() {
  try {
    console.log('\n📦 Committing changes to GitHub...');
    const cwd = process.cwd();
    process.chdir('../../pe-research');
    
    try {
      execSync('git add PE-firms/', { stdio: 'inherit' });
      execSync(`git commit -m "Enrichment update: ${new Date().toISOString()}"`, { stdio: 'inherit' });
      execSync('git push', { stdio: 'inherit' });
      console.log('✅ Changes pushed to GitHub');
    } finally {
      process.chdir(cwd);
    }
  } catch (error) {
    if (!error.message.includes('nothing to commit')) {
      console.error('⚠️ Git error:', error.message);
    }
  }
}

async function main() {
  console.log('🚀 Starting PE lead enrichment...\n');
  
  // Initialize Google Sheets
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  
  // Read sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: RANGE
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found in sheet.');
    return;
  }
  
  // Find leads needing enrichment
  const needsEnrichment = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const firm = row[0] || '';
    const contactName = row[2] || '';
    const email = row[4] || '';
    const status = row[9] || '';
    
    // Skip dead leads
    if (status.toLowerCase().includes('dead')) {
      continue;
    }
    
    // Skip already enriched
    if (status === 'Enriched - Apollo') {
      continue;
    }
    
    // Check if needs enrichment
    const hasGenericEmail = email && (
      email.toLowerCase().startsWith('info@') || 
      email.toLowerCase().startsWith('sales@') || 
      email.toLowerCase().startsWith('ir@') ||
      email.toLowerCase().startsWith('contact@')
    );
    
    const needsEnrich = 
      !contactName || 
      contactName === 'Not identified' || 
      contactName === 'Principal' ||
      contactName === 'Founder & CEO' ||
      hasGenericEmail || 
      !email;
    
    if (needsEnrich) {
      needsEnrichment.push({
        row: i + 1,
        firm,
        contactName,
        email,
        status
      });
    }
  }
  
  console.log(`📊 Found ${needsEnrichment.length} leads needing enrichment`);
  console.log(`🎯 Enriching first 12 leads...\n`);
  
  let enriched = 0;
  let noEmail = 0;
  let noResults = 0;
  const targetLeads = needsEnrichment.slice(0, 12);
  
  for (let idx = 0; idx < targetLeads.length; idx++) {
    const lead = targetLeads[idx];
    console.log(`\n[${idx + 1}/${targetLeads.length}] ${lead.firm} (Row ${lead.row})`);
    
    try {
      const contactData = await findContact(lead.firm);
      
      if (!contactData) {
        noResults++;
      } else if (contactData.email) {
        // Update sheet
        await updateSheetRow(sheets, lead.row, contactData);
        
        // Update dossier
        await createDossier(lead.firm, contactData);
        
        enriched++;
      } else {
        // Found person but no email
        await updateSheetRow(sheets, lead.row, contactData);
        await createDossier(lead.firm, contactData);
        noEmail++;
      }
      
      // Rate limit: wait 1.5 seconds between requests
      await sleep(1500);
    } catch (error) {
      console.error(`  ❌ Unexpected error:`, error.message);
      noResults++;
      await sleep(1500);
    }
  }
  
  console.log(`\n✅ Enrichment complete!`);
  console.log(`   📧 Emails found: ${enriched}`);
  console.log(`   👤 Contacts found (no email): ${noEmail}`);
  console.log(`   ❌ No results: ${noResults}`);
  
  // Commit to GitHub if we enriched anything
  if (enriched > 0 || noEmail > 0) {
    await commitToGit();
  }
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
