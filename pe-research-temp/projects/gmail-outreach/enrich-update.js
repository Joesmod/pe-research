const { google } = require('googleapis');

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

  // Enrichment data - firms with verified contacts
  const updates = [
    {
      row: null, // Find Arena Investors row
      firm: 'Arena Investors',
      contact: 'Victor Dupont',
      title: 'Managing Director',
      email: 'vdupont@arenaco.com',
      linkedin: 'https://www.linkedin.com/in/victor-dupont-86935b6/',
      status: 'Enriched',
      notes: 'Email verified from Arena website team page'
    },
    {
      row: null,
      firm: 'Bernhard Capital Partners',
      contact: 'Jeff Jenkins',
      title: 'Co-Founder and Partner',
      email: 'jeff@bernhardcapital.com',
      linkedin: 'https://www.linkedin.com/in/jeff-jenkins-7455151a8/',
      status: 'Enriched',
      notes: 'Email verified from ContactOut'
    },
    {
      row: null,
      firm: 'Monroe Capital',
      contact: 'Jeremy Simmons',
      title: 'Managing Director',
      email: 'jsimmons@monroecap.com',
      linkedin: 'https://www.linkedin.com/in/jeremysimmonschi/',
      status: 'Enriched',
      notes: 'Email verified from Monroe Capital website team page'
    },
    {
      row: null,
      firm: 'CIBC Innovation Banking',
      contact: 'Paul McKinlay',
      title: 'Executive MD and Head of Innovation Banking',
      email: 'paul.mckinlay@cibc.com',
      linkedin: '',
      status: 'Enriched',
      notes: 'Email verified from CIBC Innovation Banking team page'
    },
    {
      row: null,
      firm: 'Cambridge Capital LLC',
      contact: 'Benjamin Gordon',
      title: 'Managing Partner and CEO',
      email: '',
      linkedin: 'https://www.linkedin.com/in/bengordon18',
      status: 'Researched',
      notes: 'Supply chain focus. Need email verification - likely ben@cambridgecapital.com'
    },
    {
      row: null,
      firm: 'Riverside Acceleration Capital',
      contact: 'Jim Toth',
      title: 'Managing Partner',
      email: '',
      linkedin: '',
      status: 'Researched',
      notes: 'B2B software growth capital. Need email verification'
    },
    {
      row: null,
      firm: 'Alpha Partners',
      contact: 'Steve Brotman',
      title: 'Founder and Managing Partner',
      email: '',
      linkedin: 'https://www.linkedin.com/in/stevebrotman/',
      status: 'Researched',
      notes: 'Pro rata growth investor. Need email verification'
    },
    {
      row: null,
      firm: 'Gryphon Investors',
      contact: 'Vikram Mahidhar',
      title: 'Head of Technology, Partner',
      email: '',
      linkedin: '',
      status: 'Researched',
      notes: 'Joined Oct 2025. Email format: [last]@gryphoninvestors.com likely mahidhar@gryphoninvestors.com'
    },
    {
      row: null,
      firm: 'Dorm Room Fund',
      contact: 'Molly Fowler',
      title: 'Founding General Partner',
      email: '',
      linkedin: 'https://www.linkedin.com/in/molly-fowler/',
      status: 'Researched',
      notes: 'Email pattern suggests molly@dormroomfund.com or mfowler@dormroomfund.com'
    }
  ];

  // First, read the sheet to find row numbers
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:J',
  });

  const rows = result.data.values || [];
  
  // Find row numbers for each firm
  updates.forEach(update => {
    const rowIndex = rows.findIndex(row => 
      row[0] && row[0].toLowerCase().includes(update.firm.toLowerCase())
    );
    if (rowIndex >= 0) {
      update.row = rowIndex + 1; // +1 for 1-indexed sheets
    }
  });

  // Prepare batch update
  const batchData = [];
  
  updates.forEach(update => {
    if (update.row) {
      // Column mapping: A=Firm, B=Contact, C=Title, D=Email, E=Website, F=LinkedIn, G=Sectors, H=Description, I=Status, J=Notes
      if (update.contact) {
        batchData.push({
          range: `Sheet1!B${update.row}`,
          values: [[update.contact]]
        });
      }
      if (update.title) {
        batchData.push({
          range: `Sheet1!C${update.row}`,
          values: [[update.title]]
        });
      }
      if (update.email) {
        batchData.push({
          range: `Sheet1!D${update.row}`,
          values: [[update.email]]
        });
      }
      if (update.linkedin) {
        batchData.push({
          range: `Sheet1!F${update.row}`,
          values: [[update.linkedin]]
        });
      }
      if (update.status) {
        batchData.push({
          range: `Sheet1!I${update.row}`,
          values: [[update.status]]
        });
      }
      if (update.notes) {
        batchData.push({
          range: `Sheet1!J${update.row}`,
          values: [[update.notes]]
        });
      }
    }
  });

  if (batchData.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'RAW',
        data: batchData
      }
    });
    console.log(`✅ Updated ${updates.filter(u => u.row).length} firms in the Google Sheet`);
    console.log('Firms enriched:', updates.filter(u => u.row).map(u => u.firm).join(', '));
  } else {
    console.log('⚠️ No matching firms found in sheet');
  }

  // Log firms that weren't found
  const notFound = updates.filter(u => !u.row);
  if (notFound.length > 0) {
    console.log('\n⚠️ Firms not found in sheet:');
    notFound.forEach(u => console.log(`  - ${u.firm}`));
  }
}

updateSheet().catch(console.error);
