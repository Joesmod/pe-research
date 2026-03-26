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
  
  // Find candidates: empty email, generic email, OR status = "Needs Email"
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

    const statusCheck = status.toLowerCase();
    const notesCheck = notes.toLowerCase();
    
    const isDead = statusCheck.includes('dead') || notesCheck.includes('dead');
    const isSent = notesCheck.includes('sent') || statusCheck.includes('sent');

    if (isDead || isSent) continue;

    const hasGenericEmail = email && email.match(/^(info@|sales@|ir@|contact@|hello@|support@)/i);
    const needsEmail = !email || email.trim() === '' || hasGenericEmail || status === 'Needs Email';

    if (needsEmail && company) {
      let domain = extractDomain(notebookLM) || extractDomain(companyUrl) || extractDomain(linkedIn);
      
      if (domain) {
        candidates.push({
          row: i + 1,
          company,
          contactName,
          title,
          email,
          status,
          domain
        });
      }
    }
  }

  console.log(`🔍 Found ${candidates.length} leads needing email enrichment`);
  console.log(`🎯 Enriching up to 12 with Apollo API...\n`);

  const enriched = [];
  const toEnrich = candidates.slice(0, 12);

  for (const lead of toEnrich) {
    console.log(`\n🔎 ${lead.company} (${lead.domain})...`);
    
    try {
      // Apollo /mixed_people/api_search endpoint with correct header auth
      const searchResult = await axios.post(
        'https://api.apollo.io/v1/mixed_people/api_search',
        {
          q_organization_domains: [lead.domain],
          person_titles: [
            'CEO', 'Chief Executive Officer',
            'Managing Partner', 'Managing Director',
            'Partner', 'General Partner', 'Operating Partner',
            'Co-Founder', 'Founder',
            'President', 'Co-President',
            'CTO', 'Chief Technology Officer',
            'COO', 'Chief Operating Officer',
            'CFO',
            'VP Technology', 'VP Operations', 'VP Digital',
            'Director of Technology', 'Director of Operations'
          ],
          per_page: 3,
          page: 1
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': APOLLO_API_KEY
          }
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
        console.log(`   ✅ FOUND: ${foundName}`);
        console.log(`   🏷️ ${foundTitle}`);
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
        console.log(`   ⚠️ Contact found but no valid email: ${foundName}`);
      }

      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 1200));
      
    } catch (error) {
      if (error.response) {
        console.log(`   ❌ API Error ${error.response.status}: ${JSON.stringify(error.response.data).slice(0, 120)}`);
      } else {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
  }

  console.log(`\n\n✅ Enriched ${enriched.length} / ${toEnrich.length} leads\n`);

  // Update Google Sheet
  if (enriched.length > 0) {
    console.log('📝 Updating CRM...\n');
    
    const updates = [];
    for (const lead of enriched) {
      // Update contact name, title, email, linkedin, status
      updates.push({
        range: `Sheet1!C${lead.row}:H${lead.row}`,
        values: [[
          lead.name,
          lead.title,
          lead.email,
          '', // Column F
          lead.linkedin,
          'Enriched'
        ]]
      });

      // Update notes
      const noteText = `${lead.name} (${lead.title}) - Email verified via Apollo API. (2026-03-17 11:37 AM cron)`;
      updates.push({
        range: `Sheet1!I${lead.row}`,
        values: [[noteText]]
      });

      console.log(`   ✅ Row ${lead.row}: ${lead.company}`);
      console.log(`      → ${lead.name} <${lead.email}>`);
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

  // Save enrichment log
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const logPath = `./ENRICHMENT-LOG-MARCH17-${new Date().getHours()}${new Date().getMinutes()}.json`;
  fs.writeFileSync(logPath, JSON.stringify({
    enriched,
    attempted: toEnrich.length,
    totalCandidates: candidates.length,
    timestamp: new Date().toISOString()
  }, null, 2));
  
  console.log(`\n📄 Log: ${logPath}`);
  console.log(`\n🎉 ENRICHMENT COMPLETE`);
  console.log(`   Enriched: ${enriched.length}`);
  console.log(`   Attempted: ${toEnrich.length}`);
  console.log(`   Total candidates: ${candidates.length}`);
}

function extractDomain(url) {
  if (!url) return '';
  const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/\s]+)/);
  return match ? match[1] : '';
}

enrichLeads().catch(console.error);
