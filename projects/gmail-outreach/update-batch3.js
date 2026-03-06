const {google} = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const updates = [
  {
    row: 770,
    firm: 'Obra Capital',
    status: 'Dead - Not PE Firm',
    notes: 'Alternative asset manager focused on insurance-linked strategies and specialty credit. Not traditional middle-market PE. $6.9B AUM. (Researched 2026-03-06)'
  },
  {
    row: 775,
    firm: 'Plexus Capital, LLC',
    contactName: 'Michael Painter',
    title: 'Managing Partner, Owner',
    email: 'mpainter@plexuscap.com',
    linkedin: 'https://plexuscap.com/team/',
    status: 'Partial',
    notes: 'Lower middle-market PE (<$150M revenue). Other partners: Bob Anders, Mike Becker, Brad Pence. Email from ContactOut. (Researched 2026-03-06)'
  },
  {
    row: 781,
    firm: 'Rallyday Partners',
    contactName: 'Ryan Heckman',
    title: 'Co-Founder, Managing Partner & CEO',
    email: 'ryan@rallydaypartners.com',
    linkedin: 'https://rallydaypartners.com/people/ryan-heckman/',
    status: 'Enriched',
    notes: 'Denver-based PE. Email verified from official press release. Also: Frank A. Corvino, PhD (Managing Partner). (Researched 2026-03-06)'
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
  
  console.log('\nBatch 3 complete! Enrichment run finished.');
})();
