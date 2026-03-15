const { google } = require('googleapis');

async function enrichBatch2() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Additional enrichments
  const enrichments = [
    {
      firmName: 'HCI Equity Partners',
      contactName: 'Douglas McCormick',
      title: 'Co-Founder, Managing Partner & CIO',
      email: '',
      linkedin: 'https://www.linkedin.com/in/douglasmccormick',
      status: 'Needs Manual Research',
      notes: 'Co-Founder & CIO - former Morgan Stanley IB, West Point graduate, author of Family Inc. No direct email on official site.',
      source: 'https://www.hciequity.com/our-people/doug-mccormick/'
    },
    {
      firmName: 'Gryphon Investors',
      contactName: 'R. David Andrews',
      title: 'Founder & Co-CEO',
      email: '',
      linkedin: '',
      status: 'Needs Manual Research',
      notes: 'Founder & Co-CEO with Nicholas Orum as Co-CEO/Co-CIO. Team page available but no individual emails listed.',
      source: 'https://www.gryphon-inv.com/team/'
    },
    {
      firmName: 'Pamlico Capital',
      contactName: 'Watts Hamrick',
      title: 'Managing Partner',
      email: '',
      linkedin: 'https://www.linkedin.com/in/watts-hamrick-98912069',
      status: 'Needs Manual Research',
      notes: 'Managing Partner - joined Pamlico in 1988. Charlotte-based. No direct email on official site.',
      source: 'LinkedIn'
    },
    {
      firmName: 'Brighton Park Capital',
      contactName: 'Mark Dzialga',
      title: 'Founder & Managing Partner',
      email: '',
      linkedin: 'https://www.linkedin.com/in/mark-dzialga-109893172',
      status: 'Needs Manual Research',
      notes: 'Founder & MP - previously Managing Director at General Atlantic. Investment Committee member.',
      source: 'https://www.bpc.com/team/mark-f-dzialga'
    }
  ];

  // Read current sheet data
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:I',
  });
  
  const rows = result.data.values;
  console.log(`Found ${rows.length} total rows in sheet`);

  // Process each enrichment
  for (const enrich of enrichments) {
    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      const firmName = rows[i][0] || '';
      if (firmName.toLowerCase().includes(enrich.firmName.toLowerCase())) {
        rowIndex = i;
        break;
      }
    }

    if (rowIndex === -1) {
      console.log(`⚠️  Firm not found: ${enrich.firmName}`);
      continue;
    }

    const updates = [];
    
    if (enrich.contactName) {
      updates.push({
        range: `Sheet1!C${rowIndex + 1}`,
        values: [[enrich.contactName]]
      });
    }
    
    if (enrich.title) {
      updates.push({
        range: `Sheet1!D${rowIndex + 1}`,
        values: [[enrich.title]]
      });
    }
    
    if (enrich.linkedin) {
      updates.push({
        range: `Sheet1!G${rowIndex + 1}`,
        values: [[enrich.linkedin]]
      });
    }
    
    if (enrich.status) {
      updates.push({
        range: `Sheet1!H${rowIndex + 1}`,
        values: [[enrich.status]]
      });
    }
    
    const existingNotes = rows[rowIndex][8] || '';
    const newNotes = existingNotes 
      ? `${existingNotes} | ${enrich.notes}` 
      : enrich.notes;
    
    updates.push({
      range: `Sheet1!I${rowIndex + 1}`,
      values: [[newNotes]]
    });

    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          data: updates,
          valueInputOption: 'RAW'
        }
      });
      console.log(`✅ Updated: ${enrich.firmName} (Row ${rowIndex + 1})`);
    }
  }

  console.log('\n🎯 Batch 2 enrichment complete!');
}

enrichBatch2().catch(console.error);
