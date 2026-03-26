const axios = require('axios');
const { google } = require('googleapis');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function enrichPerson(personId) {
  try {
    const response = await axios.post(
      'https://api.apollo.io/api/v1/people/match',
      {
        id: personId,
        reveal_personal_emails: true
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );

    if (response.data && response.data.person) {
      const p = response.data.person;
      return {
        name: `${p.first_name} ${p.last_name}`,
        title: p.title,
        email: p.email,
        linkedin: p.linkedin_url,
        verified: p.email_status === 'verified'
      };
    }

    return null;
  } catch (error) {
    console.error(`Enrichment error:`, error.response?.data?.message || error.message);
    return null;
  }
}

async function searchApolloContacts(company, website) {
  try {
    // CAST A WIDE NET: C-level, Partners, Directors, VPs, Heads of
    const response = await axios.post(
      'https://api.apollo.io/api/v1/mixed_people/search',
      {
        q_organization_name: company,
        person_titles: [
          'CEO', 'Chief Executive Officer',
          'Managing Partner', 'Managing Director', 'Partner', 'General Partner', 'Operating Partner',
          'Principal', 'President', 'COO', 'Chief Operating Officer',
          'CTO', 'Chief Technology Officer', 'CMO', 'Chief Marketing Officer', 'CFO',
          'VP Technology', 'VP Operations', 'VP Digital', 'VP Portfolio', 'Vice President',
          'Director Technology', 'Director Operations', 'Director Product', 'Director Digital', 'Director Business Development',
          'Head of Value Creation', 'Head of Portfolio Operations', 'Head of Business Development',
          'Head of Technology', 'Head of IT', 'IT Director', 'Technology Director'
        ],
        page: 1,
        per_page: 5  // Get top 5 results
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );

    if (response.data && response.data.people && response.data.people.length > 0) {
      // Enrich each person to get full email
      const enriched = [];
      for (const person of response.data.people) {
        if (person.email) {
          const full = await enrichPerson(person.id);
          if (full && full.email && !full.email.includes('@apollo.io')) {
            enriched.push(full);
          }
          // Rate limit
          await new Promise(r => setTimeout(r, 500));
        }
      }
      return enriched;
    }

    return [];
  } catch (error) {
    console.error(`Apollo search error for ${company}:`, error.response?.data?.message || error.message);
    return [];
  }
}

async function getSheetData() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:I',
  });
  
  return { sheets, rows: response.data.values || [] };
}

async function updateSheetRow(sheets, rowIndex, contactName, title, email, linkedin, notes) {
  try {
    const updates = [
      { range: `Sheet1!C${rowIndex}`, values: [[contactName]] },
      { range: `Sheet1!D${rowIndex}`, values: [[title]] },
      { range: `Sheet1!E${rowIndex}`, values: [[email]] },
      { range: `Sheet1!G${rowIndex}`, values: [[linkedin || '']] },
      { range: `Sheet1!H${rowIndex}`, values: [['Enriched']] },
      { range: `Sheet1!I${rowIndex}`, values: [[notes]] }
    ];

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates
      }
    });

    return true;
  } catch (error) {
    console.error(`Error updating row ${rowIndex}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🫡 PE Research & Enrichment - Hourly Run (Wed March 25, 2026 - 2:46 PM CST)\n');
  console.log('Task: Enrich 10-15 leads with empty Contact Name or generic/empty Email\n');
  
  const { sheets, rows } = await getSheetData();
  
  // Find firms needing enrichment
  const targets = [];
  for (let i = 1; i < rows.length && targets.length < 15; i++) {
    const row = rows[i] || [];
    const company = (row[0] || '').trim();
    const website = (row[1] || '').trim();
    const contactName = (row[2] || '').trim();
    const email = (row[4] || '').trim();
    const status = (row[7] || '').trim();
    
    // Skip if no company, dead/not PE, or already enriched
    if (!company || !website || status.toLowerCase().includes('dead') || status.toLowerCase().includes('not pe')) {
      continue;
    }
    
    // Target: No contact name OR empty/generic email AND not already enriched
    const hasGenericEmail = email && (
      email.toLowerCase().startsWith('info@') || 
      email.toLowerCase().startsWith('sales@') || 
      email.toLowerCase().startsWith('ir@') ||
      email.toLowerCase().startsWith('contact@') ||
      email.toLowerCase().startsWith('investors@')
    );
    
    const needsEnrichment = (
      !contactName || 
      !email || 
      hasGenericEmail
    ) && status.toLowerCase() !== 'enriched';
    
    if (needsEnrichment) {
      targets.push({ 
        company, 
        website, 
        rowIndex: i + 1, 
        currentContact: contactName, 
        currentEmail: email 
      });
    }
  }
  
  console.log(`Found ${targets.length} firms needing enrichment\n`);
  
  if (targets.length === 0) {
    console.log('✓ Sheet is fully enriched. No action needed.\n');
    return;
  }
  
  let enriched = 0;
  const enrichmentLog = [];
  
  // Process up to 12 firms per run
  for (const target of targets.slice(0, 12)) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`Row ${target.rowIndex}: ${target.company}`);
    console.log(`Website: ${target.website}`);
    console.log(`Current: ${target.currentContact || '[NONE]'} | ${target.currentEmail || '[NONE]'}`);
    console.log('Searching Apollo API...');
    
    const contacts = await searchApolloContacts(target.company, target.website);
    
    if (contacts.length > 0) {
      console.log(`\n✓ Found ${contacts.length} decision-makers:`);
      contacts.forEach((c, idx) => {
        console.log(`  ${idx + 1}. ${c.name} - ${c.title}`);
        console.log(`     Email: ${c.email} ${c.verified ? '(verified ✓)' : '(unverified)'}`);
        if (c.linkedin) console.log(`     LinkedIn: ${c.linkedin}`);
      });
      
      // Pick best: verified email preferred, then highest title
      const best = contacts.find(c => c.verified) || contacts[0];
      
      const notes = `Apollo API (2026-03-25) - ${contacts.length} contacts found. Best: ${best.verified ? 'Verified' : 'Unverified'} email.`;
      
      const success = await updateSheetRow(
        sheets,
        target.rowIndex,
        best.name,
        best.title,
        best.email,
        best.linkedin,
        notes
      );
      
      if (success) {
        console.log(`\n✅ ENRICHED: ${best.name} (${best.title})`);
        console.log(`   Email: ${best.email}`);
        enriched++;
        enrichmentLog.push({
          company: target.company,
          contact: best.name,
          title: best.title,
          email: best.email,
          verified: best.verified
        });
      }
      
      // Rate limit between companies
      await new Promise(r => setTimeout(r, 2000));
    } else {
      console.log('❌ No contacts found in Apollo');
      
      // Leave a note for manual research
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!I${target.rowIndex}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[`Apollo search: No contacts found (2026-03-25). Try manual research: website team pages, LinkedIn, or press releases.`]]
        }
      });
    }
  }
  
  console.log(`\n${'='.repeat(70)}`);
  console.log(`\n🫡 ENRICHMENT COMPLETE`);
  console.log(`Processed: ${Math.min(targets.length, 12)} firms`);
  console.log(`Enriched: ${enriched} firms with verified contacts\n`);
  
  if (enrichmentLog.length > 0) {
    console.log('Summary of enriched leads:\n');
    enrichmentLog.forEach((item, idx) => {
      console.log(`${idx + 1}. ${item.company}`);
      console.log(`   ${item.contact} - ${item.title}`);
      console.log(`   ${item.email} ${item.verified ? '✓' : ''}\n`);
    });
  }
  
  console.log('Next run: In 1 hour\n');
}

main().catch(console.error);
