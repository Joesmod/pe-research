const { google } = require('googleapis');
const key = require('./service-account.json');

async function findLeadsToEnrich() {
  const auth = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
  );
  
  const sheets = google.sheets({ version: 'v4', auth });
  const sheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'Sheet1!A:J',
  });
  
  const rows = response.data.values;
  const headers = rows[0];
  
  // Find indices
  const companyIdx = headers.findIndex(h => h && h.toLowerCase().includes('company'));
  const websiteIdx = headers.findIndex(h => h && h.toLowerCase().includes('website'));
  const nameIdx = headers.findIndex(h => h && h.toLowerCase().includes('contact') && h.toLowerCase().includes('name'));
  const titleIdx = headers.findIndex(h => h && h.toLowerCase().includes('title'));
  const emailIdx = headers.findIndex(h => h && h.toLowerCase().includes('email'));
  const statusIdx = headers.findIndex(h => h && h.toLowerCase().includes('status'));
  
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const company = row[companyIdx] || '';
    const website = row[websiteIdx] || '';
    const contactName = row[nameIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    
    // Skip if no company name
    if (!company || company.trim() === '') continue;
    
    // Skip if already has good contact
    const hasValidContact = contactName && 
                           !contactName.includes('Team') && 
                           !contactName.includes('Contact') &&
                           !contactName.includes('Business Development');
    
    const hasDirectEmail = email && 
                          !email.includes('info@') && 
                          !email.includes('sales@') && 
                          !email.includes('ir@') &&
                          !email.includes('businessdevelopment@') &&
                          !email.includes('contact@');
    
    // Needs enrichment if missing name or has generic email
    if (!hasValidContact || !hasDirectEmail) {
      needsEnrichment.push({
        rowNum: i + 1,
        company,
        website,
        contactName,
        email,
        status,
        reason: !hasValidContact ? 'Missing contact name' : 'Generic/missing email'
      });
    }
  }
  
  // Show top 20 candidates
  console.log(`\nFound ${needsEnrichment.length} leads needing enrichment\n`);
  console.log('TOP 20 CANDIDATES FOR ENRICHMENT:\n');
  
  needsEnrichment.slice(0, 20).forEach((lead, idx) => {
    console.log(`${idx + 1}. Row ${lead.rowNum}: ${lead.company}`);
    console.log(`   Current: ${lead.contactName} | ${lead.email}`);
    console.log(`   Website: ${lead.website}`);
    console.log(`   Reason: ${lead.reason}`);
    console.log(`   Status: ${lead.status}`);
    console.log('');
  });
}

findLeadsToEnrich().catch(console.error);
