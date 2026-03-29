const { google } = require('googleapis');
const key = require('./service-account.json');

async function enrichBatch() {
  const auth = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
  );
  
  const sheets = google.sheets({ version: 'v4', auth });
  const sheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // First, append NEW firms at the end
  const newFirms = [
    [
      'Peak Rock Capital',
      'https://peakrockcapital.com',
      'Anthony DiSimone',
      'Chief Executive Officer',
      'anthony.disimone@peakrockcapital.com',
      '13413 Galleria Circle, Suite Q-300, Austin, TX 78738',
      'https://www.linkedin.com/company/peak-rock-capital-llc',
      'Research',
      'Email pattern INFERRED (needs verification via ContactOut/Apollo). CEO confirmed on official team page. Austin-based middle-market PE. Founded 2012. Focus: corporate carve-outs, family/founder businesses, performance improvement. Sectors: business services, industrials, consumer. Also: Steve Martinez (President), Jung Choi (CFO), Jordan Campbell (SMD), Robert Strauss (SMD). Source: peakrockcapital.com/team + ZoomInfo (2026-03-29 03:05 AM cron)',
      '',
      'Needs Email Verification'
    ]
  ];
  
  console.log('\\n📊 Adding NEW firmsto sheet...\\n');
  
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: 'Sheet1!A:K',
    valueInputOption: 'RAW',
    resource: {
      values: newFirms
    }
  });
  
  console.log('✅ Added Peak Rock Capital');
  console.log('\\n📈 Summary:');
  console.log('- 1 new firm added');
  console.log('- Existing sheet has 900+ enriched contacts');
  console.log('- Recommendation: Focus on data quality cleanup (remove Kyle Stanbro duplicates)');
  console.log('\\n🎯 Next enrichment run:');
  console.log('- Verify Peak Rock email via Apollo/ContactOut');
  console.log('- Add 2-3 more mid-market service-focused PE firms');
  console.log('- Update firms with generic BD emails to real decision-makers');
}

enrichBatch().catch(console.error);
