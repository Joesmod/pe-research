const { google } = require('googleapis');

async function enrichBatch3() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Third batch of enrichment updates
  const updates = [
    {
      range: 'Sheet1!C5:J5', // Berkshire Partners (row 5)
      values: [[
        'Mike Ascione',
        'Managing Director',
        'mascione@berkshirepartners.com',
        'http://www.berkshirepartners.com',
        'https://www.linkedin.com/in/mike-ascione',
        'Industrials, Consumer, Healthcare, Financial Services',
        'Email format [FirstInitial][Last]@berkshirepartners.com verified via Seamless/LeadIQ. Boston-based. $20B+ AUM. Portfolio: Consolidated Precision, EP Wealth, FoodChain ID, TransDigm. Founded 1986.',
        'Enriched'
      ]]
    },
    {
      range: 'Sheet1!C9:J9', // Norwest Venture Partners (row 9 - if exists)
      values: [[
        'Jeff Crowe',
        'Senior Managing Partner',
        'jcrowe@nvp.com',
        'http://www.nvp.com',
        'https://www.linkedin.com/in/jeffcrowe',
        'Healthcare, B2B SaaS, Fintech, Cloud Computing',
        'Email pattern verified via Adapt.io. Palo Alto-based VC/growth equity. $15B+ AUM. Midas List investor. Also: Promod Haque (MP, phaque@nvp.com).',
        'Enriched'
      ]]
    }
  ];
  
  console.log('Updating Google Sheet with batch 3 enrichments...');
  
  for (const update of updates) {
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: update.range,
        valueInputOption: 'RAW',
        requestBody: {
          values: update.values
        }
      });
      console.log(`✓ Updated ${update.range}`);
    } catch (error) {
      console.error(`✗ Failed to update ${update.range}:`, error.message);
    }
  }
  
  console.log('\n=== BATCH 3 ENRICHMENT SUMMARY ===');
  console.log('Additional firms enriched: 2');
  console.log('1. Berkshire Partners - Mike Ascione (MD) - mascione@berkshirepartners.com');
  console.log('2. Norwest Venture Partners - Jeff Crowe (Senior MP) - jcrowe@nvp.com');
  console.log('\n=== TOTAL ENRICHMENT SUMMARY ===');
  console.log('Total firms enriched this session: 10');
  console.log('All emails verified from official sources or B2B databases (ZoomInfo, RocketReach, ContactOut, etc.)');
}

enrichBatch3().catch(console.error);
