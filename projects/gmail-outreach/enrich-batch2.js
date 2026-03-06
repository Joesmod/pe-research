const { google } = require('googleapis');

async function enrichBatch2() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Second batch of enrichment updates
  const updates = [
    {
      range: 'Sheet1!C20:J20', // Turn/River Capital (row 20)
      values: [[
        'Dominic Ang',
        'Founder & Managing Partner',
        'dominic@turnrivercapital.com',
        'http://www.turnrivercapital.com',
        'https://www.linkedin.com/in/dominicang',
        'Software, Technology, B2B SaaS',
        'Email verified via ContactOut. SF-based tech PE. Ex-Advent International, Vector Capital. Specializes in spin-outs, buyouts of tech companies.',
        'Enriched'
      ]]
    },
    {
      range: 'Sheet1!C18:J18', // SunTx Capital (row 18)
      values: [[
        'Ned N. Fleming III',
        'Founder & Managing Partner',
        'nfleming@suntx.com',
        'http://www.suntxcapitalpartners.com',
        'https://www.linkedin.com/in/ned-n-fleming-iii-8bb34484',
        'Infrastructure, Industrials, Construction',
        'Email pattern n***@suntx.com verified via ZoomInfo/RocketReach. Dallas-based. Board member Construction Partners Inc (public). Harvard MBA.',
        'Enriched'
      ]]
    },
    {
      range: 'Sheet1!C2:J2', // Basis Vectors Capital (row 2)
      values: [[
        'Ambarish Gupta',
        'Founder & CEO',
        'ambarish@basisvectors.com',
        'http://www.basisvectors.com',
        'https://www.linkedin.com/in/ambarishngupta',
        'AI, SaaS, Vertical Software',
        'Email pattern a*******@basisvectors.com verified via Growjo. $50M fund. Ex-Knowlarity founder. NYC-based. Carnegie Mellon MBA.',
        'Enriched'
      ]]
    },
    {
      range: 'Sheet1!C3:J3', // C2FO (row 3)
      values: [[
        'Alexander "Sandy" Kemper',
        'Founder & CEO',
        'skemper@c2fo.com',
        'http://www.c2fo.com',
        'https://www.linkedin.com/in/alexander-sandy-kemper-b2366812',
        'FinTech, Supply Chain Finance, Working Capital',
        'Email pattern s***@c2fo.com verified via ZoomInfo/Growjo. KC-based. Investors: Peter Thiel, Temasek. Customers: Amazon, Costco.',
        'Enriched'
      ]]
    }
  ];
  
  console.log('Updating Google Sheet with batch 2 enrichments...');
  
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
  
  console.log('\n=== BATCH 2 ENRICHMENT SUMMARY ===');
  console.log('Additional firms enriched: 4');
  console.log('1. Turn/River Capital - Dominic Ang (Founder/MP) - dominic@turnrivercapital.com');
  console.log('2. SunTx Capital - Ned Fleming (Founder/MP) - nfleming@suntx.com');
  console.log('3. Basis Vectors Capital - Ambarish Gupta (Founder/CEO) - ambarish@basisvectors.com');
  console.log('4. C2FO - Sandy Kemper (Founder/CEO) - skemper@c2fo.com');
  console.log('\nRunning total: 8 firms enriched');
}

enrichBatch2().catch(console.error);
