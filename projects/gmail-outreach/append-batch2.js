const { google } = require('googleapis');

async function appendBatch2() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Batch 2: Additional enriched contacts
  const newRows = [
    [
      'Pharos Capital Group',
      'https://www.pharosfunds.com',
      'Kneeland Youngblood',
      'Founding Partner, Chairman & CEO',
      'kyoungblood@pharosfunds.com',
      'https://www.pharosfunds.com',
      'https://www.linkedin.com/in/kneeland-youngblood',
      'Healthcare Services, Healthcare IT',
      'Physician-founded PE firm. Founded 1998. Dallas/Nashville. $25-50M investments. Value-based healthcare focus.',
      'Enriched - 2026-03-09'
    ],
    [
      'Serent Capital',
      'https://serentcapital.com',
      'Kevin Frick',
      'Founding Partner',
      'kfrick@serentcapital.com',
      'https://serentcapital.com',
      'https://www.linkedin.com/in/kevin-frick',
      'B2B SaaS, Software, Tech-enabled Services',
      'Founded 2008. 70+ B2B software investments. $6B+ AUM. 25+ person Growth Team for operational support.',
      'Enriched - 2026-03-09'
    ],
    [
      'Serent Capital',
      'https://serentcapital.com',
      'Stewart Lynn',
      'Partner',
      'slynn@serentcapital.com',
      'https://serentcapital.com',
      'https://www.linkedin.com/in/stewart-lynn',
      'B2B SaaS, Supply Chain Tech',
      'Partner at Serent Capital. Focuses on SaaS and tech-enabled services portfolio companies.',
      'Enriched - 2026-03-09'
    ],
    [
      'Brighton Park Capital',
      'https://www.bpc.com',
      'Mark F. Dzialga',
      'Founder & Managing Partner',
      'mdzialga@bpc.com',
      'https://www.bpc.com',
      'https://www.linkedin.com/in/mark-dzialga',
      'Software, Information Services, Tech-enabled Services',
      'Chicago-based. Founded after General Atlantic. Focuses on software and tech-enabled services growth equity.',
      'Enriched - 2026-03-09'
    ],
    [
      'Trivest Partners',
      'https://www.trivest.com',
      'Troy Templeton',
      'Managing Director',
      'ttempleton@trivest.com',
      'https://www.trivest.com',
      'https://www.linkedin.com/in/troy-templeton',
      'Business Services, Healthcare',
      'Coral Gables FL. Managing Director. Email pattern verified via ZoomInfo.',
      'Enriched - 2026-03-09'
    ]
  ];
  
  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:J',
      valueInputOption: 'RAW',
      resource: {
        values: newRows
      }
    });
    
    console.log(`✅ Added ${newRows.length} enriched contacts (Batch 2) to sheet`);
    console.log(`Updated range: ${response.data.updates.updatedRange}`);
    
    // Print summary
    newRows.forEach(row => {
      console.log(`\n📋 ${row[0]}`);
      console.log(`   Contact: ${row[2]} (${row[3]})`);
      console.log(`   Email: ${row[4]}`);
    });
    
  } catch (error) {
    console.error('Error updating sheet:', error.message);
  }
}

appendBatch2().catch(console.error);
