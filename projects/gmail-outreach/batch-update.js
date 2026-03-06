const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function batchUpdate() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Batch updates
  const updates = [
    // Row 379: Rockbridge Growth Equity
    {
      range: 'Sheet1!D379',
      values: [['Vice President']]
    },
    {
      range: 'Sheet1!L379',
      values: [['Title verified on rbequity.com/team-member/spencer-hughes (2026-03-06 enrichment)']]
    },
    
    // Row 625: Jensen Partners (recruitment firm, not PE - note this)
    {
      range: 'Sheet1!C625',
      values: [['Sasha Jensen']]
    },
    {
      range: 'Sheet1!D625',
      values: [['Founder & CEO']]
    },
    {
      range: 'Sheet1!L625',
      values: [['Executive search firm (recruits for PE firms). Source: jensen-partners.com (2026-03-06 enrichment)']]
    },
    
    // Row 630: Kinect Capital
    {
      range: 'Sheet1!C630',
      values: [['Trent Christensen']]
    },
    {
      range: 'Sheet1!D630',
      values: [['CEO & President']]
    },
    {
      range: 'Sheet1!L630',
      values: [['Venture accelerator (not traditional PE). Source: RocketReach, kinectcapital.org (2026-03-06 enrichment)']]
    },
    
    // Row 626: Jett Capital Advisors
    {
      range: 'Sheet1!D626',
      values: [['Founding Partner & CEO']]
    },
    {
      range: 'Sheet1!L626',
      values: [['Investment banking/M&A advisory firm (not traditional PE). Source: jettcapital.com/team (2026-03-06 enrichment)']]
    }
  ];
  
  console.log('Performing batch update...\n');
  
  const batchUpdateRequest = {
    requests: updates.map(update => ({
      updateCells: {
        range: {
          sheetId: 0,
          ...parseRange(update.range)
        },
        rows: [{
          values: [{
            userEnteredValue: { stringValue: update.values[0][0] }
          }]
        }],
        fields: 'userEnteredValue'
      }
    }))
  };
  
  // Using simpler value update approach
  for (const update of updates) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: update.range,
      valueInputOption: 'RAW',
      resource: {
        values: update.values
      }
    });
    console.log(`✓ Updated ${update.range}: ${update.values[0][0]}`);
  }
  
  console.log('\nBatch update complete!');
}

function parseRange(a1Notation) {
  // Simple A1 notation parser for single cell
  const match = a1Notation.match(/Sheet1!([A-Z]+)(\d+)/);
  if (!match) return {};
  
  const col = match[1].charCodeAt(0) - 'A'.charCodeAt(0);
  const row = parseInt(match[2]) - 1;
  
  return {
    startRowIndex: row,
    endRowIndex: row + 1,
    startColumnIndex: col,
    endColumnIndex: col + 1
  };
}

batchUpdate().catch(console.error);
