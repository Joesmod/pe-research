const { google } = require('googleapis');
const key = require('./service-account.json');

async function updateEnrichmentsBatch2() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Read first to find row numbers
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:J'
  });
  
  const rows = result.data.values;
  
  // Find row indices for specific companies
  const findRow = (companyName) => {
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] && rows[i][0].toLowerCase().includes(companyName.toLowerCase())) {
        return i + 1; // +1 because sheets are 1-indexed
      }
    }
    return null;
  };
  
  const pelicanRow = findRow('Pelican Energy Partners');
  const renovusRow = findRow('Renovus Capital');
  const valeasRow = findRow('Valeas Capital');
  const windroseRow = findRow('WindRose Health');
  
  console.log(`Found rows - Pelican: ${pelicanRow}, Renovus: ${renovusRow}, Valeas: ${valeasRow}, WindRose: ${windroseRow}`);
  
  const updates = [];
  
  // Pelican Energy Partners
  if (pelicanRow) {
    updates.push(
      {
        range: `Sheet1!C${pelicanRow}:E${pelicanRow}`,
        values: [['Sam Veselka', 'Managing Director', 'sveselka@pep-lp.com']]
      },
      {
        range: `Sheet1!I${pelicanRow}`,
        values: [['Source: Pelican Energy Partners team pages. Verified emails: sveselka@pep-lp.com (Sam Veselka, MD), jay.surina@pep-lp.com (Jay Surina, MD). (2026-03-04)']]
      },
      {
        range: `Sheet1!J${pelicanRow}`,
        values: [['Enriched']]
      }
    );
  }
  
  // Renovus Capital Partners
  if (renovusRow) {
    updates.push(
      {
        range: `Sheet1!C${renovusRow}:D${renovusRow}`,
        values: [['Jason Tanker', 'Managing Director']]
      },
      {
        range: `Sheet1!I${renovusRow}`,
        values: [['Source: Renovus Capital team page + press releases. Jason Tanker (MD, Tech Services), Jesse Serventi (Founding Partner). Email pattern: firstname@renovuscapital.com or firstname.lastname@renovuscapital.com per ZoomInfo. (2026-03-04)']]
      },
      {
        range: `Sheet1!J${renovusRow}`,
        values: [['Partial']]
      }
    );
  }
  
  // Valeas Capital Partners
  if (valeasRow) {
    updates.push(
      {
        range: `Sheet1!C${valeasRow}:D${valeasRow}`,
        values: [['Rob Little', 'Co-Founder & Managing Partner']]
      },
      {
        range: `Sheet1!G${valeasRow}`,
        values: [['https://valeas.com/our-people/']]
      },
      {
        range: `Sheet1!I${valeasRow}`,
        values: [['Source: Valeas team page. Rob Little & Ed Woiteshek (Co-Founders/MPs). Email pattern per SignalHire: j-doe@valeas.com (94% confidence, but NOT VERIFIED with actual source). Generic: info@valeas.com. (2026-03-04)']]
      },
      {
        range: `Sheet1!J${valeasRow}`,
        values: [['Partial']]
      }
    );
  }
  
  // WindRose Health Investors
  if (windroseRow) {
    updates.push(
      {
        range: `Sheet1!C${windroseRow}:D${windroseRow}`,
        values: [['Oliver T. Moses', 'Managing Partner']]
      },
      {
        range: `Sheet1!I${windroseRow}`,
        values: [['Source: WindRose team page. Oliver T. Moses (Managing Partner), Curtis Lane also senior. Generic: info@windrose.com. No verified direct emails found. (2026-03-04)']]
      },
      {
        range: `Sheet1!J${windroseRow}`,
        values: [['Partial']]
      }
    );
  }
  
  if (updates.length === 0) {
    console.log('No matching rows found for updates');
    return;
  }
  
  // Batch update
  const batchUpdateRequest = {
    spreadsheetId,
    resource: {
      data: updates.map(u => ({
        range: u.range,
        values: u.values
      })),
      valueInputOption: 'RAW'
    }
  };
  
  try {
    const response = await sheets.spreadsheets.values.batchUpdate(batchUpdateRequest);
    console.log(JSON.stringify(response.data, null, 2));
    console.log(`Updated ${updates.length} ranges successfully`);
  } catch (error) {
    console.error('Error updating sheet:', error);
    throw error;
  }
}

updateEnrichmentsBatch2().catch(console.error);
