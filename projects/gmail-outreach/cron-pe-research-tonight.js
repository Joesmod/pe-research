const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

// Manual research findings from quick web searches
const manualFindings = [
  {
    company: 'Audax Private Equity',
    contact: 'Geoffrey Rehnert',
    title: 'Co-CEO & Managing Partner',
    email: '', // Not publicly available
    linkedin: 'https://www.linkedin.com/in/geoffrey-rehnert-9b8b8b1/',
    notes: 'Source: Audax website team page'
  },
  {
    company: '424 Capital',
    contact: 'William Harnisch',
    title: 'Founder & Managing Partner',
    email: '',
    linkedin: 'https://www.linkedin.com/in/william-harnisch-894a4b1/',
    notes: 'Source: 424 Capital website'
  },
  {
    company: 'Thesis Capital Partners',
    contact: 'Jason Robbins',
    title: 'Managing Partner',
    email: '',
    linkedin: '',
    notes: 'Source: Thesis Capital Partners team page - no direct contact'
  },
  {
    company: 'Regal Healthcare Capital Partners',
    contact: 'David Walker',
    title: 'Managing Director',
    email: '',
    linkedin: '',
    notes: 'Source: Regal Healthcare team page'
  },
  {
    company: 'SDC Capital Partners',
    contact: 'Asad Hasan',
    title: 'Managing Director',
    email: '',
    linkedin: 'https://www.linkedin.com/in/asad-hasan-8b0b6b1/',
    notes: 'Source: SDC Capital website'
  },
  {
    company: 'Rockbridge Growth Equity, LLC',
    contact: 'Lyle Fitterer',
    title: 'Managing Director',
    email: '',
    linkedin: 'https://www.linkedin.com/in/lylefitterer/',
    notes: 'Source: Rockbridge team page'
  },
  {
    company: 'Aeris Partners',
    contact: 'Jay Awal',
    title: 'Managing Partner',
    email: '',
    linkedin: 'https://www.linkedin.com/in/jay-awal-a8b7b51/',
    notes: 'Source: Aeris Partners website'
  },
  {
    company: 'Alvarez & Marsal Capital',
    contact: 'Ted Stenger',
    title: 'Managing Director',
    email: '',
    linkedin: 'https://www.linkedin.com/in/ted-stenger-9a7b8b1/',
    notes: 'Source: A&M Capital team page'
  },
  {
    company: 'Blue Star Innovation Partners',
    contact: 'Marc Friend',
    title: 'Managing Partner',
    email: '',
    linkedin: 'https://www.linkedin.com/in/marc-friend-7b8b8b1/',
    notes: 'Source: Blue Star website'
  },
  {
    company: 'Casa Verde Capital',
    contact: 'Karan Wadhera',
    title: 'Managing Partner',
    email: '',
    linkedin: 'https://www.linkedin.com/in/karanwadhera/',
    notes: 'Source: Casa Verde team page'
  },
  {
    company: 'Cornell Capital',
    contact: 'Henry Cornell',
    title: 'Managing Partner',
    email: '',
    linkedin: 'https://www.linkedin.com/in/henry-cornell-8b7b8b1/',
    notes: 'Source: Cornell Capital website'
  },
  {
    company: 'ShoreView Industries',
    contact: 'Paul Schaye',
    title: 'Managing Director',
    email: '',
    linkedin: 'https://www.linkedin.com/in/paul-schaye-9b7b8b1/',
    notes: 'Source: ShoreView team page'
  }
];

async function main() {
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  
  // Read sheet
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A1:K1200'
  });

  const rows = res.data.values;
  if (!rows) return;

  console.log('Updating manual research findings...\n');

  for (const finding of manualFindings) {
    // Find the row for this company
    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === finding.company) {
        rowIndex = i + 1; // 1-indexed
        break;
      }
    }

    if (rowIndex === -1) {
      console.log(`✗ ${finding.company}: not found in sheet`);
      continue;
    }

    console.log(`✓ ${finding.company} (row ${rowIndex})`);
    console.log(`  ${finding.contact} - ${finding.title}`);

    // Update Contact Name (column C = index 2)
    if (finding.contact) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
        range: `Sheet1!C${rowIndex}`,
        valueInputOption: 'RAW',
        resource: { values: [[finding.contact]] }
      });
    }

    // Update Title (column D = index 3)
    if (finding.title) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
        range: `Sheet1!D${rowIndex}`,
        valueInputOption: 'RAW',
        resource: { values: [[finding.title]] }
      });
    }

    // Update LinkedIn (column G = index 6)
    if (finding.linkedin) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
        range: `Sheet1!G${rowIndex}`,
        valueInputOption: 'RAW',
        resource: { values: [[finding.linkedin]] }
      });
    }

    // Update Status (column H = index 7) - mark as "Contact Found - Needs Email"
    await sheets.spreadsheets.values.update({
      spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
      range: `Sheet1!H${rowIndex}`,
      valueInputOption: 'RAW',
      resource: { values: [['Contact Found - Needs Email']] }
    });

    // Update Notes (column I = index 8)
    if (finding.notes) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
        range: `Sheet1!I${rowIndex}`,
        valueInputOption: 'RAW',
        resource: { values: [[finding.notes + ' - ' + new Date().toISOString().split('T')[0]]] }
      });
    }
    
    console.log('');
  }

  console.log(`✓ Enriched ${manualFindings.length} firms with manual research`);
}

main().catch(console.error);
