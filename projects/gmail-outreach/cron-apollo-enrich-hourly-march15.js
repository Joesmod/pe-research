const { google } = require('googleapis');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

async function searchApolloContacts(company, website) {
  try {
    const domain = website ? new URL(website).hostname.replace('www.', '') : '';
    
    console.log(`  Searching Apollo for: ${company} (${domain})`);
    
    const response = await axios.post(
      'https://api.apollo.io/v1/mixed_people/api_search',
      {
        q_organization_domains: domain,
        person_titles: [
          'CEO', 'Chief Executive Officer',
          'Managing Partner', 'Managing Director',
          'Partner', 'General Partner', 'Operating Partner',
          'Principal',
          'President', 'Co-President',
          'COO', 'Chief Operating Officer',
          'CTO', 'Chief Technology Officer',
          'CFO', 'Chief Financial Officer',
          'VP Technology', 'VP Operations', 'VP Digital',
          'Director Technology', 'Director Operations', 'Director Digital',
          'Head of Value Creation', 'Head of Portfolio Operations'
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

    if (response.data && response.data.people && response.data.people.length > 0) {
      return response.data.people.map(person => ({
        name: person.name,
        title: person.title,
        email: person.email,
        linkedin: person.linkedin_url,
        emailStatus: person.email_status,
        verified: person.email_status === 'verified'
      }));
    }

    return [];
  } catch (error) {
    console.error(`  ✗ Apollo API error for ${company}:`, error.response?.data?.error || error.message);
    return [];
  }
}

async function main() {
  console.log('=== Apollo PE Enrichment - Hourly Cron ===');
  console.log('Time:', new Date().toISOString());
  console.log('');

  try {
    // Authenticate with Google Sheets
    const auth = new google.auth.GoogleAuth({
      keyFile: KEY_FILE,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    // Read the sheet
    console.log('[1/4] Reading Google Sheet...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A1:K200',
    });

    const rows = response.data.values || [];
    console.log(`Retrieved ${rows.length} rows\n`);

    // Identify targets needing enrichment
    const targets = [];
    for (let i = 1; i < rows.length && targets.length < 10; i++) {
      const row = rows[i];
      if (row.length === 0) continue;

      const firm = row[0] || '';
      const website = row[1] || '';
      const contact = row[2] || '';
      const email = row[4] || '';
      const status = row[7] || '';

      // Skip if Dead/Bounced
      if (status.includes('Dead') || status.includes('Bounced')) continue;

      // Target firms that need email verification
      if (status.includes('Needs Email Verification') && firm && website) {
        targets.push({
          rowIndex: i + 1,
          firm,
          website,
          currentContact: contact,
          currentEmail: email,
          status
        });
      }
    }

    console.log(`[2/4] Found ${targets.length} firms needing enrichment\n`);

    if (targets.length === 0) {
      console.log('No firms need enrichment at this time.');
      return;
    }

    // Enrich with Apollo
    console.log('[3/4] Enriching with Apollo API...\n');
    const enrichmentResults = [];

    for (const target of targets) {
      console.log(`Processing: ${target.firm}`);
      
      const contacts = await searchApolloContacts(target.firm, target.website);
      
      if (contacts.length > 0) {
        console.log(`  ✓ Found ${contacts.length} contacts:`);
        contacts.forEach((c, idx) => {
          console.log(`    ${idx + 1}. ${c.name} - ${c.title}`);
          console.log(`       Email: ${c.email || '(none)'} ${c.verified ? '✓ verified' : `(${c.emailStatus})`}`);
        });

        // Pick best contact (first verified email, or first contact if none verified)
        const bestContact = contacts.find(c => c.verified && c.email) || contacts[0];

        enrichmentResults.push({
          rowIndex: target.rowIndex,
          firm: target.firm,
          contactName: bestContact.name,
          title: bestContact.title,
          email: bestContact.email,
          linkedin: bestContact.linkedin || '',
          emailStatus: bestContact.emailStatus,
          verified: bestContact.verified,
          notes: `Apollo API ${new Date().toISOString().split('T')[0]}: ${bestContact.emailStatus}${bestContact.verified ? ' - VERIFIED' : ''}`,
          allContacts: contacts
        });

        console.log(`  → Selected: ${bestContact.name} (${bestContact.title}) - ${bestContact.email}\n`);
      } else {
        console.log(`  ✗ No contacts found\n`);
        enrichmentResults.push({
          rowIndex: target.rowIndex,
          firm: target.firm,
          contactName: target.currentContact,
          title: '',
          email: target.currentEmail,
          linkedin: '',
          emailStatus: 'not_found',
          verified: false,
          notes: `Apollo API ${new Date().toISOString().split('T')[0]}: No contacts found`,
          allContacts: []
        });
      }

      // Rate limiting: 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Save results to file
    const outputFile = path.join(__dirname, `apollo-enrichment-march15-${new Date().getHours()}${new Date().getMinutes()}.json`);
    fs.writeFileSync(outputFile, JSON.stringify(enrichmentResults, null, 2));
    console.log(`[4/4] Results saved to: ${outputFile}\n`);

    // Summary
    console.log('=== SUMMARY ===');
    console.log(`Firms processed: ${enrichmentResults.length}`);
    console.log(`Verified emails found: ${enrichmentResults.filter(r => r.verified).length}`);
    console.log(`Any email found: ${enrichmentResults.filter(r => r.email && r.email.trim()).length}`);
    console.log(`No contacts found: ${enrichmentResults.filter(r => r.allContacts.length === 0).length}`);
    console.log('');

    // Display update instructions
    console.log('=== NEXT STEPS ===');
    console.log('To update the Google Sheet with these findings, review the JSON output and');
    console.log('manually update rows OR create a sheet-update script.');
    console.log('');
    console.log('Enriched contacts:');
    enrichmentResults.forEach(r => {
      if (r.verified) {
        console.log(`  Row ${r.rowIndex}: ${r.firm} → ${r.contactName} (${r.email}) ✓ VERIFIED`);
      }
    });

  } catch (error) {
    console.error('Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
