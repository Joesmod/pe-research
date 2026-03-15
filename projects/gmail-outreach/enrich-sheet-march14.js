const { google } = require('googleapis');

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Get existing data
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:L',
  });
  
  const allRows = result.data.values;
  const headers = allRows[0];
  
  console.log('=== ENRICHMENT UPDATE ===\n');
  
  // Enrichment data for existing firms
  const enrichments = [
    {
      company: 'Lightyear Capital',
      contactName: 'Daniel Stencel',
      title: 'Managing Director & CFO',
      email: 'dstencel@lycap.com',
      linkedin: 'https://www.linkedin.com/in/danielstencel',
      status: 'Enriched',
      notes: 'Email pattern verified via Adapt.io/RocketReach. Alternative contact: Mark Vassallo (Managing Partner). Mid-market PE, financial services focus.'
    },
    {
      company: 'Thomas H. Lee Partners',
      contactName: 'Zachary Gut',
      title: 'Managing Director',
      email: 'zgut@thl.com',
      linkedin: 'https://www.linkedin.com/in/zachary-gut',
      status: 'Enriched',
      notes: 'Email verified via ContactOut. Focus: SaaS, technology. Boston-based mid-market PE.'
    }
  ];
  
  // New firms to add
  const newFirms = [
    {
      company: 'VSS Capital Partners',
      website: 'https://www.vss.com',
      contactName: 'David Fann',
      title: 'Partner & Senior Managing Director',
      email: 'fannd@vss.com',
      linkedin: 'https://www.linkedin.com/company/vsscapitalpartners',
      status: 'Enriched',
      notes: 'Email found on official contact page. Lower middle-market PE, healthcare/business services/education focus. NY-based.',
      notebookLM: ''
    },
    {
      company: 'Audax Private Equity',
      website: 'https://www.audaxprivateequity.com',
      contactName: '',
      title: '',
      email: '',
      linkedin: 'https://www.linkedin.com/company/audax-private-equity',
      status: 'Research Needed',
      notes: '$19B AUM. Mid-market PE, industrial services & technology solutions. Boston/SF. No public emails found.',
      notebookLM: ''
    },
    {
      company: 'Gryphon Investors',
      website: 'https://www.gryphon-inv.com',
      contactName: 'David Andrews',
      title: 'Founder & Co-CEO',
      email: 'dandrews@gryphoninvestors.com',
      linkedin: 'https://www.gryphon-inv.com/team/',
      status: 'Research Needed - Verify Email',
      notes: 'Email pattern found via RocketReach (a******@gryphoninvestors.com). San Francisco. Alt: Marcelo Silva (MD).',
      notebookLM: ''
    },
    {
      company: 'Ridgemont Equity Partners',
      website: 'https://www.ridgemontep.com',
      contactName: 'Rob Edwards',
      title: 'Managing Partner',
      email: 'redwards@ridgemontep.com',
      linkedin: 'https://www.linkedin.com/company/ridgemont-equity-partners',
      status: 'Enriched',
      notes: 'Email verified via AllBiz directory. $2.35B fund closed 2022. Charlotte-based. Focus: mid-market growth companies.',
      notebookLM: ''
    }
  ];
  
  // Find rows to update
  for (const enrichment of enrichments) {
    const rowIndex = allRows.findIndex(row => row[0] === enrichment.company);
    if (rowIndex > 0) {
      console.log(`Updating ${enrichment.company} at row ${rowIndex + 1}`);
      
      // Update the row
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!C${rowIndex + 1}:L${rowIndex + 1}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[
            enrichment.contactName,
            enrichment.title,
            enrichment.email,
            allRows[rowIndex][5] || '', // website
            enrichment.linkedin,
            enrichment.status,
            enrichment.notes,
            '', // Status
            '', // Last Contacted
            ''  // Notes
          ]]
        }
      });
      
      console.log(`✓ Updated ${enrichment.company}\n`);
    } else {
      console.log(`! ${enrichment.company} not found in sheet\n`);
    }
  }
  
  // Add new firms
  console.log('\n=== ADDING NEW FIRMS ===\n');
  
  const newRows = newFirms.map(firm => [
    firm.company,
    firm.website,
    firm.contactName,
    firm.title,
    firm.email,
    firm.linkedin,
    '', // NotebookLM
    firm.status,
    firm.notes,
    '', // Status
    '', // Last Contacted
    ''  // Notes
  ]);
  
  if (newRows.length > 0) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:L',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: newRows
      }
    });
    
    console.log(`✓ Added ${newRows.length} new firms to sheet:\n`);
    newFirms.forEach(firm => {
      console.log(`  - ${firm.company} (${firm.status})`);
    });
  }
  
  console.log('\n=== SUMMARY ===');
  console.log(`Enriched: ${enrichments.length} existing firms`);
  console.log(`Added: ${newFirms.length} new firms`);
  console.log('Total updates: ' + (enrichments.length + newFirms.length));
}

main().catch(console.error);
