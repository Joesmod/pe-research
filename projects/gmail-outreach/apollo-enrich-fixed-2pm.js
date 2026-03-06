const axios = require('axios');
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Load targets
const targets = JSON.parse(fs.readFileSync('enrichment-targets-march4-2pm.json', 'utf8'));

// Filter for viable leads (not already enriched with direct email)
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

const TARGET_TITLES = [
  'Managing Partner',
  'Managing Director',
  'Partner',
  'General Partner',
  'Operating Partner',
  'Principal',
  'CEO',
  'President',
  'Chief Operating Officer',
  'COO',
  'CTO',
  'VP',
  'Director'
];

async function searchApollo(company) {
  try {
    const response = await axios.post('https://api.apollo.io/v1/mixed_people/search', {
      q_organization_name: company,
      page: 1,
      per_page: 10,
      person_titles: TARGET_TITLES
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY
      }
    });
    
    const people = response.data.people || [];
    
    // Return best match: prefer verified emails, higher titles
    const sorted = people
      .filter(p => p.email && !p.email.startsWith('info@') && !p.email.startsWith('sales@'))
      .sort((a, b) => {
        const aScore = (a.email_status === 'verified' ? 100 : 0) + 
                      (a.title?.toLowerCase().includes('partner') ? 50 : 0) +
                      (a.title?.toLowerCase().includes('managing') ? 40 : 0);
        const bScore = (b.email_status === 'verified' ? 100 : 0) + 
                      (b.title?.toLowerCase().includes('partner') ? 50 : 0) +
                      (b.title?.toLowerCase().includes('managing') ? 40 : 0);
        return bScore - aScore;
      });
    
    return sorted[0] || null;
  } catch (error) {
    console.error(`  Apollo error: ${error.response?.data?.message || error.message}`);
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
    const contact = await searchApollo(target.company);
    
    if (!contact) {
      console.log('  ❌ No suitable contacts found in Apollo');
      continue;
    }

    console.log(`  ✅ Found: ${contact.name} | ${contact.title} | ${contact.email}`);
    console.log(`     LinkedIn: ${contact.linkedin_url || 'N/A'}`);
    console.log(`     Email status: ${contact.email_status || 'unknown'}`);

    enrichments.push({
      rowIndex: target.rowIndex,
      company: target.company,
      contactName: contact.name,
      title: contact.title,
      email: contact.email,
      linkedIn: contact.linkedin_url || '',
      emailStatus: contact.email_status,
      source: 'Apollo API',
    });

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1200));
  }

  console.log(`\n\n=== ENRICHMENT SUMMARY ===`);
  console.log(`Total processed: ${batch.length}`);
  console.log(`Successfully enriched: ${enrichments.length}`);
  console.log(`Failed: ${batch.length - enrichments.length}`);

  // Save enrichment results
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
    
    // Update columns: C=Contact Name, D=Title, E=Email, G=LinkedIn, J=Status, L=Notes
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
    await new Promise(resolve => setTimeout(resolve, 300)); // Rate limit
  }

  console.log('\n✅ Sheet update complete!');
}

async function main() {
  const enrichments = await enrichLeads();
  await updateSheet(enrichments);

  // Final report
  const report = `# PE Enrichment Report - March 4, 2026 - 2:36 PM

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
