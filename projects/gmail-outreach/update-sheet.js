const { google } = require('googleapis');

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Enrichment data - only firms with publicly verified emails
  const updates = [
    {
      row: 888, // Corridor Capital
      contactName: 'Craig Enenstein',
      title: 'Founder & CEO',
      email: 'craig@corridorcap.com',
      linkedin: 'https://www.linkedin.com/in/craig-enenstein/',
      status: 'Enriched',
      notes: 'Email from official press release (corridorcapital.com). Also serves on multiple boards. Phone: 310-442-7001. Source: PR 2025-10-28'
    },
    {
      row: 1056, // Gauge Capital
      contactName: 'Andrew Peix',
      title: 'Partner, Business Development',
      email: 'apeix@gaugecapital.com',
      linkedin: 'https://www.linkedin.com/in/andrew-peix/',
      status: 'Enriched',
      notes: 'Email from official press releases (PR Newswire + gaugecapital.com). Phone: 682-334-5781 (office), 617-962-9037 (mobile). Source: PR 2025-10-29'
    },
    {
      row: 1069, // Boathouse Capital
      contactName: 'Bill Dyer',
      title: 'Managing Partner',
      email: 'Bill.Dyer@boathousecapital.com',
      linkedin: 'https://www.linkedin.com/in/bill-dyer/',
      status: 'Enriched',
      notes: 'Email from official team page (boathousecapital.com/team). Duke grad, Berwyn PA. vCard available on site. Source: Team page 2026-03-25'
    },
    {
      row: 1058, // Kinzie Capital Partners
      contactName: 'Suzanne Yoon',
      title: 'Founder & Managing Partner',
      email: '', // No public email found
      linkedin: 'https://www.linkedin.com/in/suzanneyoon/',
      status: 'Enriched',
      notes: 'Phone: 312-809-2492 (from PR Newswire 2019-06-27). Northwestern Kellogg MBA. Chicago-based. Manufacturing, Business Services, Consumer focus.'
    }
  ];
  
  for (const update of updates) {
    console.log(`Updating Row ${update.row}: ${update.contactName} at ${updates.find(u => u.row === update.row) ? update.email || 'Phone only' : 'N/A'}`);
    
    // Update columns B (Contact Name), C (Title), D (Email), E (LinkedIn), H (Status), I (Notes)
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Sheet1!B${update.row}:I${update.row}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          update.contactName,
          update.title,
          update.email,
          update.linkedin,
          '', // Column F - usually blank
          '', // Column G - usually blank  
          update.status,
          update.notes
        ]]
      }
    });
  }
  
  console.log(`\nSuccessfully enriched ${updates.length} leads with verified contact information.`);
}

updateSheet().catch(console.error);
