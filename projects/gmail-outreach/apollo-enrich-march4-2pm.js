const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Load targets
const targets = JSON.parse(fs.readFileSync('enrichment-targets-march4-2pm.json', 'utf8'));

// Filter for viable leads (not already enriched with direct email, not new/unresearched)
const viableTargets = targets.filter(t => {
  // Skip if has direct email already (not info@, contact@, ir@, sales@)
  if (t.email && !t.email.includes('info@') && !t.email.includes('contact@') && 
      !t.email.includes('ir@') && !t.email.includes('sales@')) {
    return false;
  }
  // Include Partial, Needs Email, or generic email statuses
  return ['Partial', 'Needs Email', 'Enriched'].includes(t.status) || 
         (t.email && (t.email.includes('info@') || t.email.includes('contact@') || t.email.includes('ir@')));
});

console.log(`Filtered to ${viableTargets.length} viable targets for enrichment`);

async function searchApollo(company) {
  const url = 'https://api.apollo.io/v1/mixed_people/search';
  
  const body = {
    api_key: APOLLO_API_KEY,
    q_organization_name: company,
    person_titles: [
      'CEO', 'Chief Executive Officer', 'President',
      'Managing Director', 'Managing Partner', 'Partner',
      'CTO', 'Chief Technology Officer',
      'COO', 'Chief Operating Officer',
      'VP Technology', 'VP Operations', 'VP Digital',
      'Director Technology', 'Director Operations', 'Director Digital',
      'Head of Technology', 'Head of Operations'
    ],
    per_page: 10,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error(`  Apollo API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`  Apollo fetch error for ${company}:`, error.message);
    return null;
  }
}

async function enrichLeads() {
  const enrichments = [];
  const batchSize = 15;
  const batch = viableTargets.slice(0, batchSize);

  console.log(`\nProcessing ${batch.length} leads:\n`);

  for (const target of batch) {
    console.log(`\n[Row ${target.rowIndex}] ${target.company}`);
    console.log(`  Current: ${target.contact} | ${target.email}`);

    if (!target.company) {
      console.log('  ⚠️ No company name, skipping');
      continue;
    }

    // Search Apollo
    const result = await searchApollo(target.company);
    
    if (!result || !result.people || result.people.length === 0) {
      console.log('  ❌ No contacts found in Apollo');
      continue;
    }

    // Find best contact with email
    let bestContact = null;
    for (const person of result.people) {
      if (person.email && person.email_status === 'verified') {
        bestContact = person;
        break; // Take first verified email
      }
    }

    if (!bestContact) {
      // Try again with any email
      bestContact = result.people.find(p => p.email);
    }

    if (!bestContact) {
      console.log(`  ℹ️ Found ${result.people.length} contacts but no verified emails`);
      continue;
    }

    console.log(`  ✅ Found: ${bestContact.name} | ${bestContact.title} | ${bestContact.email}`);
    console.log(`     LinkedIn: ${bestContact.linkedin_url || 'N/A'}`);
    console.log(`     Email status: ${bestContact.email_status || 'unknown'}`);

    enrichments.push({
      rowIndex: target.rowIndex,
      company: target.company,
      contactName: bestContact.name,
      title: bestContact.title,
      email: bestContact.email,
      linkedIn: bestContact.linkedin_url || '',
      emailStatus: bestContact.email_status,
      source: 'Apollo API',
    });

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n\n=== ENRICHMENT SUMMARY ===`);
  console.log(`Total processed: ${batch.length}`);
  console.log(`Successfully enriched: ${enrichments.length}`);
  console.log(`Failed: ${batch.length - enrichments.length}`);

  // Save enrichment results
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  fs.writeFileSync(
    path.join(__dirname, `enrichment-results-march4-2pm.json`),
    JSON.stringify(enrichments, null, 2)
  );

  console.log(`\nSaved enrichment results to enrichment-results-march4-2pm.json`);
  
  return enrichments;
}

async function updateSheet(enrichments) {
  if (enrichments.length === 0) {
    console.log('\nNo enrichments to update');
    return;
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  console.log(`\n\nUpdating Google Sheet with ${enrichments.length} enrichments...`);

  for (const enrichment of enrichments) {
    const row = enrichment.rowIndex;
    
    // Update columns: C=Contact Name, D=Title, E=Email, G=LinkedIn, L=Notes
    const updates = [
      {
        range: `Sheet1!C${row}`,
        values: [[enrichment.contactName]],
      },
      {
        range: `Sheet1!D${row}`,
        values: [[enrichment.title]],
      },
      {
        range: `Sheet1!E${row}`,
        values: [[enrichment.email]],
      },
      {
        range: `Sheet1!G${row}`,
        values: [[enrichment.linkedIn]],
      },
      {
        range: `Sheet1!J${row}`, // Status column
        values: [['Enriched']],
      },
      {
        range: `Sheet1!L${row}`, // Notes column
        values: [[`Apollo enrichment (${enrichment.emailStatus}) - ${new Date().toISOString().split('T')[0]}`]],
      },
    ];

    for (const update of updates) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: update.range,
        valueInputOption: 'RAW',
        requestBody: {
          values: update.values,
        },
      });
    }

    console.log(`  ✅ Updated row ${row}: ${enrichment.company} → ${enrichment.contactName}`);
    await new Promise(resolve => setTimeout(resolve, 200)); // Rate limit
  }

  console.log('\n✅ Sheet update complete!');
}

async function main() {
  const enrichments = await enrichLeads();
  await updateSheet(enrichments);

  // Final report
  const report = `
# PE Enrichment Report - March 4, 2026 - 2:36 PM

## Summary
- Total viable targets: ${viableTargets.length}
- Processed: ${Math.min(15, viableTargets.length)}
- Successfully enriched: ${enrichments.length}
- Failed: ${Math.min(15, viableTargets.length) - enrichments.length}

## Enrichments Applied
${enrichments.map(e => `
### ${e.company} (Row ${e.rowIndex})
- **Contact**: ${e.contactName}
- **Title**: ${e.title}
- **Email**: ${e.email} (${e.emailStatus})
- **LinkedIn**: ${e.linkedIn || 'N/A'}
`).join('\n')}

## Next Steps
- ${Math.max(0, viableTargets.length - 15)} leads remaining for future enrichment
- Review enriched leads for quality
- Consider manual research for failed enrichments
`;

  fs.writeFileSync('ENRICHMENT-REPORT-MARCH4-2PM.md', report);
  console.log('\n📄 Report saved to ENRICHMENT-REPORT-MARCH4-2PM.md');
}

main().catch(console.error);
