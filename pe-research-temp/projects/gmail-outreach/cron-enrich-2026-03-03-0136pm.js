const axios = require('axios');
const { google } = require('googleapis');
const fs = require('fs');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const APOLLO_URL = 'https://api.apollo.io/v1';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function readSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:M',
  });

  return response.data.values || [];
}

async function searchPeople(firmName, firmWebsite) {
  try {
    console.log(`  → Searching Apollo for ${firmName}...`);
    
    // Step 1: Search for senior people
    const searchRes = await axios.post(
      `${APOLLO_URL}/mixed_people/api_search`,
      {
        q_organization_name: firmName,
        page: 1,
        per_page: 5,
        person_titles: [
          'Managing Director',
          'Partner',
          'Managing Partner',
          'Principal',
          'CEO',
          'President',
          'COO',
          'CTO',
          'VP Business Development',
          'VP Technology',
          'VP Operations',
          'VP Portfolio Operations',
          'Head of Operations',
          'Director Technology',
          'Director Business Development',
          'Chief Technology Officer',
          'Chief Operating Officer'
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );

    const people = searchRes.data.people || [];
    if (people.length === 0) {
      console.log(`  ✗ No Apollo results`);
      return [];
    }

    console.log(`  → Found ${people.length} candidates`);
    
    // Step 2: Pick best candidate (prefer verified email)
    let candidate = people.find(p => p.email_status === 'verified') || 
                    people.find(p => p.has_email) || 
                    people[0];
    
    console.log(`  → Selected: ${candidate.name} - ${candidate.title}`);
    
    // Step 3: Reveal full details via match
    await new Promise(resolve => setTimeout(resolve, 500));
    const matchRes = await axios.post(
      `${APOLLO_URL}/people/match`,
      {
        id: candidate.id,
        reveal_personal_emails: false
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );

    if (!matchRes.data || !matchRes.data.person) {
      console.log(`  ✗ Match failed`);
      return [];
    }

    const person = matchRes.data.person;
    const email = person.email;
    
    if (!email || email.match(/^(info|sales|ir|contact|admin|support|hello)@/i)) {
      console.log(`  ✗ Generic or no email: ${email || 'none'}`);
      return [];
    }

    console.log(`  ✓ Found: ${email} [${person.email_status}]`);

    return [{
      name: person.name || `${person.first_name} ${person.last_name}`,
      title: person.title || '',
      email: email,
      email_status: person.email_status || '',
      linkedin_url: person.linkedin_url || ''
    }];
  } catch (error) {
    if (error.response?.status === 429) {
      console.error(`  ⚠️ Rate limit hit, waiting 60s...`);
      await new Promise(resolve => setTimeout(resolve, 60000));
      return [];
    }
    console.error(`  ✗ Error: ${error.response?.data?.message || error.message}`);
    return [];
  }
}

async function updateSheet(updates) {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  for (const update of updates) {
    // Update Contact Name, Title, Email, LinkedIn
    const range = `Sheet1!B${update.rowIndex}:F${update.rowIndex}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          update.contactName,
          update.title,
          update.email,
          update.website || '', // keep existing website
          update.linkedin || ''
        ]]
      }
    });
    console.log(`  ✓ Updated row ${update.rowIndex}: ${update.contactName}`);

    // Update Status to "Enriched"
    const statusRange = `Sheet1!I${update.rowIndex}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: statusRange,
      valueInputOption: 'RAW',
      requestBody: {
        values: [['Enriched']]
      }
    });

    // Update Notes with source
    const notesRange = `Sheet1!K${update.rowIndex}`;
    const existingNotes = update.existingNotes || '';
    const newNote = `Apollo-verified contact: ${update.contactName} (${update.title}). Email: ${update.email} [${update.emailStatus}]. Enriched ${new Date().toISOString().split('T')[0]}.`;
    const updatedNotes = existingNotes ? `${existingNotes} | ${newNote}` : newNote;
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: notesRange,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[updatedNotes]]
      }
    });
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   PE RESEARCH & ENRICHMENT - Hourly Cron Run              ║');
  console.log('║   Tuesday, March 3rd, 2026 — 1:36 PM CST                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Step 1: Read sheet
  console.log('📖 Reading Google Sheet...');
  const rows = await readSheet();
  console.log(`✓ Loaded ${rows.length} rows\n`);

  // Step 2: Identify leads needing enrichment
  const header = rows[0];
  const companyIdx = 0;
  const contactIdx = 1;
  const emailIdx = 3;
  const websiteIdx = 4;
  const statusIdx = 8;
  const notesIdx = 10;

  const needsEnrichment = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx];
    const contact = row[contactIdx];
    const email = row[emailIdx];
    const status = row[statusIdx];
    
    // Skip if already contacted or has good data
    if (!company || status === 'Contacted' || status === 'Meeting Scheduled') continue;
    
    // Needs enrichment if:
    // - No contact name OR
    // - Generic email (info@, sales@, ir@, contact@, admin@, etc.)
    const needsIt = !contact || 
                    !email || 
                    email.match(/^(info|sales|ir|contact|admin|support|hello|media|press)@/i);

    if (needsIt) {
      needsEnrichment.push({
        rowIndex: i + 1, // +1 for 1-indexed sheet rows
        company,
        contact: contact || '(none)',
        email: email || '(none)',
        website: row[websiteIdx] || '',
        status: status || 'New',
        notes: row[notesIdx] || ''
      });
    }
  }

  console.log(`🎯 Found ${needsEnrichment.length} leads needing enrichment\n`);

  // Step 3: Select 10-15 to process
  const targets = needsEnrichment.slice(0, 10);
  console.log(`📋 Selected ${targets.length} firms for this run:\n`);
  targets.forEach((t, idx) => {
    console.log(`   ${idx + 1}. ${t.company} (row ${t.rowIndex})`);
    console.log(`      Current: ${t.contact} | ${t.email}`);
  });
  console.log('');

  // Step 4: Enrich via Apollo
  console.log('🔍 Starting Apollo enrichment...\n');
  const updates = [];
  const log = [];

  for (const target of targets) {
    console.log(`[${targets.indexOf(target) + 1}/${targets.length}] ${target.company}`);
    const people = await searchPeople(target.company, target.website);

    if (people.length > 0) {
      const person = people[0];
      updates.push({
        rowIndex: target.rowIndex,
        company: target.company,
        contactName: person.name,
        title: person.title,
        email: person.email,
        linkedin: person.linkedin_url,
        emailStatus: person.email_status,
        website: target.website,
        existingNotes: target.notes
      });

      log.push({
        company: target.company,
        contact: person.name,
        title: person.title,
        email: person.email,
        emailStatus: person.email_status,
        linkedin: person.linkedin_url,
        source: 'Apollo API',
        timestamp: new Date().toISOString()
      });
    }

    // Rate limit: 1.5s between requests
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('');
  }

  // Step 5: Update sheet
  if (updates.length > 0) {
    console.log('\n📝 Updating Google Sheet...\n');
    await updateSheet(updates);
    console.log(`\n✅ Successfully enriched ${updates.length} leads`);
  } else {
    console.log('\n❌ No leads enriched this run');
  }

  // Step 6: Save log
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T');
  const logFile = `enrichment-log-${timestamp[0]}-${timestamp[1].split('-')[0]}${timestamp[1].split('-')[1]}.json`;
  fs.writeFileSync(logFile, JSON.stringify(log, null, 2));
  console.log(`\n💾 Saved enrichment log to ${logFile}`);

  // Summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                      RUN SUMMARY                           ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`   Total leads needing enrichment: ${needsEnrichment.length}`);
  console.log(`   Firms searched: ${targets.length}`);
  console.log(`   Leads enriched: ${updates.length}`);
  console.log(`   Success rate: ${Math.round(updates.length / targets.length * 100)}%`);
  console.log(`   Remaining to enrich: ${needsEnrichment.length - targets.length}\n`);

  return {
    searched: targets.length,
    enriched: updates.length,
    remaining: needsEnrichment.length - targets.length,
    log
  };
}

main().catch(error => {
  console.error('\n❌ ERROR:', error);
  process.exit(1);
});
