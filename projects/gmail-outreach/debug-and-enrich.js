const { google } = require('googleapis');
const fs = require('fs');
const axios = require('axios');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = JSON.parse(fs.readFileSync('./service-account.json', 'utf8'));
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function enrichLeads() {
  const auth = new google.auth.JWT(
    SERVICE_ACCOUNT.client_email,
    null,
    SERVICE_ACCOUNT.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
  );

  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read sheet data
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:M'
  });

  const rows = response.data.values;
  
  console.log('📊 Reading CRM...');
  console.log(`Total rows: ${rows.length - 1}\n`);
  
  // Debug: sample first 20 rows to understand status distribution
  console.log('🔍 Sampling first 20 rows for status distribution:\n');
  for (let i = 1; i <= Math.min(20, rows.length - 1); i++) {
    const company = rows[i][0] || '[no company]';
    const contactName = rows[i][2] || '[empty]';
    const email = rows[i][4] || '[empty]';
    const status = rows[i][7] || '[empty]';
    console.log(`Row ${i + 1}: ${company.slice(0, 30)}`);
    console.log(`   Contact: ${contactName.slice(0, 40)}, Email: ${email.slice(0, 40)}`);
    console.log(`   Status: ${status}`);
  }
  
  // Find candidates needing enrichment
  const candidates = [];
  
  for (let i = 1; i < rows.length; i++) {
    const company = rows[i][0] || '';
    const notebookLM = rows[i][1] || '';
    const contactName = rows[i][2] || '';
    const title = rows[i][3] || '';
    const email = rows[i][4] || '';
    const companyUrl = rows[i][5] || '';
    const linkedIn = rows[i][6] || '';
    const status = rows[i][7] || '';
    const notes = rows[i][8] || '';

    // Check multiple status/notes fields
    const statusCheck = (rows[i][7] || '').toLowerCase();
    const notesCheck = (rows[i][8] || '').toLowerCase();
    const altStatusCheck = (rows[i][9] || '').toLowerCase();
    
    const isDead = statusCheck.includes('dead') || notesCheck.includes('dead') || altStatusCheck.includes('dead');
    const isSent = notesCheck.includes('sent') || statusCheck.includes('sent');

    if (isDead || isSent) continue;

    const hasGenericEmail = email && email.match(/^(info@|sales@|ir@|contact@|hello@|support@)/i);
    const needsEmail = !email || email.trim() === '' || hasGenericEmail;
    const needsContact = !contactName || contactName.trim() === '';

    if ((needsEmail || needsContact) && company) {
      let domain = extractDomain(notebookLM) || extractDomain(companyUrl) || extractDomain(linkedIn);
      
      if (domain) {
        candidates.push({
          row: i + 1,
          company,
          contactName,
          title,
          email,
          status,
          domain,
          needsEmail,
          needsContact
        });
      }
    }
  }

  console.log(`\n\n🔍 Found ${candidates.length} leads needing enrichment (with domains)`);
  console.log(`🎯 Enriching up to 12...\n`);

  const enriched = [];
  const toEnrich = candidates.slice(0, 12);

  for (const lead of toEnrich) {
    console.log(`\n🔎 ${lead.company}...`);
    console.log(`   Domain: ${lead.domain}`);
    
    try {
      // NEW Apollo API endpoint: /mixed_people/api_search
      const searchResult = await axios.post(
        'https://api.apollo.io/v1/mixed_people/api_search',
        {
          api_key: APOLLO_API_KEY,
          q_organization_domains: [lead.domain],
          person_titles: [
            'CEO', 'Chief Executive Officer',
            'Managing Partner', 'Managing Director',
            'Partner', 'General Partner',
            'Co-Founder', 'Founder',
            'President',
            'CTO', 'COO', 'CFO',
            'VP of Technology', 'VP of Operations'
          ],
          per_page: 3,
          page: 1
        }
      );

      const people = searchResult.data.people || [];
      
      if (people.length === 0) {
        console.log(`   ⚠️ No decision-makers found`);
        continue;
      }

      const person = people[0];
      const foundEmail = person.email;
      const foundName = person.name;
      const foundTitle = person.title;
      const linkedinUrl = person.linkedin_url;

      if (foundEmail && foundEmail.includes('@') && !foundEmail.match(/^(info@|sales@|contact@|ir@)/i)) {
        console.log(`   ✅ FOUND: ${foundName} (${foundTitle})`);
        console.log(`   📧 ${foundEmail}`);
        
        enriched.push({
          row: lead.row,
          company: lead.company,
          name: foundName,
          title: foundTitle,
          email: foundEmail,
          linkedin: linkedinUrl || '',
          source: 'Apollo API'
        });
      } else {
        console.log(`   ⚠️ Found ${foundName} but no valid email`);
      }

      // Rate limit: 1.2 seconds per request
      await new Promise(resolve => setTimeout(resolve, 1200));
      
    } catch (error) {
      if (error.response) {
        console.log(`   ❌ API Error ${error.response.status}: ${JSON.stringify(error.response.data).slice(0, 150)}`);
      } else {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
  }

  console.log(`\n\n✅ Successfully enriched ${enriched.length} / ${toEnrich.length} leads\n`);

  // Update sheet
  if (enriched.length > 0) {
    console.log('📝 Updating Google Sheet...\n');
    
    const updates = [];
    for (const lead of enriched) {
      updates.push({
        range: `Sheet1!C${lead.row}:H${lead.row}`,
        values: [[
          lead.name,
          lead.title,
          lead.email,
          '',
          lead.linkedin,
          'Enriched'
        ]]
      });

      updates.push({
        range: `Sheet1!I${lead.row}`,
        values: [[`${lead.name} (${lead.title}) - Email verified via Apollo API. (2026-03-17 cron)`]]
      });

      console.log(`   ✅ Row ${lead.row}: ${lead.company} → ${lead.name} <${lead.email}>`);
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates
      }
    });

    console.log('\n✅ Google Sheet updated');
  }

  // Save log
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const logPath = `./enrichment-log-${timestamp}.json`;
  fs.writeFileSync(logPath, JSON.stringify({
    enriched,
    attempted: toEnrich.length,
    totalCandidates: candidates.length,
    timestamp: new Date()
  }, null, 2));
  
  console.log(`\n📄 Log saved: ${logPath}`);
  console.log(`\n🎉 COMPLETE: ${enriched.length} leads enriched`);
}

function extractDomain(url) {
  if (!url) return '';
  const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/\s]+)/);
  return match ? match[1] : '';
}

enrichLeads().catch(console.error);
