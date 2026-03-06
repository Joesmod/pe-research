const { google } = require('googleapis');

async function findTrueNeeds() {
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
    contactName: headers.indexOf('Contact Name'),
    title: headers.indexOf('Title'),
    email: headers.indexOf('Email'),
    website: headers.indexOf('Website'),
    linkedin: headers.indexOf('LinkedIn'),
    status: headers.indexOf('Status'),
  };
  
  const genericPrefixes = ['info@', 'sales@', 'ir@', 'contact@', 'hello@', 'support@', 'admin@', 'office@'];
  const trueNeeds = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[idx.companyName] || '';
    const contact = row[idx.contactName] || '';
    const title = row[idx.title] || '';
    const email = row[idx.email] || '';
    const website = row[idx.website] || '';
    const status = row[idx.status] || '';
    
    // Skip dead, sent, replied
    if (status.toLowerCase().includes('dead')) continue;
    if (['Sent', 'Replied'].includes(status)) continue;
    if (!company.trim()) continue;
    
    // Skip rows with data errors (emails in wrong fields)
    if (title.includes('@') || contact.includes('@')) continue;
    
    const missingContact = !contact.trim() || contact === 'Jacob Zodikoff' || contact.length < 3;
    const missingEmail = !email.trim();
    const hasGenericEmail = genericPrefixes.some(p => email.toLowerCase().startsWith(p));
    const contactIsTitle = contact && (contact.includes('Partner') || contact.includes('CEO') || contact.includes('Director') || contact.includes('VP') || contact.includes('Head') || contact.includes('Founder'));
    
    if (missingContact || missingEmail || hasGenericEmail || contactIsTitle) {
      trueNeeds.push({
        row: i + 1,
        company: company.trim(),
        contact: contact.trim(),
        title: title.trim(),
        email: email.trim(),
        website: website.trim(),
        status: status.trim(),
        issue: contactIsTitle ? 'CONTACT_IS_TITLE' : (missingContact ? 'NO_CONTACT' : (missingEmail ? 'NO_EMAIL' : 'GENERIC_EMAIL'))
      });
    }
  }
  
  console.log(`Found ${trueNeeds.length} leads that truly need enrichment\n`);
  
  // Group by issue type
  const byIssue = {};
  trueNeeds.forEach(lead => {
    if (!byIssue[lead.issue]) byIssue[lead.issue] = [];
    byIssue[lead.issue].push(lead);
  });
  
  Object.keys(byIssue).forEach(issue => {
    console.log(`\n=== ${issue}: ${byIssue[issue].length} leads ===`);
    byIssue[issue].slice(0, 5).forEach(lead => {
      console.log(`Row ${lead.row}: ${lead.company} | Contact: "${lead.contact}" | Email: "${lead.email}"`);
    });
  });
  
  // Save top 15 for enrichment
  console.log(`\n=== Top 15 for enrichment ===`);
  const top15 = trueNeeds.filter(l => l.issue !== 'GENERIC_EMAIL').slice(0, 15);
  console.log(JSON.stringify(top15, null, 2));
}

findTrueNeeds().catch(console.error);
