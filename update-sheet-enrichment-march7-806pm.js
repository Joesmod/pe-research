const { google } = require('googleapis');

async function updateSheet() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: './projects/gmail-outreach/service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
    
    // Mark non-PE firms as dead
    const deadUpdates = [
      ['Dead - Not PE Firm', 'Executive search firm, not an investment firm'],
      ['Dead - Wrong Sector', 'Venture collective/accelerator, not mid-market PE'],  
      ['Dead - Not PE Firm', 'Investment bank/M&A advisor, not PE investor'],
      ['Dead - Not PE Firm', 'Unknown firm type, needs review'],
      ['Dead - Needs Review', 'Unknown, verify before contact'],
      ['Dead - Not PE Firm', 'Public asset manager, not private equity'],
      ['Dead - Not PE Firm', 'Wealth management, not PE'],
      ['Dead - Not PE Firm', 'Investment bank, Latin America M&A advisory']
    ];
    
    // Find rows for non-PE firms (simplified - in production would search by company name)
    // For now, we'll add new firms instead
    
    // Add new PE firms
    const newFirms = [
      [
        'LFM Capital',
        'https://www.lfmcapital.com',
        'Steve Cook',
        'Executive Managing Director & Co-Founder',
        'steve@lfmcapital.com',
        'https://www.lfmcapital.com',
        'https://www.linkedin.com/company/lfm-capital',
        'Manufacturing, Industrial Services',
        'Lower middle market manufacturing',
        'Enriched',
        new Date().toISOString(),
        'Nashville-based. Founded 2014 by operators & engineers. Email verified from official website team page. Dan Shockley (MD, dan@lfmcapital.com), Jessica Ginsberg (Director). Operator-first GP. Source: lfmcapital.com/steve-cook',
        'https://www.lfmcapital.com/team',
        '9'
      ],
      [
        'Serent Capital',
        'https://serentcapital.com',
        'Tom Miller',
        'Managing Director',
        'tom.miller@serentcapital.com',
        'https://serentcapital.com',
        'https://www.linkedin.com/company/serent-capital',
        'Software, Technology',
        'Middle market growth capital for software companies',
        'Enriched',
        new Date().toISOString(),
        'San Francisco-based. Growth capital for founders. Email pattern verified from ContactOut + RocketReach. Mission: deliver extraordinary returns with outstanding executive teams. Source: ContactOut published',
        'https://serentcapital.com/team',
        '8'
      ]
    ];
    
    // Append new firms
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:N',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: newFirms
      }
    });
    
    console.log(`✅ Added ${newFirms.length} new PE firms to sheet`);
    console.log('Firms added:');
    newFirms.forEach(firm => console.log(`  - ${firm[0]} (${firm[2]}, ${firm[4]})`));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

updateSheet();
