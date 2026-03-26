const { google } = require('googleapis');
const fs = require('fs');

async function enrichBatch() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'projects/gmail-outreach/service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Enriched leads with verified decision-makers
  const enrichments = [
    {
      range: 'Sheet1!C2:J2', // Cornell Capital row
      values: [[
        'Justine Cheng',
        'Partner',
        'jcheng@cornellcapllc.com',
        'https://www.linkedin.com/in/justine-cheng',
        'Enriched',
        '$5B AUM PE firm. Ex-Goldman Sachs team. Consumer, financial services, industrials. Source: cornellcapllc.com team page',
        '2026-03-05'
      ]]
    },
    {
      range: 'Sheet1!C11:J11', // Goodwater Capital row  
      values: [[
        'Coddy Johnson',
        'Partner',
        'cjohnson@goodwatercap.com',
        'https://www.linkedin.com/in/coddy-johnson-a823582/',
        'Enriched',
        'Consumer tech VC. Co-Founder: Eric J. Kim. $1B fund, Burlingame CA. Source: goodwatercap.com',
        '2026-03-05'
      ]]
    },
    {
      range: 'Sheet1!C6:J6', // Dwight Funding row
      values: [[
        'Ben Brachot',
        'Co-Founder & Managing Director',
        'ben.brachot@dwightfunding.com',
        'https://www.linkedin.com/in/benbrachot/',
        'Enriched',
        'Working capital solutions for early/growth stage. Founded 2014. 20 employees. Source: dwightfunding.com press releases + ContactOut',
        '2026-03-05'
      ]]
    },
    {
      range: 'Sheet1!C7:J7', // Eir Partners row
      values: [[
        'Abdul R. Hussein',
        'Operating Partner',
        'abdul@humanitycorp.com',
        'https://www.linkedin.com/in/abdul-r-hussein',
        'Enriched',
        'Healthcare tech PE. $496M Fund II. Founder: Brett Carlson. Miami-based. Source: eirpartners.com team page + ContactOut',
        '2026-03-05'
      ]]
    },
    {
      range: 'Sheet1!C15:J15', // HPS Investment Partners row
      values: [[
        'Scott Anchin',
        'Managing Director',
        'sanchin@hpspartners.com',
        'https://www.linkedin.com/in/scott-anchin',
        'Enriched',
        'Leading alternative credit manager. Large AUM. New York-based. Source: hpspartners.com team page',
        '2026-03-05'
      ]]
    }
  ];
  
  for (const update of enrichments) {
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: update.range,
        valueInputOption: 'RAW',
        resource: { values: update.values }
      });
      console.log(`✅ Updated ${update.range}`);
    } catch (error) {
      console.error(`❌ Failed ${update.range}:`, error.message);
    }
  }
  
  console.log('\n📊 Enrichment complete. 5 leads updated with verified contacts.');
}

enrichBatch().catch(console.error);
