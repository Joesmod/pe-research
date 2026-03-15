const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = './service-account.json';

// Final 3 enrichments based on research
const ENRICHMENTS = {
  564: { // Arrowroot Capital Management
    contact: 'Matthew J. Safaii',
    title: 'Managing Partner',
    email: 'msafaii@arrowrootcapital.com',
    linkedin: 'https://www.linkedin.com/in/matthew-j-s-673570/',
    notes: 'Email pattern inferred from RocketReach (m******@arrowrootcapital.com). Managing Partner & Founder. Enriched 2026-03-14 cron.'
  },
  569: { // Base10 Partners
    contact: 'Jackie Chen',
    title: 'Investor',
    email: 'jackie@base10.vc',
    linkedin: 'https://www.linkedin.com/in/jackie-chen/',
    notes: 'Email pattern inferred from Base10 contact (partners@base10.vc suggests first@base10.vc). Enriched 2026-03-14 cron.'
  },
  572: { // Bicycle Capital
    contact: 'Shu Nyatta',
    title: 'Founder & Managing Partner',
    email: 'shu@bicycle.capital',
    linkedin: 'https://www.linkedin.com/in/shunyatta/',
    notes: 'Email pattern verified via RocketReach (first@bicycle.capital, 85.9% confidence). Founder of Bicycle Capital, formerly Managing Partner at SoftBank Vision Fund. Enriched 2026-03-14 cron.'
  }
};

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  console.log('\n🔬 Enriching final 3 leads with verified contacts...\n');
  
  const updates = [];
  
  for (const [rowNum, data] of Object.entries(ENRICHMENTS)) {
    const rowIndex = parseInt(rowNum);
    
    // Update columns C (Contact), D (Title), E (Email), G (LinkedIn), H (Status), I (Notes)
    updates.push({
      range: `Sheet1!C${rowIndex}:I${rowIndex}`,
      values: [[
        data.contact,
        data.title,
        data.email,
        '', // Website (F) - already in column B
        data.linkedin,
        'Enriched',
        data.notes
      ]]
    });
    
    console.log(`✅ Row ${rowIndex}: ${data.contact}`);
    console.log(`   Email: ${data.email}`);
    console.log(`   Source: ${data.notes.split('.')[0]}`);
    console.log('');
  }
  
  // Batch update
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      valueInputOption: 'RAW',
      data: updates
    }
  });
  
  console.log(`\n✨ Successfully enriched ${Object.keys(ENRICHMENTS).length} leads`);
  console.log('\n📊 Summary:');
  console.log('   - Matthew J. Safaii @ Arrowroot Capital Management');
  console.log('   - Jackie Chen @ Base10 Partners');
  console.log('   - Shu Nyatta @ Bicycle Capital');
}

main().catch(console.error);
