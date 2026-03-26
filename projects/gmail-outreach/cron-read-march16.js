const { google } = require('googleapis');

async function readSheet() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A:M',  // Read all rows
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found.');
      return;
    }

    // Find the actual header row (looking for "Company" or "Company Name")
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(10, rows.length); i++) {
      if (rows[i] && (rows[i][0] === 'Company' || rows[i][0] === 'Company Name')) {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) {
      console.error('Could not find header row');
      return;
    }

    const headers = rows[headerRowIndex];
    console.log('Found headers at row', headerRowIndex + 1);
    console.log('Headers:', headers);
    console.log('\nTotal data rows:', rows.length - headerRowIndex - 1);

    // Map columns
    const companyCol = headers.findIndex(h => h && (h.includes('Company') || h.includes('Firm')));
    const contactCol = headers.findIndex(h => h && h.includes('Contact'));
    const emailCol = headers.findIndex(h => h && h.includes('Email'));
    const statusCol = headers.findIndex(h => h && h.includes('Status'));

    console.log('\nColumn indices:');
    console.log('Company:', companyCol, '(' + headers[companyCol] + ')');
    console.log('Contact:', contactCol, '(' + headers[contactCol] + ')');
    console.log('Email:', emailCol, '(' + headers[emailCol] + ')');
    console.log('Status:', statusCol, '(' + headers[statusCol] + ')');

    let needsEnrichment = [];

    // Start from data rows (skip header)
    for (let i = headerRowIndex + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue; // Skip empty rows
      
      const company = row[companyCol] || '';
      const contact = row[contactCol] || '';
      const email = row[emailCol] || '';
      const status = row[statusCol] || '';

      // Skip if already Dead or Enriched
      if (status === 'Dead' || status === 'Enriched') continue;
      // Skip if company is empty
      if (!company || company.trim() === '') continue;

      // Check if needs enrichment
      const hasGenericEmail = email && email.match(/^(info@|sales@|ir@|contact@|admin@|hello@|support@)/i);
      const noContact = !contact || contact.trim() === '';
      const noEmail = !email || email.trim() === '';

      if (noContact || noEmail || hasGenericEmail) {
        needsEnrichment.push({
          row: i + 1,  // 1-indexed for sheet
          company,
          contact,
          email,
          status,
          reason: noContact ? 'No contact' : noEmail ? 'No email' : 'Generic email'
        });
      }
    }

    console.log(`\n\n=== ENRICHMENT CANDIDATES ===`);
    console.log(`Total leads needing enrichment: ${needsEnrichment.length}`);
    
    // Take first 15 for enrichment
    const targets = needsEnrichment.slice(0, 15);
    
    console.log(`\n=== TOP 15 TO ENRICH NOW ===\n`);
    targets.forEach((lead, idx) => {
      console.log(`${idx + 1}. Row ${lead.row}: ${lead.company}`);
      console.log(`   Reason: ${lead.reason}`);
      console.log(`   Current contact: ${lead.contact || '(none)'}`);
      console.log(`   Current email: ${lead.email || '(none)'}`);
      console.log(`   Status: ${lead.status || '(none)'}`);
      console.log('');
    });

    // Save to file for enrichment script
    const fs = require('fs');
    fs.writeFileSync(
      'enrichment-targets-march16-0107am.json',
      JSON.stringify(targets, null, 2)
    );
    console.log('✅ Saved targets to enrichment-targets-march16-0107am.json');

  } catch (error) {
    console.error('Error:', error.message);
    if (error.stack) console.error(error.stack);
  }
}

readSheet();
