const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:N',
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }

  const headers = rows[0];
  const data = rows.slice(1);

  // Column indices (0-based)
  // A=0: Company Name
  // B=1: NotebookLM 
  // C=2: Contact Name
  // D=3: Title
  // E=4: Email
  // F=5: Website
  // G=6: LinkedIn
  // H=7: Status field
  // I=8: Contact Notes
  // J=9: Status
  // K=10: Last Contacted
  // L=11: General Notes
  // M=12: Company Info URL
  // N=13: Gumbo Score

  const companyIdx = 0;
  const contactIdx = 2;
  const titleIdx = 3;
  const emailIdx = 4;
  const websiteIdx = 5;
  const linkedinIdx = 6;
  const contactNotesIdx = 8;
  const statusIdx = 9;
  const notesIdx = 11;

  console.log(`\n📊 Total firms in sheet: ${data.length}`);

  // Find rows that need enrichment
  const needsEnrichment = [];

  data.forEach((row, idx) => {
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';

    // Check if needs enrichment: no contact name OR generic/missing email
    const hasNoContact = !contact || contact.trim() === '';
    const hasGenericEmail = !email || 
      email.toLowerCase().includes('info@') || 
      email.toLowerCase().includes('sales@') || 
      email.toLowerCase().includes('ir@') ||
      email.toLowerCase().includes('contact@') ||
      email.trim() === '';

    if (company && (hasNoContact || hasGenericEmail) && status !== 'Dead Lead') {
      needsEnrichment.push({
        rowNum: idx + 2, // +2 because 0-indexed + header row
        company: company.trim(),
        contact: contact.trim(),
        email: email.trim(),
        website: row[websiteIdx] || '',
        status: status.trim(),
        issue: hasNoContact ? 'No contact' : 'Generic/missing email'
      });
    }
  });

  console.log(`\n🎯 Total leads needing enrichment: ${needsEnrichment.length}`);
  console.log(`\n📋 Enriching first 15 targets...\n`);

  const targets = needsEnrichment.slice(0, 15);
  
  // Save targets for reference
  const fs = require('fs');
  fs.writeFileSync(
    `enrichment-targets-${new Date().toISOString().slice(0,10)}.json`,
    JSON.stringify(targets, null, 2)
  );

  // For each target, research and find contacts
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    console.log(`\n${i + 1}. ${target.company} (Row ${target.rowNum})`);
    console.log(`   Issue: ${target.issue}`);
    console.log(`   Website: ${target.website || 'N/A'}`);
    console.log(`   Current: ${target.contact || 'EMPTY'} / ${target.email || 'EMPTY'}`);
    console.log(`\n   ⏸️  PAUSED FOR MANUAL RESEARCH`);
    console.log(`   Instructions: Search for decision-makers at ${target.company}`);
    console.log(`   - Check website team/about/leadership pages`);
    console.log(`   - LinkedIn company page -> People`);
    console.log(`   - Press releases, news articles, SEC filings`);
    console.log(`   - Look for: CEO, CTO, Managing Partner, Operating Partner, VP Digital, etc.`);
    console.log(`   - ONLY use emails from official sources (website, verified profiles)`);
    console.log(`   - NEVER guess email patterns\n`);
  }

  console.log(`\n✅ Research session complete.`);
  console.log(`📝 Next step: Update the sheet with findings manually or via update script.`);
  console.log(`💾 Targets saved to enrichment-targets-${new Date().toISOString().slice(0,10)}.json\n`);
}

main().catch(console.error);
