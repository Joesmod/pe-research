const { google } = require('googleapis');

// Batch 2: Additional enriched contacts (March 7, 2026)
const updates = [
  {
    company: 'Edison Partners',
    contact: 'Chris Sugden',
    title: 'Managing Partner',
    email: 'csugden@edisonpartners.com',
    linkedin: 'https://www.linkedin.com/in/christopher-sugden',
    notes: 'Growth-stage VC, $275M Fund VIII. Princeton-based. Email pattern from RocketReach.',
    status: 'Enriched'
  },
  {
    company: 'Transom Capital Group',
    contact: 'Steve Kim',
    title: 'Managing Director',
    email: 'skim@transomcap.com',
    linkedin: '',
    notes: 'Operations-focused PE, $1.35B AUM. LA-based. Promoted to MD Jan 2025. Email from RocketReach.',
    status: 'Enriched'
  },
  {
    company: 'Shore Capital Partners',
    contact: 'Jeff Smith',
    title: 'Partner',
    email: 'jsmith@shorecp.com',
    linkedin: '',
    notes: 'Healthcare/F&B/services PE. Chicago-based. Promoted to Partner July 2025. Email from RocketReach.',
    status: 'Enriched'
  },
  {
    company: 'The Riverside Company',
    contact: 'Stewart Kohl',
    title: 'Co-Founder & Co-CEO',
    email: 'skohl@riversidecompany.com',
    linkedin: 'https://www.linkedin.com/in/stewart-kohl',
    notes: 'Global PE firm, 1000+ investments, 350+ employees, $10B+ AUM. Founded 1988. Email pattern from ZoomInfo.',
    status: 'Enriched'
  },
  {
    company: 'WestView Capital Partners',
    contact: 'Greg Thomas',
    title: 'Partner',
    email: 'gthomas@wvcapital.com',
    linkedin: '',
    notes: 'Boston lower-middle market PE, $2.7B AUM. Joined 2012. Email pattern inferred.',
    status: 'Enriched'
  },
  {
    company: 'H.I.G. Capital',
    contact: 'Sami Mnaymneh',
    title: 'Founder, Co-CEO & Co-Executive Chairman',
    email: 'smnaymneh@hig.com',
    linkedin: 'https://www.linkedin.com/in/sami-mnaymneh',
    notes: 'Global PE giant, $74B AUM, 500+ professionals, 19 offices. Co-founded 1993 with Tony Tamer. Email pattern inferred.',
    status: 'Enriched'
  }
];

async function updateSheet() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
    
    // Read current sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A:K'
    });
    
    const rows = response.data.values || [];
    console.log(`Total rows in sheet: ${rows.length}`);
    
    let updatedCount = 0;
    
    // Update each enriched firm
    for (const update of updates) {
      const rowIndex = rows.findIndex(r => r[0] === update.company);
      
      if (rowIndex === -1) {
        console.log(`Company not found: ${update.company}`);
        continue;
      }
      
      const row = rows[rowIndex];
      
      // Update fields: Contact (C), Title (D), Email (E), LinkedIn (G), Notes (I), Status (J)
      row[2] = update.contact;
      row[3] = update.title;
      row[4] = update.email;
      row[6] = update.linkedin || row[6] || '';
      row[8] = update.notes;
      row[9] = update.status;
      
      console.log(`✓ Updated: ${update.company} - ${update.contact} (${update.email})`);
      updatedCount++;
    }
    
    // Write back to sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Sheet1!A:K',
      valueInputOption: 'RAW',
      requestBody: {
        values: rows
      }
    });
    
    console.log(`\n✅ Successfully updated ${updatedCount} firms in batch 2!`);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

updateSheet();
