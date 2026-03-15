const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Enrichment data collected from research
const enrichments = [
  {
    row: 4, // Constitution Capital Partners
    values: {
      'Contact Name': 'Robert M. Hatch',
      'Title': 'Managing Partner',
      'Email': 'rhatch@concp.com',
      'Status': 'Enriched',
      'Notes': 'Managing Partner. Email pattern verified: [first_initial][last]@concp.com. Other key contacts: Daniel M. Cahill (CEO, dcahill@concp.com), Vicente Miguel T. Ramos (Managing Partner, vramos@concp.com). Fort Worth TX-based. Source: concp.com/team (2026-03-06 cron enrichment)'
    }
  },
  {
    row: 5, // Crestline Investors
    values: {
      'Contact Name': 'Garry Bratton',
      'Title': 'CEO & Founder',
      'Email': 'gbratton@crestlineinvestors.com',
      'Status': 'Enriched',
      'Notes': 'Founded Crestline in 1997. $19B AUM alternative credit manager. Email pattern: [first_initial][last]@crestlineinvestors.com. Also: Tom Bavin (Senior MD, Co-Head Client Partnership). Fort Worth TX. Source: crestlineinvestors.com/our-team (2026-03-06 cron enrichment)'
    }
  },
  {
    row: 6, // D1 Capital Partners
    values: {
      'Contact Name': 'Daniel Sundheim',
      'Title': 'Founder & Managing Partner',
      'Email': 'dsundheim@d1capital.com',
      'Status': 'Enriched',
      'Notes': 'Founded D1 Capital Partners in July 2018. Hedge fund (public + private markets), not traditional PE. Email pattern inferred: [first_initial][last]@d1capital.com. Also: Jonathan Bregman (Partner). Miami/NYC-based. Source: LinkedIn research (2026-03-06 cron enrichment)'
    }
  }
];

async function enrichLeads() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    const sheets = google.sheets({ version: 'v4', auth });

    // Read current sheet to get headers
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A1:L1',
    });
    
    const headers = headerResponse.data.values[0];
    console.log('Headers:', headers);
    
    // Map column names to indices
    const colMap = {};
    headers.forEach((header, idx) => {
      colMap[header] = idx;
    });
    
    // Prepare batch update
    const updates = [];
    
    for (const enrichment of enrichments) {
      const row = enrichment.row;
      const values = enrichment.values;
      
      // Build row data
      const rowData = new Array(headers.length).fill('');
      
      for (const [field, value] of Object.entries(values)) {
        const colIdx = colMap[field];
        if (colIdx !== undefined) {
          rowData[colIdx] = value;
        }
      }
      
      // Add to batch
      updates.push({
        range: `Sheet1!A${row}:L${row}`,
        values: [rowData]
      });
    }
    
    // Execute batch update
    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          valueInputOption: 'RAW',
          data: updates
        }
      });
      
      console.log(`✅ Enriched ${updates.length} leads successfully`);
    }
    
  } catch (error) {
    console.error('Error enriching leads:', error.message);
    throw error;
  }
}

enrichLeads();
