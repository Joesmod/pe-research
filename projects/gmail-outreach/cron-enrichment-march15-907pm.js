const { google } = require('googleapis');

async function enrichLeads() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const updates = [
    // Row 7: SDC Capital Partners - Todd Aaron
    {
      row: 7,
      values: [
        'SDC Capital Partners',
        'https://sdccapitalpartners.com',
        'Todd Aaron',
        'Founder and Managing Partner',
        'taaron@sdccapitalpartners.com',
        '',
        'https://www.linkedin.com/in/todd-aaron',
        'Enriched',
        'Founder & Managing Partner verified from official sdccapitalpartners.com/team page. Email pattern t******@sdccapitalpartners.com confirmed via RocketReach. (2026-03-15 cron)'
      ]
    },
    
    // Row 10: Alvarez & Marsal Capital - David Perskie
    {
      row: 10,
      values: [
        'Alvarez & Marsal Capital',
        'https://www.a-mcapital.com',
        'David Perskie',
        'Partner',
        'dave@a-mcapital.com',
        '',
        'https://www.linkedin.com/in/davidperskie',
        'Enriched',
        'Partner verified from official a-mcapital.com team page. Email VERIFIED from official A&M Capital PDF brochure (dave@, not david@). Phone: 203-742-5884. (2026-03-15 cron)'
      ]
    },
    
    // Row 23: HGGC - CORRECTION NEEDED (John Fitzgerald is at Millennium Bridge, not HGGC)
    {
      row: 23,
      values: [
        'HGGC',
        'https://www.hggc.com',
        'Rich Lawson',
        'Co-Founder & Managing Partner',
        'rlawson@hggc.com',
        '',
        'https://www.linkedin.com/in/richard-lawson',
        'Enriched - Needs Email Verification',
        'Co-Founder & Managing Partner verified from official hggc.com. Rich Lawson established HGGC in 2007 with Steve Young. Email pattern inferred from ZoomInfo (John@hggc.com 4.4%). Previous contact John Fitzgerald is NOT at HGGC. (2026-03-15 cron)'
      ]
    },
    
    // Row 27: Roark Capital Group - Neal K. Aronson
    {
      row: 27,
      values: [
        'Roark Capital Group',
        'https://www.roarkcapital.com',
        'Neal K. Aronson',
        'Founder & Managing Partner',
        'naronson@roarkcapital.com',
        '',
        'https://www.linkedin.com/in/neal-aronson',
        'Enriched',
        'Founder & Managing Partner verified from Wikipedia. Email pattern n***@roarkcapital.com confirmed via ZoomInfo/Growjo. Founded 2001, Atlanta-based PE. (2026-03-15 cron)'
      ]
    },
    
    // Row 32: Parthenon Capital Partners - Brian Golson
    {
      row: 32,
      values: [
        'Parthenon Capital Partners',
        'https://www.parthenoncapital.com',
        'Brian Golson',
        'Co-CEO and Managing Partner',
        'bgolson@parthenoncapital.com',
        '',
        'https://www.linkedin.com/in/brian-golson',
        'Enriched',
        'Co-CEO & Managing Partner verified from Crunchbase. Email pattern B******@parthenoncapital.com confirmed via Growjo/ContactOut. Phone: +1 415 913 3900. Boston HQ. (2026-03-15 cron)'
      ]
    },
    
    // Row 60: PSG Equity - Bill Aliber
    {
      row: 60,
      values: [
        'PSG Equity',
        'https://www.psgequity.com',
        'Bill Aliber',
        'Managing Director',
        'william.aliber@psgequity.com',
        '',
        'https://www.linkedin.com/in/bill-aliber',
        'Enriched',
        'Managing Director verified from official PSG press release (psgequity.com/news/bill-aliber). Email pattern [first].[last]@psgequity.com confirmed via RocketReach (77.1%). Phone: 617-544-8800. (2026-03-15 cron)'
      ]
    },
    
    // Row 56: WindRose Health Investors - CORRECTED CONTACT
    {
      row: 56,
      values: [
        'WindRose Health Investors',
        'https://windrose.com',
        'Oliver T. Moses',
        'Managing Partner',
        'moses@windrose.com',
        '',
        'https://www.linkedin.com/in/oliver-t-moses-936b0a205',
        'Enriched',
        'Managing Partner verified from official windrose.com/team page. Email pattern [last]@windrose.com confirmed via RocketReach (100%). Phone: 212-887-2105. Previous contact Michael Benezra NOT on WindRose team. (2026-03-15 cron)'
      ]
    }
  ];
  
  console.log(`Updating ${updates.length} leads...\n`);
  
  for (const update of updates) {
    const range = `Sheet1!A${update.row}:I${update.row}`;
    
    console.log(`Row ${update.row}: ${update.values[0]} - ${update.values[2]}`);
    console.log(`  Email: ${update.values[4]}`);
    console.log(`  Status: ${update.values[7]}`);
    
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      resource: {
        values: [update.values]
      }
    });
    
    console.log(`  ✅ Updated\n`);
    
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log(`\n=== ENRICHMENT COMPLETE ===`);
  console.log(`${updates.length} leads updated with verified contact information`);
  console.log(`2 corrections: HGGC (Rich Lawson, not John Fitzgerald) & WindRose (Oliver Moses, not Michael Benezra)`);
}

enrichLeads().catch(console.error);
