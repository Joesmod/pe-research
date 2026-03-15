const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

async function main() {
  try {
    // Authenticate with service account
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_PATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Read the sheet
    console.log('Reading PE Leads sheet...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:M',
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found.');
      return;
    }

    // Identify rows needing enrichment
    const needsEnrichment = [];
    
    for (let i = 1; i < rows.length; i++) { // Skip header row
      const row = rows[i];
      const [company, website, contactName, title, email, , , , , status] = row;
      
      // Check if needs enrichment
      const hasNoContact = !contactName || contactName.trim() === '';
      const hasGenericEmail = !email || 
        email.includes('info@') || 
        email.includes('sales@') || 
        email.includes('ir@') ||
        email.includes('contact@') ||
        email.trim() === '';
      
      // Only enrich "Active" or "New - Unresearched" leads
      const isActive = status && (
        status.includes('Enriched') === false &&
        status.includes('Dead') === false &&
        status.includes('Not PE') === false
      );
      
      if ((hasNoContact || hasGenericEmail) && isActive && company) {
        needsEnrichment.push({
          rowIndex: i + 1,
          company,
          website: website || '',
          contactName: contactName || '',
          email: email || '',
          status: status || 'New - Unresearched'
        });
      }
    }

    console.log(`\nFound ${needsEnrichment.length} firms needing enrichment\n`);
    
    // Show first 15 for manual research
    const toEnrich = needsEnrichment.slice(0, 15);
    
    console.log('FIRMS TO ENRICH (Top 15):');
    console.log('='.repeat(80));
    toEnrich.forEach((firm, idx) => {
      console.log(`\n${idx + 1}. ${firm.company}`);
      console.log(`   Website: ${firm.website || 'NONE'}`);
      console.log(`   Current Contact: ${firm.contactName || 'EMPTY'}`);
      console.log(`   Current Email: ${firm.email || 'EMPTY'}`);
      console.log(`   Status: ${firm.status}`);
      console.log(`   Row: ${firm.rowIndex}`);
      console.log(`   ---`);
    });

    console.log('\n\nMANUAL RESEARCH GUIDE:');
    console.log('='.repeat(80));
    console.log('For each firm above:');
    console.log('1. Visit company website team/about/contact page');
    console.log('2. Search "site:linkedin.com [firm name] managing partner"');
    console.log('3. Check press releases, conference bios, SEC filings');
    console.log('4. Look for:');
    console.log('   - CEO, CTO, COO, CFO, CMO');
    console.log('   - Managing Partner, General Partner, Operating Partner');
    console.log('   - Directors: Technology, Product, Operations, Marketing');
    console.log('   - VPs: Technology, Operations, Digital Transformation');
    console.log('   - Heads of: Value Creation, Portfolio Operations');
    console.log('\n5. NEVER guess email patterns - only use published emails');
    console.log('6. Note source in sheet (e.g., "website team page", "SEC filing")');
    console.log('\n');

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

main();
