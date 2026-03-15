const { google } = require('googleapis');

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const updates = [
    // Row 566: Avathon Capital - Contact Verified
    {
      range: 'Sheet1!C566:K566',
      values: [[
        'Jason Rosenberg',  // Contact Name
        'Co-Founder, Managing Partner',  // Title
        '',  // Email (not publicly available)
        'https://avathoncapital.com',  // Website
        'https://www.linkedin.com/in/jrosenberg1/',  // LinkedIn
        '',  // Sector Focus (preserve existing)
        '',  // Portfolio Companies (preserve existing)
        'Enriched - Contact Verified',  // Status
        'Email pattern firstinitiallast@avathoncapital.com confirmed via press release. Contact verified via Apollo API + LinkedIn + official press releases (Feb 2025). $400M+ AUM, early childhood education focus. Other team: Brian Schwartz (MD), Shawn Domanic, Victor Bruene.'  // Notes
      ]]
    },
    // Row 567: AVB Invest - Partial Enrichment
    {
      range: 'Sheet1!C567:K567',
      values: [[
        'Serge Garden',  // Contact Name
        'Founder and President',  // Title
        'team@avbinvest.com',  // Email (generic)
        'https://avbinvest.com',  // Website
        'https://www.linkedin.com/in/serge-garden-87852659',  // LinkedIn
        '',  // Sector Focus (preserve existing)
        '',  // Portfolio Companies (preserve existing)
        'Partial - Generic Contact Only',  // Status
        'NYC-based (369 Lexington Ave). Innovation/future tech focus. Generic email: team@avbinvest.com, info@avbinvest.com. Direct email not published. Source: avbinvest.com, news.avbinvest.com (May 2025).'  // Notes
      ]]
    },
    // Row 117: Keltic FP - Mark as Inactive
    {
      range: 'Sheet1!J117:K117',
      values: [[
        'Inactive - Website Offline',  // Status
        'Website kelticfp.com no longer resolves (DNS error). Firm appears inactive/closed.'  // Notes
      ]]
    }
  ];

  console.log('Applying updates to Google Sheet...\n');

  for (const update of updates) {
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: update.range,
        valueInputOption: 'USER_ENTERED',
        resource: { values: update.values }
      });
      console.log(`✓ Updated ${update.range}`);
    } catch (error) {
      console.error(`✗ Error updating ${update.range}:`, error.message);
    }
  }

  console.log('\n✅ Sheet updates complete!');
  console.log('\nSummary:');
  console.log('- Row 566 (Avathon Capital): Contact verified, email pattern confirmed');
  console.log('- Row 567 (AVB Invest): Generic contact added');
  console.log('- Row 117 (Keltic FP): Marked as inactive');
}

updateSheet().catch(console.error);
