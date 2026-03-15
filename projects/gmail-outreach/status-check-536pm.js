// Status Check - Friday 5:36 PM
const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = 'service-account.json';

const auth = new google.auth.GoogleAuth({
  keyFile: SERVICE_ACCOUNT_FILE,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

async function checkStatus() {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:Z1000',
  });

  const rows = response.data.values;
  const header = rows[0];
  
  const statusIdx = header.indexOf('Status');
  const companyIdx = header.indexOf('Company');
  const emailIdx = header.indexOf('Email');
  const contactIdx = header.indexOf('Contact Name');

  const statusCounts = {};
  let totalFirms = 0;
  let enrichedCount = 0;
  let partialCount = 0;
  let deadCount = 0;
  let needsWorkCount = 0;

  const needsWork = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    if (!company) continue;

    totalFirms++;
    const status = row[statusIdx] || 'Unknown';
    const email = (row[emailIdx] || '').toLowerCase();
    const contact = row[contactIdx] || '';

    statusCounts[status] = (statusCounts[status] || 0) + 1;

    if (status === 'Enriched') enrichedCount++;
    else if (status === 'Partial') partialCount++;
    else if (status.includes('Dead')) deadCount++;
    else if (status === 'New - Unresearched') needsWorkCount++;

    // Check for firms with enriched status but questionable data
    if (status === 'Enriched' && (!contact || email.startsWith('info@') || email.startsWith('sales@'))) {
      needsWork.push({ row: i + 1, company, contact, email, status });
    }
  }

  return { statusCounts, totalFirms, enrichedCount, partialCount, deadCount, needsWorkCount, needsWork };
}

async function main() {
  console.log('=== SHEET STATUS - Friday 5:36 PM ===\n');
  
  const stats = await checkStatus();
  
  console.log(`Total firms: ${stats.totalFirms}`);
  console.log(`\nStatus breakdown:`);
  Object.entries(stats.statusCounts).sort((a, b) => b[1] - a[1]).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`);
  });

  console.log(`\nSummary:`);
  console.log(`  Fully enriched: ${stats.enrichedCount}`);
  console.log(`  Partial: ${stats.partialCount}`);
  console.log(`  Dead/Invalid: ${stats.deadCount}`);
  console.log(`  Needs work: ${stats.needsWorkCount}`);

  if (stats.needsWork.length > 0) {
    console.log(`\n  ⚠️  ${stats.needsWork.length} firms marked "Enriched" but have questionable data:`);
    stats.needsWork.slice(0, 5).forEach(firm => {
      console.log(`     Row ${firm.row}: ${firm.company} - ${firm.contact || '(no contact)'} - ${firm.email || '(no email)'}`);
    });
  }
}

main().catch(console.error);
