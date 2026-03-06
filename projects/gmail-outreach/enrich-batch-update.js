const { google } = require('googleapis');

async function batchUpdate() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const updates = [
    {
      range: 'Sheet1!C735:J735', // DLP Capital
      values: [['Don Wenner', 'Founder & CEO', 'dwenner@dlpcapital.com', 'https://dlpcapital.com/about/team/don-wenner', 'https://www.linkedin.com/in/donwenner/', 'Real Estate Investment', 'Real estate-focused, not traditional PE. Pattern inferred from team page.', 'Partial']]
    },
    {
      range: 'Sheet1!C736:J736', // Driehaus Capital Management
      values: [['Stephen Weber', 'President & CEO', 'sweber@driehaus.com', 'https://www.driehaus.com/about/our-team/stephen-weber', 'https://www.linkedin.com/in/stephen-weber', 'Asset Management', 'Email pattern from ZoomInfo. Asset manager/mutual funds, not PE.', 'Partial']]
    },
    {
      range: 'Sheet1!C739:J739', // EIV Capital, LLC
      values: [['David Finan', 'Managing Partner & Co-Founder', 'dfinan@eivcapital.com', 'https://eivcapital.com/team/', 'https://www.linkedin.com/in/david-finan-93a91a27/', 'Energy', 'Energy-focused PE. Email verified from company press release.', 'Enriched']]
    },
    {
      range: 'Sheet1!C746:J746', // Great Point Partners
      values: [['Jeffrey R. Jay, M.D.', 'Founder & Managing Partner', 'jjay@gppfunds.com', 'https://www.gppfunds.com/our-team/', 'https://www.linkedin.com/in/jeffrey-jay', 'Healthcare', 'Healthcare PE, $1.7B invested. Email from ContactOut.', 'Enriched']]
    },
    {
      range: 'Sheet1!C748:J748', // Hall Capital Holdings
      values: [['Bill Hood III', 'Managing Member & Founder', 'bhood@hallcapitalllc.com', 'https://hallcapitalllc.com/', 'https://www.linkedin.com/in/bill-hood-912b79110/', 'Multi-Sector', 'Family office, lower middle market PE. Email pattern from SignalHire.', 'Enriched']]
    },
    {
      range: 'Sheet1!C749:J749', // Hermitage Capital
      values: [['Sean Xiang', 'Founder & CEO', 'sxiang@hermitage.hk', 'https://www.hermitagecap.com/team', 'https://www.linkedin.com/in/seanxianghermitage/', 'Technology', 'China/HK tech PE, $1.5B AUM. Email domain from ZoomInfo.', 'Enriched']]
    }
  ];
  
  for (const update of updates) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: update.range,
      valueInputOption: 'RAW',
      resource: {
        values: update.values
      }
    });
    console.log(`Updated ${update.range}`);
  }
  
  console.log('Batch update complete.');
}

batchUpdate().catch(console.error);
