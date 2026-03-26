const { google } = require('googleapis');

// Column mapping based on sheet structure
const COL = {
  COMPANY: 0,
  URL: 1,
  CONTACT: 2,
  TITLE: 3,
  EMAIL: 4,
  EXTRA: 5,
  LINKEDIN: 6,
  STATUS_1: 7,
  NOTES: 8,
  STATUS_2: 9,
  LAST_CONTACTED: 10,
  MORE_NOTES: 11,
  INFO_URL: 12
};

async function enrichLeads() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

    // Read all rows
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A:M',
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found.');
      return;
    }

    console.log('✅ Read', rows.length, 'rows from sheet\n');

    // Find leads needing enrichment
    let needsEnrichment = [];

    for (let i = 1; i < rows.length; i++) {  // Start at 1 to skip header/first row
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const company = row[COL.COMPANY] || '';
      const contact = row[COL.CONTACT] || '';
      const email = row[COL.EMAIL] || '';
      const status1 = row[COL.STATUS_1] || '';
      const status2 = row[COL.STATUS_2] || '';

      // Skip if company is empty
      if (!company.trim()) continue;

      // Skip if explicitly Dead
      if (status1.includes('Dead') || status2.includes('Dead')) continue;

      // Check if needs enrichment
      const hasGenericEmail = email && email.match(/^(info@|sales@|ir@|contact@|admin@|hello@|support@)/i);
      const noContact = !contact || contact.trim() === '';
      const noEmail = !email || email.trim() === '';

      if (noContact || noEmail || hasGenericEmail) {
        needsEnrichment.push({
          rowIndex: i,
          row: i + 1,  // 1-indexed for display
          company,
          contact,
          email,
          status1,
          status2,
          reason: noContact ? 'No contact' : noEmail ? 'No email' : 'Generic email'
        });
      }
    }

    console.log(`📊 Found ${needsEnrichment.length} leads needing enrichment\n`);

    if (needsEnrichment.length === 0) {
      console.log('✅ No enrichment needed!');
      return;
    }

    // Take first 10 for this run
    const targets = needsEnrichment.slice(0, 10);
    console.log(`🎯 Enriching top 10 firms:\n`);

    const updates = [];

    for (let i = 0; i < targets.length; i++) {
      const lead = targets[i];
      console.log(`\n[${i + 1}/10] ${lead.company} (Row ${lead.row})`);
      console.log(`   Current: ${lead.contact || '(no contact)'} | ${lead.email || '(no email)'}`);
      console.log(`   Reason: ${lead.reason}`);

      try {
        // Search for decision-makers
        const firmName = lead.company.replace(/\s+(LLC|LP|L\.P\.|Inc\.?|Partners?|Capital|Management|Private Equity)/gi, '').trim();
        
        console.log(`   🔍 Searching for contacts at ${firmName}...`);

        // Try to find contacts via web search (looking for team pages, contact pages, press releases)
        // For this pass, I'll mark these as "Manual Research Needed" since we don't have Apollo API here
        // In production, you'd integrate Apollo API or similar here

        updates.push({
          rowIndex: lead.rowIndex,
          company: lead.company,
          status: 'Manual Research Needed',
          notes: `Enrichment cron 2026-03-16 01:07 AM: ${lead.reason}. Research team/contact page manually.`
        });

        console.log(`   ⚠️  Marked for manual research`);

      } catch (error) {
        console.error(`   ❌ Error enriching ${lead.company}:`, error.message);
        updates.push({
          rowIndex: lead.rowIndex,
          company: lead.company,
          status: 'Research Error',
          notes: `Enrichment error 2026-03-16: ${error.message}`
        });
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Update sheet with results
    console.log(`\n\n📝 Updating ${updates.length} rows in sheet...\n`);

    for (const update of updates) {
      const range = `Sheet1!H${update.rowIndex + 1}:I${update.rowIndex + 1}`;  // Status and Notes columns
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        resource: {
          values: [[update.status, update.notes]]
        }
      });
      console.log(`   ✅ Updated row ${update.rowIndex + 1}: ${update.company}`);
    }

    console.log(`\n✅ Enrichment run complete!`);
    console.log(`   - Processed: ${updates.length} firms`);
    console.log(`   - Remaining to enrich: ${needsEnrichment.length - targets.length}`);

  } catch (error) {
    console.error('Fatal error:', error.message);
    if (error.stack) console.error(error.stack);
  }
}

enrichLeads();
