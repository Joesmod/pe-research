const { google } = require('googleapis');

async function findEnrichmentNeeds() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:M'
  });
  
  const rows = response.data.values;
  const headers = rows[0];
  
  const idx = {
    companyName: headers.indexOf('Company Name'),
    notebook: headers.indexOf('NotebookLM'),
    contactName: headers.indexOf('Contact Name'),
    title: headers.indexOf('Title'),
    email: headers.indexOf('Email'),
    website: headers.indexOf('Website'),
    linkedin: headers.indexOf('LinkedIn'),
    status: headers.indexOf('Status'),
  };
  
  const needsEnrichment = [];
  const genericPrefixes = ['info@', 'sales@', 'ir@', 'contact@', 'hello@', 'support@', 'admin@', 'office@'];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[idx.companyName] || '';
    const contact = row[idx.contactName] || '';
    const title = row[idx.title] || '';
    const email = row[idx.email] || '';
    const status = row[idx.status] || '';
    const website = row[idx.website] || '';
    const linkedin = row[idx.linkedin] || '';
    
    if (!company.trim()) continue;
    if (['Dead', 'Sent', 'Replied'].includes(status)) continue;
    
    // Check for issues
    const missingContact = !contact.trim();
    const missingEmail = !email.trim();
    const hasGenericEmail = genericPrefixes.some(p => email.toLowerCase().startsWith(p));
    const emailInWrongField = title.includes('@') || contact.includes('@');
    
    if (missingContact || missingEmail || hasGenericEmail || emailInWrongField) {
      needsEnrichment.push({
        row: i + 1,
        company: company.trim(),
        contact: contact.trim(),
        title: title.trim(),
        email: email.trim(),
        website: website.trim(),
        linkedin: linkedin.trim(),
        status: status.trim(),
        issue: emailInWrongField ? 'DATA_ERROR' : (missingContact ? 'NO_CONTACT' : (missingEmail ? 'NO_EMAIL' : 'GENERIC_EMAIL'))
      });
    }
  }
  
  console.log(`Found ${needsEnrichment.length} leads needing enrichment\n`);
  console.log(JSON.stringify(needsEnrichment.slice(0, 15), null, 2));
}

findEnrichmentNeeds().catch(console.error);
