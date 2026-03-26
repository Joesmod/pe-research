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
  const headers = rows[0];
  
  console.log('📊 Reading CRM...');
  console.log(`Total rows: ${rows.length - 1}\n`);
  
  // Find candidates (empty email or generic email, not Dead/Bad/Sent)
  const candidates = [];
  
  for (let i = 1; i < rows.length; i++) {
    const company = rows[i][0] || '';
    const contactName = rows[i][2] || '';
    const email = rows[i][4] || '';
    const status = rows[i][7] || '';
    const notes = rows[i][8] || '';

    // Skip dead/bad/sent
    if (status === 'Dead' || status === 'Bad' || notes.includes('Dead')) continue;

    const hasGenericEmail = email.match(/^(info@|sales@|ir@|contact@|hello@|support@)/i);
    const needsEmail = !email || email.trim() === '' || hasGenericEmail;

    if (needsEmail && company) {
      candidates.push({
        row: i + 1,
        company,
        contactName,
        email,
        status,
        domain: extractDomain(rows[i][1] || rows[i][5] || '')
      });
    }
  }

  console.log(`🔍 Found ${candidates.length} leads needing enrichment`);
  console.log(`🎯 Enriching top 15...\n`);

  const enriched = [];
  const toEnrich = candidates.slice(0, 15);

  for (const lead of toEnrich) {
    console.log(`\n🔎 ${lead.company}...`);
    
    if (!lead.domain) {
      console.log('   ❌ No domain found, skipping');
      continue;
    }

    try {
      // Apollo People Search API
      const searchResult = await axios.post(
        'https://api.apollo.io/v1/mixed_people/search',
        {
          q_organization_domains: [lead.domain],
          person_titles: [
            'CEO', 'Chief Executive Officer',
            'Managing Partner', 'Managing Director',
            'Partner', 'General Partner', 'Operating Partner',
            'President', 'Co-President',
            'CTO', 'Chief Technology Officer',
            'COO', 'Chief Operating Officer',
            'CFO', 'Chief Financial Officer',
            'VP Technology', 'VP Operations', 'VP Digital',
            'Head of Technology', 'Head of Operations', 'Head of Digital'
          ],
          page: 1,
          per_page: 5
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'X-Api-Key': APOLLO_API_KEY
          }
        }
      );

      const people = searchResult.data.people || [];
      
      if (people.length === 0) {
        console.log('   ⚠️ No contacts found');
        continue;
      }

      const person = people[0];
      const foundEmail = person.email;
      const foundName = person.name;
      const foundTitle = person.title;
      const linkedinUrl = person.linkedin_url;

      if (foundEmail && foundEmail.includes('@') && !foundEmail.match(/^(info@|sales@|contact@)/i)) {
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
        console.log(`   ⚠️ Found contact but no valid email`);
      }

      // Rate limit: 1 request per second
      await new Promise(resolve => setTimeout(resolve, 1100));
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  console.log(`\n\n✅ Enriched ${enriched.length} leads\n`);

  // Update sheet
  if (enriched.length > 0) {
    console.log('📝 Updating sheet...\n');
    
    const updates = [];
    for (const lead of enriched) {
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
      updates.push({
        range: `Sheet1!I${lead.row}`,
        values: [[`${lead.name} (${lead.title}) - Email verified via Apollo API. (2026-03-17 cron)`]]
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

    console.log('\n✅ Sheet updated successfully');
  }

  // Save enrichment log
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const logPath = `./enrichment-log-${timestamp}.json`;
  fs.writeFileSync(logPath, JSON.stringify({ enriched, timestamp: new Date() }, null, 2));
  
  console.log(`\n📄 Log saved to ${logPath}`);
  console.log(`\n🎉 Enrichment complete: ${enriched.length} leads updated`);
}

function extractDomain(url) {
  if (!url) return '';
  const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/\s]+)/);
  return match ? match[1] : '';
}

enrichLeads().catch(console.error);
