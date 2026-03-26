const { google } = require('googleapis');
const fs = require('fs');

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const updates = [
    // Cranemere Group - Row 242 - ENRICHED
    {
      range: 'Sheet1!C242:K242',
      values: [[
        'Kamil Salame',
        'Chief Executive Officer',
        '[email protected]',
        'https://www.cranemere.com',
        'https://www.linkedin.com/in/kamil-salame/',
        'Diversified holding company, permanent capital',
        '',
        'Enriched',
        'CEO since Jan 2024. 25+ years PE experience (DLJ, CVC). Media contact: Tom Davies, Kekst CNC, [email protected], 212-521-4873'
      ]]
    },
    
    // Lead Edge Capital - Row 631 - EMAIL PATTERN CONFIRMED
    {
      range: 'Sheet1!J631',
      values: [['Email Pattern Confirmed']]
    },
    {
      range: 'Sheet1!K631',
      values: [['Email pattern: first@leadedgecapital.com confirmed via jobs.leadedge.com/privacy-policy (andrew@leadedgecapital.com). Mitchell Green = mitchell@leadedgecapital.com (unverified pattern)']]
    },
    
    // HRCap Inc - Row 620 - DEAD
    {
      range: 'Sheet1!J620',
      values: [['Dead - Not PE Firm']]
    },
    {
      range: 'Sheet1!K620',
      values: [['HR consulting firm that serves PE firms. Not a PE investor.']]
    },
    
    // HSP Henkel Search Partners - Row 621 - DEAD
    {
      range: 'Sheet1!C621:K621',
      values: [[
        'Eleni Henkel',
        'CEO & Founder',
        'info@henkelsp.com',
        'https://www.henkelsp.com',
        'https://www.linkedin.com/company/hsp---henkel-search-partners',
        'Executive search/recruiting',
        '',
        'Dead - Not PE Firm',
        'Executive search firm. Not a PE investor.'
      ]]
    },
    
    // Jensen Partners - Row 625 - DEAD
    {
      range: 'Sheet1!C625:K625',
      values: [[
        'Sasha Jensen',
        'Founder & CEO',
        '',
        'https://www.jensen-partners.com',
        'https://www.linkedin.com/in/mssashajensen',
        'Executive search (PE/credit recruiting)',
        '',
        'Dead - Not PE Firm',
        'Executive search firm focused on PE recruiting. Not an investor.'
      ]]
    },
    
    // Jett Capital Advisors - Row 626 - DEAD
    {
      range: 'Sheet1!J626',
      values: [['Dead - Investment Bank']]
    },
    {
      range: 'Sheet1!K626',
      values: [['M&A advisory/investment banking firm. Not PE investor. General: info@jettcapital.com']]
    },
    
    // Kinect Capital - Row 630 - DEAD
    {
      range: 'Sheet1!J630',
      values: [['Dead - Accelerator/VC']]
    },
    {
      range: 'Sheet1!K630',
      values: [['Early-stage accelerator/incubator (Utah). Not mid-market PE firm.']]
    },
    
    // The Wicks Group - Row 221 - UPDATE CONTACT INFO
    {
      range: 'Sheet1!C221:K221',
      values: [[
        'Daniel L. Black',
        'Managing Partner',
        '',
        'https://www.wicksgroup.com',
        'https://www.linkedin.com/company/the-wicks-group',
        'Information, education, media industries',
        '',
        'Researched - No Email',
        'Partners: Craig B. Klosk (Co-founder), Daniel M. Kortick, Max von Zuben. Address: 400 Park Ave, NY 10022. No public emails.'
      ]]
    }
  ];
  
  console.log('=== UPDATING GOOGLE SHEET ===\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const update of updates) {
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: update.range,
        valueInputOption: 'RAW',
        resource: {
          values: update.values
        }
      });
      console.log(`✓ Updated ${update.range}`);
      successCount++;
    } catch (err) {
      console.error(`✗ Error updating ${update.range}:`, err.message);
      failCount++;
    }
  }
  
  console.log(`\n=== UPDATE COMPLETE ===`);
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`\nEnrichment Summary:`);
  console.log(`- Enriched: 2 (Cranemere, Lead Edge pattern confirmed)`);
  console.log(`- Dead/Non-PE: 5 (HRCap, HSP, Jensen, Jett, Kinect)`);
  console.log(`- Contact info added: 1 (The Wicks Group)`);
  
  // Log the enrichment to a JSON file for tracking
  const log = {
    timestamp: new Date().toISOString(),
    enriched: ['Cranemere Group', 'Lead Edge Capital'],
    deadLeads: ['HRCap Inc', 'HSP - Henkel Search Partners', 'Jensen Partners', 'Jett Capital Advisors', 'Kinect Capital'],
    updated: ['The Wicks Group'],
    researchedNoEmail: ['Apax Partners', 'Falconhead Capital', 'Clayton Dubilier & Rice', 'Morgan Stanley Expansion Capital', 'Kayne Partners', 'IEQ Capital', 'Kaizen Equity Partners']
  };
  
  fs.writeFileSync(
    'enrichment-log-hourly-2026-03-03T19-06-00.json',
    JSON.stringify(log, null, 2)
  );
  
  console.log('\nEnrichment log saved to: enrichment-log-hourly-2026-03-03T19-06-00.json');
}

updateSheet().catch(console.error);
