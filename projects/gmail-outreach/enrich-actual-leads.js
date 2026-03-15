const { google } = require('googleapis');

async function enrichLeads() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Enrichment data with row numbers
  const enrichments = [
    {
      row: 223, // Row 222 + 1 for header
      company: 'Harvest Partners (SCF)',
      contact: 'James Harter',
      title: 'Vice President',
      email: 'jharter@harvestpartners.com',
      linkedin: 'https://www.linkedin.com/in/james-harter',
      notes: 'Vice President, joined 2024. Source: harvestpartners.com/team, RocketReach verified'
    },
    {
      row: 478, // Row 477 + 1
      company: 'Palm Beach Capital',
      contact: 'Mike Schmickle',
      title: 'Partner',
      email: 'mschmickle@pbcap.com',
      linkedin: 'https://www.linkedin.com/in/mike-schmickle-839115bb',
      notes: 'Partner, key decision-maker. Source: ContactOut email format, Bloomberg'
    },
    {
      row: 500, // Row 499 + 1
      company: 'Aurora Capital Partners',
      contact: 'Andrew Wilson',
      title: 'Partner',
      email: 'awilson@auroracap.com',
      linkedin: 'https://www.linkedin.com/in/andrew-wilson',
      notes: 'Partner (promoted from Principal 2018). Joined 2008. Source: auroracap.com/team, RocketReach'
    },
    {
      row: 511, // Row 510 + 1
      company: 'Emerging Capital Partners - ECP',
      contact: 'Carolyn Campbell',
      title: 'Managing Director & Founding Partner',
      email: 'ccampbell@ecpinvestments.com',
      linkedin: 'https://www.linkedin.com/in/-carolyn-campbell',
      notes: 'Founding Partner, COO. Pan-African PE, $3B+ raised. Verified via ContactOut (campbellc@ecpinvestments.com alternate). Source: ecpinvestments.com/team'
    },
    {
      row: 842, // Row 841 + 1
      company: 'Wind Point Partners',
      contact: 'Nathan Brown',
      title: 'Managing Director',
      email: 'nbrown@wppartners.com',
      linkedin: 'https://www.linkedin.com/in/nathan-brown-82bb71169',
      notes: 'Managing Director since 1997. Serves on multiple portfolio boards. Source: wppartners.com/team, RocketReach'
    },
    {
      row: 861, // Row 860 + 1
      company: 'Wynnchurch Capital',
      contact: 'Greg Gleason',
      title: 'Managing Partner',
      email: 'ggleason@wynnchurch.com',
      linkedin: 'https://www.linkedin.com/in/greg-gleason-5468848',
      notes: 'Managing Partner, oversees management & investment. Joined 2008. Source: wynnchurch.com/team, RocketReach'
    }
  ];
  
  // Prepare batch update
  const updates = [];
  
  for (const enrichment of enrichments) {
    const row = enrichment.row;
    
    // Update Contact Name (Column C)
    updates.push({
      range: `Sheet1!C${row}`,
      values: [[enrichment.contact]]
    });
    
    // Update Title (Column D)
    updates.push({
      range: `Sheet1!D${row}`,
      values: [[enrichment.title]]
    });
    
    // Update Email (Column E)
    updates.push({
      range: `Sheet1!E${row}`,
      values: [[enrichment.email]]
    });
    
    // Update LinkedIn (Column G)
    updates.push({
      range: `Sheet1!G${row}`,
      values: [[enrichment.linkedin]]
    });
    
    // Update Notes (Column I - assuming it exists)
    updates.push({
      range: `Sheet1!I${row}`,
      values: [[enrichment.notes]]
    });
  }
  
  // Execute batch update
  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      resource: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    
    console.log(`✅ Enriched ${enrichments.length} leads`);
    console.log('\nEnriched firms:');
    enrichments.forEach(e => {
      console.log(`  Row ${e.row}: ${e.company}`);
      console.log(`    → ${e.contact} (${e.title}) - ${e.email}`);
    });
  } else {
    console.log('No leads to enrich');
  }
}

enrichLeads().catch(console.error);
