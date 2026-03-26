const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // First, get the current data to find column indices
  const getResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:N1500',
  });
  
  const rows = getResponse.data.values;
  const headers = rows[0];
  
  const contactIdx = headers.findIndex(h => h && h.toLowerCase().includes('contact') && h.toLowerCase().includes('name'));
  const titleIdx = headers.findIndex(h => h && h.toLowerCase().includes('title'));
  const emailIdx = headers.findIndex(h => h && h.toLowerCase().includes('email'));
  const statusIdx = headers.findIndex(h => h && h.toLowerCase().includes('status'));
  const notesIdx = headers.findIndex(h => h && h.toLowerCase().includes('notes'));

  console.log(`\nUpdating enrichment findings for 10 firms...\n`);

  const updates = [
    {
      row: 18,
      company: 'Gryphon Investors',
      contact: 'Keith Stimson',
      title: 'Deal Partner & Head of Heritage Fund',
      email: 'kstimson@gryphoninvestors.com',
      status: 'Enriched',
      notes: 'Email pattern verified via RocketReach. Keith Stimson listed on official Gryphon team page. [2026-03-25 10PM cron]'
    },
    {
      row: 36,
      company: 'Cressey & Company',
      contact: 'Bryan Cressey',
      title: 'Managing Partner',
      email: 'bcressey@cresseyco.com',
      status: 'Enriched',
      notes: 'Email verified via ContactOut. Managing Partner per official website. Pioneer in healthcare PE investing. [2026-03-25 10PM cron]'
    },
    {
      row: 39,
      company: 'Ampersand Capital Partners',
      contact: 'Herb Hooper',
      title: 'Managing Partner',
      email: 'hhooper@ampersandcapital.com',
      status: 'Enriched',
      notes: 'Email pattern verified via RocketReach/ContactOut. Managing Partner, joined 2002. Healthcare-focused PE. [2026-03-25 10PM cron]'
    },
    {
      row: 55,
      company: 'Clearview Capital',
      contact: 'William Case',
      title: 'Managing Partner',
      email: 'wcase@clearviewcap.com',
      status: 'Enriched',
      notes: 'Email pattern verified via RocketReach (first_initial+last@clearviewcap.com). Bill Case, Managing Partner since 2002. [2026-03-25 10PM cron]'
    },
    {
      row: 68,
      company: 'Pamlico Capital',
      contact: 'Watts Hamrick',
      title: 'Managing Partner',
      email: 'watts.hamrick@pamlicocapital.com',
      status: 'Enriched',
      notes: 'Email VERIFIED from official Pamlico team page https://www.pamlicocapital.com/team/l-watts-hamrick-iii. Managing Partner since 1988. [2026-03-25 10PM cron]'
    },
    {
      row: 192,
      company: 'NewSpring Capital',
      contact: 'Michael DiPiano',
      title: 'Managing General Partner & Co-Founder',
      email: 'mdipiano@newspringcapital.com',
      status: 'Enriched',
      notes: 'Email pattern verified via RocketReach. Managing General Partner and co-founder. Growth equity focus. [2026-03-25 10PM cron]'
    },
    {
      row: 361,
      company: 'K1 Investment Management',
      contact: 'Ron Cano',
      title: 'Managing Partner',
      email: 'rcano@k1capital.com',
      status: 'Enriched',
      notes: 'Email pattern verified via RocketReach/ZoomInfo. Managing Partner. Enterprise software focus. [2026-03-25 10PM cron]'
    },
    {
      row: 375,
      company: 'Kinzie Capital Partners LP',
      contact: 'Suzanne Yoon',
      title: 'Founder & Managing Partner',
      email: 'syoon@kinziecp.com',
      status: 'Enriched',
      notes: 'Email pattern verified via RocketReach. Founder and Managing Partner, launched firm in 2017. Lower middle market focus. [2026-03-25 10PM cron]'
    },
    {
      row: 135,
      company: 'Leeds Equity Partners',
      contact: 'Jeffrey Leeds',
      title: 'President',
      email: '',
      status: 'Needs Email',
      notes: 'Co-Founder & President. No direct business email found (only personal Gmail shown in RocketReach). Alternative: firm main line (212) 835-2000. [2026-03-25 10PM cron]'
    },
    {
      row: 603,
      company: 'Erez Capital',
      contact: 'Michael Benezra',
      title: 'Managing Partner & Founder',
      email: '',
      status: 'Needs Email',
      notes: 'Managing Partner & Founder (founded 2022). Early-stage VC in Boston, pre-seed focus. No direct business email publicly available (only personal Comcast shown in RocketReach). [2026-03-25 10PM cron]'
    }
  ];

  let enriched = 0;
  let failed = 0;

  // Batch update data
  const batchData = [];
  
  for (const update of updates) {
    try {
      const rowIndex = update.row - 1; // Convert to 0-indexed
      const rowData = rows[rowIndex] || [];
      
      // Prepare row updates
      if (update.contact && contactIdx >= 0) rowData[contactIdx] = update.contact;
      if (update.title && titleIdx >= 0) rowData[titleIdx] = update.title;
      if (update.email && emailIdx >= 0) rowData[emailIdx] = update.email;
      if (update.status && statusIdx >= 0) rowData[statusIdx] = update.status;
      if (update.notes && notesIdx >= 0) {
        const existingNotes = rowData[notesIdx] || '';
        rowData[notesIdx] = existingNotes ? `${update.notes}\n\n${existingNotes}` : update.notes;
      }
      
      // Ensure row has enough cells
      while (rowData.length < Math.max(contactIdx, titleIdx, emailIdx, statusIdx, notesIdx) + 1) {
        rowData.push('');
      }
      
      batchData.push({
        range: `Sheet1!A${update.row}:N${update.row}`,
        values: [rowData.slice(0, headers.length)]
      });
      
      if (update.email) {
        console.log(`✓ Row ${update.row}: ${update.company} - ${update.contact} - ${update.email}`);
        enriched++;
      } else {
        console.log(`⚠ Row ${update.row}: ${update.company} - ${update.contact} - No email found`);
        failed++;
      }
    } catch (error) {
      console.error(`✗ Row ${update.row}: ${update.company} - ${error.message}`);
      failed++;
    }
  }
  
  // Execute batch update
  if (batchData.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: batchData
      }
    });
  }

  console.log(`\n================================================================================`);
  console.log(`ENRICHMENT COMPLETE`);
  console.log(`  ✓ Successfully enriched: ${enriched} firms`);
  console.log(`  ⚠ No email found: ${failed} firms`);
  console.log(`================================================================================\n`);
}

main().catch(console.error);
