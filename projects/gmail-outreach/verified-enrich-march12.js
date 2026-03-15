const { google } = require('googleapis');

async function updateVerifiedContacts() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // ONLY verified contacts from official sources (websites, LinkedIn)
  // Emails ONLY if found on published sources - otherwise left blank
  const verified = [
    {
      row: 161,
      company: 'Thomas H. Lee Partners',
      contact: 'Scott Sperling',
      title: 'Co-Chief Executive Officer',
      email: '', // Not verified from published source
      linkedin: 'https://www.linkedin.com/in/scott-sperling-thl/',
      notes: 'Co-CEO verified from LinkedIn and THL press releases. Email pattern inferred but not verified from published source. Source: thl.com, LinkedIn, 2026-03-12'
    },
    {
      row: 176,
      company: 'Hg Capital',
      contact: 'Nic Humphries',
      title: 'Senior Partner & Executive Chairman',
      email: '', // Not verified
      linkedin: 'https://hgcapital.com/team/Nic-Humphries',
      notes: 'Executive Chairman, Head of Saturn fund. Verified from hgcapital.com/team. Email not found on published source. 2026-03-12'
    },
    {
      row: 220,
      company: 'WindPoint Partners',
      contact: 'Nathan Brown',
      title: 'Managing Director',
      email: '', // Email pattern suggested in sheet row 842 but not verified here
      linkedin: 'https://www.linkedin.com/in/nathan-brown-82bb71169/',
      notes: 'Managing Director, joined 1997. Verified from wppartners.com/team and LinkedIn. Email not published. 2026-03-12'
    },
    {
      row: 510,
      company: 'Edgewater Capital Partners',
      contact: 'Ryan Meany',
      title: 'Managing Partner',
      email: '', // Not verified
      linkedin: 'https://www.linkedin.com/in/ryan-meany-7309492a/',
      notes: 'Managing Partner & Chairman of Investment Committee. Verified from edgewatercapital.com/team. Email not published. 2026-03-12'
    },
    {
      row: 525,
      company: 'Levine Leichtman Capital Partners',
      contact: 'Matthew Frankel',
      title: 'Managing Partner & Co-Chairperson of the Investment Committee',
      email: '', // Not verified
      linkedin: 'https://www.llcp.com/team/',
      notes: 'Managing Partner & Co-Chair Investment Committee. Head of U.S. Investment Team. Verified from llcp.com/team. Email not published. 2026-03-12'
    },
    {
      row: 525,
      company: 'Levine Leichtman Capital Partners',
      contact: 'Jarett Moyse',
      title: 'Managing Director',
      email: '', // Not verified
      linkedin: '', // LinkedIn not found yet
      notes: 'Managing Director. Rejoined firm per press release. Verified from llcp.com press releases. Email not published. 2026-03-12'
    }
  ];

  console.log(`Updating ${verified.length} verified contacts in Google Sheet...\n`);

  for (const item of verified) {
    try {
      // Update columns: C=Contact, D=Title, E=Email, G=LinkedIn, J=Status, K=Notes
      const range = `Sheet1!C${item.row}:K${item.row}`;
      
      // Read current row to preserve existing data
      const currentData = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `Sheet1!A${item.row}:K${item.row}`
      });
      
      const currentRow = currentData.data.values ? currentData.data.values[0] : [];
      
      // Columns: A=Company, B=NotebookLM, C=Contact, D=Title, E=Email, F=Website, G=LinkedIn, H=Sector, I=Portfolio, J=Status, K=Notes
      const values = [[
        item.contact,           // C: Contact Name
        item.title,             // D: Title
        item.email || '',       // E: Email (blank if not verified)
        currentRow[5] || '',    // F: Website (preserve existing)
        item.linkedin,          // G: LinkedIn
        currentRow[7] || '',    // H: Sector Focus (preserve existing)
        currentRow[8] || '',    // I: Portfolio Companies (preserve existing)
        'Partial',              // J: Status (Partial = has contact but no email)
        item.notes              // K: Notes
      ]];

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        resource: { values }
      });

      console.log(`✓ Row ${item.row}: ${item.company} - ${item.contact} (${item.title})`);
      console.log(`  LinkedIn: ${item.linkedin}`);
      console.log(`  Email: ${item.email || 'NOT FOUND'}`);
      console.log('');
    } catch (error) {
      console.error(`✗ Row ${item.row}: ${item.company} - Error:`, error.message);
    }
  }

  console.log('\n✅ Enrichment complete!');
  console.log(`Total updated: ${verified.length} leads`);
  console.log('\nStatus: Partial (contact found, email verification needed)');
}

updateVerifiedContacts().catch(console.error);
