const { google } = require('googleapis');

async function addNewFirms() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

  // New firms to add
  const newFirms = [
    {
      company: 'New Harbor Capital',
      website: 'https://www.newharborcap.com',
      contact: 'Drew Nicholson',
      title: 'Partner',
      email: 'anicholson@newharborcap.com',
      linkedin: 'https://www.linkedin.com/in/drew-nicholson/',
      status: 'Enriched',
      notes: 'Email verified from official team page newharborcap.com/team/andrew-nicholson. Partner. Lower middle-market PE firm, ~$494M AUM, healthcare focus. Chicago-based. (Added 2026-03-15 cron)',
      companyInfo: 'https://www.newharborcap.com/healthcare-investments/',
      gumboScore: '8'
    },
    {
      company: 'Baymark Partners',
      website: 'https://baymarkpartners.com',
      contact: 'David J. Hook',
      title: 'Managing Director',
      email: 'david@baymarkpartners.com',
      linkedin: 'https://www.linkedin.com/company/baymark-partners/',
      status: 'Enriched',
      notes: 'Email verified from official contact page baymarkpartners.com/contact/thank-you. Managing Director since 1982, 50 investments, 14 IPOs. Dallas-based PE firm, mid-market IT/healthcare/business services. (Added 2026-03-15 cron)',
      companyInfo: 'https://baymarkpartners.com/about/',
      gumboScore: '7'
    },
    {
      company: 'Amulet Capital Partners',
      website: 'https://amuletcapital.com',
      contact: 'Ramsey Frank',
      title: 'President and Managing Partner',
      email: '',
      linkedin: 'https://www.linkedin.com/company/amulet-capital/',
      status: 'Needs Enrichment',
      notes: 'Middle-market healthcare-focused PE firm. ~$2.7B AUM. Greenwich, CT and Walnut Creek, CA. 12 platform investments, 34 add-ons. Raised $1.2B Fund III in 2024. No published email found. (Added 2026-03-15 cron)',
      companyInfo: 'https://amuletcapital.com/',
      gumboScore: '8'
    }
  ];

  console.log('Adding new firms to Google Sheet...\n');

  // Find the first empty row by reading the sheet
  const readResponse = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:A'
  });

  const rows = readResponse.data.values || [];
  let nextRow = rows.length + 1;

  for (const firm of newFirms) {
    console.log(`Adding row ${nextRow}: ${firm.company}`);
    
    // Columns: A=Company, B=Website, C=Contact, D=Title, E=Email, F=?, G=LinkedIn, H=Status, I=Notes, J=?, K=?, L=?, M=Company Info, N=Gumbo Score
    const range = `Sheet1!A${nextRow}:N${nextRow}`;
    const values = [[
      firm.company,       // A: Company Name
      firm.website,       // B: Website/NotebookLM
      firm.contact,       // C: Contact Name
      firm.title,         // D: Title
      firm.email,         // E: Email
      '',                 // F: (unknown column)
      firm.linkedin,      // G: LinkedIn
      firm.status,        // H: Status
      firm.notes,         // I: Notes
      '',                 // J: (unknown)
      '',                 // K: (unknown)
      '',                 // L: (unknown)
      firm.companyInfo,   // M: Company Info URL
      firm.gumboScore     // N: Gumbo Score
    ]];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      resource: { values }
    });

    console.log(`   ✅ Added`);
    nextRow++;
  }

  console.log('\n✅ New firms added!');
  console.log('\nSUMMARY:');
  console.log(`- Total new firms: ${newFirms.length}`);
  console.log(`- With verified emails: ${newFirms.filter(f => f.email).length}`);
  console.log(`- Need further enrichment: ${newFirms.filter(f => !f.email).length}`);
}

addNewFirms().catch(console.error);
