const { google } = require('googleapis');

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const updates = [
    // Row 11: Blue Star - Update to Rob Wechsler
    { range: 'Sheet1!C11', values: [['Rob Wechsler']] },
    { range: 'Sheet1!D11', values: [['Founder / Managing Partner']] },
    { range: 'Sheet1!E11', values: [['rob@bluestarinnovationpartners.com']] },
    { range: 'Sheet1!G11', values: [['https://www.linkedin.com/in/robert-wechsler-002bab2/']] },
    { range: 'Sheet1!H11', values: [['Enriched - Needs Email Verification']] },
    { range: 'Sheet1!I11', values: [['Founder & Managing Partner. Email pattern inferred from ZoomInfo r***@ and domain length. Official team page: bluestarinnovationpartners.com/team/. Alt contact: Dan Wechsler (CEO/Managing Partner). (2026-03-14 cron)']] },
    
    // Row 12: Casa Verde - Update to Karan Wadhera
    { range: 'Sheet1!C12', values: [['Karan Wadhera']] },
    { range: 'Sheet1!D12', values: [['Managing Partner']] },
    { range: 'Sheet1!E12', values: [['karan@casaverdecapital.com']] },
    { range: 'Sheet1!G12', values: [['https://www.linkedin.com/in/karanwadhera']] },
    { range: 'Sheet1!H12', values: [['Enriched - Needs Email Verification']] },
    { range: 'Sheet1!I12', values: [['Managing Partner of Casa Verde Capital. Email pattern [first]@casaverdecapital.com per RocketReach (79.6%). Confirmed from official team page: casaverdecapital.com/team/. (2026-03-14 cron)']] },
    
    // Row 13: Cornell Capital - Update to Henry Cornell
    { range: 'Sheet1!C13', values: [['Henry Cornell']] },
    { range: 'Sheet1!D13', values: [['Founder and Senior Partner']] },
    { range: 'Sheet1!E13', values: [['henry@cornellcapllc.com']] },
    { range: 'Sheet1!G13', values: [['https://www.linkedin.com/in/henry-cornell']] },
    { range: 'Sheet1!H13', values: [['Enriched - Needs Email Verification']] },
    { range: 'Sheet1!I13', values: [['Founder & Senior Partner. Former Vice Chairman of Goldman Sachs Merchant Banking Division. Email pattern First@cornellcapllc.com per LeadIQ. ~$6B AUM. (2026-03-14 cron)']] }
  ];
  
  console.log('Updating batch 3 (final batch for existing leads): ' + updates.length + ' cells...\n');
  
  for (const update of updates) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: update.range,
      valueInputOption: 'RAW',
      resource: { values: update.values }
    });
    console.log('Updated: ' + update.range);
  }
  
  console.log('\nBatch 3 complete! Now adding new firms...');
}

updateSheet().catch(console.error);
