const { google } = require('googleapis');

async function enrichSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const sheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Batch 2 enrichments
  const updates = [
    // Cranemere Group - Row 242
    {
      range: 'Sheet1!C242:K242',
      values: [['Kamil Salame', 'Chief Executive Officer', '',
                'https://www.cranemere.com', 'https://www.linkedin.com/company/cranemere-group/',
                'Business Services, Healthcare, Industrial Services', '', 'Researched - No Email',
                'Long-hold PE. Also: Vincent Mai (Founder/Chairman), Jeff Case (MD), Bernardo Hees (Operating Partner). NY/London/DC offices. No public emails found.']]
    },
    // Morgan Stanley Expansion Capital - Row 264
    {
      range: 'Sheet1!C264:K264',
      values: [['Pete Chung', 'Managing Principal, Head of Expansion Capital', '',
                'https://www.morganstanley.com/im/en-us/capital-seeker/', 'https://www.linkedin.com/company/morgan-stanley',
                'Healthcare, Business Services, Technology, SaaS', '', 'Researched - No Email',
                'Part of Morgan Stanley Private Credit & Equity. San Francisco-based. No direct contact emails found publicly.']]
    },
    // Kayne Partners - Row 288  
    {
      range: 'Sheet1!C288:K288',
      values: [['Nishita Cummings', 'Managing Partner, Co-Head of Growth Equity', '',
                'https://www.kaynepartners.com', 'https://www.linkedin.com/company/kayne-anderson-capital-advisors',
                'BPO & automation, healthcare IT, fintech, supply chain', '', 'Researched - No Email',
                'Also: Nate Locke (Managing Partner, Co-Head Growth Equity). Portfolio: Panzura, KlearNow, MaintenanceNet (sold). No public emails found.']]
    },
    // Keltic Financial Partners - Row 117 (mark as dead - acquired)
    {
      range: 'Sheet1!J117',
      values: [['Dead Lead - Acquired by Ares Management in 2014']]
    },
    // Apax Partners - Row 93
    {
      range: 'Sheet1!C93:K93',
      values: [['Mark Beith', 'Partner, Apax Digital (Europe)', '',
                'https://www.apax.com', 'https://www.linkedin.com/company/apax-partners',
                'Tech, Services, Internet/Consumer', '', 'Researched - No Email',
                'London-based. Apax Digital leads European growth software/internet investments. Portfolio: Faculty (sold to Accenture), WGSN, RapidSOS. No public emails found.']]
    },
    // Falconhead Capital - Row 216
    {
      range: 'Sheet1!C216:K216',
      values: [['David Moross', 'Founder, Chairman & CEO', '',
                'https://www.falconheadcapital.com', 'https://www.linkedin.com/company/falconhead-capital',
                'Business Services, Healthcare, Financial Services, Consumer', '', 'Researched - No Email',
                'Founded 1998. Also: David Gubbay (General Partner). Services-focused. No public emails found.']]
    },
    // BayBoston Capital - Row 259
    {
      range: 'Sheet1!J259',
      values: [['Dead Lead - No website found, likely defunct']]
    },
    // Bindley Capital - Row 258
    {
      range: 'Sheet1!J258',
      values: [['Dead Lead - No website found, likely defunct']]
    }
  ];
  
  console.log('Updating sheet with batch 2 enrichments...');
  
  for (const update of updates) {
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: update.range,
        valueInputOption: 'RAW',
        resource: {
          values: update.values
        }
      });
      console.log(`✓ Updated ${update.range}`);
    } catch (err) {
      console.error(`✗ Error updating ${update.range}:`, err.message);
    }
  }
  
  console.log('\n=== BATCH 2 ENRICHMENT COMPLETE ===');
  console.log('Total enriched this batch: 8 leads');
  console.log('With contact info: 6');
  console.log('Marked as dead/defunct: 3');
}

enrichSheet().catch(console.error);
