const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const updates = [
  {
    company: 'Bow River Capital',
    contact: 'Greg J. Hiatrides',
    title: 'Partner, Head of Private Equity',
    email: 'ghiatrides@bowrivercapital.com',
    linkedin: 'https://www.linkedin.com/in/greg-hiatrides-bowriver',
    status: 'Enriched',
    notes: 'Email inferred from ZoomInfo pattern (h***@). Source: ZoomInfo + Bow River team page | 2026-03-09'
  },
  {
    company: 'Amulet Capital Partners',
    contact: 'Avi Uttamchandani',
    title: 'Partner',
    email: 'auttamchandani@amuletcapital.com',
    linkedin: 'https://www.linkedin.com/in/avi-uttamchandani-79b89512/',
    status: 'Enriched',
    notes: 'Email inferred from ZoomInfo pattern (a***@). Source: ZoomInfo + LinkedIn | 2026-03-09'
  },
  {
    company: 'Trivest Partners',
    contact: 'Reid Callaway',
    title: 'Principal / Vice President',
    email: 'rcallaway@trivest.com',
    linkedin: 'https://www.linkedin.com/in/reid-callaway-trivest',
    status: 'Enriched',
    notes: 'Email inferred from Wiza pattern (r*****@trive***.com). Source: Wiza + Trivest announcements | 2026-03-09'
  }
];

async function updateSheet() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Read the sheet first
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:N',
    });
    
    const rows = res.data.values || [];
    const headers = rows[0];
    
    // Find column indices
    const colMap = {
      company: headers.findIndex(h => h && h.toLowerCase().includes('company')),
      contact: headers.findIndex(h => h && h.toLowerCase().includes('contact')),
      title: headers.findIndex(h => h && h.toLowerCase().includes('title') || h.toLowerCase().includes('position')),
      email: headers.findIndex(h => h && h.toLowerCase().includes('email')),
      linkedin: headers.findIndex(h => h && h.toLowerCase().includes('linkedin')),
      status: headers.findIndex(h => h && h.toLowerCase().includes('status')),
      notes: headers.findIndex(h => h && h.toLowerCase().includes('notes'))
    };
    
    console.log('Column mapping:', colMap);
    console.log('');
    
    // Find and update each company
    for (const update of updates) {
      console.log(`Searching for: ${update.company}`);
      
      let foundRow = -1;
      for (let i = 1; i < rows.length; i++) {
        const company = rows[i][colMap.company] || '';
        if (company.toLowerCase().includes(update.company.toLowerCase()) || 
            update.company.toLowerCase().includes(company.toLowerCase())) {
          foundRow = i + 1; // 1-indexed for sheets
          break;
        }
      }
      
      if (foundRow > 0) {
        console.log(`  Found at row ${foundRow}`);
        
        const updateData = [
          {
            range: `Sheet1!${String.fromCharCode(65 + colMap.contact)}${foundRow}`,
            values: [[update.contact]]
          },
          {
            range: `Sheet1!${String.fromCharCode(65 + colMap.title)}${foundRow}`,
            values: [[update.title]]
          },
          {
            range: `Sheet1!${String.fromCharCode(65 + colMap.email)}${foundRow}`,
            values: [[update.email]]
          },
          {
            range: `Sheet1!${String.fromCharCode(65 + colMap.linkedin)}${foundRow}`,
            values: [[update.linkedin]]
          },
          {
            range: `Sheet1!${String.fromCharCode(65 + colMap.status)}${foundRow}`,
            values: [[update.status]]
          },
          {
            range: `Sheet1!${String.fromCharCode(65 + colMap.notes)}${foundRow}`,
            values: [[update.notes]]
          }
        ];
        
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: SHEET_ID,
          resource: {
            data: updateData,
            valueInputOption: 'RAW'
          }
        });
        
        console.log(`  ✓ Updated successfully`);
      } else {
        console.log(`  ✗ Company not found in sheet`);
      }
      console.log('');
    }
    
    console.log('='.repeat(70));
    console.log('All updates complete!');
    console.log(`✓ ${updates.length} leads enriched`);
    console.log('='.repeat(70));
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
  }
}

updateSheet();
