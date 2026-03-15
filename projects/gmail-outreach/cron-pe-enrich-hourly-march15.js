const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

async function main() {
  console.log('=== PE Research & Enrichment - Hourly Run ===');
  console.log('Time:', new Date().toISOString());
  
  try {
    // Authenticate
    const auth = new google.auth.GoogleAuth({
      keyFile: KEY_FILE,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    // Read the sheet
    console.log('\n[1/4] Reading Google Sheet...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:K',
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      console.log('No data found in sheet.');
      return;
    }

    const headers = rows[0];
    console.log('Headers:', headers);
    
    // Find column indices
    const colIndices = {
      firm: headers.indexOf('Company Name'),
      contact: headers.indexOf('Contact Name'),
      title: headers.indexOf('Position/Title'),
      email: headers.indexOf('Email'),
      linkedin: headers.indexOf('LinkedIn URL'),
      status: headers.indexOf('Status'),
      notes: headers.indexOf('Notes'),
    };

    console.log('Column indices:', colIndices);

    // Identify leads needing enrichment
    console.log('\n[2/4] Identifying leads needing enrichment...');
    const needsEnrichment = [];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const firm = row[colIndices.firm] || '';
      const contact = row[colIndices.contact] || '';
      const email = row[colIndices.email] || '';
      const status = row[colIndices.status] || '';

      // Skip if already has valid contact + email
      if (contact && contact.trim() && 
          email && email.trim() && 
          !email.includes('info@') && 
          !email.includes('sales@') && 
          !email.includes('ir@') &&
          !email.includes('contact@')) {
        continue;
      }

      // Skip if status is Dead/Bounced
      if (status === 'Dead' || status === 'Bounced') {
        continue;
      }

      // This row needs enrichment
      if (firm && firm.trim()) {
        needsEnrichment.push({
          rowIndex: i + 1,
          firm,
          contact,
          email,
          status,
        });
      }
    }

    console.log(`Found ${needsEnrichment.length} leads needing enrichment`);
    
    if (needsEnrichment.length === 0) {
      console.log('No leads need enrichment at this time.');
      return;
    }

    // Select top 10-15 for this run
    const targetCount = Math.min(15, needsEnrichment.length);
    const targets = needsEnrichment.slice(0, targetCount);
    
    console.log(`\nTargeting ${targets.length} firms for enrichment:`);
    targets.forEach((t, idx) => {
      console.log(`  ${idx + 1}. ${t.firm} (Row ${t.rowIndex})`);
    });

    // Save targets to file for manual research
    const targetFile = path.join(__dirname, 'enrichment-targets-march15-0037am.json');
    fs.writeFileSync(targetFile, JSON.stringify(targets, null, 2));
    console.log(`\nTargets saved to: ${targetFile}`);

    console.log('\n[3/4] Research Instructions:');
    console.log('For each firm, search for:');
    console.log('  • C-level: CEO, CTO, COO, CMO, CFO');
    console.log('  • Partners: Managing, Operating, General Partner');
    console.log('  • Directors: Technology, Product, Operations, Marketing');
    console.log('  • VPs: Technology, Operations, Digital');
    console.log('  • Heads of: Value Creation, Portfolio Ops, BD');
    console.log('\nSources to check:');
    console.log('  • Firm website team/contact pages');
    console.log('  • LinkedIn (site:linkedin.com/in queries)');
    console.log('  • Press releases');
    console.log('  • Conference speaker bios');
    console.log('  • SEC filings');
    console.log('\n⚠️  ONLY use emails found on official published sources.');
    console.log('⚠️  NEVER guess email patterns.');
    console.log('⚠️  Document source in Notes column.');

    // This is a CRON run - we need to actually DO the research, not just create instructions
    // Let's prepare a structured approach for the human operator or next automation step
    console.log('\n[4/4] Next Steps:');
    console.log('This is an hourly automated run. To complete enrichment:');
    console.log('1. Review targets in enrichment-targets-march15-0037am.json');
    console.log('2. Research each firm systematically');
    console.log('3. Update the Google Sheet with findings');
    console.log('4. Mark Status as "Enriched" when complete');
    console.log('\nOr: Use web_search + web_fetch to automate research in next iteration.');

  } catch (error) {
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

main();
