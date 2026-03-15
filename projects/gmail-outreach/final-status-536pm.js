// Final Status Check - Friday 5:36 PM
const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function checkFinalStatus() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A1:Z1000',
    });

    const rows = response.data.values;
    const header = rows[0];
    
    // Find correct column indices
    const companyIdx = header.indexOf('Company Name');
    const contactIdx = header.indexOf('Contact Name');
    const emailIdx = header.indexOf('Email');
    const statusIdx = header.indexOf('Status');

    const statusCounts = {};
    let totalFirms = 0;
    const needsWork = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const company = row[companyIdx] || '';
      if (!company || company.trim() === '') continue;

      totalFirms++;
      const status = row[statusIdx] || 'Unknown';
      const email = (row[emailIdx] || '').toLowerCase();
      const contact = row[contactIdx] || '';

      statusCounts[status] = (statusCounts[status] || 0) + 1;

      // Check for problematic "Enriched" entries
      if (status === 'Enriched') {
        const hasGenericEmail = email.startsWith('info@') || email.startsWith('sales@') || 
                                email.startsWith('ir@') || email.startsWith('contact@') || email === '';
        if (hasGenericEmail || !contact) {
          needsWork.push({ 
            row: i + 1, 
            company, 
            contact: contact || '(none)', 
            email: email || '(none)' 
          });
        }
      }
    }

    return { statusCounts, totalFirms, needsWork };
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log(' PE ENRICHMENT STATUS - Friday, March 6, 2026 - 5:36 PM');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const stats = await checkFinalStatus();
  
  if (!stats) {
    console.log('❌ Failed to read sheet');
    return;
  }

  console.log(`📊 SHEET OVERVIEW:\n`);
  console.log(`Total firms: ${stats.totalFirms}\n`);
  
  console.log(`Status breakdown:`);
  const sortedStatuses = Object.entries(stats.statusCounts).sort((a, b) => b[1] - a[1]);
  sortedStatuses.forEach(([status, count]) => {
    const pct = ((count / stats.totalFirms) * 100).toFixed(1);
    console.log(`  ${status.padEnd(30)} ${count.toString().padStart(4)} (${pct}%)`);
  });

  console.log(`\n═══════════════════════════════════════════════════════════\n`);

  if (stats.needsWork.length > 0) {
    console.log(`⚠️  DATA QUALITY ALERT:\n`);
    console.log(`${stats.needsWork.length} firms marked "Enriched" but have questionable data:\n`);
    stats.needsWork.slice(0, 10).forEach((firm, idx) => {
      console.log(`${idx + 1}. Row ${firm.row}: ${firm.company}`);
      console.log(`   Contact: ${firm.contact} | Email: ${firm.email}\n`);
    });

    // Save to file
    fs.writeFileSync(
      'needs-quality-review.json',
      JSON.stringify(stats.needsWork, null, 2)
    );
    console.log(`\nSaved ${stats.needsWork.length} problematic entries to needs-quality-review.json\n`);
  } else {
    console.log(`✅ ALL ENRICHED FIRMS HAVE VALID CONTACTS\n`);
  }

  console.log('═══════════════════════════════════════════════════════════');
}

main();
