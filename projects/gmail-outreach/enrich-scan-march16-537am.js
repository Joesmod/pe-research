const { google } = require('googleapis');
const fs = require('fs');

async function scanSheet() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

    console.log('🔍 PE Research & Enrichment - Hourly Scan');
    console.log('📅 Monday, March 16, 2026 — 5:37 AM CST\n');

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A:M',
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('❌ No data found');
      return;
    }

    // Find header row
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(10, rows.length); i++) {
      if (rows[i] && (rows[i][0] === 'Company' || rows[i][0] === 'Company Name')) {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) {
      console.error('❌ Could not find header row');
      return;
    }

    const headers = rows[headerRowIndex];
    console.log(`📋 Found headers at row ${headerRowIndex + 1}`);
    console.log('Headers:', headers.slice(0, 8).join(' | '));
    console.log(`\n📊 Total rows: ${rows.length - headerRowIndex - 1}\n`);

    // Map columns
    const companyCol = headers.findIndex(h => h && (h.includes('Company') || h.includes('Firm')));
    const contactCol = headers.findIndex(h => h && h.includes('Contact'));
    const emailCol = headers.findIndex(h => h && h.includes('Email'));
    const statusCol = headers.findIndex(h => h && h.includes('Status'));
    const websiteCol = headers.findIndex(h => h && (h.includes('Website') || h.includes('URL') || h.includes('NotebookLM')));
    const titleCol = headers.findIndex(h => h && (h.includes('Position') || h.includes('Title')));
    const linkedinCol = headers.findIndex(h => h && h.includes('LinkedIn'));
    const notesCol = headers.findIndex(h => h && h.includes('Notes'));

    console.log('📍 Column mapping:');
    console.log(`   Company: Col ${String.fromCharCode(65 + companyCol)}`);
    console.log(`   Contact: Col ${String.fromCharCode(65 + contactCol)}`);
    console.log(`   Email: Col ${String.fromCharCode(65 + emailCol)}`);
    console.log(`   Status: Col ${String.fromCharCode(65 + statusCol)}`);
    console.log(`   Website: Col ${String.fromCharCode(65 + websiteCol)}\n`);

    let needsEnrichment = [];

    // Scan data rows
    for (let i = headerRowIndex + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;
      
      const company = row[companyCol] || '';
      const contact = row[contactCol] || '';
      const email = row[emailCol] || '';
      const status = row[statusCol] || '';
      const website = row[websiteCol] || '';

      // Skip dead, bounced, sent, replied, scheduled
      if (['Dead', 'Bounced', 'Sent', 'Replied', 'Scheduled', 'Enriched'].includes(status)) {
        continue;
      }

      // Skip if no company
      if (!company || company.trim() === '') continue;

      // Check enrichment needs
      const hasGenericEmail = email && email.match(/^(info@|sales@|ir@|contact@|admin@|hello@|support@)/i);
      const noContact = !contact || contact.trim() === '';
      const noEmail = !email || email.trim() === '';

      if (noContact || noEmail || hasGenericEmail) {
        needsEnrichment.push({
          rowIndex: i + 1,  // 1-indexed for Google Sheets
          company,
          website,
          contact,
          email,
          status,
          reason: noContact ? 'Missing contact' : noEmail ? 'Missing email' : 'Generic email'
        });
      }
    }

    console.log(`🎯 Found ${needsEnrichment.length} leads needing enrichment\n`);

    if (needsEnrichment.length === 0) {
      console.log('✅ All leads are enriched!');
      return;
    }

    // Take batch of 10-15
    const batchSize = Math.min(12, needsEnrichment.length);
    const batch = needsEnrichment.slice(0, batchSize);
    
    console.log(`📝 Enrichment Batch (${batch.length} leads):\n`);
    console.log('─'.repeat(80));
    
    batch.forEach((lead, idx) => {
      console.log(`\n${idx + 1}. ${lead.company} (Row ${lead.rowIndex})`);
      console.log(`   Website: ${lead.website || '(search needed)'}`);
      console.log(`   Current contact: ${lead.contact || '(EMPTY)'}`);
      console.log(`   Current email: ${lead.email || '(EMPTY)'}`);
      console.log(`   Status: ${lead.status || 'Unresearched'}`);
      console.log(`   ⚠️  ${lead.reason}`);
    });
    
    console.log('\n' + '─'.repeat(80));
    console.log('\n💡 Research Instructions:');
    console.log('\n1. CAST A WIDE NET - Look for ANY decision-maker with direct email:');
    console.log('   • C-level: CEO, CTO, COO, CMO, CFO');
    console.log('   • Partners: Managing, Operating, General, Investment');
    console.log('   • Directors: Tech, Product, Ops, Marketing, Digital, BD');
    console.log('   • VPs: Technology, Operations, Digital Transformation, Portfolio Ops');
    console.log('   • Heads of: Value Creation, Portfolio Ops, Business Development');
    console.log('\n2. Search Sources:');
    console.log('   • Firm website: /team, /about, /leadership, /people pages');
    console.log('   • LinkedIn: site:linkedin.com "firm name" partner');
    console.log('   • Press releases, conference speakers, SEC filings');
    console.log('   • Downloadable PDFs (investor decks, brochures)');
    console.log('   • RocketReach, ZoomInfo, Apollo (when available)');
    console.log('\n3. Email Verification:');
    console.log('   • ONLY use emails from official published sources');
    console.log('   • Document source in Notes column');
    console.log('   • NEVER guess email patterns without verification');
    console.log('   • Leave blank if not found\n');
    console.log('4. Update Sheet:');
    console.log('   • Contact Name, Title, Email, LinkedIn URL');
    console.log('   • Set Status to "Enriched" when complete');
    console.log('   • Note source in Notes column\n');

    // Save batch to file
    fs.writeFileSync(
      'enrichment-targets-march16-537am.json',
      JSON.stringify(batch, null, 2)
    );
    console.log('✅ Saved batch to enrichment-targets-march16-537am.json\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) console.error(error.stack);
  }
}

scanSheet();
