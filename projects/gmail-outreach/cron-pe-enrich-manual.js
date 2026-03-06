const { google } = require('googleapis');
const key = require('./service-account.json');

const SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function enrichLeads() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth });

  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Sheet1!A:J'
  });

  const rows = result.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }

  console.log(`\n📊 Total rows: ${rows.length - 1}`);
  
  // Find leads needing enrichment
  const needsEnrichment = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const website = row[1] || '';
    const contactName = row[2] || '';
    const email = row[4] || '';
    const status = row[9] || '';
    
    const hasEmptyContact = !contactName || contactName.trim() === '' || contactName === 'Jacob Zodikoff';
    const hasGenericEmail = !email || 
                            email.includes('info@') || 
                            email.includes('sales@') || 
                            email.includes('ir@') || 
                            email.includes('contact@') ||
                            email.trim() === '';
    
    const needsAttention = (status === 'New - Unresearched' || 
                           status === 'Partial' ||
                           hasEmptyContact || 
                           hasGenericEmail);
    
    if (needsAttention && company && website) {
      needsEnrichment.push({
        rowIndex: i,
        company,
        website,
        contactName,
        email,
        status
      });
    }
  }

  console.log(`\n=== Found ${needsEnrichment.length} leads needing enrichment ===\n`);
  console.log(`\n🔍 Top 15 firms to research:\n`);
  
  const toEnrich = needsEnrichment.slice(0, 15);
  
  toEnrich.forEach((lead, idx) => {
    console.log(`${idx + 1}. ${lead.company}`);
    console.log(`   Website: ${lead.website}`);
    console.log(`   Current: ${lead.contactName || '(empty)'} / ${lead.email || '(empty)'}`);
    console.log(`   Search: site:${lead.website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]} (team OR about OR contact OR people)`);
    console.log(`   Search: site:linkedin.com "${lead.company}" partner OR "managing director"`);
    console.log('');
  });
  
  console.log(`\n📝 RECOMMENDATION:`);
  console.log(`   Apollo API appears to have endpoint/access issues.`);
  console.log(`   Switching to manual web research + LinkedIn for this run.`);
  console.log(`   Use the search queries above to find team pages and verify emails.`);
  console.log(`   Update sheet manually or create enrichment script with web scraping.`);
}

enrichLeads().catch(console.error);
