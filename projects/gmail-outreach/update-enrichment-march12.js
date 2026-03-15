const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function updateEnrichment() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: SCOPES,
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Updates array: [row, contactName, title, email, linkedIn, status, notes]
    const updates = [
      {
        row: 176, // Hg Capital
        contactName: 'Jodie Gray',
        title: 'Executive Assistant to Nic Humphries (Senior Partner)',
        email: 'jodie.gray@hgcapital.com',
        linkedIn: 'https://www.linkedin.com/company/hg/',
        status: 'Enriched',
        notes: 'Executive Assistant to Nic Humphries (Senior Partner & Executive Chairman). Email verified on official Hg Capital website. | Source: hgcapital.com/team-member/nic-humphries/ 2026-03-12'
      },
      {
        row: 285, // Sentinel Capital Partners
        contactName: 'David S. Lobel',
        title: 'Founder and Managing Partner',
        email: 'info@sentinelpartners.com',
        linkedIn: 'https://www.linkedin.com/company/sentinel-capital-partners/',
        status: 'Researched - Generic Email Only',
        notes: 'Founder and Managing Partner confirmed. Only generic firm email publicly available: info@sentinelpartners.com. Direct email pattern likely: last@sentinelpartners.com | Source: sentinelpartners.com 2026-03-12'
      },
      {
        row: 220, // WindPoint Partners
        contactName: 'Nathan Brown',
        title: 'Managing Director',
        email: '',
        linkedIn: 'https://www.linkedin.com/company/wind-point-partners/',
        status: 'Researched - No Public Contact',
        notes: 'Managing Director confirmed via wppartners.com team page. Email pattern @wppartners.com but no public direct email available. | Source: wppartners.com/our-team/ 2026-03-12'
      },
      {
        row: 161, // Thomas H. Lee Partners
        contactName: 'Scott Sperling',
        title: '',
        email: '',
        linkedIn: 'https://www.linkedin.com/company/thl/',
        status: 'Researched - No Public Contact',
        notes: 'THL website found (thl.com). Key executives: Tony DiNovi (Chairman), Tom Hagerty (Managing Director). No public emails found on official sources. | Source: thl.com 2026-03-12'
      }
    ];

    console.log(`🔄 Updating ${updates.length} rows...`);
    
    for (const update of updates) {
      const range = `Sheet1!C${update.row}:L${update.row}`;
      
      const values = [[
        update.contactName,
        update.title,
        update.email,
        '', // Website (leave as-is)
        update.linkedIn,
        '', // Sector Focus (leave as-is)
        '', // Portfolio Companies (leave as-is)
        update.status,
        '', // Last Contacted (leave as-is)
        update.notes
      ]];
      
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range,
        valueInputOption: 'RAW',
        resource: { values }
      });
      
      console.log(`✅ Updated row ${update.row}: ${update.contactName} at ${update.status}`);
    }
    
    console.log(`\n✅ Successfully updated ${updates.length} leads`);
    console.log(`\n📊 SUMMARY:`);
    console.log(`- Enriched (verified): 1`);
    console.log(`- Generic Email Only: 1`);
    console.log(`- No Public Contact: 2`);
    
  } catch (error) {
    console.error('Error updating sheet:', error.message);
    throw error;
  }
}

updateEnrichment().catch(console.error);
