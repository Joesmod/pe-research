const { google } = require('googleapis');

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Read current sheet to get row numbers
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:K',
  });
  
  const rows = response.data.values;
  const updates = [];
  
  // Find and update specific companies
  rows.forEach((row, index) => {
    const company = row[0]; // Column A = Company
    const rowNum = index + 1;
    
    // Top Tier Capital Partners - VERIFIED EMAIL
    if (company && company.includes('Top Tier Capital')) {
      updates.push({
        range: `Sheet1!D${rowNum}:H${rowNum}`,
        values: [[
          'David York',
          'Chairman, Founder & Managing Director',
          'dyork@ttcp.com',
          'https://www.linkedin.com/in/david-york-2407295',
          'Enriched'
        ]]
      });
    }
    
    // Sydecar
    if (company && company.includes('Sydecar')) {
      updates.push({
        range: `Sheet1!D${rowNum}:J${rowNum}`,
        values: [[
          'Nik Talreja',
          'Co-Founder & CEO',
          '', // No verified email
          'https://www.linkedin.com/in/niktalreja',
          'Contact Found - Email Not Published',
          'Verified from sydecar.io/leadership - email not publicly available'
        ]]
      });
    }
    
    // Butterfly Equity
    if (company && company.includes('Butterfly Equity')) {
      updates.push({
        range: `Sheet1!D${rowNum}:J${rowNum}`,
        values: [[
          'Dustin Beck',
          'Co-Founder & Co-CEO',
          '', // No verified email
          'https://www.linkedin.com/in/dustinbeck',
          'Contact Found - Email Not Published',
          'Verified from bfly.com/team - 15+ years PE/VC experience, former Vista & Goldman'
        ]]
      });
    }
    
    // Character Capital
    if (company && company.includes('Character Capital')) {
      updates.push({
        range: `Sheet1!D${rowNum}:J${rowNum}`,
        values: [[
          'John Zeratsky',
          'Co-Founder & General Partner',
          '', // Contact form only
          'https://www.linkedin.com/in/johnzeratsky',
          'Contact Found - Email Not Published',
          'Verified from character.vc - Former GV partner, bestselling author (Sprint). Contact via form at contact.character.vc'
        ]]
      });
    }
    
    // Callais Capital
    if (company && company.includes('Callais Capital')) {
      updates.push({
        range: `Sheet1!D${rowNum}:J${rowNum}`,
        values: [[
          'Harold Callais II (Hal)',
          'Managing Partner & Chief Investment Officer',
          '', // No email published
          'https://www.linkedin.com/in/hjc2',
          'Contact Found - Email Not Published',
          'Verified from callaiscapital.com - Phone: 985.272.1324. $138M+ in direct transactions.'
        ]]
      });
    }
    
    // Bicycle Capital
    if (company && company.includes('Bicycle Capital')) {
      updates.push({
        range: `Sheet1!D${rowNum}:J${rowNum}`,
        values: [[
          'Shu Nyatta',
          'Co-Founder & Managing Partner',
          '', // Generic emails only
          'https://www.linkedin.com/in/shunyatta',
          'Contact Found - Email Not Published',
          'Verified from bicycle.capital - LatAm growth equity, ~$440M fund. Generic: investors@bicycle.capital'
        ]]
      });
    }
    
    // Bruin Capital
    if (company && company.includes('Bruin Capital')) {
      updates.push({
        range: `Sheet1!D${rowNum}:J${rowNum}`,
        values: [[
          'George Pyne',
          'Founder & CEO',
          '', // No email published
          'https://www.linkedin.com/in/georgepyne',
          'Contact Found - Email Not Published',
          'Verified from bruincptl.com - Global sports & entertainment PE, founded 2015'
        ]]
      });
    }
    
    // BlueWave Resource Partners - NOT A PE FIRM
    if (company && company.includes('BlueWave')) {
      updates.push({
        range: `Sheet1!D${rowNum}:J${rowNum}`,
        values: [[
          'Laura Danforth',
          'President',
          'laura@bluewaverp.com',
          '',
          'Not PE Firm',
          'STAFFING/RECRUITING COMPANY - Not private equity. Should be removed from PE research list.'
        ]]
      });
    }
  });
  
  // Batch update
  if (updates.length > 0) {
    console.log(`Updating ${updates.length} rows...`);
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      resource: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    console.log('✅ Sheet updated successfully');
  } else {
    console.log('No matching rows found to update');
  }
}

updateSheet().catch(console.error);
