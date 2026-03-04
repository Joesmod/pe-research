#!/usr/bin/env node

const { google } = require('googleapis');
const https = require('https');
const fs = require('fs');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

/**
 * Search Apollo for contacts at a company
 */
async function searchApollo(orgName, titles) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      q_organization_name: orgName,
      person_titles: titles,
      page: 1,
      per_page: 10
    });

    const options = {
      hostname: 'api.apollo.io',
      path: '/api/v1/mixed_people/api_search',
      method: 'POST',
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsed = JSON.parse(responseData);
            resolve(parsed);
          } catch (err) {
            reject(new Error(`Failed to parse response: ${err.message}`));
          }
        } else {
          console.error(`Apollo API error ${res.statusCode}: ${responseData}`);
          resolve({ people: [] });
        }
      });
    });

    req.on('error', (err) => {
      console.error('Apollo request error:', err.message);
      resolve({ people: [] });
    });

    req.write(data);
    req.end();
  });
}

/**
 * Main enrichment function
 */
async function enrichLeads() {
  console.log('\n=== PE RESEARCH & ENRICHMENT - HOURLY CRON ===');
  console.log(`Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}\n`);

  // Read enrichment targets
  const targetsFile = 'enrichment-targets-hourly.json';
  if (!fs.existsSync(targetsFile)) {
    console.error(`Targets file not found: ${targetsFile}`);
    process.exit(1);
  }

  const allTargets = JSON.parse(fs.readFileSync(targetsFile, 'utf8'));
  
  // Prioritize targets
  const prioritized = [
    ...allTargets.filter(t => t.status === 'New - Unresearched'),
    ...allTargets.filter(t => t.status === 'Researched - No Email'),
    ...allTargets.filter(t => t.status === 'Dead Lead' && !t.contact),
    ...allTargets.filter(t => t.status === 'Dead Lead' && t.contact && !t.email),
  ];

  // Take top 15
  const targets = prioritized.slice(0, 15);
  console.log(`Selected ${targets.length} targets for enrichment:\n`);
  
  targets.forEach((t, idx) => {
    console.log(`${idx + 1}. ${t.company} (Row ${t.rowIndex}) - ${t.reason}`);
  });

  // Initialize Google Sheets
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });

  const enrichmentLog = [];
  const updates = [];

  console.log('\n=== STARTING ENRICHMENT ===\n');

  for (const target of targets) {
    console.log(`\n--- ${target.company} (Row ${target.rowIndex}) ---`);
    
    const logEntry = {
      company: target.company,
      rowIndex: target.rowIndex,
      originalContact: target.contact,
      originalEmail: target.email,
      originalStatus: target.status,
      foundContact: null,
      foundEmail: null,
      foundTitle: null,
      foundLinkedIn: null,
      source: null,
      newStatus: target.status
    };

    try {
      // Wide cast titles for Apollo search
      const titles = [
        'CEO', 'Chief Executive Officer',
        'CTO', 'Chief Technology Officer',
        'COO', 'Chief Operating Officer',
        'CFO', 'Chief Financial Officer',
        'CMO', 'Chief Marketing Officer',
        'Managing Partner', 'Managing Director',
        'Operating Partner', 'General Partner',
        'Partner', 'Principal',
        'Director of Technology', 'Director of Operations',
        'VP Technology', 'VP Operations', 'VP Digital',
        'Head of Portfolio Operations', 'Head of Value Creation'
      ];

      console.log(`Searching Apollo for decision-makers at ${target.company}...`);
      const apolloResults = await searchApollo(target.company, titles);

      if (apolloResults.people && apolloResults.people.length > 0) {
        // Pick first person with verified email
        const person = apolloResults.people.find(p => p.email && !p.email.includes('info@') && !p.email.includes('sales@'));
        
        if (person) {
          console.log(`✓ Found via Apollo: ${person.name} - ${person.title}`);
          console.log(`  Email: ${person.email}`);
          console.log(`  LinkedIn: ${person.linkedin_url || 'N/A'}`);
          
          logEntry.foundContact = person.name;
          logEntry.foundEmail = person.email;
          logEntry.foundTitle = person.title;
          logEntry.foundLinkedIn = person.linkedin_url || '';
          logEntry.source = 'Apollo API';
          logEntry.newStatus = 'Enriched';

          // Prepare sheet update
          updates.push({
            rowIndex: target.rowIndex,
            contact: person.name,
            title: person.title,
            email: person.email,
            linkedin: person.linkedin_url || '',
            status: 'Enriched',
            notes: `Enriched via Apollo - ${new Date().toISOString().split('T')[0]}`
          });
        } else {
          console.log(`✗ Apollo returned ${apolloResults.people.length} people but none with verified direct email`);
        }
      } else {
        console.log(`✗ No results from Apollo`);
      }

      // Add delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`Error enriching ${target.company}:`, error.message);
      logEntry.source = `Error: ${error.message}`;
    }

    enrichmentLog.push(logEntry);
  }

  console.log('\n=== ENRICHMENT COMPLETE ===\n');
  console.log(`Enriched: ${enrichmentLog.filter(e => e.foundEmail).length} / ${targets.length}`);

  // Save enrichment log
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  fs.writeFileSync(`enrichment-log-hourly-${timestamp}.json`, JSON.stringify(enrichmentLog, null, 2));
  console.log(`\nLog saved to: enrichment-log-hourly-${timestamp}.json`);

  // Update Google Sheet
  if (updates.length > 0) {
    console.log(`\nUpdating ${updates.length} rows in Google Sheet...`);
    
    for (const update of updates) {
      try {
        const range = `Sheet1!B${update.rowIndex}:H${update.rowIndex}`;
        const values = [[
          update.contact,
          update.title,
          update.email,
          update.linkedin,
          '', // Subject (empty)
          update.status,
          update.notes
        ]];

        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: range,
          valueInputOption: 'RAW',
          resource: { values }
        });

        console.log(`✓ Updated row ${update.rowIndex}: ${update.contact}`);
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`✗ Failed to update row ${update.rowIndex}:`, error.message);
      }
    }
  }

  // Summary report
  console.log('\n=== ENRICHMENT SUMMARY ===');
  console.log(`Total targets: ${targets.length}`);
  console.log(`Successfully enriched: ${updates.length}`);
  console.log(`Failed to enrich: ${targets.length - updates.length}`);
  console.log(`\nEnriched firms:`);
  updates.forEach(u => {
    console.log(`  - ${u.contact} at ${targets.find(t => t.rowIndex === u.rowIndex).company} (${u.email})`);
  });

  console.log('\nCron job complete. 🫡\n');
}

enrichLeads().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
