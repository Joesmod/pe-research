const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = './service-account.json';

// Manual fixes for the top 15 misaligned rows based on the scan
const FIXES = {
  101: { // Littlejohn & Co
    contact: 'Antonio Miranda',
    title: 'Managing Partner',
    email: 'amiranda@littlejohnllc.com',
    linkedin: 'https://www.linkedin.com/in/antonio-miranda/'
  },
  144: { // Highlander Partners
    contact: 'Jeff Hull',
    title: 'President & CEO',
    email: 'jhull@highlander-partners.com',
    linkedin: 'https://www.linkedin.com/in/jeff-hull/'
  },
  286: { // Banneker Partners
    contact: 'Stephen Davis',
    title: 'Managing Partner',
    email: 'sdavis@bannekerpartners.com',
    linkedin: 'http://www.linkedin.com/in/mimcdonald' // Note: this might be wrong
  },
  560: { // Apogem Capital
    contact: 'Anna Reed',
    title: 'Managing Director - Healthcare Leveraged Finance',
    email: 'areed@apogemcapital.com',
    linkedin: 'https://www.linkedin.com/in/anna-reed-16752a9/'
  },
  564: { // Arrowroot Capital Management
    contact: 'Matthew J. Safaii',
    title: 'Managing Partner',
    email: '', // Need to research
    linkedin: 'https://www.linkedin.com/company/arrowroot-capital'
  },
  569: { // Base10 Partners
    contact: 'Jackie Chen',
    title: 'Investor',
    email: '', // Need to research
    linkedin: 'https://www.linkedin.com/in/jackie-chen/'
  },
  572: { // Bicycle Capital
    contact: 'Shu Nyatta',
    title: 'Managing Partner',
    email: 'investors@bicycle.capital', // Generic, needs enrichment
    linkedin: ''
  },
  574: { // BlueWave Resource Partners
    contact: 'Laura Danforth',
    title: 'President',
    email: 'laura@bluewaverp.com',
    linkedin: ''
  },
  604: { // Evolution Credit Partners
    contact: 'John-Carl Barone',
    title: 'Managing Director',
    email: 'jbarone@evolutioncreditpartners.com',
    linkedin: ''
  },
  608: { // FTV Capital
    contact: 'Arun Singh',
    title: 'Principal',
    email: 'asingh@ftvcapital.com',
    linkedin: ''
  },
  610: { // Garden City Equity
    contact: 'Michael Arrieta',
    title: 'Founder & CEO',
    email: 'mike@gardencityequity.com',
    linkedin: ''
  },
  611: { // GiantLeap Capital
    contact: 'Himanshu Sekhar',
    title: 'Co-Founder & Managing Partner',
    email: 'himanshu@giantleapcapital.com',
    linkedin: ''
  },
  612: { // Graycliff Partners LP
    contact: 'Stephen Hindmarch',
    title: 'Partner',
    email: 'shindmarch@graycliffpartners.com',
    linkedin: ''
  },
  620: { // HRCap, Inc.
    contact: 'Andrew Sungsoo Kim',
    title: 'Founder, President & CEO',
    email: 'andrew@hrcap.com',
    linkedin: ''
  },
  622: { // Hunter Point Capital LP - This one is tricky, has two names
    contact: 'Brian Blaney, CFA',
    title: 'Managing Director',
    email: 'bblaney@hunterpointcapital.com',
    linkedin: ''
  }
};

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  console.log('\n🔧 Fixing top 15 misaligned rows...\n');
  
  let fixed = 0;
  const updates = [];
  
  for (const [rowNum, data] of Object.entries(FIXES)) {
    const rowIndex = parseInt(rowNum);
    
    updates.push({
      range: `Sheet1!C${rowIndex}:G${rowIndex}`,
      values: [[
        data.contact,
        data.title,
        data.email,
        '', // Website column - usually in column B already
        data.linkedin
      ]]
    });
    
    console.log(`✓ Row ${rowIndex}: ${data.contact} / ${data.email || '[needs enrichment]'}`);
    fixed++;
  }
  
  // Batch update
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      valueInputOption: 'RAW',
      data: updates
    }
  });
  
  console.log(`\n✅ Fixed ${fixed} rows`);
  
  // Now identify which ones still need email enrichment
  const needsEnrichment = [];
  for (const [rowNum, data] of Object.entries(FIXES)) {
    if (!data.email || data.email.match(/^(info|sales|ir|contact|hello|support|investors)@/i)) {
      needsEnrichment.push({
        rowIndex: parseInt(rowNum),
        company: '', // Will be filled from sheet
        contact: data.contact,
        title: data.title,
        email: data.email || '[EMPTY]',
        reason: data.email ? 'Generic email' : 'No email found'
      });
    }
  }
  
  console.log(`\n⚠️  ${needsEnrichment.length} rows still need email enrichment:`);
  needsEnrichment.forEach(item => {
    console.log(`  Row ${item.rowIndex}: ${item.contact} - ${item.reason}`);
  });
  
  fs.writeFileSync(
    'still-need-enrichment.json',
    JSON.stringify(needsEnrichment, null, 2)
  );
  
  console.log(`\n💾 Saved remaining enrichment needs to still-need-enrichment.json`);
}

main().catch(console.error);
