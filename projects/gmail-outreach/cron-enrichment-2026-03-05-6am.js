const { google } = require('googleapis');

async function enrichSheetBatch() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Batch updates - row number, values array for columns A-L
  const updates = [
    {
      range: 'Sheet1!A702:L702', // Ancor Capital Partners
      values: [[
        'Ancor Capital Partners',
        'http://www.ancorcapital.com',
        'Brook Smith',
        'Partner & Managing Director',
        '', // Email not verified - pattern likely bsmith@ancorcapital.com but not published
        'http://www.ancorcapital.com',
        'https://www.linkedin.com/in/brook-smith-a935508',
        'Healthcare, Industrial, Manufacturing, Consumer',
        'Care Options for Kids, Advanced Tissue, Duva Sawko, PMA Photometals',
        'Partial',
        '2026-03-05',
        'Southlake TX. 35+ yrs exp. Handles capital raising & investor relations. Email pattern likely [first_initial][last]@ancorcapital.com but not verified. General: newdeals@ancorcapital.com (from contact page).'
      ]]
    },
    {
      range: 'Sheet1!A711:L711', // Atlantic Street Capital Advisors
      values: [[
        'Atlantic Street Capital Advisors, Inc.',
        'http://www.atlanticstreetcapital.com',
        'Peter Shabecoff',
        'Founder & Managing Partner',
        '', // No verified email
        'http://www.atlanticstreetcapital.com',
        'https://www.linkedin.com/in/peter-shabecoff',
        'Advisory/Operating Partners (not direct PE investor)',
        'Advisory firm providing senior exec guidance to portfolio cos',
        'Partial',
        '2026-03-05',
        'Founded 2006. LMM PE. Advisory-focused (senior executives network). No verified emails found on official sources. May not be direct PE investor - appears to be capital advisory firm.'
      ]]
    },
    {
      range: 'Sheet1!A728:L728', // Sageview Capital
      values: [[
        'Sageview Capital',
        'http://www.sageviewcapital.com',
        'Ned Gilhuly',
        'Co-Founder & Partner',
        '', // No verified email
        'http://www.sageviewcapital.com',
        'https://www.sageviewcapital.com/team/ned-gilhuly/',
        'Business Services, Technology, Consumer',
        'Mid-market growth equity and operational support',
        'Partial',
        '2026-03-05',
        'Palo Alto/Greenwich. Co-Founders: Ned Gilhuly & Scott Stuart. Partners: Dean Nelson, Jeff Klemens, Sasank Chary, Roberto Avila, Caitlin Vorlicek. General: info@sageviewcapital.com. No direct emails published.'
      ]]
    }
  ];
  
  // Execute updates
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
    } catch (err) {
      console.error(`✗ Failed ${update.range}:`, err.message);
    }
  }
  
  console.log(`\n📊 Enrichment complete: ${updates.length} firms updated`);
  console.log('Status: Partial enrichment - contacts identified but no verified direct emails from official sources');
  console.log('Recommendation: Use Apollo API credits for email verification on these firms');
}

enrichSheetBatch().catch(console.error);
