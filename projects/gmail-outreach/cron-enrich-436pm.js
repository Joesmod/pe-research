const { google } = require('googleapis');

async function findEnrichmentTargets() {
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
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  const headers = rows[0];
  const companyIdx = headers.indexOf('Company');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');
  const websiteIdx = headers.indexOf('Website');
  const linkedinIdx = headers.indexOf('LinkedIn');
  const titleIdx = headers.indexOf('Title');
  
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    const website = row[websiteIdx] || '';
    const linkedin = row[linkedinIdx] || '';
    const title = row[titleIdx] || '';
    
    // Skip dead/sent/replied
    if (['Dead', 'Sent', 'Replied'].includes(status)) continue;
    if (!company.trim()) continue;
    
    // Check if needs enrichment
    const genericEmails = ['info@', 'sales@', 'ir@', 'contact@', 'hello@', 'support@'];
    const hasGenericEmail = genericEmails.some(prefix => email.toLowerCase().startsWith(prefix));
    
    if (!contact.trim() || hasGenericEmail || !email.trim()) {
      needsEnrichment.push({
        row: i + 1,
        company: company.trim(),
        contact: contact.trim(),
        email: email.trim(),
        title: title.trim(),
        status: status.trim(),
        website: website.trim(),
        linkedin: linkedin.trim()
      });
    }
  }
  
  console.log(JSON.stringify(needsEnrichment.slice(0, 15), null, 2));
}

findEnrichmentTargets().catch(console.error);
