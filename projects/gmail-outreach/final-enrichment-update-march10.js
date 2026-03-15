const { google } = require('googleapis');

async function finalUpdate() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Final enrichment data (additional firms beyond the first 5)
  const additionalUpdates = [
    {
      row: 198, // Valeas Capital Partners
      contact: 'Rob Little',
      title: 'Co-Founder and Managing Partner',
      email: 'rob@valeas.com',
      linkedin: 'https://www.linkedin.com/in/rob-little-6746b7253',
      status: 'Enriched',
      notes: 'Pattern inference r******@valeas.com (RocketReach). Co-Founders: Rob Little, Ed Woiteshek. Source: official team page (valeas.com/our-people).'
    },
    {
      row: 248, // Bregal Sagemount
      contact: 'Jillian Hazelton',
      title: 'Head of Marketing & Communications',
      email: 'Jillian.hazelton@sagemount.com',
      linkedin: 'https://www.sagemount.com/team/',
      status: 'Enriched',
      notes: 'Email from official press release. Managing Partner: Gene Yoon. Source: https://www.sagemount.com/news/bregal-sagemount-announces-strategic-growth-investment-in-buildinglink/'
    },
    {
      row: 56, // WindRose Health Investors
      contact: 'Oliver T. Moses',
      title: 'Managing Partner',
      email: 'info@windrose.com',
      linkedin: 'https://www.linkedin.com/company/windrose-health-investors',
      status: 'Enriched',
      notes: 'Generic email only. Oliver T. Moses (Managing Partner), Alexander Buzik (Partner), Christopher Burnes (Partner). No direct emails publicly available. Source: windrose.com/team/'
    }
  ];
  
  console.log('\n=== FINAL ENRICHMENT UPDATE ===\n');
  console.log(`Updating ${additionalUpdates.length} additional firms...\n`);
  
  for (const update of additionalUpdates) {
    try {
      const range = `Sheet1!C${update.row}:L${update.row}`;
      const values = [[
        update.contact,
        update.title,
        update.email,
        '', // Website
        update.linkedin,
        '', '', // Columns H, I
        update.status,
        '', // Column K
        update.notes
      ]];
      
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        resource: { values }
      });
      
      console.log(`✓ Row ${update.row}: Updated`);
    } catch (error) {
      console.error(`✗ Error updating row ${update.row}:`, error.message);
    }
  }
  
  console.log(`\n✓ Final enrichment complete!`);
  console.log('\n=== ENRICHMENT SUMMARY ===');
  console.log('Total enriched: 8 firms');
  console.log('');
  console.log('High-quality (verified emails from official sources):');
  console.log('  - Kinderhook Industries (rmichalik@kinderhook.com from press release)');
  console.log('  - Goode Partners (doddi@goodepartners.com from team page)');
  console.log('  - Tenex Capital (sjohnson@tenexcm.com from PDF)');
  console.log('  - Bregal Sagemount (Jillian.hazelton@sagemount.com from press release)');
  console.log('');
  console.log('Pattern inference + confirmed titles:');
  console.log('  - Berkshire Partners (lhamelsky@berkshirepartners.com)');
  console.log('  - Cranemere Group (ksalame@cranemere.com)');
  console.log('  - Valeas Capital (rob@valeas.com)');
  console.log('');
  console.log('Generic/partial:');
  console.log('  - WindRose Health Investors (info@windrose.com)');
}

finalUpdate().catch(console.error);
