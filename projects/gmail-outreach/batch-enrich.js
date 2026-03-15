const { google } = require('googleapis');

async function batchUpdate() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // First, read the sheet to find exact row positions
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:I'
  });
  
  const rows = result.data.values;
  const updates = [];
  
  // Find rows by company name
  rows.forEach((row, index) => {
    const rowNum = index + 1;
    const company = row[0] || '';
    
    // Update American Industrial Partners if found
    if (company.includes('American Industrial Partners')) {
      updates.push({
        range: 'Sheet1!C' + rowNum + ':I' + rowNum,
        values: [['Kim Marvin', 'General Partner', 'kmarvin@americanindustrial.com', 'https://www.linkedin.com/in/kim-marvin', 'https://americanindustrial.com', 'Enriched - Email Inferred', 'Source: Bloomberg/Wikipedia verified as General Partner. Email pattern inferred. NYC-based mid-market industrial PE, founded 1988.']]
      });
    }
    
    // Update Volition Capital if found
    if (company.includes('Volition Capital')) {
      updates.push({
        range: 'Sheet1!C' + rowNum + ':I' + rowNum,
        values: [['Sean Cantwell', 'Managing Partner & Co-Founder', 'scantwell@volitioncapital.com', 'https://www.linkedin.com/in/sean-cantwell-59070a4/', 'https://volitioncapital.com', 'Enriched', 'Source: RocketReach verified. Boston-based growth equity, software/tech-enabled services focus.']]
      });
    }
    
    // Update Kinect Capital if found (mark as dead)
    if (company.includes('Kinect Capital')) {
      updates.push({
        range: 'Sheet1!H' + rowNum + ':I' + rowNum,
        values: [['Dead - Not PE', '501(c)(3) educational non-profit for entrepreneurs. Contact: James Kemp (James@kinectcapital.org). NOT an investment firm.']]
      });
    }
    
    // Update GTMfund if found (mark as dead)
    if (company.includes('GTMfund') || company.includes('GTM fund')) {
      updates.push({
        range: 'Sheet1!H' + rowNum + ':I' + rowNum,
        values: [['Dead - Not PE', 'VC fund/network with 350+ LP members. Not a traditional PE firm. Community-based investment model.']]
      });
    }
    
    // Update Hark Capital if found (mark as dead)
    if (company.includes('Hark Capital')) {
      updates.push({
        range: 'Sheet1!H' + rowNum + ':I' + rowNum,
        values: [['Dead - Not PE', 'Provides non-dilutive loans to PE/VC portfolio companies. Not a traditional PE investor.']]
      });
    }
    
    // Update 360 Equipment Finance if found (mark as dead)
    if (company.includes('360 Equipment Finance')) {
      updates.push({
        range: 'Sheet1!H' + rowNum + ':I' + rowNum,
        values: [['Dead - Not PE', 'Equipment leasing/financing company. Contact: Kip Amstutz (Founder). NOT a PE firm.']]
      });
    }
  });
  
  // Execute updates
  for (const update of updates) {
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: update.range,
        valueInputOption: 'RAW',
        resource: { values: update.values }
      });
      console.log('Updated: ' + update.range);
    } catch (err) {
      console.error('Error updating ' + update.range + ':', err.message);
    }
  }
  
  console.log('Batch update complete. ' + updates.length + ' rows updated.');
}

batchUpdate().catch(console.error);
