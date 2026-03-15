const { google } = require('googleapis');

async function readSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A:N'
  });
  
  const rows = res.data.values || [];
  const header = rows[0];
  
  // Find column indices
  const companyIdx = header.indexOf('Company Name');
  const contactIdx = header.indexOf('Contact Name');
  const emailIdx = header.indexOf('Email');
  const statusIdx = header.indexOf('Status');
  const websiteIdx = header.indexOf('Website');
  
  console.log('Header:', header);
  console.log(`Company col: ${companyIdx}, Contact col: ${contactIdx}, Email col: ${emailIdx}, Status col: ${statusIdx}`);
  
  // Find leads needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    const website = row[websiteIdx] || '';
    
    // Skip if no company name (nothing to enrich)
    if (!company || company.trim() === '') continue;
    
    // Skip if status contains "Dead", "Sent", "Replied", or "Not PE"
    if (/dead|sent|replied|not pe/i.test(status)) continue;
    
    // Needs enrichment if:
    // - No contact name, OR
    // - No email, OR
    // - Generic email (info@, sales@, ir@, contact@, admin@)
    const genericEmail = email && /^(info|sales|ir|contact|admin|support)@/i.test(email);
    
    if (!contact || !email || genericEmail) {
      needsEnrichment.push({
        rowIndex: i + 1,
        company,
        contact,
        email,
        website,
        status,
        reason: !contact ? 'no_contact' : (!email ? 'no_email' : 'generic_email')
      });
    }
  }
  
  console.log(`\nTotal rows: ${rows.length}`);
  console.log(`Leads needing enrichment: ${needsEnrichment.length}\n`);
  console.log(JSON.stringify(needsEnrichment.slice(0, 20), null, 2));
}

readSheet().catch(console.error);
