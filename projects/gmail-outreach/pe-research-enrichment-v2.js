const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

async function main() {
  console.log('🔍 PE Research & Enrichment - Full Analysis\n');

  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Read the sheet - expand range to get all columns
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:Z',
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('❌ No data found');
    return;
  }

  const headers = rows[0];
  console.log('📊 Headers:', headers.join(' | '));
  console.log('');

  const companyIdx = headers.indexOf('Company');
  const contactNameIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const titleIdx = headers.indexOf('Title');
  const statusIdx = headers.indexOf('Status');
  const notesIdx = headers.indexOf('Notes');
  const linkedinIdx = headers.indexOf('LinkedIn URL');
  const websiteIdx = headers.indexOf('Website');

  const needsEnrichment = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contactName = row[contactNameIdx] || '';
    const email = row[emailIdx] || '';
    const title = row[titleIdx] || '';
    const status = row[statusIdx] || '';
    const website = row[websiteIdx] || '';

    // Skip if already sent or dead
    if (status === 'Sent' || status === 'Dead' || status === 'Replied') continue;

    // Check if needs enrichment
    const hasEmptyContact = !contactName || contactName.trim() === '';
    const hasGenericEmail = email && (
      email.includes('info@') ||
      email.includes('sales@') ||
      email.includes('ir@') ||
      email.includes('contact@')
    );
    const hasEmptyEmail = !email || email.trim() === '';

    if (hasEmptyContact || hasGenericEmail || hasEmptyEmail) {
      needsEnrichment.push({
        rowIndex: i + 1,
        company,
        contactName,
        email,
        title,
        status,
        website,
        issue: hasEmptyContact ? 'No contact name' : (hasEmptyEmail ? 'No email' : 'Generic email')
      });
    }
  }

  console.log(`\n🎯 Found ${needsEnrichment.length} leads needing enrichment\n`);
  console.log('=' .repeat(80));

  // Group by company to avoid duplicates
  const firmMap = new Map();
  needsEnrichment.forEach(lead => {
    if (!firmMap.has(lead.company)) {
      firmMap.set(lead.company, []);
    }
    firmMap.get(lead.company).push(lead);
  });

  console.log(`\n📁 Unique firms needing enrichment: ${firmMap.size}\n`);

  let count = 0;
  for (const [company, leads] of firmMap.entries()) {
    if (count >= 15) break;
    
    console.log(`\n${count + 1}. ${company || 'UNKNOWN COMPANY'}`);
    console.log(`   Rows: ${leads.map(l => l.rowIndex).join(', ')}`);
    console.log(`   Website: ${leads[0].website || 'N/A'}`);
    console.log(`   Issues found in ${leads.length} row(s):`);
    
    leads.forEach(lead => {
      console.log(`     - Row ${lead.rowIndex}: ${lead.contactName || 'N/A'} | ${lead.email || 'N/A'} (${lead.issue})`);
    });
    
    count++;
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n✅ Analysis complete. Research these firms to find decision-makers.');
  console.log('Focus: C-level, Partners, VPs, Directors with DIRECT emails from official sources.\n');
}

main().catch(console.error);
