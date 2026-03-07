const { google } = require('googleapis');
const fs = require('fs');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const enrichments = [
  {
    row: 733,
    company: "Davidson Kempner Capital Management",
    contact: "Gabriel Schwartz",
    title: "Co-Deputy Managing Partner, Global Head of Sales",
    email: "gschwartz@davidsonkempner.com",
    linkedin: "https://www.linkedin.com/in/gabriel-schwartz-040a47202/",
    status: "Enriched",
    notes: "Email pattern verified: {first_initial}{last}@davidsonkempner.com. Partner-level contact. Source: ContactOut 3/7/26"
  },
  {
    row: 750,
    company: "Highland Capital Partners",
    contact: "Dan Nova",
    title: "General Partner",
    email: "dnova@hcp.com",
    linkedin: "https://www.linkedin.com/in/dan-nova-bba09946/",
    status: "Enriched",
    notes: "Email pattern verified: {first_initial}{last}@hcp.com. GP since 1996. VC firm, $7B AUM. Source: RocketReach 3/7/26"
  },
  {
    row: 802,
    company: "Thrive Capital",
    contact: "Kareem Zaki",
    title: "General Partner",
    email: "kzaki@thrivecap.com",
    linkedin: "https://www.linkedin.com/in/kareemzaki/",
    status: "Enriched",
    notes: "Alternative to Joshua Kushner. Forbes 30 Under 30. Source: LinkedIn/Crunchbase 3/7/26"
  }
];

// Mark non-PE firms as Dead
const markDead = [
  { row: 690, reason: "Wall Street Oasis - career forum, not PE" },
  { row: 691, reason: "Wall Street Prep - education company, not PE" },
  { row: 692, reason: "Wefunder - crowdfunding platform, not PE" },
  { row: 704, reason: "Apercen Partners - tax consulting, not PE" },
  { row: 737, reason: "Dynamics Search Partners - recruiting firm, not PE" },
  { row: 753, reason: "ILPA - trade association, not PE" },
  { row: 754, reason: "Investment Management Partners - recruiting, not PE" }
];

(async () => {
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  
  // Read headers
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:L1'
  });
  
  const headers = res.data.values[0];
  console.log('Headers:', headers);
  
  const contactIdx = headers.indexOf('Contact Name');
  const titleIdx = headers.indexOf('Title');
  const emailIdx = headers.indexOf('Email');
  const linkedinIdx = headers.indexOf('LinkedIn');
  const statusIdx = headers.indexOf('Status');
  const notesIdx = headers.indexOf('Notes');
  
  const updates = [];
  
  // Prepare enrichment updates
  for (const e of enrichments) {
    const range = `Sheet1!${String.fromCharCode(65 + contactIdx)}${e.row}:${String.fromCharCode(65 + notesIdx)}${e.row}`;
    const values = [[]];
    
    values[0][contactIdx] = e.contact;
    values[0][titleIdx] = e.title;
    values[0][emailIdx] = e.email;
    values[0][linkedinIdx] = e.linkedin;
    values[0][statusIdx] = e.status;
    values[0][notesIdx] = e.notes;
    
    // Fill any gaps with empty strings
    for (let i = 0; i < notesIdx + 1; i++) {
      if (values[0][i] === undefined) values[0][i] = '';
    }
    
    updates.push({
      range,
      values: [values[0].slice(contactIdx, notesIdx + 1)]
    });
    
    console.log(`✓ Enriched Row ${e.row}: ${e.company} - ${e.contact}`);
  }
  
  // Prepare Dead status updates
  for (const d of markDead) {
    const range = `Sheet1!${String.fromCharCode(65 + statusIdx)}${d.row}`;
    const notesRange = `Sheet1!${String.fromCharCode(65 + notesIdx)}${d.row}`;
    
    updates.push({
      range,
      values: [['Dead']]
    });
    
    updates.push({
      range: notesRange,
      values: [[d.reason]]
    });
    
    console.log(`✗ Marked Dead Row ${d.row}: ${d.reason}`);
  }
  
  // Batch update
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    resource: {
      valueInputOption: 'RAW',
      data: updates
    }
  });
  
  console.log(`\n✅ Successfully updated ${enrichments.length} enrichments and marked ${markDead.length} as Dead`);
  console.log('\n📊 Summary:');
  console.log(`   - Enriched: ${enrichments.length} firms (3 valid PE/VC targets)`);
  console.log(`   - Marked Dead: ${markDead.length} firms (non-PE companies)`);
  console.log(`   - Total rows updated: ${enrichments.length + markDead.length}`);
  
})().catch(console.error);
