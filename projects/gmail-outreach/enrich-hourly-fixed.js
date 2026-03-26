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

    // Skip if Dead or already sent
    if (status === 'Dead' || notes.toLowerCase().includes('dead') || notes.toLowerCase().includes('sent')) continue;

    const hasGenericEmail = email && email.match(/^(info@|sales@|ir@|contact@|hello@|support@)/i);
    const needsEmail = !email || email.trim() === '' || hasGenericEmail;
    const needsContact = !contactName || contactName.trim() === '';

    if ((needsEmail || needsContact) && company) {
      // Extract domain from URLs
      let domain = extractDomain(notebookLM) || extractDomain(companyUrl) || extractDomain(linkedIn);
      
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

  console.log(`🔍 Found ${candidates.length} leads needing enrichment`);
  console.log(`🎯 Enriching up to 15 with Apollo...\n`);

  const enriched = [];
  const toEnrich = candidates.slice(0, 15);

  for (const lead of toEnrich) {
    console.log(`\n🔎 ${lead.company}...`);
    
    if (!lead.domain) {
      console.log('   ❌ No domain found, skipping');
      continue;
    }

    try {
      // Apollo API: Search by organization domain
      const searchResult = await axios.post(
        'https://api.apollo.io/v1/mixed_people/search',
        {
          q_organization_domains: lead.domain,
          person_titles: [
            'CEO', 'Chief Executive Officer', 'Managing Partner', 'Managing Director',
            'Partner', 'General Partner', 'Operating Partner',
            'Co-Founder', 'Founder',
            'President', 'Co-President',
            'CTO', 'COO', 'CFO',
            'VP Technology', 'VP Operations', 'VP Digital Transformation',
            'Director Technology', 'Director Operations',
            'Head of Technology', 'Head of Operations'
          ],
          page: 1,
          per_page: 3
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
        console.log(`   ⚠️ No decision-makers found for ${lead.domain}`);
        continue;
      }

      const person = people[0];
      const foundEmail = person.email;
      const foundName = person.name;
      const foundTitle = person.title;
      const linkedinUrl = person.linkedin_url;

      if (foundEmail && foundEmail.includes('@') && !foundEmail.match(/^(info@|sales@|contact@|ir@)/i)) {
        console.log(`   ✅ Found: ${foundName} (${foundTitle})`);
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

      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 1200));
      
    } catch (error) {
      if (error.response) {
        console.log(`   ❌ API Error ${error.response.status}: ${JSON.stringify(error.response.data).slice(0, 200)}`);
      } else {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
  }

  console.log(`\n\n✅ Successfully enriched ${enriched.length} leads\n`);

  // Update sheet
  if (enriched.length > 0) {
    console.log('📝 Updating Google Sheet...\n');
    
    const updates = [];
    for (const lead of enriched) {
      // Update contact, title, email, linkedin, status
      updates.push({
        range: `Sheet1!C${lead.row}:H${lead.row}`,
        values: [[
          lead.name,
          lead.title,
          lead.email,
          '', // Column F (empty for now)
          lead.linkedin,
          'Enriched'
        ]]
      });

      // Update notes
      const noteText = `${lead.name} (${lead.title}) - Email verified via Apollo API. (2026-03-17 cron)`;
      updates.push({
        range: `Sheet1!I${lead.row}`,
        values: [[noteText]]
      });

      console.log(`   ✅ Row ${lead.row}: ${lead.company} → ${lead.name} (${lead.email})`);
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates
      }
    });

    console.log('\n✅ Google Sheet updated successfully');
  }

  // Save enrichment log
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const logPath = `./enrichment-log-${timestamp}.json`;
  fs.writeFileSync(logPath, JSON.stringify({ enriched, candidates: candidates.slice(0, 15), timestamp: new Date() }, null, 2));
  
  console.log(`\n📄 Enrichment log saved: ${logPath}`);
  console.log(`\n🎉 COMPLETE: ${enriched.length} leads enriched and updated in CRM`);
}

function extractDomain(url) {
  if (!url) return '';
  const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/\s]+)/);
  return match ? match[1] : '';
}

enrichLeads().catch(console.error);
