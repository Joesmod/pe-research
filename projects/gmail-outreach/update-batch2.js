const {google} = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const updates = [
  {
    row: 767,
    firm: 'Next Sparc Growth Partners',
    contactName: 'Len Pagon Jr.',
    title: 'Chairman & CEO',
    email: 'len.pagon@nextsparc.com',
    linkedin: 'https://nextsparc.com/team/',
    status: 'Partial',
    notes: 'Founded Next Sparc in 2009 after sale of Brulant. Email from ContactOut (not official source). Cleveland-based. (Researched 2026-03-06)'
  },
  {
    row: 773,
    firm: 'Pathway Capital Management',
    status: 'Dead - Not Direct PE',
    notes: 'Fund-of-funds / secondaries investor. Does not invest directly in operating companies. (Researched 2026-03-06)'
  },
  {
    row: 776,
    firm: 'PPC (Pritzker Private Capital)',
    contactName: 'Paul J. Carbone',
    title: 'President & Managing Partner',
    email: 'pcarbone@ppcpartners.com',
    linkedin: 'https://www.ppcpartners.com',
    status: 'Partial',
    notes: 'Also: Anthony N. Pritzker (Chairman & CEO). Email from ContactOut. Chicago-based, middle-market PE. (Researched 2026-03-06)'
  },
  {
    row: 779,
    firm: 'Quake Capital Partners',
    status: 'Dead - Early Stage VC',
    notes: 'Early-stage venture capital, not mid-market PE. Austin-based. Team names not published. (Researched 2026-03-06)'
  }
];

(async () => {
  const sheets = google.sheets({version: 'v4', auth});
  const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  for (const update of updates) {
    const range = `Sheet1!A${update.row}:K${update.row}`;
    
    // Read current row
    const readRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range
    });
    
    const currentRow = readRes.data.values ? readRes.data.values[0] : [];
    
    // Update fields
    if (update.contactName) currentRow[2] = update.contactName;
    if (update.title) currentRow[3] = update.title;
    if (update.email) currentRow[4] = update.email;
    if (update.linkedin) currentRow[6] = update.linkedin;
    if (update.notes) currentRow[8] = update.notes;
    if (update.status) currentRow[9] = update.status;
    currentRow[10] = new Date().toISOString().split('T')[0];
    
    // Write back
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range,
      valueInputOption: 'RAW',
      resource: {
        values: [currentRow]
      }
    });
    
    console.log(`✓ Updated row ${update.row}: ${update.firm}`);
  }
  
  console.log('\nBatch 2 complete!');
})();
