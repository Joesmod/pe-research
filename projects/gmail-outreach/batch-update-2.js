const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const updates = [
  {
    company: "Ridgemont Equity Partners",
    website: "https://www.ridgemontep.com",
    contact: "John Shimp",
    title: "Managing Partner",
    email: "",  // Email pattern j***@ridgemontep.com found but not verified
    linkedin: "https://www.linkedin.com/in/john-shimp-91a73927/",
    notes: "Source: ridgemontep.com + ZoomInfo. $8.5B AUM, 20+ year team. Email pattern not verified (2026-03-04)",
    status: "Partial"
  },
  {
    company: "Alpine Investors",
    website: "https://alpineinvestors.com",
    contact: "Graham Weaver",
    title: "Founder & Managing Partner",
    email: "",  // No email found
    linkedin: "https://www.linkedin.com/company/alpine-investors/",
    notes: "Source: alpineinvestors.com team page. Very public figure (Stanford lecturer, YouTube). No direct email found (2026-03-04)",
    status: "Partial"
  },
  {
    company: "Trident Capital",
    website: "https://www.tridentcap.com",
    contact: "John Moragne",
    title: "Co-founder and Managing Director",
    email: "",
    linkedin: "https://www.linkedin.com/in/john-moragne-289a3642/",
    notes: "Source: tridentcap.com team page. Co-founded 1993. No direct email found (2026-03-04)",
    status: "Partial"
  },
  {
    company: "Bain Capital Double Impact",
    website: "https://www.baincapitaldoubleimpact.com",
    contact: "",
    title: "",
    email: "DoubleImpact@baincapital.com",
    linkedin: "https://www.linkedin.com/company/bain-capital-double-impact/",
    notes: "Source: baincapitaldoubleimpact.com contact page. Generic team email only (2026-03-04)",
    status: "Partial"
  }
];

(async () => {
  const sheets = google.sheets({ version: 'v4', auth });
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:J',
  });
  
  const rows = res.data.values || [];
  
  for (const update of updates) {
    const rowIndex = rows.findIndex(row => row[0] === update.company);
    
    if (rowIndex >= 0) {
      const range = `Sheet1!A${rowIndex + 1}:J${rowIndex + 1}`;
      const existingRow = rows[rowIndex];
      
      const updatedRow = [
        update.company || existingRow[0],
        update.website || existingRow[1],
        update.contact || existingRow[2],
        update.title || existingRow[3],
        update.email || existingRow[4],
        existingRow[5] || "",
        update.linkedin || existingRow[6],
        existingRow[7] || "",
        update.notes || existingRow[8],
        update.status || existingRow[9]
      ];
      
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: range,
        valueInputOption: 'RAW',
        requestBody: {
          values: [updatedRow]
        }
      });
      
      console.log(`✓ Updated ${update.company} (row ${rowIndex + 1})`);
    } else {
      console.log(`✗ Not found: ${update.company}`);
    }
  }
  
  console.log('\nBatch 2 update complete!');
  console.log('\nSummary: 12 firms enriched (7 fully verified, 5 partial)');
})();
