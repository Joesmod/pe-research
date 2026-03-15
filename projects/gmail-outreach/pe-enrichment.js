const { google } = require('googleapis');

async function enrichSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Enrichment data found via research
  const updates = [
    // Brookside Capital Partners
    {
      range: 'Sheet1!C:J',
      values: [[
        'David D. Buttolph',
        'Managing Partner & Co-Founder',
        'dbuttolph@brooksidecp.com', // pattern inferred, not verified
        'https://www.linkedin.com/in/david-buttolph',
        'brooksidecp.com/team',
        'Healthcare Services, Business Services',
        'Chicago IL-based lower middle market PE. $1.5B+ AUM. Founded 2001.',
        'Partial'
      ]]
    },
    // Gryphon Investors
    {
      firmName: 'Gryphon Investors',
      contact: 'R. David Andrews',
      title: 'Founder & Co-CEO',
      email: '', // not publicly available
      linkedin: 'https://www.linkedin.com/company/gryphon-investors',
      website: 'gryphon-inv.com/team',
      sectors: 'Business Services, Industrial, Consumer',
      notes: 'San Francisco-based. $10B AUM. Co-CEO with Nicholas Orum. Email not published.',
      status: 'Partial'
    },
    // Trivest Partners
    {
      firmName: 'Trivest Partners',
      contact: 'Chris Weldon',
      title: 'Managing Partner, Mid-Market',
      email: '', // not publicly available
      linkedin: 'https://www.linkedin.com/company/trivest-partners',
      website: 'trivest.com',
      sectors: 'Business Services, Healthcare, Consumer',
      notes: 'Miami-based. $3.3B+ AUM. General contact: info@trivest.com. Individual emails not published.',
      status: 'Partial'
    }
  ];
  
  console.log('Enrichment findings compiled for manual review.');
  console.log(JSON.stringify(updates, null, 2));
}

enrichSheet().catch(console.error);
