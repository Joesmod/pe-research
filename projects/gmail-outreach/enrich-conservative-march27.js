const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Conservative enrichment: only updating Contact Names + LinkedIn + Titles from verified official sources
// Leaving email blank when not found on official published pages
// Status: "Needs Email" for further research
const updates = [
  // Row 31: soundgrowth - Kyle Largent, Managing Partner (from official team page)
  [31, 'Kyle Largent', '', 'Needs Email', 'Managing Partner', 'https://www.linkedin.com/in/kyle-largent-a1b2676/', 'From soundgrowthpartners.com/team on 2026-03-27; email not published'],
  
  // Row 39: highlander - Michael Knigin, Managing Director (from official team page)
  [39, 'Michael Knigin', '', 'Needs Email', 'Managing Director', '', 'From highlander-partners.com/team on 2026-03-27; email not published'],
  
  // Row 40: hig - Keval Patel, MD & Head of U.S. Middle Market (from hig.com team directory)
  [40, 'Keval Patel', '', 'Needs Email', 'Managing Director & Head of U.S. Middle Market', '', 'From hig.com/team on 2026-03-27; email not published'],
  
  // Row 44: thomabravo - Seth Boro, Managing Partner (from Wikipedia and official site)
  [44, 'Seth Boro', '', 'Needs Email', 'Managing Partner', '', 'From thomabravo.com and Wikipedia on 2026-03-27; email not published'],
  
  // Row 48: kainos - Claire Bissot, Managing Director (from press release Jan 2025)
  [48, 'Claire Bissot', '', 'Needs Email', 'Managing Director', '', 'From kainoscapital.com press release on 2026-03-27; email not published'],
];

async function enrichLeads() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });

  console.log(`📊 Conservative Enrichment: Updating ${updates.length} rows with verified Contact Names\n`);

  const batchData = updates.map(([row, contact, email, status, title, linkedin, notes]) => ({
    range: `Outreach Log!C${row}:I${row}`,
    values: [[contact, email, '', status, title, linkedin, notes]]
  }));

  const res = await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data: batchData,
    },
  });

  console.log(`✅ Updated ${res.data.totalUpdatedRows} rows in Google Sheet\n`);
  
  console.log('🎯 Enriched Contacts (Name + Title verified):');
  updates.forEach(([row, contact, email, status, title]) => {
    console.log(`  Row ${row}: ${contact} - ${title}`);
  });
  
  console.log('\n📝 Summary:');
  console.log('- All names and titles verified from official sources (company websites, press releases)');
  console.log('- LinkedIn URLs added where found');
  console.log('- Email addresses left blank (not found on official published sources)');
  console.log('- Status: "Needs Email" for follow-up research');
  console.log('\n💡 Next Steps:');
  console.log('- Search for investor relations contact pages');
  console.log('- Check SEC filings for contact information');
  console.log('- Review press releases for media contact emails');
  console.log('- Use LinkedIn InMail or company contact forms');
}

enrichLeads().catch(console.error);
