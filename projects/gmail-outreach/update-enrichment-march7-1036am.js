const { google } = require('googleapis');

// Enriched contacts from research (March 7, 2026 10:36 AM)
const updates = [
  {
    company: 'Vistria Group',
    contact: 'Kip Kirkpatrick',
    title: 'Co-Founder & Co-CEO',
    email: 'kkirkpatrick@vistria.com',
    linkedin: 'https://www.linkedin.com/in/kip-kirkpatrick-309689147',
    notes: 'Co-CEO with Martin Nesbitt. $8B+ AUM. Healthcare & education focus. Email verified from ContactOut.',
    status: 'Enriched'
  },
  {
    company: 'Anzu Partners',
    contact: 'David Michael',
    title: 'Co-Founder & Managing Partner',
    email: 'dmichael@anzupartners.com',
    linkedin: 'https://www.linkedin.com/in/dmichael',
    notes: 'Industrial tech & life sciences VC. $190M Fund II. Email pattern verified from RocketReach.',
    status: 'Enriched'
  },
  {
    company: 'Arctos',
    contact: 'Ian Charles',
    title: 'Co-Managing Partner & Founder',
    email: 'icharles@arctospartners.com',
    linkedin: 'https://www.linkedin.com/in/iancharles',
    notes: 'Sports PE leader. $3B+ Fund I. Co-Managing Partner with David O\'Connor. Email pattern from RocketReach.',
    status: 'Enriched'
  },
  {
    company: 'Renovus Capital Partners',
    contact: 'Jason Tanker',
    title: 'Managing Director',
    email: 'jtanker@renovuscapital.com',
    linkedin: '',
    notes: 'Education/training/human capital PE. $2B+ committed capital. 100+ investments. Email pattern from ContactOut.',
    status: 'Enriched'
  },
  {
    company: '25madison',
    contact: 'Steven Price',
    title: 'Managing Partner & CEO',
    email: 'sprice@25madison.com',
    linkedin: 'https://www.linkedin.com/in/steven-price-92009514',
    notes: 'Company builder PE. Founder/Chairman of Townsquare Media. Email pattern inferred.',
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
    
    console.log(`\n✅ Successfully updated ${updatedCount} firms in the sheet!`);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

updateSheet();
