const { google } = require('googleapis');
const key = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

(async () => {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Read all data
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:K'
    });

    const rows = res.data.values || [];
    if (rows.length === 0) {
      console.log('No data found');
      return;
    }

    const headers = rows[0];
    console.log('Headers:', headers);
    console.log('Total rows:', rows.length - 1);

    // Find columns
    const companyIdx = headers.indexOf('Company Name');
    const contactIdx = headers.indexOf('Contact Name');
    const emailIdx = headers.indexOf('Email');
    const statusIdx = headers.indexOf('Status');

    console.log(`\nColumn indexes: Company=${companyIdx}, Contact=${contactIdx}, Email=${emailIdx}, Status=${statusIdx}`);

    // Find leads needing enrichment
    const needsEnrichment = [];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const company = row[companyIdx] || '';
      const contact = row[contactIdx] || '';
      const email = row[emailIdx] || '';
      const status = row[statusIdx] || '';

      // Skip if status is Dead (any Dead variant), Sent, Replied
      if (!status || status.startsWith('Dead') || ['Sent', 'Replied'].includes(status)) continue;
      
      // Skip if company name is empty (invalid row)
      if (!company || company.trim() === '') continue;

      // Needs enrichment if:
      // - No contact name, OR
      // - No email, OR
      // - Generic email (info@, sales@, ir@, contact@, careers@, hello@, support@)
      const hasGenericEmail = email && /^(info|sales|ir|contact|careers|hello|support|admin|team|mail)@/i.test(email);
      
      if (!contact || !email || hasGenericEmail) {
        needsEnrichment.push({
          rowNumber: i + 1,
          company,
          contact: contact || '(none)',
          email: email || '(none)',
          status,
          reason: !contact ? 'No contact' : hasGenericEmail ? 'Generic email' : 'No email'
        });
      }
    }

    console.log(`\n=== LEADS NEEDING ENRICHMENT: ${needsEnrichment.length} ===\n`);
    
    // Status breakdown
    const statusCounts = {};
    needsEnrichment.forEach(lead => {
      statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
    });
    console.log('Status breakdown:');
    Object.entries(statusCounts).sort((a, b) => b[1] - a[1]).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });
    console.log('');
    
    // Show first 15
    needsEnrichment.slice(0, 15).forEach(lead => {
      console.log(`Row ${lead.rowNumber}: ${lead.company}`);
      console.log(`  Contact: ${lead.contact}`);
      console.log(`  Email: ${lead.email}`);
      console.log(`  Status: ${lead.status}`);
      console.log(`  Reason: ${lead.reason}`);
      console.log('');
    });

    // Save to file for reference
    const fs = require('fs');
    fs.writeFileSync('./enrich-targets-march8-1106pm.json', JSON.stringify(needsEnrichment, null, 2));
    console.log(`\nSaved ${needsEnrichment.length} targets to enrich-targets-march8-1106pm.json`);

  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
